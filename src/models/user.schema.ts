import mongoose from 'mongoose';

enum SystemRoles {
    ADMIN = 'admin',
    MANAGER = 'manager',
    CUSTOMER = 'customer',
}

export const UserSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true,
        trim: true
    },
    email: { 
        type: String, 
        required: true,
        unique: true, lowercase: true, trim: true
    },
    password: { 
        type: String, 
        required: true 
    },
    role: { 
        type: String, 
        enum: Object.values(SystemRoles), 
        default: SystemRoles.CUSTOMER
    },
    addresses: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Address" 
    }],
    phone: { 
        type: String, 
        required: true 
    },
}, { timestamps: true });