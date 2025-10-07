"use client";

import { useEffect, useMemo, useState } from "react";

interface ThemeItem {
  _id?: string;
  name: string;
  title: string;
  description?: string;
  version?: string;
  author?: string;
  previewUrl?: string;
  installed?: boolean;
  enabled?: boolean;
}

const buildLoadingMap = (themes: ThemeItem[]): Record<string, boolean> => {
  return themes.reduce<Record<string, boolean>>((acc, theme) => {
    acc[theme.name] = true;
    return acc;
  }, {});
};

export default function ThemesPage() {
  const [themes, setThemes] = useState<ThemeItem[]>([]);
  const [previewLoading, setPreviewLoading] = useState<Record<string, boolean>>({});
  const [activeTheme, setActiveTheme] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState<string | null>(null);

  useEffect(() => {
    void Promise.all([loadThemes(), loadSettings()]);
  }, []);

  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(""), 3000);
    return () => clearTimeout(timer);
  }, [message]);

  const loadThemes = async () => {
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch("/api/themes", {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      const data = await res.json();
      const list: ThemeItem[] = data.themes || [];
      setThemes(list);
      setPreviewLoading(buildLoadingMap(list));
    } catch (error) {
      console.error("加载主题失败:", error);
      setMessage("主题列表加载失败，请稍后重试。");
    } finally {
      setLoading(false);
    }
  };

  const loadSettings = async () => {
    try {
      const res = await fetch("/api/settings");
      const data = await res.json();
      setActiveTheme(data.settings?.activeTheme || "");
    } catch (error) {
      console.error("加载主题设置失败:", error);
    }
  };

  const handlePreview = (themeName: string) => {
    const previewUrl = `/preview?theme=${themeName}`;
    window.open(previewUrl, "_blank", "noopener,noreferrer");
  };

  const handleActivate = async (themeName: string) => {
    try {
      setPending(themeName);
      const token = localStorage.getItem("admin_token");
      const res = await fetch("/api/themes/activate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ themeName }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "主题启用失败");
      }

      setActiveTheme(themeName);
      setMessage("主题启用成功。");
    } catch (error: any) {
      console.error("启用主题失败:", error);
      setMessage(error?.message || "启用失败，请稍后重试。");
    } finally {
      setPending(null);
    }
  };

  const previewSrc = useMemo(() => {
    return themes.reduce<Record<string, string>>((acc, theme) => {
      acc[theme.name] = `/preview?theme=${theme.name}&embed=1`;
      return acc;
    }, {});
  }, [themes]);

  if (loading) {
    return (
      <div className="flex min-h-[320px] items-center justify-center text-sm text-slate-300">
        <span className="inline-flex h-10 w-10 animate-spin rounded-full border-2 border-white/15 border-t-white" />
        <span className="ml-3">主题数据加载中...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 text-slate-100 shadow-[0_25px_60px_-40px_rgba(15,23,42,0.9)]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs tracking-[0.3em] text-slate-400">主题库</p>
            <h1 className="mt-2 text-2xl font-semibold text-white">主题布局管理</h1>
            <p className="mt-3 max-w-2xl text-sm text-slate-300/85">
              在此切换官方主题，实时预览效果，确保导航站点在不同终端拥有一致体验。
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-xs text-slate-200">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              <span>当前主题：</span>
              <strong className="text-white">{activeTheme || "未设置"}</strong>
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
          const loadingPreview = previewLoading[theme.name];
          const src = previewSrc[theme.name];

          return (
            <div
              key={theme._id ?? theme.name}
              className={`overflow-hidden rounded-3xl border bg-slate-900/70 shadow-[0_20px_60px_-45px_rgba(15,23,42,0.95)] backdrop-blur transition ${
                isActive ? 'border-indigo-400/40' : 'border-white/10'
              }`}
            >
              <div className="relative h-64 border-b border-white/5 bg-slate-950/80">
                <iframe
                  src={src}
                  title={`${theme.title} preview`}
                  className="h-full w-full scale-[0.78] origin-top-left bg-white"
                  style={{ width: '128%', pointerEvents: 'none' }}
                  onLoad={() => setPreviewLoading(prev => ({ ...prev, [theme.name]: false }))}
                />
                {loadingPreview && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-slate-950/60 text-sm text-slate-200">
                    <span className="inline-flex h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                    预览生成中…
                  </div>
                )}
                {isActive && (
                  <div className="absolute left-5 top-5 rounded-full bg-indigo-500/90 px-3 py-1 text-xs font-semibold text-white shadow">
                    已启用
                  </div>
                )}
              </div>

              <div className="space-y-4 p-6 text-slate-100">
                <div className="space-y-1">
                  <h2 className="text-lg font-semibold text-white">{theme.title}</h2>
                  <p className="text-sm text-slate-300/85">
                    {theme.description || '官方导航主题，专为高效浏览体验打造。'}
                  </p>
                </div>

                <div className="grid gap-2 text-xs text-slate-400 sm:grid-cols-3">
                  <span>版本：{theme.version || '1.0.0'}</span>
                  <span>作者：{theme.author || 'NavGo 团队'}</span>
                  <span>标识：{theme.name}</span>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => void handlePreview(theme.name)}
                    className="flex-1 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 transition hover:border-white/30 hover:bg-white/10"
                  >
                    预览
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
                    {pending === theme.name ? '启用中…' : isActive ? '正在使用' : '启用主题'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {themes.length === 0 && (
        <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-10 text-center text-sm text-slate-300/80">
          暂无可用主题，请从官方仓库安装主题后重试。
        </div>
      )}
    </div>
  );
}
