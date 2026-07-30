import mongoose, { Document, Schema } from 'mongoose';

export interface IVaultItem extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  category?: string;
  owner: 'Personal' | 'Family' | 'Friend' | 'Other';
  encryptedData: string;
  iv: string;
  createdAt: Date;
  updatedAt: Date;
}

const vaultItemSchema = new Schema<IVaultItem>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    trim: true,
    default: 'General'
  },
  owner: {
    type: String,
    enum: ['Personal', 'Family', 'Friend', 'Other'],
    default: 'Personal'
  },
  encryptedData: {
    type: String,
    required: true
  },
  iv: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

// Index to quickly fetch a user's vault items
vaultItemSchema.index({ userId: 1 });

const VaultItem = (mongoose.models.VaultItem || mongoose.model<IVaultItem>('VaultItem', vaultItemSchema)) as any;

export default VaultItem;
