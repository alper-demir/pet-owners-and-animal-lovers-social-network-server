import mongoose from "mongoose";

const PetProfileSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    species: {
        type: String,
        required: true,
    },
    breed: {
        type: String,
        required: true,
    },
    birthDate: {
        type: Date,
        required: true,
    },
    profileUrl: {
        type: String,
        require: true
    },
    weight: {
        type: Number,
        required: true,
    },
    color: {
        type: String,
        required: true,
    },
    gender: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
});

export default mongoose.model("Pet", PetProfileSchema);
