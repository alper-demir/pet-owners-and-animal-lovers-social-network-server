import mongoose from "mongoose";

const AnimalProfileSchema = new mongoose.Schema({
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
    age: {
        type: Number,
        required: true,
    },
    weight: {
        type: Number,
        required: true,
    },
    color: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
});

export default mongoose.model("AnimalProfile", AnimalProfileSchema);
