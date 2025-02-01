import { Document } from 'mongoose';

export interface User extends Document {
    name: string;
    email: string;
    readonly password: string;
    role: string;
    addresses: string[];
    phone: string;
}