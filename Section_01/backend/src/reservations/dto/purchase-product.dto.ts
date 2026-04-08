import { IsMongoId } from 'class-validator';

export class PurchaseProductDto {
  @IsMongoId()
  userId: string;

  @IsMongoId()
  productId: string;
}
