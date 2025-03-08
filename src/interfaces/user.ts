import { Document } from 'mongoose';
import { Role } from 'src/enums/user-roles.enum';
import { Address } from './address';

export interface User extends Document {
  provider: string;
  googleID?: string;
  name: string;
  email: string;
  password: string;
  role: Role;
  verificationToken?: string;
  tokenExpiration?: Date;
  isVerified: boolean;
  refreshToken: string;
  resetToken?: string;
  resetExpires?: Date;
  addresses?: Address[];
  phone?: string;
}