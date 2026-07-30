import { Router } from 'express';
import { registerUser, getCurrentUser, updateProfilePicture, setSecurityPin, verifySecurityPin } from '../controllers/authController';
import { requireAuth } from '../middlewares/authMiddleware';

const router = Router();

// Public route: register/sync a user in DB after Firebase / Google Auth
router.post('/register', registerUser as any);

// Protected route: verify user and get details
router.get('/me', requireAuth as any, getCurrentUser as any);

// Protected route: update profile picture
router.put('/profile-picture', requireAuth as any, updateProfilePicture as any);

// Protected routes: set/update and verify Security PIN (hotkey code)
router.put('/pin', requireAuth as any, setSecurityPin as any);
router.post('/verify-pin', requireAuth as any, verifySecurityPin as any);

export default router;
