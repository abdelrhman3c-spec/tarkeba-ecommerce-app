import { Document } from 'mongoose';

export interface OrderDetails extends Document {
    orderID: string;
    productID: string;
    quantity: number;
    price: number;
}