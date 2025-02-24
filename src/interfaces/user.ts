import { Document } from 'mongoose';
import { Role } from 'src/enums/user-roles.enum';

export interface User extends Document {
    name: string;
    email: string;
    readonly password: string;
    role: Role;
    addresses: string[];
    phone: string;
}