import { Response } from 'express';
import Swipe from '../models/Swipe';
import Chat from '../models/Chat';
import { AuthRequest } from '../middlewares/authMiddleware';
import { io } from '../server'; // Import socket instance for real-time notifications

export const handleSwipe = async (req: AuthRequest, res: Response): Promise<void> => {
  const { targetUserId, action } = req.body;
  const currentUserId = req.user?._id;

  try {
    // 1. Record the swipe
    const swipe = await Swipe.create({
      swiperId: currentUserId,
      swipeeId: targetUserId,
      action,
    });

    // 2. Check for mutual match if action is 'like'
    let matchCreated = false;
    let newChat = null;

    if (action === 'like') {
      const mutualLike = await Swipe.findOne({
        swiperId: targetUserId,
        swipeeId: currentUserId,
        action: 'like',
      });

      if (mutualLike) {
        matchCreated = true;
        // Create a chat for the match
        newChat = await Chat.create({
          participants: [currentUserId, targetUserId],
          lastMessage: 'It\'s a match! Say hi.',
        });

        // Notify both users in real-time
        io.to(`user_${currentUserId}`).emit('new_match', { chatId: newChat._id, matchedWith: targetUserId });
        io.to(`user_${targetUserId}`).emit('new_match', { chatId: newChat._id, matchedWith: currentUserId });
      }
    }

    res.status(201).json({
      message: 'Swipe registered successfully',
      swipe,
      match: matchCreated,
      chat: newChat,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
