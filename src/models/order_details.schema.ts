import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class OrderDetail extends Document {
    @Prop({ type: Types.ObjectId, ref: 'Order', required: true })
    orderID: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
    productID: Types.ObjectId;

    @Prop({ required: true, min: 1 })
    quantity: number;

    @Prop({ required: true, min: 0 })
    price: number;
}

export const OrderDetailSchema = SchemaFactory.createForClass(OrderDetail);

