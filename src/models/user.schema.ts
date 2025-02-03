import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Roles } from 'src/enums/user-roles.enum';
import { Address } from 'src/interfaces/address';

@Schema({ timestamps: true })
export class User extends Document {
    @Prop({ required: true, trim: true })
    name: string;

    @Prop({ required: true, unique: true, lowercase: true, trim: true })
    email: string;

    @Prop({ required: true })
    password: string;

    @Prop({
        type: String,
        enum: Object.values(Roles),
        default: Roles.CUSTOMER,
    })
    role: Roles;

    @Prop({ type: [{ type: Types.ObjectId, ref: 'Address' }] })
    addresses: Address[];

    @Prop({ required: true })
    phone: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
