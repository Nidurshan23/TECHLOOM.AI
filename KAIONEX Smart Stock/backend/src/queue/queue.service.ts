import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { QueueStatus } from '../common/enums/queue-status.enum';
import { SocketGateway } from '../gateway/socket.gateway';
import { ProductService } from '../product/product.service';
import { QueueEntry, QueueEntryDocument } from './queue.schema';

const FIVE_MINUTES_MS = 5 * 60 * 1000;
const SEEDED_USERS = [
  { userId: 'user1', name: 'User 1' },
  { userId: 'user2', name: 'User 2' },
  { userId: 'user3', name: 'User 3' },
  { userId: 'user4', name: 'User 4' },
  { userId: 'user5', name: 'User 5' },
];

@Injectable()
export class QueueService {
  private processingChain = Promise.resolve();

  constructor(
    @InjectModel(QueueEntry.name)
    private readonly queueModel: Model<QueueEntryDocument>,
    private readonly productService: ProductService,
    private readonly socketGateway: SocketGateway,
  ) {}

  async seedUsers(productId: string) {
    const mongoProductId = new Types.ObjectId(productId);

    for (const user of SEEDED_USERS) {
      await this.queueModel.updateOne(
        { userId: user.userId },
        {
          $setOnInsert: {
            userId: user.userId,
            name: user.name,
            productId: mongoProductId,
            status: QueueStatus.Idle,
            position: null,
            queuedAt: null,
            reservedAt: null,
            expiresAt: null,
          },
        },
        { upsert: true },
      );
    }
  }

  async resetUsers(productId: string) {
    const mongoProductId = new Types.ObjectId(productId);

    await this.queueModel.updateMany(
      {},
      {
        $set: {
          productId: mongoProductId,
          status: QueueStatus.Idle,
          position: null,
          queuedAt: null,
          reservedAt: null,
          expiresAt: null,
        },
      },
    );
  }

  async getQueue() {
    return {
      users: await this.getFormattedUsers(),
    };
  }

  async getState() {
    return {
      product: await this.productService.getProduct(),
      queue: await this.getQueue(),
    };
  }

  async addToQueue(userId: string, productId?: string) {
    return this.withLock(async () => {
      const product = await this.productService.getProductDoc();
      const user = await this.queueModel.findOne({ userId }).exec();

      if (!user) {
        throw new NotFoundException('User not found');
      }

      if (productId && productId !== product.id) {
        throw new BadRequestException('Invalid product');
      }

      if (this.isUserAlreadyQueued(user.status)) {
        throw new BadRequestException('User is already in the queue');
      }

      user.productId = product._id as Types.ObjectId;
      user.status = QueueStatus.Waiting;
      user.position = await this.getNextPosition();
      user.queuedAt = new Date();
      user.reservedAt = null;
      user.expiresAt = null;
      await user.save();

      await this.processQueueInternal();
      await this.broadcastState();
      return this.getState();
    });
  }

  async completePurchase(userId: string) {
    return this.withLock(async () => {
      const user = await this.queueModel.findOne({ userId }).exec();

      if (!user || user.status !== QueueStatus.Reserved) {
        throw new BadRequestException('User does not have an active reservation');
      }

      await this.productService.finalizePurchase();
      this.clearQueueFields(user, QueueStatus.Completed);
      await user.save();

      await this.processQueueInternal();
      await this.broadcastState();
      return this.getState();
    });
  }

  async processQueue() {
    return this.withLock(async () => {
      await this.processQueueInternal();
      await this.broadcastState();
    });
  }

  async handleExpiration() {
    return this.withLock(async () => {
      const expiredUsers = await this.queueModel
        .find({
          status: QueueStatus.Reserved,
          expiresAt: { $ne: null, $lte: new Date() },
        })
        .sort({ position: 1 })
        .exec();

      if (expiredUsers.length === 0) {
        return;
      }

      for (const user of expiredUsers) {
        this.clearQueueFields(user, QueueStatus.Idle);
        await user.save();
        await this.productService.releaseOne();
      }

      await this.processQueueInternal();
      await this.broadcastState();
    });
  }

  async broadcastState() {
    const state = await this.getState();
    this.socketGateway.emitQueueUpdated(state.queue.users);
    this.socketGateway.emitStockUpdated(state.product);
  }

  private async processQueueInternal() {
    let product = await this.productService.getProductDoc();

    const waitingUsers = await this.queueModel
      .find({
        position: { $ne: null },
        status: { $in: [QueueStatus.Waiting, QueueStatus.Expired] },
      })
      .sort({ position: 1, queuedAt: 1 })
      .exec();

    for (const user of waitingUsers) {
      if (product.availableStock <= 0) {
        break;
      }

      const updatedProduct = await this.productService.reserveOne();

      if (!updatedProduct) {
        break;
      }

      product = updatedProduct;
      user.status = QueueStatus.Reserved;
      user.reservedAt = new Date();
      user.expiresAt = new Date(Date.now() + FIVE_MINUTES_MS);
      await user.save();
    }
  }

  private async getFormattedUsers() {
    const users = await this.queueModel.find().sort({ name: 1 }).lean().exec();

    const usersInQueue = users
      .filter((user) => user.position !== null)
      .sort((firstUser, secondUser) => (firstUser.position ?? 0) - (secondUser.position ?? 0));

    const normalizedPositions = new Map<string, number>();

    usersInQueue.forEach((user, index) => {
      normalizedPositions.set(user.userId, index + 1);
    });

    return users.map((user) => ({
      userId: user.userId,
      name: user.name,
      status: user.status,
      position: normalizedPositions.get(user.userId) ?? null,
      expiresAt: user.expiresAt ? new Date(user.expiresAt).getTime() : null,
    }));
  }

  private async getNextPosition() {
    const lastUser = await this.queueModel
      .findOne({ position: { $ne: null } })
      .sort({ position: -1 })
      .exec();

    return (lastUser?.position ?? 0) + 1;
  }

  private isUserAlreadyQueued(status: QueueStatus) {
    return (
      status === QueueStatus.Waiting ||
      status === QueueStatus.Reserved ||
      status === QueueStatus.Expired
    );
  }

  private clearQueueFields(user: QueueEntryDocument, status: QueueStatus) {
    user.status = status;
    user.position = null;
    user.queuedAt = null;
    user.reservedAt = null;
    user.expiresAt = null;
  }

  private async withLock<T>(task: () => Promise<T>) {
    const nextRun = this.processingChain.then(task, task);
    this.processingChain = nextRun.then(
      () => undefined,
      () => undefined,
    );
    return nextRun;
  }
}
