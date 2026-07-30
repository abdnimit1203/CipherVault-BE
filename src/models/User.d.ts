import mongoose, { Document } from 'mongoose';
export interface IUser extends Document {
    firebaseUid: string;
    email: string;
    fullName: string;
    profilePictureUrl?: string;
    securityPin?: string;
    createdAt: Date;
    updatedAt: Date;
}
declare const User: mongoose.Model<any, {}, {}, {}, any, any, any> | mongoose.Model<IUser, {}, {}, {}, Document<unknown, {}, IUser, {}, mongoose.DefaultSchemaOptions> & IUser & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IUser>;
export default User;
//# sourceMappingURL=User.d.ts.map