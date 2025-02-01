import { Document } from 'mongoose';

export interface Order extends Document {
    userID: string;
    totalPrice: number;
    status: string;
    address: string;
}