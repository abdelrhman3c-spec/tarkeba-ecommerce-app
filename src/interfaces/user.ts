import { Document } from 'mongoose';
import { Roles } from 'src/enums/user-roles.enum';

export interface User extends Document {
    name: string;
    email: string;
    readonly password: string;
    role: Roles;
    addresses: string[];
    phone: string;
}