import mongoose from 'mongoose';

const AdoptionNoticeSchema = new mongoose.Schema({
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
    city: {
        type: String,
        required: true,
    },
    dateOfBirth: {
        type: Date,
        required: true,
    },
    adoptionStatus: {
        type: String,
        enum: ['Adopting', 'Adopted'],
        default: 'Lost',
    },
    contactPhoneNumber: {
        type: String,
        required: true
    },
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

export default mongoose.model('AdoptionNotice', AdoptionNoticeSchema);