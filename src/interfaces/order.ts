import { Document, Types } from 'mongoose';

export interface Order extends Document {
    userID: Types.ObjectId;
    totalPrice: number;
    status: string;
    address: string;
}