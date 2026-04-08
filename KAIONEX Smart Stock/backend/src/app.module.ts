import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { SocketGateway } from './gateway/socket.gateway';
import { ProductController } from './product/product.controller';
import { Product, ProductSchema } from './product/product.schema';
import { ProductService } from './product/product.service';
import { QueueController } from './queue/queue.controller';
import { QueueEntry, QueueEntrySchema } from './queue/queue.schema';
import { QueueService } from './queue/queue.service';
import { ReservationService } from './reservation/reservation.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const mongoUri = configService.get<string>('MONGODB_URI');

        if (!mongoUri) {
          throw new Error('MONGODB_URI is missing. Add it to backend/.env.');
        }

        return {
          uri: mongoUri,
        };
      },
    }),
    MongooseModule.forFeature([
      { name: Product.name, schema: ProductSchema },
      { name: QueueEntry.name, schema: QueueEntrySchema },
    ]),
  ],
  controllers: [ProductController, QueueController],
  providers: [ProductService, QueueService, ReservationService, SocketGateway],
})
export class AppModule {}
