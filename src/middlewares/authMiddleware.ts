import { Request, Response, NextFunction } from 'express';
import admin from '../config/firebase';
import User from '../models/User';
import jwt from 'jsonwebtoken';
import JWT_SECRET from '../config/jwtSecret';

export interface AuthRequest extends Request {
  user?: any;
}

export const requireAuth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }

    const token = authHeader.split('Bearer ')[1];

    // 1. Try verifying custom 30-day JWT token first
    try {
      const decodedJwt: any = jwt.verify(token, JWT_SECRET);
      if (decodedJwt && decodedJwt.userId) {
        const user = await User.findById(decodedJwt.userId);
        if (user) {
          req.user = user;
          return next();
        }
      }
    } catch (e) {
      // Fallback to Firebase ID Token verification if JWT fails
    }
    
    // 2. Verify Firebase ID Token
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    // Find or sync user in MongoDB
    let user = await User.findOne({ firebaseUid: decodedToken.uid });
    
    if (!user && decodedToken.email) {
      // Auto-register user logged in via Google Auth
      user = new User({
        firebaseUid: decodedToken.uid,
        email: decodedToken.email,
        fullName: decodedToken.name || decodedToken.email.split('@')[0],
        profilePictureUrl: decodedToken.picture || '',
      });
      await user.save();
    } else if (!user) {
      return res.status(404).json({ error: 'User not found in database' });
    }

    // Attach user to request
    req.user = user;
    
    next();
  } catch (error: any) {
    console.error('Auth Error:', error.message);
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};
