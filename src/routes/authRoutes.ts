import { Router } from 'express';
import { registerUser, getCurrentUser } from '../controllers/authController';
import { requireAuth } from '../middlewares/authMiddleware';

const router = Router();

// Public route: register a new user in DB after they get their Firebase UID
router.post('/register', registerUser as any);

// Protected route: verify user and get details
router.get('/me', requireAuth as any, getCurrentUser as any);

export default router;
