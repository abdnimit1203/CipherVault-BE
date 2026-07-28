import { Request, Response } from 'express';
import admin from '../config/firebase';
import User from '../models/User';
import { AuthRequest } from '../middlewares/authMiddleware';

// @route POST /api/auth/register
// @desc Create a new user in MongoDB after they signed up via Firebase Client SDK
export const registerUser = async (req: Request, res: Response) => {
  try {
    const { firebaseUid, email, fullName, profilePictureUrl } = req.body;

    if (!firebaseUid || !email || !fullName) {
      return res.status(400).json({ error: 'firebaseUid, email, and fullName are required' });
    }

    // Check if user already exists
    let user = await User.findOne({ firebaseUid });
    
    if (user) {
      return res.status(400).json({ error: 'User already exists in database' });
    }

    user = new User({
      firebaseUid,
      email,
      fullName,
      profilePictureUrl: profilePictureUrl || "",
    });

    await user.save();

    res.status(201).json({ message: 'User registered successfully', user });
  } catch (error: any) {
    console.error('Register User Error:', error.message);
    res.status(500).json({ error: 'Server error during registration' });
  }
};

// @route GET /api/auth/me
// @desc Get current user details
export const getCurrentUser = async (req: AuthRequest, res: Response) => {
  try {
    // req.user is set by authMiddleware
    res.status(200).json({ user: req.user });
  } catch (error: any) {
    res.status(500).json({ error: 'Server error' });
  }
};
