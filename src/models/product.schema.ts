import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Product extends Document {
    @Prop({ required: true, trim: true })
    name: string;

    @Prop({ required: true, trim: true })
    description: string;

    @Prop({ required: true, min: 0 })
    price: number;

    @Prop({ required: true })
    stock: number;

    @Prop({ type: Map, of: String, default: {} })
    details: Record<string, string>;

    @Prop({ type: Types.ObjectId, ref: 'Category' })
    categoryID: Types.ObjectId;

    @Prop({ type: [String] })
    images: string[];
}

export const ProductSchema = SchemaFactory.createForClass(Product);