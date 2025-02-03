import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { OrderStatus } from 'src/enums/order-status.enum';


@Schema({ timestamps: true })
export class Order extends Document {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    userID: Types.ObjectId;

    @Prop({ required: true, min: 0 })
    totalPrice: number;

    @Prop({ type: String, enum: Object.values(OrderStatus), default: OrderStatus.PENDING })
    status: OrderStatus;

    @Prop({ type: Types.ObjectId, ref: 'Address', required: true })
    address: Types.ObjectId;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
