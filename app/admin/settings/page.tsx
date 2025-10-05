'use client';

import { useEffect, useState } from 'react';

interface SettingsState {
  siteName: string;
  siteDescription: string;
  siteKeywords: string;
  logo: string;
  favicon: string;
}

const INITIAL_STATE: SettingsState = {
  siteName: '',
  siteDescription: '',
  siteKeywords: '',
  logo: '',
  favicon: '',
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<SettingsState>(INITIAL_STATE);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    void loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      if (data.settings) {
        setSettings({
          siteName: data.settings.siteName || '',
          siteDescription: data.settings.siteDescription || '',
          siteKeywords: data.settings.siteKeywords || '',
          logo: data.settings.logo || '',
          favicon: data.settings.favicon || '',
        });
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
      setMessage('Unable to load site settings.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const token = localStorage.getItem('admin_token');
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(settings),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save settings');
      }

      setMessage('Settings saved successfully.');
    } catch (error: any) {
      console.error('Failed to save settings:', error);
      setMessage(error?.message || 'Saving failed, please retry.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[320px] flex-col items-center justify-center gap-3 text-sm text-slate-300">
        <span className="inline-flex h-10 w-10 animate-spin rounded-full border-2 border-white/15 border-t-white" />
        Loading site configuration...
      </div>
    );
  }

  return (
    <div className="space-y-8 text-slate-100">
      <header className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 shadow-[0_25px_60px_-40px_rgba(15,23,42,0.9)]">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Configuration</p>
        <h1 className="mt-2 text-2xl font-semibold text-white">Site settings</h1>
        <p className="mt-3 max-w-2xl text-sm text-slate-300/85">
          Update public branding, meta information, and media assets that power the navigation portal.
        </p>
      </header>

      {message && (
        <div className="rounded-2xl border border-emerald-400/30 bg-emerald-500/15 px-4 py-3 text-sm text-emerald-200">
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <section className="rounded-3xl border border-white/10 bg-slate-900/55 p-6 shadow-[0_20px_60px_-45px_rgba(15,23,42,0.95)]">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">Site identity</h2>
              <p className="text-sm text-slate-300/80">Control how the navigation hub appears publicly.</p>
            </div>
            <span className="rounded-full border border-white/10 bg-white/5 px-4 py-1 text-xs text-slate-200">
              Branding
            </span>
          </div>

          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <label className="space-y-2 text-sm">
              <span className="font-medium text-slate-200">Site name</span>
              <input
                type="text"
                value={settings.siteName}
                onChange={event => setSettings(prev => ({ ...prev, siteName: event.target.value }))}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-white/20 focus:bg-white/10"
                placeholder="NavCraft"
              />
            </label>
            <label className="space-y-2 text-sm">
              <span className="font-medium text-slate-200">Search keywords</span>
              <input
                type="text"
                value={settings.siteKeywords}
                onChange={event => setSettings(prev => ({ ...prev, siteKeywords: event.target.value }))}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-white/20 focus:bg-white/10"
                placeholder="navigation, resources, productivity"
              />
            </label>
          </div>

          <label className="mt-6 block space-y-2 text-sm">
            <span className="font-medium text-slate-200">Site description</span>
            <textarea
              value={settings.siteDescription}
              onChange={event => setSettings(prev => ({ ...prev, siteDescription: event.target.value }))}
              rows={3}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-white/20 focus:bg-white/10"
              placeholder="A curated navigation site powered by Next.js and MongoDB."
            />
          </label>
        </section>

        <section className="rounded-3xl border border-white/10 bg-slate-900/55 p-6 shadow-[0_20px_60px_-45px_rgba(15,23,42,0.95)]">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">Brand assets</h2>
              <p className="text-sm text-slate-300/80">Logo and favicon URLs are used across every theme.</p>
            </div>
            <span className="rounded-full border border-white/10 bg-white/5 px-4 py-1 text-xs text-slate-200">
              Media
            </span>
          </div>

          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <div className="space-y-3">
              <label className="space-y-2 text-sm">
                <span className="font-medium text-slate-200">Logo URL</span>
                <input
                  type="url"
                  value={settings.logo}
                  onChange={event => setSettings(prev => ({ ...prev, logo: event.target.value }))}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-white/20 focus:bg-white/10"
                  placeholder="https://example.com/logo.png"
                />
              </label>
              {settings.logo && (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-xs text-slate-300">
                  <p className="text-slate-200">Preview</p>
                  <img src={settings.logo} alt="Logo preview" className="mt-3 h-16 object-contain" />
                </div>
              )}
            </div>

            <div className="space-y-3">
              <label className="space-y-2 text-sm">
                <span className="font-medium text-slate-200">Favicon URL</span>
                <input
                  type="url"
                  value={settings.favicon}
                  onChange={event => setSettings(prev => ({ ...prev, favicon: event.target.value }))}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-white/20 focus:bg-white/10"
                  placeholder="https://example.com/favicon.ico"
                />
              </label>
              {settings.favicon && (
                <div className="inline-flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-slate-300">
                  <img src={settings.favicon} alt="Favicon preview" className="h-8 w-8 object-contain" />
                  <span>Favicon preview</span>
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-white/10 bg-slate-900/55 p-6 shadow-[0_20px_60px_-45px_rgba(15,23,42,0.95)]">
          <h2 className="text-lg font-semibold text-white">System status</h2>
          <div className="mt-5 grid gap-4 text-sm text-slate-300/80 md:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-400">Version</p>
              <p className="mt-2 text-white">NavCraft v1.0.0</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-400">Stack</p>
              <p className="mt-2">Next.js 15 · MongoDB · Tailwind CSS</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-400">Status</p>
              <p className="mt-2">Database connected · APIs responsive</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-400">Maintenance tip</p>
              <p className="mt-2">Schedule weekly backups and store environment variables securely.</p>
            </div>
          </div>
        </section>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-gradient-to-r from-sky-500 via-indigo-500 to-violet-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? 'Saving...' : 'Save settings'}
          </button>
        </div>
      </form>
    </div>
  );
}
