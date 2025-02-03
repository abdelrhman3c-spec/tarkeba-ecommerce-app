import { Document, Types } from 'mongoose';

export interface Address extends Document {
    userID: Types.ObjectId;
    street: string;
    city: string;
    state?: string;
    country: string;
    postalCode: string;
}