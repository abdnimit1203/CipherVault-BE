"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = void 0;
const express_1 = require("express");
const firebase_1 = __importDefault(require("../config/firebase"));
const User_1 = __importDefault(require("../models/User"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const requireAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Unauthorized: No token provided' });
        }
        const token = authHeader.split('Bearer ')[1];
        const JWT_SECRET = process.env.JWT_SECRET || 'ciphervault_super_secret_jwt_key_30d';
        // 1. Try verifying custom 30-day JWT token first
        try {
            const decodedJwt = jsonwebtoken_1.default.verify(token, JWT_SECRET);
            if (decodedJwt && decodedJwt.userId) {
                const user = await User_1.default.findById(decodedJwt.userId);
                if (user) {
                    req.user = user;
                    return next();
                }
            }
        }
        catch (e) {
            // Fallback to Firebase ID Token verification if JWT fails
        }
        // 2. Verify Firebase ID Token
        const decodedToken = await firebase_1.default.auth().verifyIdToken(token);
        // Find or sync user in MongoDB
        let user = await User_1.default.findOne({ firebaseUid: decodedToken.uid });
        if (!user && decodedToken.email) {
            // Auto-register user logged in via Google Auth
            user = new User_1.default({
                firebaseUid: decodedToken.uid,
                email: decodedToken.email,
                fullName: decodedToken.name || decodedToken.email.split('@')[0],
                profilePictureUrl: decodedToken.picture || '',
            });
            await user.save();
        }
        else if (!user) {
            return res.status(404).json({ error: 'User not found in database' });
        }
        // Attach user to request
        req.user = user;
        next();
    }
    catch (error) {
        console.error('Auth Error:', error.message);
        return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }
};
exports.requireAuth = requireAuth;
//# sourceMappingURL=authMiddleware.js.map