import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Category extends Document {
    @Prop({ required: true, unique: true, trim: true })
    name: string;

    @Prop({ trim: true })
    description: string;

    @Prop({ type: Types.ObjectId, ref: 'Category', default: null })
    parentCategoryID: Category;
}

export const CategorySchema = SchemaFactory.createForClass(Category);