import express from 'express';
import { createVaultItem, getVaultItems, updateVaultItem, deleteVaultItem } from '../controllers/vaultController';
import { requireAuth } from '../middlewares/authMiddleware';

const router = express.Router();

// Apply auth middleware to all vault routes
router.use(requireAuth as any);

router.post('/', createVaultItem);
router.get('/', getVaultItems);
router.put('/:id', updateVaultItem);
router.delete('/:id', deleteVaultItem);

export default router;
