import CommunityDiscussion from "../models/CommunityDiscussion.js"
import User from "../models/User.js"

export const createDiscussion = async (req, res) => {
    const { title, content, author } = req.body;
    try {
        const newDiscussions = await CommunityDiscussion.create({ title, content, author });
        if (newDiscussions) {
            await User.findByIdAndUpdate(author, { $push: { discussions: newDiscussions._id } });
            return res.json({ message: "New discussion created.", status: "success" });
        }
        return res.json({ message: "New discussion error!", status: "error" });
    } catch (error) {
        return res.json({ message: "New discussion error!", status: "error" });
    }
}

export const getDiscussionList = async (req, res) => {
    try {
        const discussions = await CommunityDiscussion.find()
            .sort({ createdAt: -1 })
            .select('tips createdAt title');
        return res.json({ discussions, status: "success" });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
}

export const getOneDiscussion = async (req, res) => {
    try {
        const discussion = await CommunityDiscussion.findById(req.params.id)
            .populate("author", { profileUrl: 1, firstName: 1, lastName: 1, username: 1 })
            .populate({
                path: "tips",
                populate: {
                    path: "userId",
                    select: "firstName lastName profileUrl username"
                }
            })
            ;
        if (!discussion) {
            return res.status(404).json({ status: 'error', message: 'Discussion not found' });
        }
        return res.status(200).json({ status: 'success', discussion });
    } catch (error) {
        console.error('Error fetching discussion:', error);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
};