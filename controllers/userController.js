import User from "../models/User.js"
import Post from "../models/Post.js"
import fs from "fs"
import path from "path"

export const updateProfileImage = async (req, res) => {
    const { userId } = req.params;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const updatedUser = await User.findByIdAndUpdate(userId, { profileUrl: req.file.filename });
        if (updatedUser && user.profileUrl) {
            // Delete old profile pic
            fs.unlink(path.join(process.cwd(), 'public', 'images', user.profileUrl), (err) => { console.log(err) });
            return res.json({ message: "Profile picture updated.", status: "success" }).status(200);
        } else {
            return res.json({ message: "Profile picture update failed." }).status(400);
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }
}

export const updateProfile = async (req, res) => {
    const { userId } = req.params;
    const updateFields = req.body;

    try {
        const updatedUser = await User.findByIdAndUpdate(userId, updateFields, { new: true });

        if (updatedUser) {
            return res.json({ message: "Profile updated successfully.", status: "success" });
        } else {
            return res.status(404).json({ message: "User not found.", status: "error" });
        }
    } catch (error) {
        console.error('Error updating profile:', error);
        return res.status(500).json({ message: "An error occurred while updating profile.", status: "error" });
    }
}

export const getOneUser = async (req, res) => {
    const username = req.params.username;
    try {
        const user = await User.findOne({ username }, { about: 1, firstName: 1, lastName: 1, posts: 1, pets: 1, username: 1, profileUrl: 1, privacy: 1, gender: 1 });
        if (user) {
            return res.json({ user });
        }
        return res.status(404).json({ message: "User not found" });
    } catch (error) {
        console.log("User find error: " + error);
        return res.status(500).json({ message: "Internal Server Error", status: "error" });
    }
}

export const getAllPostsOfOneUser = async (req, res) => {
    const username = req.params.username;

    try {
        const posts = await User.findOne({ username }).populate("posts").select("posts");
        res.json(posts);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', status: "error" });
    }
}

export const getAllPetsOfOneUser = async (req, res) => {
    const username = req.params.username;

    try {
        const pets = await User.findOne({ username }).populate("pets").select("pets");
        res.json(pets);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error ', status: "error" });
    }
}

export const getAllNoticesOfOneUser = async (req, res) => {
    const username = req.params.username;

    try {
        const notices = await User.findOne({ username }).populate("notices").select("notices");
        res.json(notices);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', status: "error" });
    }
}

export const likePost = async (req, res) => {
    const { userId, postId } = req.body;
    try {
        const user = await User.findById(userId);
        const post = await Post.findById(postId);

        if (!user.likes.includes(postId)) {
            await post.updateOne({ $push: { likes: userId } });
            await user.updateOne({ $push: { likes: postId } });
            return res.json({ message: "New like pushed!", liked: true });

        } else {
            await post.updateOne({ $pull: { likes: userId } });
            await user.updateOne({ $pull: { likes: postId } });
            return res.json({ message: "Like pulled!", liked: false });
        }


    } catch (error) {
        console.log("Create like error: " + error);
        res.status(500).json({ message: "New like create error" });
    }
}

export const didUserLikeThePost = async (req, res) => { // On the post detail page like status will be checked
    const { userId, postId } = req.body;
    try {
        // Check if the user has an entry containing the postId in the likes field
        const user = await User.findById(userId);
        const liked = user.likes.includes(postId);

        res.json({ liked });
    } catch (error) {
        console.error("Check post like status error:", error);
        res.status(500).json({ message: 'Internal Server Error', status: "error" });
    }
}

export const checkProfileVisibility = async (req, res) => { // checks profile visibility for private accounts
    const { currentUserId, username } = req.body;

    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (user._id.toString() === currentUserId) {
            // If the user is on their own profile, don't do any checks
            return res.status(200).json({ message: "Own profile" });
        }

        const isFollowing = user.followers.includes(currentUserId);
        const isPrivate = user.privacy === "private";
        let visibility = false;
        if (!isPrivate || isFollowing) {
            visibility = true
        }

        return res.status(200).json({ isFollowing, isPrivate, visibility });
    } catch (error) {
        console.error("Error checking profile visibility:", error);
        return res.status(500).json({ message: "Server error", status: "error" });
    }
}