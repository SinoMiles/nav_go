import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPreviewToken extends Document {
  token: string;
  theme: string;
  createdBy: mongoose.Types.ObjectId;
  expiresAt: Date;
  createdAt: Date;
}

const PreviewTokenSchema = new Schema<IPreviewToken>(
  {
    token: {
      type: String,
      required: true,
      unique: true,
    },
    theme: {
      type: String,
      required: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      default: () => new Date(Date.now() + 60 * 60 * 1000), // 1小时过期
    },
  },
  {
    timestamps: true,
  }
);

PreviewTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL索引

const PreviewToken: Model<IPreviewToken> =
  mongoose.models.PreviewToken ||
  mongoose.model<IPreviewToken>('PreviewToken', PreviewTokenSchema);

export default PreviewToken;

