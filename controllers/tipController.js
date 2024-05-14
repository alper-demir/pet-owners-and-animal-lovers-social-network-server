import CommunityDiscussion from "../models/CommunityDiscussion.js"
import Tip from "../models/Tip.js"
import User from "../models/User.js";

export const createTip = async (req, res) => {
    try {
        const { userId, discussionId, content } = req.body;

        const discussion = await CommunityDiscussion.findById(discussionId);
        if (!discussion) {
            return res.status(404).json({ status: "error", message: "Discussion not found" });
        }

        const newTip = await Tip.create({ userId, discussionId, content })
        if (newTip) {
            await User.findByIdAndUpdate(userId, { $push: { tips: newTip._id } });
            await CommunityDiscussion.findByIdAndUpdate(discussionId, { $push: { tips: newTip._id } });
            return res.status(201).json({ status: "success", message: "Tip added successfully" });
        }
        return res.status(500).json({ status: "error", message: "Tip create error" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: "error", message: "Internal server error" });
    }
}

export const editTip = async (req, res) => {
    try {
        const { id } = req.params;
        const { content } = req.body;

        const tip = await Tip.findById(id);
        if (!tip) {
            return res.status(404).json({ status: "error", message: "Tip not found" });
        }

        await Tip.findByIdAndUpdate(id, { content });

        return res.status(200).json({ status: "success", message: "Tip updated successfully" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: "error", message: "Internal server error" });
    }
}

export const deleteTip = async (req, res) => {
    try {
        const { id } = req.params;
        const tip = await Tip.findById(id);
        if (!tip) {
            return res.status(404).json({ status: "error", message: "Tip not found" });
        }

        await Tip.findByIdAndDelete(id);
        await User.findByIdAndUpdate(tip.userId, { $pull: { tips: id } });
        await CommunityDiscussion.findByIdAndUpdate(tip.discussionId, { $pull: { tips: id } });
        return res.status(200).json({ status: "success", message: "Tip deleted successfully" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: "error", message: "Internal server error" });
    }
}