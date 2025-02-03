import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from './user.schema';

@Schema({ timestamps: true })
export class Address extends Document {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    userID: User;

    @Prop({ required: true, trim: true })
    street: string;

    @Prop({ required: true, trim: true })
    city: string;

    @Prop({ trim: true })
    state: string;

    @Prop({ required: true, trim: true })
    country: string;

    @Prop({ required: true, trim: true })
    postalCode: string;
}

export const AddressSchema = SchemaFactory.createForClass(Address);