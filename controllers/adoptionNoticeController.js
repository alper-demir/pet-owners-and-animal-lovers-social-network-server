import AdoptionNotice from "../models/AdoptionNotice.js";
import User from "../models/User.js";
import fs from "fs"
import path from "path"

export const createAdoptionNotice = async (req, res) => {
    try {
        const {
            name,
            species,
            age,
            gender,
            color,
            breed,
            city,
            dateOfBirth,
            description,
            userId,
            adoptionStatus,
            contactPhoneNumber
        } = req.body;

        const image = req.file?.filename;

        const newAdoptionNotice = await AdoptionNotice.create({ name, species, age, gender, color, breed, city, adoptionStatus, dateOfBirth, description, image, userId, contactPhoneNumber });
        if (newAdoptionNotice) {
            await User.findByIdAndUpdate(userId, { $push: { adoptionNotices: newAdoptionNotice._id } });
            return res.status(201).json({ message: "New adoption notice created", status: "success" });
        }
        return res.status(500).json({ message: 'Adoption notice error!', status: "error" });
    } catch (error) {
        console.error('Error creating adoption notice:', error);
        res.status(500).json({ message: 'Server error', status: "error" });
    }
}

export const getAdoptionNoticeList = async (req, res) => {
    try {
        const adoptionNotices = await AdoptionNotice.find().populate("userId", { username: 1, firstName: 1, lastName: 1 });
        res.status(200).json(adoptionNotices);
    } catch (error) {
        console.error('Error listing adoption notices:', error);
        res.status(500).json({ message: 'Server error' });
    }
}

export const getOneAdoptionNotice = async (req, res) => {
    const id = req.params.id;
    try {
        const adoptionNotice = await AdoptionNotice.findById(id).populate("userId", { username: 1, firstName: 1, lastName: 1 });
        if (!adoptionNotice) {
            return res.status(404).json({ message: "Adoption notice not found" });
        }
        res.status(200).json(adoptionNotice);
    } catch (error) {
        console.error("Error fetching adoption notice details:", error);
        res.status(500).json({ message: "Server error" });
    }
}

export const updateOneAdoptionNotice = async (req, res) => {
    const { id } = req.params;
    const { userId } = req.body; // ID of the logged in user
    const {
        name,
        species,
        age,
        gender,
        color,
        breed,
        city,
        dateOfBirth,
        adoptionStatus,
        contactPhoneNumber,
        description,
    } = req.body;
    const image = req.file?.filename
    const updatedAdoptionNotice = {};
    updatedAdoptionNotice.name = name?.trim();
    updatedAdoptionNotice.species = species?.trim();
    updatedAdoptionNotice.age = age;
    updatedAdoptionNotice.gender = gender?.trim();
    updatedAdoptionNotice.image = image?.trim();
    updatedAdoptionNotice.color = color?.trim();
    updatedAdoptionNotice.breed = breed?.trim();
    updatedAdoptionNotice.city = city?.trim();
    updatedAdoptionNotice.dateOfBirth = dateOfBirth;
    updatedAdoptionNotice.adoptionStatus = adoptionStatus?.trim();
    updatedAdoptionNotice.contactPhoneNumber = contactPhoneNumber?.trim();
    updatedAdoptionNotice.description = description?.trim();
    try {
        // Find the ad and check if it matches the user ID
        const adoptionNotice = await AdoptionNotice.findById(id)
        const updateLostPet = await AdoptionNotice.findByIdAndUpdate(id, updatedAdoptionNotice, { new: true });
        if (!adoptionNotice) {
            return res.status(404).json({ message: "Adoptin notice not found" });
        }
        if (adoptionNotice.userId._id.toString() !== userId) {
            return res.status(403).json({ message: "You are not authorized to update this adoption notice" });
        }

        if (updateLostPet && image) {
            // Delete old Notice Image
            fs.unlink(path.join(process.cwd(), 'public', 'images', adoptionNotice.image), (err) => { console.log(err) });
            return res.status(200).json({ message: "Lost pet notice updated successfully", adoptionNotice, status: "success" });
        } else {
            return res.status(200).json({ message: "Lost pet notice updated successfully", adoptionNotice, status: "success" });
        }

    } catch (error) {
        console.error("Error updating adoption notice:", error);
        return res.status(500).json({ message: "Server error", status: error });
    }
};

export const deleteAdoptionNotice = async (req, res) => {
    const { id } = req.params;
    try {
        const deleteAdoptionNotice = await AdoptionNotice.findByIdAndDelete(id);
        if (deleteAdoptionNotice) {
            return res.status(201).json({ message: "Adoption notice deleted succesfully", status: "success" });
        } else {
            return res.status(400).json({ message: "An error occured during adoption notice delete", status: "error" });
        }
    } catch (error) {
        return res.status(400).json({ message: "An error occured during adoption notice delete", status: "error" });
    }
}