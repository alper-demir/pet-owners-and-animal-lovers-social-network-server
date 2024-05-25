import Message from '../models/Messages.js';

export const getChatHistory = async (req, res) => {
    const { roomId } = req.params;

    try {
        const chatHistory = await Message.find({ roomId });
        res.status(200).json({ success: true, chatHistory });
    } catch (error) {
        console.error('Error fetching chat history:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch chat history' });
    }
}

export const verifyChatAccess = async (req, res) => {
    const { roomId, userId } = req.params;

    try {
        const participants = roomId.split('-');
        if (participants.includes(userId)) {
            res.status(200).json({ success: true });
        } else {
            res.status(403).json({ success: false, message: 'Access denied' });
        }
    } catch (error) {
        console.error('Error verifying chat access:', error);
        res.status(500).json({ success: false, message: 'Failed to verify chat access' });
    }
};

export const getChats = async (req, res) => {
    const { userId } = req.params;
    try {

        const chats = await Message.find({
            $or: [
                { receiverId: userId },
                { senderId: userId }
            ]
        })
            .select('senderId receiverId content read roomId timestamp')
            .populate("senderId", { firstName: 1, lastName: 1, username: 1, profileUrl: 1 })
            .populate("receiverId", { firstName: 1, lastName: 1, username: 1, profileUrl: 1 })
            .sort({ timestamp: -1 });

        let uniqueSenderIds = chats.map(chat => chat.senderId);
        let uniqueReceiverIds = chats.map(chat => chat.receiverId);

        // Return an array of unique senderIds and receiverIds
        let uniqueChatsSender = chats.filter((chat, index) => uniqueSenderIds.indexOf(chat.senderId) === index);
        let uniqueChatsReceiver = chats.filter((chat, index) => uniqueReceiverIds.indexOf(chat.receiverId) === index);

        let uniqueRoomIds = [];
        let uniqueChats = [];

        //Merge filtered chats from both sender and receiver
        let combinedChats = [...uniqueChatsSender, ...uniqueChatsReceiver];

        // Check for non-duplicate roomIds for each chat room
        for (const chat of combinedChats) {
            const roomId = chat.roomId;

            // If the room's ID has not been processed before, push the room
            if (!uniqueRoomIds.includes(roomId)) {
                uniqueRoomIds.push(roomId);
                uniqueChats.push(chat);
            }
        }

        return res.json(uniqueChats);

    } catch (error) {
        return res.json({ message: error.message, status: "error" });
    }
}

export const markMessagesAsRead = async (req, res) => {
    const { roomId, userId } = req.body;
    try {
        const result = await Message.updateMany({ roomId, receiverId: userId, read: false }, { read: true });
        if (result.nModified > 0) {
            return res.sendStatus(200);
        } else {
            return res.status(404).json({ message: 'No messages found or already read' });
        }
    } catch (error) {
        console.error('Error updating messages:', error);
        return res.status(500).json({ message: error.message });
    }
};
