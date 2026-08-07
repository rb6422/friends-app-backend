import express from 'express';
import { handleSwipe } from '../controllers/swipeController';
import { protect } from '../middlewares/authMiddleware';

const router = express.Router();

router.post('/', protect, handleSwipe);

export default router;
