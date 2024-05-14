import mongoose from "mongoose";

const TipSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    discussionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "CommunityDiscussion",
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
});

export default mongoose.model("Tip", TipSchema);