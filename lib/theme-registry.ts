import fs from 'fs';
import path from 'path';

export interface ThemeManifest {
  name: string;
  title: string;
  description?: string;
  version: string;
  author?: string;
  previewUrl?: string;
  configSchema?: Record<string, any>;
  directory: string;
}

const THEMES_DIR = path.join(process.cwd(), 'themes');

type ManifestCache = {
  key: string;
  data: ThemeManifest[];
};

let manifestCache: ManifestCache | null = null;

function slugToTitle(name: string): string {
  return name
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b([a-z])/gi, (_, ch: string) => ch.toUpperCase()) || name;
}

function computeDirectorySignature(): string {
  try {
    const entries = fs.readdirSync(THEMES_DIR, { withFileTypes: true });
    return entries
      .filter(entry => entry.isDirectory())
      .map(entry => {
        const dirPath = path.join(THEMES_DIR, entry.name);
        try {
          const dirStat = fs.statSync(dirPath);
          const settingsPath = path.join(dirPath, 'settings.json');
          const settingsStat = fs.existsSync(settingsPath) ? fs.statSync(settingsPath) : null;
          return `${entry.name}:${dirStat.mtimeMs}:${settingsStat?.mtimeMs ?? 0}`;
        } catch {
          return `${entry.name}:0:0`;
        }
      })
      .sort()
      .join('|');
  } catch {
    return 'missing';
  }
}

function buildManifestFromDirectory(dirName: string): ThemeManifest | null {
  if (dirName.startsWith('.')) return null;
  if (dirName === 'shared') return null;

  const directory = path.join(THEMES_DIR, dirName);
  const settingsPath = path.join(directory, 'settings.json');

  let settings: Partial<ThemeManifest & { previewUrl?: string }> = {};
  if (fs.existsSync(settingsPath)) {
    try {
      const raw = fs.readFileSync(settingsPath, 'utf-8');
      settings = JSON.parse(raw);
    } catch (error) {
      console.warn(`[theme-registry] Failed to parse settings for ${dirName}:`, error);
    }
  }

  const name = settings.name?.trim() || dirName;
  const previewCandidate = settings.previewUrl || `/themes/${name}/preview.png`;
  const previewPath = path.join(directory, previewCandidate.replace(/^\//, ''));
  const previewUrl = fs.existsSync(previewPath) ? previewCandidate : undefined;

  return {
    name,
    title: settings.title?.trim() || slugToTitle(name),
    description: settings.description,
    version: settings.version?.trim() || '1.0.0',
    author: settings.author,
    previewUrl,
    configSchema: (() => {
      const raw = settings.configSchema;
      if (!raw || typeof raw !== 'object') return undefined;
      if ('properties' in (raw as Record<string, any>) && typeof (raw as Record<string, any>).properties === 'object') {
        return (raw as Record<string, any>).properties as Record<string, any>;
      }
      return raw as Record<string, any>;
    })(),
    directory,
  };
}

export function getThemeManifests(): ThemeManifest[] {
  const signature = computeDirectorySignature();
  if (manifestCache && manifestCache.key === signature) {
    return manifestCache.data;
  }

  const manifests: ThemeManifest[] = [];
  if (!fs.existsSync(THEMES_DIR)) {
    manifestCache = { key: signature, data: manifests };
    return manifests;
  }

  const entries = fs.readdirSync(THEMES_DIR, { withFileTypes: true });
  entries.forEach(entry => {
    if (!entry.isDirectory()) return;
    const manifest = buildManifestFromDirectory(entry.name);
    if (manifest) {
      manifests.push(manifest);
    }
  });

  manifests.sort((a, b) => a.name.localeCompare(b.name, 'en'));
  manifestCache = { key: signature, data: manifests };
  return manifests;
}

export function getThemeManifest(name: string): ThemeManifest | undefined {
  return getThemeManifests().find(theme => theme.name === name);
}

export function getAvailableThemeNames(): string[] {
  return getThemeManifests().map(theme => theme.name);
}


