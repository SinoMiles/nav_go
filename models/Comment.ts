import mongoose, { Schema, Document } from 'mongoose';

export interface IComment extends Document {
  userId: mongoose.Types.ObjectId;
  linkId: mongoose.Types.ObjectId;
  content: string;
  likes: number;
  createdAt: Date;
  updatedAt: Date;
}

const CommentSchema = new Schema<IComment>({
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
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000,
  },
  likes: {
    type: Number,
    default: 0,
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

CommentSchema.index({ linkId: 1, createdAt: -1 });
CommentSchema.index({ userId: 1 });

export default mongoose.models.Comment || mongoose.model<IComment>('Comment', CommentSchema);
