import User from "../models/User.js"
import Post from "../models/Post.js"
import LostPet from "../models/LostPet.js"
import AdoptionNotice from "../models/AdoptionNotice.js"
import fs from "fs"
import path from "path"
import Pet from "../models/PetProfile.js"
import generateToken from "../utils/generateToken.js"
import bcrypt from "bcrypt"

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
        const user = await User.findOne({ username }, { about: 1, firstName: 1, lastName: 1, posts: 1, pets: 1, username: 1, profileUrl: 1, privacy: 1, gender: 1, followers: 1, followings: 1, isVolunteer: 1 });
        if (user) {
            return res.json({ user });
        }
        return res.status(404).json({ message: "User not found" });
    } catch (error) {
        console.log("User find error: " + error);
        return res.status(500).json({ message: "Internal Server Error", status: "error" });
    }
}

export const getOneUserById = async (req, res) => {
    const { id } = req.params;
    try {
        const user = await User.findById(id, { username: 1, firstName: 1, lastName: 1, profileUrl: 1 });
        return res.json(user);
    } catch (error) {
        console.log(error);
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

export const getAllAdoptionNoticesOfOneUser = async (req, res) => {
    const username = req.params.username;

    try {
        const adoptionNotices = await User.findOne({ username }).populate("adoptionNotices").select("adoptionNotices");
        res.json(adoptionNotices);
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

export const search = async (req, res) => {
    const searchText = req.query.q;

    try {
        const users = await User.find({
            $or: [
                { firstName: { $regex: searchText, $options: 'i' } },
                { lastName: { $regex: searchText, $options: 'i' } },
                { username: { $regex: searchText, $options: 'i' } }
            ]
        }).select('firstName lastName username profileUrl').limit(6);

        const posts = await Post.find({
            $or: [
                { title: { $regex: searchText, $options: 'i' } },
                { content: { $regex: searchText, $options: 'i' } }
            ]
        }).select('content image').limit(6);

        const pets = await Pet.find({
            $or: [
                { name: { $regex: searchText, $options: 'i' } },
                { species: { $regex: searchText, $options: 'i' } },
                { breed: { $regex: searchText, $options: 'i' } }
            ]
        }).select('name species breed profileUrl').limit(6);

        const lostPets = await LostPet.find({
            $or: [
                { name: { $regex: searchText, $options: 'i' } },
                { description: { $regex: searchText, $options: 'i' } }
            ]
        }).select('name description image').limit(6);

        const adoptionNotices = await AdoptionNotice.find({
            $or: [
                { title: { $regex: searchText, $options: 'i' } },
                { description: { $regex: searchText, $options: 'i' } },
                { city: { $regex: searchText, $options: 'i' } }
            ]
        }).select('title description image city').limit(6);

        res.json({ users, posts, pets, lostPets, adoptionNotices });
    } catch (error) {
        console.error('Error searching:', error);
        res.status(500).json({ message: 'An error occurred while searching' });
    }
}

export const getFollowers = async (req, res) => {
    const { id } = req.params;
    try {
        const followers = await User.findById(id, { followers: 1 }).populate({ path: "followers", select: { firstName: 1, lastName: 1, username: 1, profileUrl: 1 } });
        if (followers) {
            return res.json(followers)
        }
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error", status: "error" });
    }
}

export const getFollowings = async (req, res) => {
    const { id } = req.params;
    try {
        const followings = await User.findById(id, { followings: 1 }).populate({ path: "followings", select: { firstName: 1, lastName: 1, username: 1, profileUrl: 1 } });
        if (followings) {
            return res.json(followings)
        }
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error", status: "error" });
    }
}

export const timeline = async (req, res) => {
    const { id, type } = req.params;
    try {
        if (type === "posts") {
            const user = await User.findById(id);
            if (!user) {
                return res.status(404).json({ message: "User not found", status: "error" });
            }

            // Find posts of the users that the current user is following
            const timelinePosts = await Post.find({ userId: { $in: user.followings } })
                .populate("userId", "firstName lastName username profileUrl")
                .sort({ createdAt: -1 });

            return res.json({ timeline: timelinePosts, status: "success" });
        }

        if (type === "notices") {
            const user = await User.findById(id);
            if (!user) {
                return res.status(404).json({ message: "User not found", status: "error" });
            }

            // Find notices of the users that the current user is following
            const timelineNotices = await LostPet.find({ userId: { $in: user.followings } })
                .populate("userId", "firstName lastName username profileUrl")
                .sort({ createdAt: -1 });

            return res.json({ timeline: timelineNotices, status: "success" });
        }

    } catch (error) {
        console.error("Error fetching timeline:", error);
        return res.status(500).json({ message: "Internal Server Error", status: "error" });
    }
}

export const doesUserAllowedToSeeContent = async (req, res) => {
    const { userId, contentOwnerId } = req.body;
    try {
        const user = await User.findById(userId);
        const contentOwnner = await User.findById(contentOwnerId);
        if (contentOwnner.privacy === "public" || user.followings.includes(contentOwnerId) || userId == contentOwnerId) {
            return res.json({ message: "User can see content", status: "success", allowed: true });
        }
        return res.json({ message: "You cannot view this content. The account is private or you are not following it!", status: "success", allowed: false });

    } catch (error) {
        return res.json({ message: "Error!", status: "error", allowed: false });
    }
}

export const checkUsernameValid = async (req, res) => {
    const { username } = req.body;

    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.json({ message: "Username is avaliable.", status: "success", avaliable: true });
        }
        return res.json({ message: "Username is not avaliable!", status: "success", avaliable: false });
    } catch (error) {
        return res.json({ message: "Error username", status: "error" });
    }

}

export const changeUsername = async (req, res) => {
    const { userId, newUsername, data } = req.body;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found', status: "error" });
        }

        user.username = newUsername;
        await user.save();

        const newToken = generateToken(data);

        return res.status(200).json({ message: 'Username successfully changed', status: "success", token: newToken });
    } catch (error) {
        console.error('Error changing username:', error);
        return res.status(500).json({ message: 'Server error', status: "error" });
    }
}

export const changePasswordInProfile = async (req, res) => {
    const { userId, oldPassword, newPassword } = req.body;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found', status: "error" });
        }

        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.json({ message: 'Incorrect old password', status: "error" });
        }

        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();

        return res.status(200).json({ message: 'Password successfully changed', status: "success" });
    } catch (error) {
        console.error('Error changing password:', error);
        res.status(500).json({ message: 'Server error' });
    }
}