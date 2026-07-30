"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const vaultController_1 = require("../controllers/vaultController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = express_1.default.Router();
// Apply auth middleware to all vault routes
router.use(authMiddleware_1.requireAuth);
router.post('/', vaultController_1.createVaultItem);
router.get('/', vaultController_1.getVaultItems);
router.put('/:id', vaultController_1.updateVaultItem);
router.delete('/:id', vaultController_1.deleteVaultItem);
exports.default = router;
