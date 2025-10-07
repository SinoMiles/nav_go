const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://NavGo:3afnijdxHaMrJHsT@39.98.161.189:27017/NavGo';

const ThemeSchema = new mongoose.Schema(
  {
    name: String,
    title: String,
    description: String,
    version: String,
    author: String,
    previewUrl: String,
    installed: Boolean,
    enabled: Boolean,
    configSchema: mongoose.Schema.Types.Mixed,
  },
  { timestamps: true },
);

const Theme = mongoose.model('Theme', ThemeSchema);

const THEMES_DIR = path.join(process.cwd(), 'themes');

function loadThemeManifests() {
  if (!fs.existsSync(THEMES_DIR)) {
    console.warn('[theme-install] themes directory not found:', THEMES_DIR);
    return [];
  }

  return fs
    .readdirSync(THEMES_DIR, { withFileTypes: true })
    .filter(entry => entry.isDirectory() && entry.name !== 'shared' && !entry.name.startsWith('.'))
    .map(entry => {
      const dirPath = path.join(THEMES_DIR, entry.name);
      const settingsPath = path.join(dirPath, 'settings.json');

      let settings = {};
      if (fs.existsSync(settingsPath)) {
        try {
          settings = JSON.parse(fs.readFileSync(settingsPath, 'utf-8'));
        } catch (error) {
          console.warn(`[theme-install] Failed to parse settings for ${entry.name}:`, error);
        }
      }

      const name = settings.name || entry.name;
      const previewCandidate = settings.previewUrl || `/themes/${name}/preview.png`;
      const previewPath = path.join(dirPath, previewCandidate.replace(/^\//, ''));
      const previewUrl = fs.existsSync(previewPath) ? previewCandidate : undefined;

      let configSchema = settings.configSchema || {};
      if (configSchema && typeof configSchema === 'object' && configSchema.properties) {
        configSchema = configSchema.properties;
      }

      return {
        name,
        title: settings.title || name,
        description: settings.description || '',
        version: settings.version || '1.0.0',
        author: settings.author || 'Unknown',
        previewUrl,
        configSchema,
      };
    });
}

async function installThemes() {
  try {
    console.log('🔗  Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅  Connected to MongoDB');

    const manifests = loadThemeManifests();
    const names = manifests.map(item => item.name);

    console.log('🧹  Removing themes not present on filesystem...');
    await Theme.deleteMany({ name: { $nin: names } });

    console.log('📦  Syncing theme metadata...');
    for (const manifest of manifests) {
      const update = {
        title: manifest.title,
        description: manifest.description,
        version: manifest.version,
        author: manifest.author,
        previewUrl: manifest.previewUrl,
        configSchema: manifest.configSchema || {},
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

      console.log(`  ✅  Synced theme: ${manifest.name}`);
    }

    console.log(`\n🎉  Synchronized ${manifests.length} theme(s).`);
    console.log('➡️  Admin panel: http://localhost:3000/admin/themes\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌  Failed to synchronize themes:', error);
    process.exit(1);
  }
}

installThemes();
