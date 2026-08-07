import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  profilePicture?: string;
  age: number;
  gender: 'M' | 'F' | 'Other';
  country: string;
  state: string;
  bio?: string;
  createdAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    profilePicture: { type: String },
    age: { type: Number, required: true },
    gender: { type: String, enum: ['M', 'F', 'Other'], required: true },
    country: { type: String, required: true },
    state: { type: String, required: true },
    bio: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model<IUser>('User', UserSchema);
