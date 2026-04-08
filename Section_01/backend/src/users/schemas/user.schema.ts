import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true, collection: 'kaionex_users' })
export class User {
  @Prop({ required: true, trim: true })
  name: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
