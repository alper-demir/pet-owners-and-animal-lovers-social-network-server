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