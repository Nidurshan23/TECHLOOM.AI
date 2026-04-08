import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductsModule } from '../products/products.module';
import { UsersModule } from '../users/users.module';
import { ReservationsController } from './reservations.controller';
import { ReservationsGateway } from './reservations.gateway';
import { ReservationsService } from './reservations.service';
import { Reservation, ReservationSchema } from './schemas/reservation.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Reservation.name, schema: ReservationSchema },
    ]),
    ProductsModule,
    UsersModule,
  ],
  controllers: [ReservationsController],
  providers: [ReservationsService, ReservationsGateway],
  exports: [ReservationsService],
})
export class ReservationsModule {}
