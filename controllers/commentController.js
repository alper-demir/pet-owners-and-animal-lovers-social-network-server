import User from "../models/User.js"
import Post from "../models/Post.js"
import Comment from "../models/Comments.js"

export const createComment = async (req, res) => {
    const { userId, postId, content } = req.body;
    try {
        const user = await User.findById(userId);
        if (user) {
            const newComment = await Comment.create({ userId, postId, content });
            const commentId = newComment._id;
            if (newComment) {
                console.log("New post : " + newComment);
                await User.findByIdAndUpdate(user, { $push: { comments: commentId } }, { new: true });
                await Post.findByIdAndUpdate(postId, { $push: { comments: commentId } }, { new: true });
            }
            return res.json({ newComment, message: "New comment added" })
        }


    } catch (error) {
        console.log("Create comment error: " + error);
        res.send("New comment create error")
    }
}

export const deleteComment = async (req, res) => {
    const { postId } = req.body;
    const { id } = req.params;
    try {
        await Comment.findByIdAndDelete(id);
        await Post.findByIdAndUpdate(postId, { $pull: { comments: id } });
        return res.json({ message: "Comment deleted successfully", status: "success" })
    } catch (error) {
        console.log("Delete comment error: " + error);
        return res.json({ message: "Comment delete error", status: "error" });
    }
}

export const editComment = async (req, res) => {
    const { content } = req.body;
    const { id } = req.params;
    if (content) {
        try {
            const editComment = await Comment.findByIdAndUpdate(id, { content }, { new: true });
            if (editComment) {
                return res.json({ message: "Comment updated successfully", status: "success" })
            }
        } catch (error) {
            console.log("Edit comment error: " + error);
            return res.json({ message: "Edit comment error", status: "error" });
        }
    }
    return res.json({ message: "Edit comment error", status: "error" });
}