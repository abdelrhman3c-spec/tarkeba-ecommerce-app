import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Role } from 'src/enums/user-roles.enum';
import { Address } from 'src/interfaces/address';

@Schema({ timestamps: true })
export class User extends Document {
    @Prop({ default: 'local' })
    provider: string;

    @Prop()
    googleID?: string;

    @Prop({ required: true, trim: true })
    name: string;

    @Prop({ required: true, unique: true, lowercase: true, trim: true })
    email: string;

    @Prop({ required: true })
    password: string;

    @Prop({
        type: String,
        enum: Object.values(Role),
        default: Role.CUSTOMER,
    })
    role: Role;

    @Prop()
    verificationToken: string;
    
    @Prop()
    tokenExpiration: Date;
    
    @Prop({ default: false })
    isVerified: boolean;

    @Prop({ default: null })
    refreshToken: string;

    @Prop()
    resetToken?: string;

    @Prop()
    resetExpires?: Date;

    @Prop({ type: [{ type: Types.ObjectId, ref: 'Address' }], default: [] })
    addresses: Address[];

    @Prop({ required: false, default: null })
    phone: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
