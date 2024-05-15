import Volunteer from "../models/Volunteer.js";
import User from "../models/User.js";

export const becomeVolunteer = async (req, res) => {
    try {
        const { userId, city } = req.body;

        const existingVolunteer = await Volunteer.findOne({ userId });
        if (existingVolunteer) {
            return res.status(400).json({ status: "error", message: "You are already a volunteer." });
        }

        await Volunteer.create({ userId, city });
        await User.findByIdAndUpdate(userId, { isVolunteer: true });

        return res.status(201).json({ status: "success", message: "Thank you for becoming a volunteer!" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: "error", message: "Internal server error" });
    }
}

export const leaveVolunteer = async (req, res) => {
    try {
        const { userId } = req.body;

        const volunteer = await Volunteer.findOneAndDelete({ userId });
        if (!volunteer) {
            return res.status(404).json({ status: "error", message: "You are not a volunteer." });
        }

        await User.findByIdAndUpdate(userId, { isVolunteer: false });

        return res.status(200).json({ status: "success", message: "You have successfully left the volunteer program." });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: "error", message: "Internal server error" });
    }
}

export const updateVolunteerCity = async (req, res) => {
    const { userId, city } = req.body;

    try {
        const volunteer = await Volunteer.findOneAndUpdate({ userId }, { city });
        if (!volunteer) {
            return res.status(404).json({ status: "error", message: "Volunteer not found" });
        }
        return res.status(200).json({ status: "success", message: "Volunteer city updated successfully", volunteer });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: "error", message: "Internal server error" });
    }
};

export const getOneVolunteer = async (req, res) => {
    const { userId } = req.params;

    try {
        const volunteer = await Volunteer.findOne({ userId }).populate("userId", { isVolunteer: 1 });
        if (!volunteer) {
            return res.status(404).json({ status: "error", message: "Volunteer not found" });
        }
        return res.status(200).json({ status: "success", volunteer });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: "error", message: "Internal server error" });
    }
};

export const getVolunteersStats = async (req, res) => {
    try {
        const totalVolunteers = await Volunteer.countDocuments();
        const volunteersByCity = await Volunteer.aggregate([
            {
                $group: {
                    _id: "$city",
                    count: { $sum: 1 }
                }
            }
        ]);

        return res.status(200).json({
            status: "success",
            totalVolunteers, volunteersByCity
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: "error", message: "Internal server error" });
    }
};

export const getVolunteersByCity = async (req, res) => {
    try {
        const { city } = req.params;
        const volunteerCount = await Volunteer.find({ city }).countDocuments();
        const volunteers = await Volunteer.find({ city }).populate("userId", "firstName profileUrl")

        return res.status(200).json({
            status: "success",
            volunteerCount,
            volunteers
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: "error", message: "Internal server error" });
    }
};