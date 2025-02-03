import { Document, Types } from 'mongoose';

export interface Product extends Document {
    name: string;
    description: string;
    price: number;
    stock: number;
    details: Map<string, string>;
    categoryID: Types.ObjectId;
    images: string[];
}