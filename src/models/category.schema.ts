import mongoose from "mongoose";

export const CategorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    description: {
        type: String,
        trim: true,
    },
    parentCategoryID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        default: null,
    },
}, { timestamps: true });
