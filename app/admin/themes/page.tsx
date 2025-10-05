'use client';

import { useEffect, useState } from 'react';

interface ThemeItem {
  _id: string;
  name: string;
  title: string;
  description?: string;
  version: string;
  author?: string;
  installed: boolean;
  enabled: boolean;
}

const ALLOWED_THEMES = new Set(['fullscreen-section', 'sidebar-nav']);

export default function ThemesPage() {
  const [themes, setThemes] = useState<ThemeItem[]>([]);
  const [previewUrls, setPreviewUrls] = useState<Record<string, string>>({});
  const [activeTheme, setActiveTheme] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [pending, setPending] = useState<string | null>(null);

  useEffect(() => {
    void Promise.all([loadThemes(), loadSettings()]);
  }, []);

  useEffect(() => {
    if (themes.length > 0) {
      void generatePreviewUrls();
    }
  }, [themes]);

  const loadThemes = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const res = await fetch('/api/themes', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      const filtered = (data.themes || []).filter((theme: ThemeItem) =>
        ALLOWED_THEMES.has(theme.name)
      );
      setThemes(filtered);
    } catch (error) {
      console.error('Failed to load themes:', error);
      setMessage('Unable to load theme list. Try again later.');
    } finally {
      setLoading(false);
    }
  };

  const loadSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      setActiveTheme(data.settings?.activeTheme || '');
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const generatePreviewUrls = async () => {
    const token = localStorage.getItem('admin_token');
    const urls: Record<string, string> = {};

    for (const theme of themes) {
      try {
        const res = await fetch('/api/preview', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ theme: theme.name }),
        });
        const data = await res.json();
        if (res.ok) {
          urls[theme.name] = data.previewUrl;
        }
      } catch (error) {
        console.error(`Unable to generate preview for ${theme.name}:`, error);
      }
    }

    setPreviewUrls(urls);
  };

  const handleActivate = async (themeName: string) => {
    try {
      setPending(themeName);
      const token = localStorage.getItem('admin_token');
      const res = await fetch('/api/themes/activate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ themeName }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to activate theme');
      }

      setActiveTheme(themeName);
      setMessage('Theme activated successfully.');
    } catch (error: any) {
      console.error('Failed to activate theme:', error);
      setMessage(error?.message || 'Activation failed, please retry.');
    } finally {
      setPending(null);
    }
  };

  const handlePreview = (themeName: string) => {
    const url = previewUrls[themeName];
    if (!url) {
      setMessage('Preview is still generating. Please try again shortly.');
      return;
    }
    window.open(url, '_blank');
  };

  if (loading) {
    return (
      <div className="flex min-h-[320px] items-center justify-center text-sm text-slate-300">
        <span className="inline-flex h-10 w-10 animate-spin rounded-full border-2 border-white/15 border-t-white" />
        <span className="ml-3">Loading theme catalog...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 text-slate-100 shadow-[0_25px_60px_-40px_rgba(15,23,42,0.9)]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Themes</p>
            <h1 className="mt-2 text-2xl font-semibold text-white">Visual layouts</h1>
            <p className="mt-3 max-w-2xl text-sm text-slate-300/85">
              Switch between official layouts, preview changes in real time, and keep your navigation experience consistent across devices.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-xs text-slate-200">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              <span>Active theme: </span>
              <strong className="text-white">{activeTheme || 'Not set'}</strong>
            </div>
          </div>
        </div>
      </header>

      {message && (
        <div className="rounded-2xl border border-indigo-400/30 bg-indigo-500/10 px-4 py-3 text-sm text-indigo-100">
          {message}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {themes.map(theme => {
          const isActive = activeTheme === theme.name;
          const previewUrl = previewUrls[theme.name];

          return (
            <div
              key={theme._id}
              className={`overflow-hidden rounded-3xl border bg-slate-900/70 shadow-[0_20px_60px_-45px_rgba(15,23,42,0.95)] backdrop-blur transition ${
                isActive ? 'border-indigo-400/40' : 'border-white/10'
              }`}
            >
              <div className="relative h-64 border-b border-white/5 bg-slate-950/80">
                {previewUrl ? (
                  <iframe
                    src={previewUrl}
                    title={`${theme.title} preview`}
                    className="h-full w-full scale-[0.78] origin-top-left bg-white"
                    style={{ width: '128%', pointerEvents: 'none' }}
                  />
                ) : (
                  <div className="flex h-full flex-col items-center justify-center gap-3 text-sm text-slate-400">
                    <span className="inline-flex h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-white" />
                    Generating preview...
                  </div>
                )}
                {isActive && (
                  <div className="absolute left-5 top-5 rounded-full bg-indigo-500/90 px-3 py-1 text-xs font-semibold text-white shadow">
                    Active
                  </div>
                )}
              </div>

              <div className="space-y-4 p-6 text-slate-100">
                <div className="space-y-1">
                  <h2 className="text-lg font-semibold text-white">{theme.title}</h2>
                  <p className="text-sm text-slate-300/85">
                    {theme.description || 'Official navigation layout built for fast browsing.'}
                  </p>
                </div>

                <div className="grid gap-2 text-xs text-slate-400 sm:grid-cols-3">
                  <span>Version: {theme.version}</span>
                  <span>Author: {theme.author || 'NavCraft Studio'}</span>
                  <span>Identifier: {theme.name}</span>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => handlePreview(theme.name)}
                    className="flex-1 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 transition hover:border-white/30 hover:bg-white/10"
                  >
                    Preview
                  </button>
                  <button
                    onClick={() => handleActivate(theme.name)}
                    disabled={isActive || pending === theme.name}
                    className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold transition ${
                      isActive
                        ? 'cursor-not-allowed border border-white/10 bg-white/10 text-slate-200'
                        : 'border border-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-sky-500 text-white hover:opacity-90'
                    }`}
                  >
                    {pending === theme.name ? 'Activating...' : isActive ? 'In use' : 'Activate'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {themes.length === 0 && (
        <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-10 text-center text-sm text-slate-300/80">
          No themes available yet. Please install an official layout from the repository.
        </div>
      )}
    </div>
  );
}
