import { Controller, Get } from '@nestjs/common';
import { ProductListItem, ProductsService } from './products.service';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  findAll(): Promise<ProductListItem[]> {
    return this.productsService.findAll();
  }
}
