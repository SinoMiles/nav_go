import mongoose, { Schema, Document } from 'mongoose';

export interface IFolder extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  icon?: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const FolderSchema = new Schema<IFolder>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  icon: {
    type: String,
  },
  order: {
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

FolderSchema.index({ userId: 1, order: 1 });

export default mongoose.models.Folder || mongoose.model<IFolder>('Folder', FolderSchema);
