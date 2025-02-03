import { Document, Types } from 'mongoose';

export interface OrderDetails extends Document {
    orderID: Types.ObjectId;
    productID: Types.ObjectId;
    quantity: number;
    price: number;
}