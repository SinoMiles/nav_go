import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISettings extends Document {
  activeTheme: string;
  siteName: string;
  siteDescription?: string;
  siteKeywords?: string;
  logo?: string;
  favicon?: string;
  headerTagline?: string;
  themeConfigs: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const SettingsSchema = new Schema<ISettings>(
  {
    activeTheme: {
      type: String,
      default: 'fullscreen-section',
    },
    siteName: {
      type: String,
      default: 'NavGo',
    },
    siteDescription: {
      type: String,
    },
    siteKeywords: {
      type: String,
    },
    logo: {
      type: String,
    },
    favicon: {
      type: String,
    },
    headerTagline: {
      type: String,
      default: '优雅 永不过时...',
    },
    themeConfigs: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

const Settings: Model<ISettings> =
  mongoose.models.Settings ||
  mongoose.model<ISettings>('Settings', SettingsSchema);

export default Settings;
