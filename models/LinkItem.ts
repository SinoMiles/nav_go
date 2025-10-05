import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ILinkItem extends Document {
  title: string;
  url: string;
  description?: string;
  iconUrl?: string;
  categoryId: mongoose.Types.ObjectId;
  order: number;
  enabled: boolean;
  tags?: string[];
  clicks: number;
  reviewStatus: 'pending' | 'approved' | 'rejected';
  source: 'admin' | 'guest';
  submittedName?: string;
  submittedEmail?: string;
  createdAt: Date;
  updatedAt: Date;
}

const LinkItemSchema = new Schema<ILinkItem>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    url: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    iconUrl: {
      type: String,
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    order: {
      type: Number,
      default: 0,
    },
    enabled: {
      type: Boolean,
      default: true,
    },
    tags: [
      {
        type: String,
      },
    ],
    clicks: {
      type: Number,
      default: 0,
    },
    reviewStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'approved',
    },
    source: {
      type: String,
      enum: ['admin', 'guest'],
      default: 'admin',
    },
    submittedName: {
      type: String,
      trim: true,
    },
    submittedEmail: {
      type: String,
      trim: true,
      lowercase: true,
    },
  },
  {
    timestamps: true,
  }
);

LinkItemSchema.index({ categoryId: 1 });
LinkItemSchema.index({ url: 1 });
LinkItemSchema.index({ order: 1 });
LinkItemSchema.index({ reviewStatus: 1 });
LinkItemSchema.index({ source: 1 });

const LinkItem: Model<ILinkItem> =
  mongoose.models.LinkItem ||
  mongoose.model<ILinkItem>('LinkItem', LinkItemSchema);

export default LinkItem;
