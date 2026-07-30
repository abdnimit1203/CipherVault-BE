import { Request, Response } from 'express';
import admin from '../config/firebase';
import User from '../models/User';
import { AuthRequest } from '../middlewares/authMiddleware';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'ciphervault_super_secret_jwt_key_30d';

// @route POST /api/auth/register
// @desc Create or sync user in MongoDB after signing in via Firebase / Google Auth
export const registerUser = async (req: Request, res: Response) => {
  try {
    const { firebaseUid, email, fullName, profilePictureUrl } = req.body;

    if (!firebaseUid || !email || !fullName) {
      return res.status(400).json({ error: 'firebaseUid, email, and fullName are required' });
    }

    // Check if user already exists
    let user = await User.findOne({ firebaseUid });
    
    if (!user) {
      user = new User({
        firebaseUid,
        email,
        fullName,
        profilePictureUrl: profilePictureUrl || "",
      });

      await user.save();
    } else if (profilePictureUrl && !user.profilePictureUrl) {
      user.profilePictureUrl = profilePictureUrl;
      await user.save();
    }

    // Generate 30-Day JWT session token
    const token = jwt.sign(
      { userId: user._id, firebaseUid: user.firebaseUid, email: user.email },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.status(200).json({ message: 'User authenticated successfully', user, token });
  } catch (error: any) {
    console.error('Register User Error:', error.message);
    res.status(500).json({ error: 'Server error during registration' });
  }
};

// @route GET /api/auth/me
// @desc Get current user details and issue/refresh 30-day JWT session token
export const getCurrentUser = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    const token = jwt.sign(
      { userId: user._id, firebaseUid: user.firebaseUid, email: user.email },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.status(200).json({ user, token });
  } catch (error: any) {
    res.status(500).json({ error: 'Server error' });
  }
};

// @route PUT /api/auth/profile-picture
// @desc Update user profile picture URL
export const updateProfilePicture = async (req: AuthRequest, res: Response) => {
  try {
    const { profilePictureUrl } = req.body;
    
    if (!profilePictureUrl) {
      return res.status(400).json({ error: 'profilePictureUrl is required' });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { profilePictureUrl },
      { new: true }
    );

    res.status(200).json({ message: 'Profile picture updated successfully', user });
  } catch (error: any) {
    console.error('Update Profile Picture Error:', error.message);
    res.status(500).json({ error: 'Server error updating profile picture' });
  }
};
