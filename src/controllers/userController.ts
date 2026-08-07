import { Response } from 'express';
import User from '../models/User';
import Swipe from '../models/Swipe';
import { AuthRequest } from '../middlewares/authMiddleware';

// GET /api/users/me
export const getUserProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user?._id);

    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/users/me
export const updateUserProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user?._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.age = req.body.age || user.age;
      user.gender = req.body.gender || user.gender;
      user.country = req.body.country || user.country;
      user.state = req.body.state || user.state;
      user.bio = req.body.bio || user.bio;
      
      if (req.file) {
        user.profilePicture = req.file.path; // Cloudinary URL
      }

      if (req.body.password) {
        // Handled by user model pre-save hook normally, but since we are hashing in controller we should hash here too
        const bcrypt = require('bcryptjs');
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(req.body.password, salt);
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        profilePicture: updatedUser.profilePicture,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/users/discover
export const discoverUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const currentUser = req.user?._id;
    const { country, state, gender, minAge, maxAge } = req.query;

    // Find all users the current user has already swiped on
    const previousSwipes = await Swipe.find({ swiperId: currentUser }).select('swipeeId');
    const swipedUserIds = previousSwipes.map(swipe => swipe.swipeeId);
    
    // Add current user to exclude list
    swipedUserIds.push(currentUser);

    // Build filter query
    const filter: any = { _id: { $nin: swipedUserIds } };
    
    if (country) filter.country = country;
    if (state) filter.state = state;
    if (gender) filter.gender = gender;
    
    if (minAge || maxAge) {
      filter.age = {};
      if (minAge) filter.age.$gte = Number(minAge);
      if (maxAge) filter.age.$lte = Number(maxAge);
    }

    const usersToDiscover = await User.find(filter)
      .select('-password')
      .limit(20); // Limit results per request

    res.json(usersToDiscover);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
