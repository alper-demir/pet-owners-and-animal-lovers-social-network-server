import User from "../models/User.js"
import Pet from "../models/PetProfile.js"
import fs from "fs"
import path from "path"
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
    const { id } = req.params;
    try {
        const pet = await Pet.findById(id).populate("userId", { username: 1 }).select();
        res.json(pet);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', status: "error" });
    }
}

export const updatePetProfile = async (req, res) => {
    const { id } = req.params;
    const { userId } = req.body; // ID of the logged in user
    const { name, species, gender, color, breed, birthDate, weight } = req.body;
    const profileUrl = req.file?.filename
    try {
        // Find the ad and check if it matches the user ID
        const petProfile = await Pet.findById(id)
        const updatePetProfile = await Pet.findByIdAndUpdate(id, { name, species, gender, color, breed, profileUrl, weight, birthDate }, { new: true });
        if (!petProfile) {
            return res.status(404).json({ message: "Lost pet not found" });
        }
        if (petProfile.userId._id.toString() !== userId) {
            return res.status(403).json({ message: "You are not authorized to update this pet profile" });
        }

        if (updatePetProfile && profileUrl) {
            // Delete old profileUrl
            fs.unlink(path.join(process.cwd(), 'public', 'images', petProfile.profileUrl), (err) => { console.log(err) });
            return res.status(200).json({ message: "Pet profile updated successfully", updatePetProfile, status: "success" });
        } else {
            return res.status(200).json({ message: "Pet profile updated successfully", updatePetProfile, status: "success" });
        }

    } catch (error) {
        console.error("Error updating pet profile:", error);
        return res.status(500).json({ message: "Server error", status: error });
    }
}

export const deletePetProfile = async (req, res) => {
    const { id } = req.params;
    try {
        const deletePost = await Pet.findByIdAndDelete(id);
        if (deletePost) {
            return res.status(201).json({ message: "Pet profile deleted succesfully", status: "success" });
        } else {
            return res.status(400).json({ message: "An error occured during pet profile delete", status: "error" });
        }
    } catch (error) {
        return res.status(400).json({ message: "An error occured during pet profile delete", status: "error" });
    }
}