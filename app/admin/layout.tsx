'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

const NAV_ITEMS = [
  { name: '\u6982\u89c8', path: '/admin', icon: '\u603b' },
  { name: '\u4e3b\u9898\u7ba1\u7406', path: '/admin/themes', icon: '\u9898' },
  { name: '\u5206\u7c7b\u7ba1\u7406', path: '/admin/categories', icon: '\u7c7b' },
  { name: '\u94fe\u63a5\u7ba1\u7406', path: '/admin/links', icon: '\u94fe' },
  { name: '\u7cfb\u7edf\u8bbe\u7f6e', path: '/admin/settings', icon: '\u8bbe' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    const rawUser = localStorage.getItem('admin_user');

    if (!token || !rawUser) {
      if (pathname !== '/admin/login') {
        router.push('/admin/login');
      }
      setLoading(false);
      return;
    }

    try {
      const parsed = JSON.parse(rawUser);
      setUser(parsed);
    } catch (error) {
      router.push('/admin/login');
    } finally {
      setLoading(false);
    }
  }, [pathname, router]);

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/admin/login');
  };

  const activePath = useMemo(() => {
    if (!pathname) return '';
    const exact = NAV_ITEMS.find(item => pathname === item.path);
    if (exact) return exact.path;
    const candidates = NAV_ITEMS.filter(item => pathname.startsWith(`${item.path}/`)).sort(
      (a, b) => b.path.length - a.path.length,
    );
    return candidates[0]?.path ?? '';
  }, [pathname]);

  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-400">
        后台加载中…
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_20%_20%,rgba(148,163,184,0.18),transparent_55%),radial-gradient(circle_at_80%_0%,rgba(129,140,248,0.18),transparent_45%),linear-gradient(135deg,#020617,#0f172a_50%,#111827_80%)]" />

      <header className="fixed inset-x-0 top-0 z-50 px-6 pt-4">
        <div className="mx-auto rounded-3xl border border-white/10 bg-slate-900/75 px-6 py-4 shadow-[0_30px_70px_-28px_rgba(15,23,42,0.9)] backdrop-blur">
          <div className="flex items-center justify-between gap-8">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(prev => !prev)}
                className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-slate-200 transition hover:bg-white/10 lg:hidden"
                aria-label="展开或折叠菜单"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <div className="flex items-center gap-3">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-sky-500 via-indigo-500 to-purple-500 text-lg font-semibold text-white shadow-lg">
                  导
                </div>
                <div>
                  <p className="text-base font-semibold text-white">导航后台中心</p>
                  <p className="text-xs text-slate-300">集中管理站点内容与主题</p>
                </div>
              </div>
            </div>

            <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs tracking-[0.2em] text-slate-200 backdrop-blur-sm lg:flex">
              ⚡ 实时同步 · 安全访问
            </div>

            <div className="flex items-center gap-4">
              <Link
                href="/"
                target="_blank"
                className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/10 lg:flex"
              >
                <span>🏠</span>
                <span>查看前台</span>
              </Link>
              <div className="hidden items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 backdrop-blur lg:flex">
                <div className="text-right">
                  <p className="font-medium text-white">{user.name}</p>
                  <p className="text-xs text-slate-300">{user.email}</p>
                </div>
                <div className="grid h-9 w-9 place-items-center rounded-full bg-white/20 text-sm font-semibold text-white">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="rounded-full border border-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-sky-500 px-5 py-2 text-sm font-semibold text-white shadow-lg transition hover:opacity-90"
              >
                退出登录
              </button>
            </div>
          </div>
        </div>
      </header>

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed left-4 right-4 top-[8.5rem] z-50 max-h-[calc(100vh-9.5rem)] origin-left overflow-hidden rounded-3xl border border-white/10 bg-slate-900/80 p-5 shadow-2xl backdrop-blur transition-transform duration-300 lg:left-8 lg:right-auto lg:w-72 lg:max-h-[calc(100vh-9rem)] lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-[calc(100%+1.5rem)] lg:translate-x-0'
        }`}
      >
        <nav className="mt-2 space-y-2">
          {NAV_ITEMS.map(item => {
            const isActive = activePath === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-500/90 via-purple-500/90 to-indigo-600/90 text-white shadow-lg shadow-indigo-500/40'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.name}</span>
                {isActive && <span className="ml-auto h-2 w-2 rounded-full bg-white" />}
              </Link>
            );
          })}
        </nav>
      </aside>

      <main className="relative pt-[9.5rem] pb-16 lg:pl-[24rem]">
        <div className="px-6">
          <div className="rounded-[28px] border border-white/10 bg-slate-900/55 px-6 py-8 shadow-[0_25px_60px_-40px_rgba(0,0,0,0.9)] backdrop-blur-lg">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
