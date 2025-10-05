import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ITheme extends Document {
  name: string;
  title: string;
  description?: string;
  previewUrl?: string;
  version: string;
  author?: string;
  installed: boolean;
  enabled: boolean;
  configSchema?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const ThemeSchema = new Schema<ITheme>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    previewUrl: {
      type: String,
    },
    version: {
      type: String,
      default: '1.0.0',
    },
    author: {
      type: String,
    },
    installed: {
      type: Boolean,
      default: false,
    },
    enabled: {
      type: Boolean,
      default: false,
    },
    configSchema: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

ThemeSchema.index({ name: 1 });

const Theme: Model<ITheme> =
  mongoose.models.Theme || mongoose.model<ITheme>('Theme', ThemeSchema);

export default Theme;
