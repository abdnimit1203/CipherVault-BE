"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifySecurityPin = exports.setSecurityPin = exports.updateProfilePicture = exports.getCurrentUser = exports.registerUser = void 0;
const express_1 = require("express");
const firebase_1 = __importDefault(require("../config/firebase"));
const User_1 = __importDefault(require("../models/User"));
const authMiddleware_1 = require("../middlewares/authMiddleware");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
const JWT_SECRET = process.env.JWT_SECRET || 'ciphervault_super_secret_jwt_key_30d';
// @route POST /api/auth/register
// @desc Create or sync user in MongoDB after signing in via Firebase / Google Auth
const registerUser = async (req, res) => {
    try {
        const { firebaseUid, email, fullName, profilePictureUrl } = req.body;
        if (!firebaseUid || !email || !fullName) {
            return res.status(400).json({ error: 'firebaseUid, email, and fullName are required' });
        }
        // Check if user already exists
        let user = await User_1.default.findOne({ firebaseUid });
        if (!user) {
            user = new User_1.default({
                firebaseUid,
                email,
                fullName,
                profilePictureUrl: profilePictureUrl || "",
            });
            await user.save();
        }
        else if (profilePictureUrl && !user.profilePictureUrl) {
            user.profilePictureUrl = profilePictureUrl;
            await user.save();
        }
        // Generate 30-Day JWT session token
        const token = jsonwebtoken_1.default.sign({ userId: user._id, firebaseUid: user.firebaseUid, email: user.email }, JWT_SECRET, { expiresIn: '30d' });
        res.status(200).json({ message: 'User authenticated successfully', user, token });
    }
    catch (error) {
        console.error('Register User Error:', error.message);
        res.status(500).json({ error: 'Server error during registration' });
    }
};
exports.registerUser = registerUser;
// @route GET /api/auth/me
// @desc Get current user details and issue/refresh 30-day JWT session token
const getCurrentUser = async (req, res) => {
    try {
        const user = req.user;
        const token = jsonwebtoken_1.default.sign({ userId: user._id, firebaseUid: user.firebaseUid, email: user.email }, JWT_SECRET, { expiresIn: '30d' });
        res.status(200).json({ user, token });
    }
    catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};
exports.getCurrentUser = getCurrentUser;
// @route PUT /api/auth/profile-picture
// @desc Update user profile picture URL
const updateProfilePicture = async (req, res) => {
    try {
        const { profilePictureUrl } = req.body;
        if (!profilePictureUrl) {
            return res.status(400).json({ error: 'profilePictureUrl is required' });
        }
        const user = await User_1.default.findByIdAndUpdate(req.user._id, { profilePictureUrl }, { new: true });
        res.status(200).json({ message: 'Profile picture updated successfully', user });
    }
    catch (error) {
        console.error('Update Profile Picture Error:', error.message);
        res.status(500).json({ error: 'Server error updating profile picture' });
    }
};
exports.updateProfilePicture = updateProfilePicture;
// @route PUT /api/auth/pin
// @desc Set or update Security PIN / Private Code (e.g., 4-digit code like "1655")
const setSecurityPin = async (req, res) => {
    try {
        const { pin } = req.body;
        if (!pin || typeof pin !== 'string' || pin.trim().length < 4) {
            return res.status(400).json({ error: 'Security PIN must be at least 4 digits/characters long' });
        }
        const hashedPin = crypto_1.default.createHash('sha256').update(pin.trim()).digest('hex');
        const user = await User_1.default.findByIdAndUpdate(req.user._id, { securityPin: hashedPin }, { new: true });
        res.status(200).json({ message: 'Security PIN updated successfully', user, hasSecurityPin: true });
    }
    catch (error) {
        console.error('Set Security PIN Error:', error.message);
        res.status(500).json({ error: 'Server error setting security PIN' });
    }
};
exports.setSecurityPin = setSecurityPin;
// @route POST /api/auth/verify-pin
// @desc Verify entered Security PIN / Private Code to reveal passwords
const verifySecurityPin = async (req, res) => {
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
        const hashedPin = crypto_1.default.createHash('sha256').update(pin.trim()).digest('hex');
        if (hashedPin === user.securityPin) {
            return res.status(200).json({ success: true, message: 'Security PIN verified successfully' });
        }
        else {
            return res.status(401).json({ success: false, error: 'Incorrect Security PIN. Access denied.' });
        }
    }
    catch (error) {
        console.error('Verify Security PIN Error:', error.message);
        res.status(500).json({ success: false, error: 'Server error verifying PIN' });
    }
};
exports.verifySecurityPin = verifySecurityPin;
//# sourceMappingURL=authController.js.map