import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { PurchaseProductDto } from './dto/purchase-product.dto';
import { ReserveProductDto } from './dto/reserve-product.dto';
import { ReservationsService } from './reservations.service';

@Controller()
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Post('reserve')
  reserve(@Body() dto: ReserveProductDto) {
    return this.reservationsService.reserve(dto);
  }

  @Post('purchase')
  purchase(@Body() dto: PurchaseProductDto) {
    return this.reservationsService.purchase(dto);
  }

  @Get('queue')
  getQueue(@Query('productId') productId: string) {
    return this.reservationsService.getQueue(productId);
  }
}
