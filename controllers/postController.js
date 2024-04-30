import Post from "../models/Post.js"
import User from "../models/User.js"

export const createPost = async (req, res) => {
    const { userId, content } = req.body;

    if (!req.file) {
        return res.status(400).json({ message: "Please select a file", status: "error" });
    }

    try {
        const newPost = await Post.create({ userId, content, image: req.file.filename });
        const postId = newPost._id;
        const updatedUser = await User.findByIdAndUpdate(userId, { $push: { posts: postId } }, { new: true });

        console.log("New post:", newPost);
        console.log("Updated user:", updatedUser);

        return res.status(201).json({ message: "New post added", status: "success" });
    } catch (error) {
        console.error("Create post error:", error);
        return res.status(500).json({ message: "An error occurred while creating post", status: "error" });
    }
}

export const getOnePost = async (req, res) => {
    const postId = req.params.postId;
    try {
        const post = await Post.findById(postId).populate("userId", { username: 1, profileUrl: 1, firstName: 1, lastName: 1 }) // owner of post
            .populate({
                path: "comments",
                populate: {
                    path: "userId",
                    select: { username: 1, profileUrl: 1, firstName: 1, lastName: 1 } // selection of needed fields
                }
            })
            .populate("likes", { username: 1, profileUrl: 1, firstName: 1, lastName: 1 })
        res.json(post);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Sunucu hatası' });
    }
}