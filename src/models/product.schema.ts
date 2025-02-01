import mongoose from 'mongoose';

export const ProductSchema = new mongoose.Schema({
    name: {
        type: String, 
        required: true, 
        trim: true 
    },
    description: { 
        type: String, 
        required: true, 
        trim: true
    },
    price: {
        type: Number, 
        required: true, 
        min: 0 
    },
    stock: {
        type: Number, 
        required: true
    },
    details: { 
        type: Map, 
        of: String, 
        default: {} 
    },
    categoryID: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Category"
    },
    images: [{ type: String }],
}, { timestamps: true });