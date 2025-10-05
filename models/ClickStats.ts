import mongoose, { Schema, Document } from 'mongoose';

export interface IClickStats extends Document {
  linkId: mongoose.Types.ObjectId;
  userId?: mongoose.Types.ObjectId;
  ip?: string;
  userAgent?: string;
  referer?: string;
  clickedAt: Date;
}

const ClickStatsSchema = new Schema<IClickStats>({
  linkId: {
    type: Schema.Types.ObjectId,
    ref: 'LinkItem',
    required: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  ip: {
    type: String,
  },
  userAgent: {
    type: String,
  },
  referer: {
    type: String,
  },
  clickedAt: {
    type: Date,
    default: Date.now,
  },
});

ClickStatsSchema.index({ linkId: 1, clickedAt: -1 });
ClickStatsSchema.index({ userId: 1, clickedAt: -1 });

export default mongoose.models.ClickStats || mongoose.model<IClickStats>('ClickStats', ClickStatsSchema);
