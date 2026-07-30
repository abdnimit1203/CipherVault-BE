"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteVaultItem = exports.updateVaultItem = exports.getVaultItems = exports.createVaultItem = void 0;
const express_1 = require("express");
const VaultItem_1 = __importDefault(require("../models/VaultItem"));
const User_1 = __importDefault(require("../models/User"));
// Create a new vault item
const createVaultItem = async (req, res) => {
    try {
        const { title, category, encryptedData, iv } = req.body;
        const firebaseUid = req.user?.firebaseUid;
        if (!firebaseUid) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const user = await User_1.default.findOne({ firebaseUid });
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        const newItem = new VaultItem_1.default({
            userId: user._id,
            title,
            category,
            encryptedData,
            iv
        });
        await newItem.save();
        res.status(201).json({ message: 'Vault item created successfully', item: newItem });
    }
    catch (error) {
        console.error('Error creating vault item:', error);
        res.status(500).json({ error: error.message || 'Server error' });
    }
};
exports.createVaultItem = createVaultItem;
// Get all vault items for the authenticated user
const getVaultItems = async (req, res) => {
    try {
        const firebaseUid = req.user?.firebaseUid;
        if (!firebaseUid) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const user = await User_1.default.findOne({ firebaseUid });
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        const items = await VaultItem_1.default.find({ userId: user._id }).sort({ createdAt: -1 });
        res.status(200).json({ items });
    }
    catch (error) {
        console.error('Error fetching vault items:', error);
        res.status(500).json({ error: error.message || 'Server error' });
    }
};
exports.getVaultItems = getVaultItems;
// Update a vault item
const updateVaultItem = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, category, encryptedData, iv } = req.body;
        const firebaseUid = req.user?.firebaseUid;
        if (!firebaseUid) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const user = await User_1.default.findOne({ firebaseUid });
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        const item = await VaultItem_1.default.findOne({ _id: id, userId: user._id });
        if (!item) {
            res.status(404).json({ error: 'Vault item not found or unauthorized' });
            return;
        }
        item.title = title || item.title;
        item.category = category || item.category;
        item.encryptedData = encryptedData || item.encryptedData;
        item.iv = iv || item.iv;
        await item.save();
        res.status(200).json({ message: 'Vault item updated successfully', item });
    }
    catch (error) {
        console.error('Error updating vault item:', error);
        res.status(500).json({ error: error.message || 'Server error' });
    }
};
exports.updateVaultItem = updateVaultItem;
// Delete a vault item
const deleteVaultItem = async (req, res) => {
    try {
        const { id } = req.params;
        const firebaseUid = req.user?.firebaseUid;
        if (!firebaseUid) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const user = await User_1.default.findOne({ firebaseUid });
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        const deletedItem = await VaultItem_1.default.findOneAndDelete({ _id: id, userId: user._id });
        if (!deletedItem) {
            res.status(404).json({ error: 'Vault item not found or unauthorized' });
            return;
        }
        res.status(200).json({ message: 'Vault item deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting vault item:', error);
        res.status(500).json({ error: error.message || 'Server error' });
    }
};
exports.deleteVaultItem = deleteVaultItem;
//# sourceMappingURL=vaultController.js.map