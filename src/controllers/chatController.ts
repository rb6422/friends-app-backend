import { Response } from 'express';
import Chat from '../models/Chat';
import Message from '../models/Message';
import { AuthRequest } from '../middlewares/authMiddleware';

// GET /api/chats
export const getUserChats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const chats = await Chat.find({ participants: { $in: [req.user?._id] } })
      .populate('participants', 'name profilePicture') // Get basic info of participants
      .sort({ updatedAt: -1 });

    res.json(chats);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/chats/:chatId/messages
export const getChatMessages = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { chatId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    // Verify if user is part of the chat
    const chat = await Chat.findOne({ _id: chatId, participants: { $in: [req.user?._id] } });
    if (!chat) {
      res.status(403).json({ message: 'Not authorized to view these messages' });
      return;
    }

    const messages = await Message.find({ chatId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json(messages.reverse()); // Reverse so older messages are at the top
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/chats/:chatId/messages/image
export const uploadChatImage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ message: 'No image provided' });
      return;
    }

    // Returning the url so the client can emit it via socket
    res.json({ imageUrl: req.file.path });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
