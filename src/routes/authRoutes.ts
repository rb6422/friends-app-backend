import express from 'express';
import { registerUser, loginUser } from '../controllers/authController';
// import { upload } from '../config/cloudinary'; // Multer config

const router = express.Router();

// router.post('/register', upload.single('profilePicture'), registerUser);
router.post('/register', registerUser);
router.post('/login', loginUser);

export default router;
