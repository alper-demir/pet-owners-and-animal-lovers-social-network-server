import mongoose from 'mongoose';

const LostPetSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    species: {
        type: String,
        required: true,
    },
    age: {
        type: Number,
        required: true,
    },
    gender: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        required: true
    },
    color: {
        type: String,
        required: true,
    },
    breed: String,
    lastSeenLocation: {
        type: String,
        required: true,
    },
    lastSeenDate: {
        type: Date,
        required: true,
    },
    lostStatus: {
        type: String,
        enum: ['Lost', 'Found'],
        default: 'Lost',
    },
    contactPhoneNumber: {
        type: String,
        required: true,
    },
    city: {
        type: String,
        required: true
    },
    contactEmail: String,
    description: String,
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

export default mongoose.model('LostPet', LostPetSchema);
