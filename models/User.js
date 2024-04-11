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
    },
    animalProfiles: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "AnimalProfile",
        }
    ],
    posts: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Post",
        }
    ],
    createdAt: {
        type: Date,
        default: Date.now,
    }
});

export default mongoose.model("User", UserSchema);
