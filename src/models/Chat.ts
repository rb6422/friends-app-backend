import mongoose, { Document, Schema } from 'mongoose';
import { IUser } from './User';

export interface IChat extends Document {
  participants: mongoose.Types.ObjectId[] | IUser[];
  lastMessage?: string;
  updatedAt: Date;
  createdAt: Date;
}

const ChatSchema: Schema = new Schema(
  {
    participants: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    lastMessage: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model<IChat>('Chat', ChatSchema);
