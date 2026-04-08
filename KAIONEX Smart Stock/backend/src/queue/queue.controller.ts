import { Body, Controller, Get, Post } from '@nestjs/common';
import { QueueService } from './queue.service';

@Controller('queue')
export class QueueController {
  constructor(private readonly queueService: QueueService) {}

  @Get()
  getQueue() {
    return this.queueService.getQueue();
  }

  @Post()
  addToQueue(@Body() body: { userId: string; productId?: string }) {
    return this.queueService.addToQueue(body.userId, body.productId);
  }

  @Post('complete')
  completePurchase(@Body() body: { userId: string }) {
    return this.queueService.completePurchase(body.userId);
  }
}
