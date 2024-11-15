import mongoose from "mongoose";

const newsSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        maxlength: 128
    },
    content: {
        type: String,
        required: true,
        maxlength: 8192
    },
    image: {
        type: String,
        required: false,
        maxlength: 256
    },
    video: {
        type: String,
        required: false,
        maxlength: 256
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
                maxlength: 1024
            },
            date: {
                type: Date,
                required: true,
                default: Date.now
            }
        }
    ],
    views: [
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
    ]
}, { timestamps: true });

export default mongoose.model('News', newsSchema);