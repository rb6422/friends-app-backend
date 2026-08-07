import mongoose, { Document, Schema } from 'mongoose';
import { IUser } from './User';

export interface ISwipe extends Document {
  swiperId: mongoose.Types.ObjectId | IUser;
  swipeeId: mongoose.Types.ObjectId | IUser;
  action: 'like' | 'pass';
  createdAt: Date;
}

const SwipeSchema: Schema = new Schema(
  {
    swiperId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    swipeeId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    action: { type: String, enum: ['like', 'pass'], required: true },
  },
  { timestamps: true }
);

export default mongoose.model<ISwipe>('Swipe', SwipeSchema);
