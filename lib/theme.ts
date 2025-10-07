import Settings from '@/models/Settings';
import Theme from '@/models/Theme';
import connectDB from './mongodb';
import { getAvailableThemeNames, getThemeManifest, getThemeManifests } from './theme-registry';

function getAllowedThemeNames(): string[] {
  const names = getAvailableThemeNames();
  return names.length > 0 ? names : ['fullscreen-section'];
}

async function ensureAllowedTheme(themeName: string): Promise<void> {
  const allowed = getAllowedThemeNames();
  if (!allowed.includes(themeName)) {
    throw new Error(`Theme "${themeName}" is not available`);
  }
}

export async function syncThemesWithFilesystem(): Promise<void> {
  await connectDB();
  const manifests = getThemeManifests();
  const names = manifests.map(manifest => manifest.name);

  await Theme.deleteMany({ name: { $nin: names } });

  for (const manifest of manifests) {
    const update = {
      title: manifest.title,
      description: manifest.description,
      previewUrl: manifest.previewUrl,
      version: manifest.version,
      author: manifest.author,
      configSchema: manifest.configSchema ?? {},
      installed: true,
    };

    await Theme.findOneAndUpdate(
      { name: manifest.name },
      {
        name: manifest.name,
        ...update,
        $setOnInsert: { enabled: false },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
  }
}

export async function getActiveTheme(): Promise<string> {
  await connectDB();
  const settings = await Settings.findOne({});
  const allowed = getAllowedThemeNames();
  const fallback = allowed.includes('fullscreen-section') ? 'fullscreen-section' : allowed[0] ?? 'fullscreen-section';

  const activeTheme = settings?.activeTheme;
  if (activeTheme && allowed.includes(activeTheme)) {
    return activeTheme;
  }

  if (!settings) {
    return fallback;
  }

  settings.activeTheme = fallback;
  await settings.save();
  return fallback;
}

export async function getThemeConfig(themeName: string): Promise<any> {
  await connectDB();
  await ensureAllowedTheme(themeName);
  const settings = await Settings.findOne({});
  return settings?.themeConfigs?.[themeName] || {};
}

export async function setActiveTheme(themeName: string): Promise<void> {
  await connectDB();
  await ensureAllowedTheme(themeName);

  const theme = await Theme.findOne({ name: themeName, installed: true });
  if (!theme) {
    throw new Error('Theme not installed in database');
  }

  await Settings.findOneAndUpdate(
    {},
    { activeTheme: themeName },
    { upsert: true, new: true },
  );
}

export async function updateThemeConfig(themeName: string, config: any): Promise<void> {
  await connectDB();
  await ensureAllowedTheme(themeName);

  const settings = await Settings.findOne({});
  const themeConfigs = settings?.themeConfigs || {};
  themeConfigs[themeName] = config;

  await Settings.findOneAndUpdate(
    {},
    { themeConfigs },
    { upsert: true, new: true },
  );
}

export async function getAllThemes() {
  await connectDB();
  const allowed = getAllowedThemeNames();
  return Theme.find({ name: { $in: allowed } }).sort({ name: 1 });
}

export async function installTheme(themeName: string) {
  await connectDB();
  await ensureAllowedTheme(themeName);

  const manifest = getThemeManifest(themeName);
  if (!manifest) {
    throw new Error(`Theme manifest not found for ${themeName}`);
  }

  const existingTheme = await Theme.findOne({ name: themeName });
  if (existingTheme) {
    existingTheme.installed = true;
    if (!existingTheme.title) existingTheme.title = manifest.title;
    if (!existingTheme.version) existingTheme.version = manifest.version;
    if (!existingTheme.author) existingTheme.author = manifest.author;
    existingTheme.previewUrl = manifest.previewUrl;
    existingTheme.configSchema = manifest.configSchema ?? {};
    await existingTheme.save();
    return existingTheme;
  }

  const theme = new Theme({
    name: manifest.name,
    title: manifest.title,
    description: manifest.description,
    previewUrl: manifest.previewUrl,
    version: manifest.version,
    author: manifest.author,
    configSchema: manifest.configSchema ?? {},
    installed: true,
    enabled: false,
  });

  await theme.save();
  return theme;
}
