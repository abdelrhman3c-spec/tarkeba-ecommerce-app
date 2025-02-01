import { Document } from 'mongoose';

export interface Address extends Document {
    userID: string;
    street: string;
    city: string;
    state?: string;
    country: string;
    postalCode: string;
}