'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { PropsWithChildren, ReactNode } from 'react';

type NavItem = {
  href: string;
  label: string;
  description: string;
  icon: ReactNode;
};

const NAV_ITEMS: NavItem[] = [
  {
    href: '/admin',
    label: '控制台',
    description: '查看站点运行概况',
    icon: (
      <svg
        className="h-5 w-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 13h8V3H3z" />
        <path d="M13 21h8v-8h-8z" />
        <path d="M13 3h8v5h-8z" />
        <path d="M3 16h8v5H3z" />
      </svg>
    ),
  },
  {
    href: '/admin/categories',
    label: '分类管理',
    description: '维护一级与二级分类',
    icon: (
      <svg
        className="h-5 w-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M4 4h7v7H4z" />
        <path d="M13 4h7v4h-7z" />
        <path d="M13 13h7v7h-7z" />
        <path d="M4 13h7v7H4z" />
      </svg>
    ),
  },
  {
    href: '/admin/links',
    label: '链接管理',
    description: '整理站点导航链接',
    icon: (
      <svg
        className="h-5 w-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M10 13a5 5 0 0 0 7.07 0l2.12-2.12a5 5 0 0 0-7.07-7.07l-1.42 1.41" />
        <path d="M14 11a5 5 0 0 0-7.07 0l-2.12 2.12a5 5 0 0 0 7.07 7.07l1.42-1.41" />
      </svg>
    ),
  },
  {
    href: '/admin/themes',
    label: '主题管理',
    description: '切换站点主题与样式',
    icon: (
      <svg
        className="h-5 w-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 3v7l3 3" />
        <circle cx="12" cy="12" r="9" />
      </svg>
    ),
  },
  {
    href: '/admin/settings',
    label: '系统设置',
    description: '配置站点基础信息',
    icon: (
      <svg
        className="h-5 w-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06A1.65 1.65 0 0 0 15 19.4a1.65 1.65 0 0 0-1 .6 1.65 1.65 0 0 0-.33 1.82l.02.07A2 2 0 1 1 9 21.5l.02-.07A1.65 1.65 0 0 0 8 19.4a1.65 1.65 0 0 0-1-.6 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-.6-1 1.65 1.65 0 0 0-1.82-.33l-.07.02A2 2 0 1 1 2.5 9l.07.02A1.65 1.65 0 0 0 4.6 8a1.65 1.65 0 0 0 .6-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-.6 1.65 1.65 0 0 0 .33-1.82l-.02-.07A2 2 0 1 1 15 2.5l-.02.07A1.65 1.65 0 0 0 16 4.6a1.65 1.65 0 0 0 1 .6 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9c.36.57.36 1.3 0 1.87A1.65 1.65 0 0 0 20 12c.63 0 1.2.3 1.57.8" />
      </svg>
    ),
  },
  {
    href: '/admin/search',
    label: '搜索管理',
    description: '维护搜索引擎分组',
    icon: (
      <svg
        className="h-5 w-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3-3" />
      </svg>
    ),
  },
];

const Header = () => (
  <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-white/10 bg-slate-950/70 px-8 backdrop-blur">
    <div className="flex items-center gap-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-sky-500/40 via-indigo-500/40 to-purple-500/40 text-white shadow-lg">
        <span className="text-sm font-semibold">Nav</span>
      </div>
      <div className="space-y-0.5">
        <p className="text-sm font-semibold text-white">导航后台中心</p>
        <p className="text-xs text-slate-300">统一管理分类、链接与主题配置</p>
      </div>
    </div>

    <Link
      href="/"
      className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-slate-200 transition hover:border-white/20 hover:bg-white/10"
    >
      返回前台
    </Link>
  </header>
);

function Sidebar({ pathname }: { pathname: string }) {
  return (
    <aside className="hidden min-h-full w-72 flex-col border-r border-white/10 bg-slate-950/60 px-6 pb-8 pt-10 text-slate-200 lg:flex">
      <nav className="flex flex-1 flex-col gap-3">
        {NAV_ITEMS.map(item => {
          const active = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group relative overflow-hidden rounded-2xl border ${
                active ? 'border-sky-400/50 bg-sky-400/10 text-white shadow-[0_12px_40px_-20px_rgba(56,189,248,0.8)]' : 'border-white/10 bg-white/5 text-slate-200 hover:border-white/20 hover:bg-white/10'
              } px-4 py-3 transition`}
            >
              <div className="absolute inset-y-0 left-0 w-1 rounded-xl bg-gradient-to-b from-sky-400 via-indigo-400 to-fuchsia-400 opacity-0 transition group-hover:opacity-80" />
              <div className="relative z-10 flex items-start gap-3">
                <span
                  className={`flex h-10 w-10 items-center justify-center rounded-xl border ${
                    active ? 'border-sky-400/60 bg-sky-500/15 text-white' : 'border-white/10 bg-white/10 text-slate-200'
                  }`}
                >
                  {item.icon}
                </span>
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-semibold">{item.label}</span>
                  <span className="text-xs text-slate-300">{item.description}</span>
                </div>
              </div>
            </Link>
          );
        })}
      </nav>
      <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4 text-xs text-slate-300">
        <p className="font-medium text-slate-200">操作建议</p>
        <p className="mt-2 leading-relaxed">
          定期检查链接状态，保持分类层级清晰，并及时同步主题样式，让访客拥有稳定一致的浏览体验。
        </p>
      </div>
    </aside>
  );
}

export default function AdminLayout({ children }: PropsWithChildren) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      <Sidebar pathname={pathname} />
      <div className="flex w-full flex-1 flex-col">
        <Header />
        <main className="flex-1 overflow-y-auto px-6 py-10 lg:px-12">
          <nav className="mb-8 grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:hidden">
            {NAV_ITEMS.map(item => {
              const active = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm transition ${
                    active
                      ? 'border-sky-400/60 bg-sky-500/10 text-white'
                      : 'border-white/10 bg-white/5 text-slate-200 hover:border-white/20 hover:bg-white/10'
                  }`}
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl border border-current/40 bg-white/10">
                    {item.icon}
                  </span>
                  <div className="flex flex-col leading-tight">
                    <span className="font-semibold">{item.label}</span>
                    <span className="text-xs text-slate-300/80">{item.description}</span>
                  </div>
                </Link>
              );
            })}
          </nav>

          <div className="w-full space-y-10">{children}</div>
        </main>
      </div>
    </div>
  );
}
