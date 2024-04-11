import mongoose from "mongoose";

const LikeSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    postId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
});

export default mongoose.model("Like", LikeSchema);
