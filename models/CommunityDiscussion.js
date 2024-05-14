import mongoose from 'mongoose';

const CommunityDiscussionSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    tips: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Tip',
        }
    ],
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

export default mongoose.model('CommunityDiscussion', CommunityDiscussionSchema);