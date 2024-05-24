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