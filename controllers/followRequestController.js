import FollowRequest from "../models/FollowRequest.js"
import User from "../models/User.js"

export const sendFollowRequest = async (req, res) => {
    const { senderId, receiverId } = req.body;
    console.log(senderId, receiverId);
    try {
        const sender = await User.findById(senderId);
        const receiver = await User.findById(receiverId);
        if (senderId == receiverId) {
            return res.status(400).json({ message: "You cannot send a folow request to yourself" });
        }
        // If the sender is already following the receiver, unfollow
        if (sender.followings.includes(receiverId)) {
            sender.followings.pull(receiverId);
            receiver.followers.pull(senderId)
            await sender.save();
            await receiver.save();
            await FollowRequest.findOneAndDelete({ senderId, receiverId })
            return res.status(200).json({ message: "Unfollowed successfully" });
        }
        // If the receiver user's account is not private, add them directly as a follower
        if (receiver.privacy !== "private") {
            sender.followings.push(receiverId);
            receiver.followers.push(senderId);
            await sender.save();
            await receiver.save();
            await FollowRequest.create({ senderId, receiverId, status: "accepted" });
            return res.status(200).json({ message: "Followed successfully" });
        } else {
            const existingRequest = await FollowRequest.findOne({ senderId, receiverId });

            if (existingRequest) {
                // If a request with the same sender and receiver is found, remove it
                await FollowRequest.findByIdAndDelete(existingRequest._id);
                return res.status(200).json({ message: "A previous request has been withdrawn." });
            } else {
                await FollowRequest.create({ senderId, receiverId, status: "pending" });
                return res.status(200).json({ message: "Follow request sent successfully" });
            }
        }

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error", status: "error" });
    }
}

export const getPendingFollowRequestsOfOneUser = async (req, res) => { // Pending requests will be shown on the notification page.
    const receiverId = req.params.receiverId;
    try {
        // Find requests with receiverId and status "pending"
        const followRequests = await FollowRequest.find({ receiverId: receiverId, status: "pending" }).populate({ path: "senderId", select: { username: 1, profileUrl: 1 } });

        if (followRequests) {
            res.json(followRequests);
        } else {
            res.status(404).json({ message: 'No pending tracking requests were found.' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Sunucu hatası', status: "error" });
    }
}

export const checkFollowRequest = async (req, res) => { // checks status of request for single user. For profile page interaction.
    const { senderId, receiverUsername } = req.body;
    try {
        const receiver = await User.findOne({ username: receiverUsername }, { _id: 1 })
        const request = await FollowRequest.findOne({ senderId, receiverId: receiver._id });

        if (request) {
            return res.status(200).json({ status: request.status });
        } else {
            return res.status(200).json({ status: "not_requested" });
        }
    } catch (error) {
        console.error("Error checking friend request:", error);
        return res.status(500).json({ message: "Server error", status: "error" });
    }
}

export const acceptFollowRequest = async (req, res) => {
    const { requestId } = req.params;
    try {
        const request = await FollowRequest.findByIdAndUpdate(requestId, { status: "accepted" }, { new: true });
        if (!request) {
            return res.status(404).json({ message: "Follow request not found" });
        }
        const receiver = await User.findById(request.receiverId);
        const sender = await User.findById(request.senderId);
        receiver.followers.push(sender._id);
        sender.followings.push(receiver._id);
        await receiver.save();
        await sender.save();
        return res.status(200).json({ message: "Follow request accepted successfully", accepted: true });
    } catch (error) {
        console.error("Error accepting follow request:", error);
        return res.status(500).json({ message: "Server error", status: "error" });
    }
}

export const rejectFollowRequest = async (req, res) => {
    const { requestId } = req.params;
    try {
        const request = await FollowRequest.findOneAndDelete(requestId)
        if (!request) {
            return res.status(404).json({ message: "Follow request not found" });
        }
        return res.status(200).json({ message: "Follow request rejected successfully", rejected: true });
    } catch (error) {
        console.error("Error rejecting follow request:", error);
        return res.status(500).json({ message: "Server error", status: "error" });
    }
}