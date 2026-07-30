"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
// Public route: register/sync a user in DB after Firebase / Google Auth
router.post('/register', authController_1.registerUser);
// Protected route: verify user and get details
router.get('/me', authMiddleware_1.requireAuth, authController_1.getCurrentUser);
// Protected route: update profile picture
router.put('/profile-picture', authMiddleware_1.requireAuth, authController_1.updateProfilePicture);
// Protected routes: set/update and verify Security PIN (hotkey code)
router.put('/pin', authMiddleware_1.requireAuth, authController_1.setSecurityPin);
router.post('/verify-pin', authMiddleware_1.requireAuth, authController_1.verifySecurityPin);
exports.default = router;
