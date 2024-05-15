import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: true,
    },
    username: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    profileUrl: {
        type: String,
        default: "defaultAvatar.jpg"
    },
    about: {
        type: String
    },
    gender: {
        type: String,
        enum: ["male", "female"]
    },
    pets: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Pet",
        }
    ],
    posts: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Post",
        }
    ],
    notices: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "LostPet",
        }
    ],
    adoptionNotices: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "AdoptionNotice",
        }
    ],
    comments: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment",
        }
    ],
    likes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Post",
            default: 0
        }
    ],
    privacy: {
        type: String,
        enum: ["public", "private"],
        default: "public"
    },
    followers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    followings: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    discussions: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "CommunityDiscussion",
        }
    ],
    tips: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Tip",
        }
    ],
    createdAt: {
        type: Date,
        default: Date.now,
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    isVolunteer: {
        type: Boolean,
        default: false
    },
});

export default mongoose.model("User", UserSchema);
