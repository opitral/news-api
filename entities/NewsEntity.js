import mongoose from "mongoose";

const newsSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        length: 128
    },
    content: {
        type: String,
        required: true,
        length: 1024
    },
    image: {
        type: String,
        required: false,
        length: 256
    },
    video: {
        type: String,
        required: false,
        length: 256
    },
    likes: [
        {
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
                required: true
            },
            date: {
                type: Date,
                required: true,
                default: Date.now
            }
        }
    ],
    comments: [
        {
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
                required: true
            },
            content: {
                type: String,
                required: true,
                length: 1024
            },
            date: {
                type: Date,
                required: true,
                default: Date.now
            }
        }
    ],
}, { timestamps: true });

export default mongoose.model('News', newsSchema);