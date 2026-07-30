import mongoose, { Document } from 'mongoose';
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
declare const VaultItem: mongoose.Model<any, {}, {}, {}, any, any, any> | mongoose.Model<IVaultItem, {}, {}, {}, Document<unknown, {}, IVaultItem, {}, mongoose.DefaultSchemaOptions> & IVaultItem & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IVaultItem>;
export default VaultItem;
//# sourceMappingURL=VaultItem.d.ts.map