import { Request, Response } from 'express';
import VaultItem from '../models/VaultItem';
import User from '../models/User';

// Create a new vault item
export const createVaultItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, category, encryptedData, iv } = req.body;
    const firebaseUid = (req as any).user?.firebaseUid;

    if (!firebaseUid) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const user = await User.findOne({ firebaseUid });
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const newItem = new VaultItem({
      userId: user._id,
      title,
      category,
      encryptedData,
      iv
    });

    await newItem.save();

    res.status(201).json({ message: 'Vault item created successfully', item: newItem });
  } catch (error: any) {
    console.error('Error creating vault item:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
};

// Get all vault items for the authenticated user
export const getVaultItems = async (req: Request, res: Response): Promise<void> => {
  try {
    const firebaseUid = (req as any).user?.firebaseUid;

    if (!firebaseUid) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const user = await User.findOne({ firebaseUid });
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const items = await VaultItem.find({ userId: user._id }).sort({ createdAt: -1 });

    res.status(200).json({ items });
  } catch (error: any) {
    console.error('Error fetching vault items:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
};

// Update a vault item
export const updateVaultItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { title, category, encryptedData, iv } = req.body;
    const firebaseUid = (req as any).user?.firebaseUid;

    if (!firebaseUid) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const user = await User.findOne({ firebaseUid });
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const item = await VaultItem.findOne({ _id: id, userId: user._id });
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
  } catch (error: any) {
    console.error('Error updating vault item:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
};

// Delete a vault item
export const deleteVaultItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const firebaseUid = (req as any).user?.firebaseUid;

    if (!firebaseUid) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const user = await User.findOne({ firebaseUid });
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const deletedItem = await VaultItem.findOneAndDelete({ _id: id, userId: user._id });
    if (!deletedItem) {
      res.status(404).json({ error: 'Vault item not found or unauthorized' });
      return;
    }

    res.status(200).json({ message: 'Vault item deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting vault item:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
};
