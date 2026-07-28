import { Request, Response, NextFunction } from 'express';
import admin from '../config/firebase';
import User from '../models/User';

export interface AuthRequest extends Request {
  user?: any;
}

export const requireAuth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }

    const idToken = authHeader.split('Bearer ')[1];
    
    // Verify Firebase ID Token
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    
    // Find user in MongoDB
    const user = await User.findOne({ firebaseUid: decodedToken.uid });
    
    if (!user) {
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
