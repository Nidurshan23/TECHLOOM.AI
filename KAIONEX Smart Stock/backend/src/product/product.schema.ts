import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ProductDocument = HydratedDocument<Product>;

@Schema({ timestamps: true })
export class Product {
  @Prop({ required: true, unique: true })
  code!: string;

  @Prop({ required: true })
  name!: string;

  @Prop({ required: true })
  price!: number;

  @Prop({ required: true, min: 0 })
  totalStock!: number;

  @Prop({ required: true, min: 0 })
  availableStock!: number;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
