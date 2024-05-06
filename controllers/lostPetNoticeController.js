import LostPet from "../models/LostPet.js"
import User from "../models/User.js"
import fs from "fs"
import path from "path"

export const createLostPetNotice = async (req, res) => {
    try {
        const {
            name,
            species,
            age,
            gender,
            color,
            breed,
            city,
            lastSeenLocation,
            lastSeenDate,
            lostStatus,
            contactPhoneNumber,
            contactEmail,
            description,
            userId
        } = req.body;

        const image = req.file.filename

        const newLostPet = {
            name,
            species,
            age,
            gender,
            image,
            color,
            breed,
            city,
            lastSeenLocation,
            lastSeenDate,
            lostStatus,
            contactPhoneNumber,
            contactEmail,
            description,
            userId
        };

        try {
            const user = await User.findById(userId);
            if (user && image) {
                const newLostNotice = await LostPet.create(newLostPet);
                const lostNoticeId = newLostNotice._id;
                if (newLostNotice) {
                    console.log("New lost notice: " + newLostNotice);
                    const updatedUser = await User.findByIdAndUpdate(userId, { $push: { notices: lostNoticeId } }, { new: true });
                    console.log({ message: `Updated user: ${updatedUser}` });
                    return res.json({ message: "New lost notice created", status: "success" }).status(201);
                }
            }

        } catch (error) {
            console.log("Create lost notice  error: " + error);
            return res.json({ message: "New lost notice create error", status: "error" });
        }


    } catch (error) {
        console.error('Error creating lost pet notice:', error);
        return res.status(500).json({ message: 'Server error' });
    }
}

export const getLostPetNoticeList = async (req, res) => { // Listing of posted notices
    try {
        const { page = 1, limit = 20 } = req.query;
        // Retrieve lost animal advertisements from the database with pagination
        const lostPets = await LostPet.find().populate("userId", { username: 1, firstName: 1, lastName: 1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec();
        // Get the total number of notices
        const totalCount = await LostPet.countDocuments();

        // Calculate total number of pages
        const totalPages = Math.ceil(totalCount / limit);
        // Send current page, total page and ad list as reply
        return res.status(200).json({
            lostPets,
            totalPages,
            currentPage: page
        });
    } catch (error) {
        console.error('Error listing lost pet listings:', error);
        return res.status(500).json({ message: 'Server error', status: "error" });
    }
}

export const getOneLostPetNotice = async (req, res) => { // Detail page of single lost pet notice
    const id = req.params.id;

    try {
        const lostPet = await LostPet.findById(id).populate("userId", { firstName: 1, lastName: 1, username: 1 });
        if (!lostPet) {
            return res.status(404).json({ message: "Lost pet not found", status: "error" });
        }
        res.status(200).json(lostPet);
    } catch (error) {
        console.error("Error fetching lost pet details:", error);
        res.status(500).json({ message: "Server error", status: "error" });
    }
}

export const updateOneNotice = async (req, res) => {
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
        lastSeenLocation,
        lastSeenDate,
        lostStatus,
        contactPhoneNumber,
        contactEmail,
        description,
    } = req.body;
    const image = req.file?.filename
    const updatedLostPet = {};
    updatedLostPet.name = name?.trim();
    updatedLostPet.species = species?.trim();
    updatedLostPet.age = age;
    updatedLostPet.gender = gender?.trim();
    updatedLostPet.image = image?.trim();
    updatedLostPet.color = color?.trim();
    updatedLostPet.breed = breed?.trim();
    updatedLostPet.city = city?.trim();
    updatedLostPet.lastSeenLocation = lastSeenLocation?.trim();
    updatedLostPet.lastSeenDate = lastSeenDate;
    updatedLostPet.lostStatus = lostStatus?.trim();
    updatedLostPet.contactPhoneNumber = contactPhoneNumber?.trim();
    updatedLostPet.contactEmail = contactEmail?.trim();
    updatedLostPet.description = description?.trim();
    try {
        // Find the ad and check if it matches the user ID
        const lostPet = await LostPet.findById(id)
        const updateLostPet = await LostPet.findByIdAndUpdate(id, updatedLostPet, { new: true });
        if (!lostPet) {
            return res.status(404).json({ message: "Lost pet not found" });
        }
        if (lostPet.userId._id.toString() !== userId) {
            return res.status(403).json({ message: "You are not authorized to update this lost pet notice" });
        }

        if (updateLostPet && image) {
            // Delete old Notice Image
            fs.unlink(path.join(process.cwd(), 'public', 'images', lostPet.image), (err) => { console.log(err) });
            return res.status(200).json({ message: "Lost pet notice updated successfully", lostPet, status: "success" });
        } else {
            return res.status(200).json({ message: "Lost pet notice updated successfully", lostPet, status: "success" });
        }

    } catch (error) {
        console.error("Error updating lost pet notice:", error);
        return res.status(500).json({ message: "Server error", status: error });
    }
}

export const deleteNotice = async (req, res) => {
    const { id } = req.params;
    try {
        const deleteNotice = await LostPet.findByIdAndDelete(id);
        if (deleteNotice) {
            return res.status(201).json({ message: "Notice deleted succesfully", status: "success" });
        } else {
            return res.status(400).json({ message: "An error occured during notice delete", status: "error" });
        }
    } catch (error) {
        return res.status(400).json({ message: "An error occured during notice delete", status: "error" });
    }
}