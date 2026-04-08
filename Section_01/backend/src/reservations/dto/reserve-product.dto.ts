import { IsMongoId } from 'class-validator';

export class ReserveProductDto {
  @IsMongoId()
  userId: string;

  @IsMongoId()
  productId: string;
}
