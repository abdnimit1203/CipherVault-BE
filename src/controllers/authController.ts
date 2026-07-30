import { Request, Response } from 'express';
import admin from '../config/firebase';
import User from '../models/User';
import { AuthRequest } from '../middlewares/authMiddleware';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import JWT_SECRET from '../config/jwtSecret';

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

// @route PUT /api/auth/pin
// @desc Set or update Security PIN / Private Code (e.g., 4-digit code like "1655")
export const setSecurityPin = async (req: AuthRequest, res: Response) => {
  try {
    const { pin } = req.body;
    if (!pin || typeof pin !== 'string' || pin.trim().length < 4) {
      return res.status(400).json({ error: 'Security PIN must be at least 4 digits/characters long' });
    }

    const hashedPin = crypto.createHash('sha256').update(pin.trim()).digest('hex');

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { securityPin: hashedPin },
      { new: true }
    );

    res.status(200).json({ message: 'Security PIN updated successfully', user, hasSecurityPin: true });
  } catch (error: any) {
    console.error('Set Security PIN Error:', error.message);
    res.status(500).json({ error: 'Server error setting security PIN' });
  }
};

// @route POST /api/auth/verify-pin
// @desc Verify entered Security PIN / Private Code to reveal passwords
export const verifySecurityPin = async (req: AuthRequest, res: Response) => {
  try {
    const { pin } = req.body;
    const user = req.user;

    if (!user.securityPin) {
      return res.status(400).json({ 
        success: false, 
        hasSecurityPin: false, 
        error: 'No Security PIN configured yet. Please set your Security PIN in Settings.' 
      });
    }

    if (!pin) {
      return res.status(400).json({ success: false, error: 'Security PIN is required' });
    }

    const hashedPin = crypto.createHash('sha256').update(pin.trim()).digest('hex');

    if (hashedPin === user.securityPin) {
      return res.status(200).json({ success: true, message: 'Security PIN verified successfully' });
    } else {
      return res.status(401).json({ success: false, error: 'Incorrect Security PIN. Access denied.' });
    }
  } catch (error: any) {
    console.error('Verify Security PIN Error:', error.message);
    res.status(500).json({ success: false, error: 'Server error verifying PIN' });
  }
};
