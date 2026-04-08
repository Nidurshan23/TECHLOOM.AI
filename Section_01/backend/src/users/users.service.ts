import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';

const PRELOADED_USERS = [
  'Aarav',
  'Bhavya',
  'Charan',
  'Diya',
  'Eshan',
];

@Injectable()
export class UsersService implements OnModuleInit {
  constructor(@InjectModel(User.name) private readonly userModel: Model<UserDocument>) {}

  async onModuleInit() {
    const existingUsers = await this.userModel.countDocuments();
    if (existingUsers >= PRELOADED_USERS.length) {
      return;
    }

    await this.userModel.deleteMany({});
    await this.userModel.insertMany(PRELOADED_USERS.map((name) => ({ name })));
  }

  async findAll() {
    return this.userModel.find().lean();
  }

  async findById(userId: string) {
    return this.userModel.findById(userId);
  }
}
