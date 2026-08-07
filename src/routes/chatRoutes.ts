import express from 'express';
import { getUserChats, getChatMessages, uploadChatImage } from '../controllers/chatController';
import { protect } from '../middlewares/authMiddleware';
import { upload } from '../config/cloudinary';

const router = express.Router();

router.get('/', protect, getUserChats);
router.get('/:chatId/messages', protect, getChatMessages);
router.post('/:chatId/messages/image', protect, upload.single('image'), uploadChatImage);

export default router;
