import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    ip: {
        type: String,
        required: true,
        unique: true,
        maxlength: 32
    },
    username: {
        type: String,
        required: true,
        maxlength: 32
    },
    lastOnline: {
        type: Date,
        required: true,
        default: Date.now
    },
    role: {
        type: String,
        required: true,
        default: 'user',
        enum: ['user', 'admin']
    }
}, { timestamps: true });

export default mongoose.model('User', userSchema);