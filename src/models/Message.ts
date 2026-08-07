import mongoose, { Document, Schema } from 'mongoose';
import { IChat } from './Chat';
import { IUser } from './User';

export interface IMessage extends Document {
  chatId: mongoose.Types.ObjectId | IChat;
  senderId: mongoose.Types.ObjectId | IUser;
  content?: string;
  imageUrl?: string;
  createdAt: Date;
}

const MessageSchema: Schema = new Schema(
  {
    chatId: { type: Schema.Types.ObjectId, ref: 'Chat', required: true },
    senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String },
    imageUrl: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model<IMessage>('Message', MessageSchema);
