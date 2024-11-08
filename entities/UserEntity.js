import mongoose from "mongoose";
import News from './NewsEntity.js';

const userSchema = new mongoose.Schema({
    ip: {
        type: String,
        required: true,
        unique: true,
        maxlength: 15
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

userSchema.pre('findOneAndDelete', async function(next) {
    const userId = this.getQuery()._id;

    try {
        await News.updateMany(
            {},
            {
                $pull: {
                    comments: { user: userId },
                    likes: { user: userId },
                }
            }
        );

        next();
    } catch (error) {
        next(error);
    }
});

export default mongoose.model('User', userSchema);