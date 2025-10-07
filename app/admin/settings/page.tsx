"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";

interface SettingsState {
  siteName: string;
  siteDescription: string;
  siteKeywords: string;
  logo: string;
  favicon: string;
  headerTagline: string;
  friendLinkDomain: string;
}

const INITIAL_STATE: SettingsState = {
  siteName: "",
  siteDescription: "",
  siteKeywords: "",
  logo: "",
  favicon: "",
  headerTagline: "",
  friendLinkDomain: "",
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<SettingsState>(INITIAL_STATE);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    void loadSettings();
  }, []);

  useEffect(() => {
    if (!message) return;
    const timer = window.setTimeout(() => setMessage(""), 3000);
    return () => window.clearTimeout(timer);
  }, [message]);

  const loadSettings = async () => {
    try {
      const res = await fetch("/api/settings");
      const data = await res.json();
      if (data.settings) {
        setSettings({
          siteName: data.settings.siteName || "",
          siteDescription: data.settings.siteDescription || "",
          siteKeywords: data.settings.siteKeywords || "",
          logo: data.settings.logo || "",
          favicon: data.settings.favicon || "",
          headerTagline: data.settings.headerTagline || "",
          friendLinkDomain: data.settings.friendLinkDomain || "",
        });
      }
    } catch (error) {
      console.error("加载站点设置失败:", error);
      setMessage("站点设置加载失败，请稍后重试。");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const token = window.localStorage.getItem("admin_token");
      const payload = {
        ...settings,
        friendLinkDomain: settings.friendLinkDomain.trim(),
      };

      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "保存站点设置失败");
      }

      setMessage("站点设置保存成功。");
    } catch (error: any) {
      console.error("保存站点设置失败:", error);
      setMessage(error?.message || "保存失败，请稍后重试。");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[320px] flex-col items-center justify-center gap-3 text-sm text-slate-300">
        <span className="inline-flex h-10 w-10 animate-spin rounded-full border-2 border-white/15 border-t-white" />
        站点设置加载中…
      </div>
    );
  }

  return (
    <div className="space-y-8 text-slate-100">
      <header className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 shadow-[0_25px_60px_-40px_rgba(15,23,42,0.9)]">
        <p className="text-xs tracking-[0.3em] text-slate-400">全局配置</p>
        <h1 className="mt-2 text-2xl font-semibold text-white">站点基础设置</h1>
        <p className="mt-3 max-w-2xl text-sm text-slate-300/85">
          更新导航站对外展示的站名、关键词与品牌物料，保持站点信息统一专业。
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
              <h2 className="text-lg font-semibold text-white">站点信息</h2>
              <p className="text-sm text-slate-300/80">控制前台展现的基础文案与 SEO 关键词。</p>
            </div>
            <span className="rounded-full border border-white/10 bg-white/5 px-4 py-1 text-xs text-slate-200">
              品牌信息
            </span>
          </div>

          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <label className="space-y-2 text-sm">
              <span className="font-medium text-slate-200">站点名称</span>
              <input
                type="text"
                value={settings.siteName}
                onChange={event => setSettings(prev => ({ ...prev, siteName: event.target.value }))}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-white/20 focus:bg-white/10"
                placeholder="示例：NavGo · 导航精选"
              />
            </label>
            <label className="space-y-2 text-sm">
              <span className="font-medium text-slate-200">搜索关键词</span>
              <input
                type="text"
                value={settings.siteKeywords}
                onChange={event => setSettings(prev => ({ ...prev, siteKeywords: event.target.value }))}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-white/20 focus:bg-white/10"
                placeholder="示例：导航, 工具, 资源"
              />
            </label>
            <label className="space-y-2 text-sm">
              <span className="font-medium text-slate-200">本站域名</span>
              <input
                type="text"
                value={settings.friendLinkDomain}
                onChange={event => setSettings(prev => ({ ...prev, friendLinkDomain: event.target.value }))}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-white/20 focus:bg-white/10"
                placeholder="navgo.com"
              />
              <p className="text-xs text-slate-400/90">用于友链互换检测，请填写不带协议的主域名，例如 navgo.com。</p>
            </label>
            <label className="space-y-2 text-sm md:col-span-2">
              <span className="font-medium text-slate-200">顶部标语</span>
              <input
                type="text"
                value={settings.headerTagline}
                onChange={event => setSettings(prev => ({ ...prev, headerTagline: event.target.value }))}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-white/20 focus:bg-white/10"
                placeholder="示例：精选中文工具导航，为效率加速"
              />
              <p className="text-xs text-slate-400/90">此文案用于前台 Hero 区域的导语，并伴随字符动画效果。</p>
            </label>
          </div>

          <label className="mt-6 block space-y-2 text-sm">
            <span className="font-medium text-slate-200">站点简介</span>
            <textarea
              value={settings.siteDescription}
              onChange={event => setSettings(prev => ({ ...prev, siteDescription: event.target.value }))}
              rows={3}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-white/20 focus:bg-white/10"
              placeholder="用一段话介绍你的导航站点，例如：收录精选效率工具与资源的中文导航站。"
            />
          </label>
        </section>

        <section className="rounded-3xl border border-white/10 bg-slate-900/55 p-6 shadow-[0_20px_60px_-45px_rgba(15,23,42,0.95)]">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">品牌物料</h2>
              <p className="text-sm text-slate-300/80">配置 Logo、站点图标等静态资源，确保链接可访问。</p>
            </div>
            <span className="rounded-full border border-white/10 bg-white/5 px-4 py-1 text-xs text-slate-200">素材资源</span>
          </div>

          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <div className="space-y-3">
              <label className="space-y-2 text-sm">
                <span className="font-medium text-slate-200">Logo 地址</span>
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
                  <p className="text-slate-200">Logo 预览</p>
                  <img src={settings.logo} alt="Logo" className="mt-3 h-16 object-contain" />
                </div>
              )}
            </div>

            <div className="space-y-3">
              <label className="space-y-2 text-sm">
                <span className="font-medium text-slate-200">站点图标</span>
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
                  <img src={settings.favicon} alt="Favicon" className="h-8 w-8 object-contain" />
                  <span>Favicon 预览</span>
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-white/10 bg-slate-900/55 p-6 shadow-[0_20px_60px_-45px_rgba(15,23,42,0.95)]">
          <h2 className="text-lg font-semibold text-white">运行状态</h2>
          <div className="mt-5 grid gap-4 text-sm text-slate-300/80 md:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-400">版本</p>
              <p className="mt-2 text-white">NavGo v1.0.0</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-400">技术栈</p>
              <p className="mt-2">Next.js 15 · MongoDB · Tailwind CSS</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-400">服务状态</p>
              <p className="mt-2">数据库已连接 · 接口响应正常</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-400">运维建议</p>
              <p className="mt-2">建议每周巡检数据，并及时更新环境变量与备份策略。</p>
            </div>
          </div>
        </section>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-gradient-to-r from-sky-500 via-indigo-500 to-violet-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "保存中…" : "保存设置"}
          </button>
        </div>
      </form>
    </div>
  );
}
