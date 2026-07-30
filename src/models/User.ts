import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  firebaseUid: string;
  email: string;
  fullName: string;
  profilePictureUrl?: string;
  securityPin?: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema: Schema = new Schema(
  {
    firebaseUid: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    profilePictureUrl: {
      type: String,
      default: "",
    },
    securityPin: {
      type: String,
      default: "",
    }
  },
  {
    timestamps: true,
  }
);

const User = (mongoose.models.User || mongoose.model<IUser>('User', userSchema)) as any;

export default User;
