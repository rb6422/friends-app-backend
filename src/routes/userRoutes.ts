import express from 'express';
import { getUserProfile, updateUserProfile, discoverUsers } from '../controllers/userController';
import { protect } from '../middlewares/authMiddleware';
import { upload } from '../config/cloudinary';

const router = express.Router();

router.route('/me')
  .get(protect, getUserProfile)
  .put(protect, upload.single('profilePicture'), updateUserProfile);

router.get('/discover', protect, discoverUsers);

export default router;
