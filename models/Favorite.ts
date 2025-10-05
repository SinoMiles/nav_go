import mongoose, { Schema, Document } from 'mongoose';

export interface IFavorite extends Document {
  userId: mongoose.Types.ObjectId;
  linkId: mongoose.Types.ObjectId;
  folderId?: mongoose.Types.ObjectId;
  createdAt: Date;
}

const FavoriteSchema = new Schema<IFavorite>({
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
  folderId: {
    type: Schema.Types.ObjectId,
    ref: 'Folder',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

FavoriteSchema.index({ userId: 1, linkId: 1 }, { unique: true });

export default mongoose.models.Favorite || mongoose.model<IFavorite>('Favorite', FavoriteSchema);
