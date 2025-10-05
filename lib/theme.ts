import Settings from '@/models/Settings';
import Theme from '@/models/Theme';
import connectDB from './mongodb';

const ALLOWED_THEMES = ['fullscreen-section', 'sidebar-nav'] as const;
type AllowedTheme = (typeof ALLOWED_THEMES)[number];

function ensureAllowedTheme(themeName: string): asserts themeName is AllowedTheme {
  if (!(ALLOWED_THEMES as readonly string[]).includes(themeName)) {
    throw new Error('主题不存在或未安装');
  }
}

export async function getActiveTheme(): Promise<string> {
  await connectDB();
  const settings = await Settings.findOne({});
  const activeTheme = settings?.activeTheme || 'fullscreen-section';

  if (!(ALLOWED_THEMES as readonly string[]).includes(activeTheme)) {
    return 'fullscreen-section';
  }

  return activeTheme;
}

export async function getThemeConfig(themeName: string): Promise<any> {
  await connectDB();
  ensureAllowedTheme(themeName);
  const settings = await Settings.findOne({});
  return settings?.themeConfigs?.[themeName] || {};
}

export async function setActiveTheme(themeName: string): Promise<void> {
  await connectDB();

  ensureAllowedTheme(themeName);
  const theme = await Theme.findOne({ name: themeName, installed: true });
  if (!theme) {
    throw new Error('主题不存在或未安装');
  }

  await Settings.findOneAndUpdate(
    {},
    { activeTheme: themeName },
    { upsert: true, new: true }
  );
}

export async function updateThemeConfig(
  themeName: string,
  config: any
): Promise<void> {
  await connectDB();

  ensureAllowedTheme(themeName);

  const settings = await Settings.findOne({});
  const themeConfigs = settings?.themeConfigs || {};
  themeConfigs[themeName] = config;

  await Settings.findOneAndUpdate(
    {},
    { themeConfigs },
    { upsert: true, new: true }
  );
}

export async function getAllThemes() {
  await connectDB();
  return await Theme.find({ name: { $in: ALLOWED_THEMES } }).sort({ name: 1 });
}

export async function installTheme(themeData: {
  name: string;
  title: string;
  description?: string;
  version: string;
  author?: string;
  previewUrl?: string;
  configSchema?: any;
}) {
  await connectDB();

  ensureAllowedTheme(themeData.name);

  const existingTheme = await Theme.findOne({ name: themeData.name });
  if (existingTheme) {
    throw new Error('主题已存在');
  }

  const theme = new Theme({
    ...themeData,
    installed: true,
    enabled: false,
  });

  await theme.save();
  return theme;
}
