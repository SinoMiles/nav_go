import mongoose, { Schema, Document } from 'mongoose';

export interface IRating extends Document {
  userId: mongoose.Types.ObjectId;
  linkId: mongoose.Types.ObjectId;
  rating: number; // 1-5 stars
  createdAt: Date;
  updatedAt: Date;
}

const RatingSchema = new Schema<IRating>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  linkId: {
    type: Schema.Types.ObjectId,
    ref: 'LinkItem',
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

RatingSchema.index({ userId: 1, linkId: 1 }, { unique: true });
RatingSchema.index({ linkId: 1 });

export default mongoose.models.Rating || mongoose.model<IRating>('Rating', RatingSchema);
