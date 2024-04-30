import User from "../models/User.js"
import Pet from "../models/PetProfile.js"

export const createPetProfile = async (req, res) => {
    const { userId, name, species, breed, birthDate, weight, color, gender } = req.body;
    const image = req.file.filename;
    try {
        const user = await User.findById(userId);
        if (user && image) {
            const newPetProfile = await Pet.create({ userId, name, species, breed, birthDate, profileUrl: image, weight, color, gender });
            const petProfileId = newPetProfile._id;
            if (newPetProfile) {
                console.log("New pet profile: " + newPetProfile);
                const updatedUser = await User.findByIdAndUpdate(user, { $push: { pets: petProfileId } }, { new: true });
                console.log({ message: `Updated user: ${updatedUser}` });
                return res.json({ message: "New pet profile added", status: "success" });
            }
        }
        return res.json({ message: "New pet profile create error", status: "error" });

    } catch (error) {
        console.log("Create pet profile error: " + error);
        return res.json({ message: "New pet profile create error", status: "error" });
    }
}

export const getOnePet = async (req, res) => {
    const petId = req.params.petId;
    try {
        const pet = await Pet.findById(petId).populate("userId", { username: 1 }).select();
        res.json(pet);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', status: "error" });
    }
}