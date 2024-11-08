import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    ip: {
        type: String,
        required: true,
        unique: true,
        length: 15
    },
    username: {
        type: String,
        required: true,
        unique: true,
        length: 32
    },
    lastOnline: {
        type: Date,
        required: true,
        default: Date.now
    }
}, { timestamps: true });

export default mongoose.model('User', userSchema);