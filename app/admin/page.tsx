'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

type Stats = {
  categories: number;
  links: number;
  themes: number;
};

const TEXT = {
  loading: '\u4eea\u8868\u76d8\u6570\u636e\u52a0\u8f7d\u4e2d\u2026',
  heroTag: '\u4eca\u65e5\u6982\u51b5',
  heroTitle: '\u5bfc\u822a\u540e\u53f0\u603b\u89c8',
  heroDesc:
    '\u638c\u63e1\u5185\u5bb9\u89c4\u6a21\u3001\u64cd\u4f5c\u63d0\u9192\u4e0e\u5f85\u529e\u5b89\u6392\uff0c\u8ba9\u65e5\u5e38\u7ef4\u62a4\u66f4\u9ad8\u6548\u3002',
  badges: ['\u5b9e\u65f6\u6570\u636e', '\u591a\u7aef\u9002\u914d', '\u4e3b\u9898\u53ef\u8c03'],
  operations: '\u8fd0\u8425\u63d0\u793a',
  operationsUpdated: '\u66f4\u65b0\u65e5\u671f',
  systemStatus: '\u7cfb\u7edf\u72b6\u6001',
  quickActions: '\u5feb\u6377\u64cd\u4f5c',
};

const ACTION_CARDS = [
  {
    href: '/admin/categories',
    label: '\u5206\u7c7b\u7ba1\u7406',
    short: '\u5206\u7c7b',
    description: '\u68c0\u7ea0\u9879\u76ee\u6784\u4ef6\u4e0e\u5c55\u793a\u987a\u5e8f\u3002',
    accent: 'from-sky-500/20 to-cyan-500/10',
  },
  {
    href: '/admin/links',
    label: '\u94fe\u63a5\u7ba1\u7406',
    short: '\u94fe\u63a5',
    description: '\u65b0\u589e\u4f18\u8d28\u8d44\u6e90\u5e76\u68c0\u9a8c\u72b6\u6001\u3002',
    accent: 'from-emerald-500/20 to-teal-500/10',
  },
  {
    href: '/admin/themes',
    label: '\u4e3b\u9898\u5207\u6362',
    short: '\u4e3b\u9898',
    description: '\u9884\u89c8\u7248\u5f0f\u5e76\u8c03\u6574\u914d\u8272\u65b9\u6848\u3002',
    accent: 'from-violet-500/20 to-fuchsia-500/10',
  },
  {
    href: '/admin/settings',
    label: '\u7ad9\u70b9\u8bbe\u7f6e',
    short: '\u8bbe\u7f6e',
    description: '\u66f4\u65b0\u54c1\u724c\u4fe1\u606f\u4e0eSEO\u914d\u7f6e\u3002',
    accent: 'from-amber-500/20 to-orange-500/10',
  },
] as const;

const OPERATIONS = [
  {
    title: '\u5b9a\u671f\u5de1\u68c0\u94fe\u63a5',
    detail: '\u5728\u201c\u94fe\u63a5\u7ba1\u7406\u201d\u4e2d\u6279\u91cf\u68c0\u67e5\u72b6\u6001\uff0c\u5e76\u6807\u8bb0\u65e0\u6cd5\u8bbf\u95ee\u7684\u5730\u5740\u3002',
  },
  {
    title: '\u4fdd\u6301\u5206\u7c7b\u7b80\u6d01',
    detail: '\u4e24\u7ea7\u7ed3\u6784\u5373\u53ef\u8986\u76d6\u4e3b\u8981\u573a\u666f\uff0c\u534f\u52a9\u7528\u6237\u5feb\u901f\u5b9a\u4f4d\u8d44\u6e90\u3002',
  },
  {
    title: '\u5b89\u6392\u6570\u636e\u5907\u4efd',
    detail: '\u6bcf\u5468\u5bfc\u51fa\u6570\u636e\u5e93\uff0c\u964d\u4f4e\u6545\u969c\u6062\u590d\u6210\u672c\u3002',
  },
] as const;

const QUICK_ACTIONS = [
  { href: '/admin/categories', label: '\u521b\u5efa\u65b0\u5206\u7c7b' },
  { href: '/admin/links', label: '\u5ba1\u6838\u6700\u65b0\u94fe\u63a5' },
  { href: '/admin/themes', label: '\u8c03\u6574\u4e3b\u9898\u989c\u8272' },
] as const;

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({ categories: 0, links: 0, themes: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const token = localStorage.getItem('admin_token');

      const [categoriesRes, linksRes, themesRes] = await Promise.all([
        fetch('/api/categories', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/links', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/themes', { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      const [categoriesData, linksData, themesData] = await Promise.all([
        categoriesRes.json(),
        linksRes.json(),
        themesRes.json(),
      ]);

      setStats({
        categories: categoriesData.categories?.length ?? 0,
        links: linksData.pagination?.total ?? (linksData.links?.length ?? 0),
        themes: themesData.themes?.length ?? 0,
      });
    } catch (error) {
      console.error('仪表盘数据获取失败:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[280px] flex-col items-center justify-center gap-4 text-sm text-slate-300">
        <span className="inline-flex h-10 w-10 animate-spin rounded-full border-2 border-white/20 border-t-white" />
        {TEXT.loading}
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-blue-500/30 via-indigo-600/25 to-slate-900/60 p-8 text-slate-100 shadow-[0_32px_80px_-40px_rgba(51,65,85,0.9)]">
        <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-32 w-full bg-gradient-to-t from-slate-900/40 to-transparent" />

        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-xl space-y-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs tracking-[0.2em] text-slate-200">
              {TEXT.heroTag}
            </span>
            <h1 className="text-3xl font-semibold text-white lg:text-4xl">{TEXT.heroTitle}</h1>
            <p className="text-sm text-slate-200/90">{TEXT.heroDesc}</p>
            <div className="flex flex-wrap gap-3 pt-2 text-xs text-slate-200/80">
              {TEXT.badges.map(badge => (
                <span
                  key={badge}
                  className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 py-1"
                >
                  {badge}
                </span>
              ))}
            </div>
          </div>

          <div className="grid w-full gap-4 sm:grid-cols-3 lg:w-auto">
            {[
              { label: '\u5206\u7c7b\u6570\u91cf', value: stats.categories, accent: 'from-sky-400 via-blue-500 to-indigo-500', unit: '\u4e2a' },
              { label: '\u94fe\u63a5\u6570\u91cf', value: stats.links, accent: 'from-emerald-400 via-teal-500 to-cyan-500', unit: '\u6761' },
              { label: '\u4e3b\u9898\u6570\u91cf', value: stats.themes, accent: 'from-purple-400 via-fuchsia-500 to-pink-500', unit: '\u5957' },
            ].map(item => (
              <div
                key={item.label}
                className="relative overflow-hidden rounded-2xl border border-white/20 bg-slate-900/30 p-4 shadow-lg backdrop-blur"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${item.accent} opacity-50`} />
                <div className="relative z-10 space-y-3">
                  <p className="text-xs text-slate-200/70">{item.label}</p>
                  <p className="text-3xl font-semibold text-white">
                    {item.value}
                    <span className="ml-1 text-base text-slate-300/80">{item.unit}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 text-slate-100">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">{TEXT.operations}</h2>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-200">
              {TEXT.operationsUpdated} {new Date().toLocaleDateString('zh-CN')}
            </span>
          </div>
          <ul className="mt-4 space-y-3 text-sm text-slate-200/90">
            {OPERATIONS.map((item, index) => (
              <li
                key={item.title}
                className="flex items-start gap-2 rounded-2xl border border-white/10 bg-white/5 p-3"
              >
                <span className="mt-0.5 text-sm font-semibold text-white/70">{index + 1}</span>
                <div>
                  <p className="font-medium text-white">{item.title}</p>
                  <p className="text-xs text-slate-300">{item.detail}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="grid gap-4">
          <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 text-slate-100">
            <h3 className="text-base font-semibold">{TEXT.systemStatus}</h3>
            <div className="mt-4 grid gap-3 text-sm text-slate-200/90">
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <p className="text-xs uppercase tracking-wide text-slate-300">版本信息</p>
                <p className="mt-1 text-white">NavCraft v1.0.0</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <p className="text-xs uppercase tracking-wide text-slate-300">运行环境</p>
                <p className="mt-1">Next.js 15 · MongoDB · Docker</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <p className="text-xs uppercase tracking-wide text-slate-300">服务状态</p>
                <p className="mt-1">数据库已连接 · 接口正常</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 text-slate-100">
            <h3 className="text-base font-semibold">{TEXT.quickActions}</h3>
            <div className="mt-4 grid gap-2 text-sm text-slate-200/90">
              {QUICK_ACTIONS.map(action => (
                <Link
                  key={action.href}
                  href={action.href}
                  className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 transition hover:bg-white/10"
                >
                  <span>{action.label}</span>
                  <span>&gt;</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {ACTION_CARDS.map(card => (
          <Link
            key={card.href}
            href={card.href}
            className="relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900/60 p-5 transition hover:-translate-y-1 hover:border-white/20 hover:bg-slate-800/70"
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${card.accent} opacity-70 transition group-hover:opacity-90`} />
            <div className="relative z-10 flex flex-col gap-3 text-slate-100">
              <span className="text-xs font-semibold uppercase tracking-wide text-white/70">{card.short}</span>
              <div>
                <p className="text-base font-semibold">{card.label}</p>
                <p className="mt-1 text-xs text-slate-200/80">{card.description}</p>
              </div>
            </div>
          </Link>
        ))}
      </section>
    </div>
  );
}
