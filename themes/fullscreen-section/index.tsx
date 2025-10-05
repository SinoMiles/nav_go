'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { ThemeProps } from '@/lib/types/theme';
import AddLinkModal from '@/themes/shared/AddLinkModal';

const gradients = [
  ['#2563eb', '#9333ea'],
  ['#0ea5e9', '#10b981'],
  ['#f97316', '#ef4444'],
  ['#6366f1', '#ec4899'],
  ['#14b8a6', '#3b82f6'],
];

const parseId = (value: any) =>
  typeof value === 'string' ? value : value?.toString?.() ?? '';

const formatHost = (url?: string) => {
  if (!url) return '';
  try {
    const { hostname } = new URL(url);
    return hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
};

export default function FullscreenSectionTheme({
  children,
  categories,
  links,
  config,
  siteName,
}: ThemeProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [autoPlay, setAutoPlay] = useState(false);
  const [showSubmit, setShowSubmit] = useState(false);

  const accent = config?.primaryColor || '#2563eb';
  const hasCategories = categories.length > 0;
  const safeIndex = hasCategories
    ? Math.min(currentIndex, categories.length - 1)
    : 0;
  const currentYear = useMemo(() => new Date().getFullYear(), []);

  useEffect(() => {
    if (!autoPlay || categories.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % categories.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [autoPlay, categories.length]);

  const activeCategory = hasCategories ? categories[safeIndex] : null;

  const activeLinks = useMemo(() => {
    if (!activeCategory) return [] as typeof links;
    const categoryId = parseId(activeCategory._id);
    return links
      .filter(link => parseId(link.categoryId) === categoryId)
      .slice(0, 6);
  }, [links, activeCategory]);

  const categoriesForModal = useMemo(
    () =>
      categories.map(category => ({
        id: parseId(category._id),
        title: category.title,
      })),
    [categories]
  );

  const gradientPair = gradients[safeIndex % gradients.length];

  const goTo = (index: number) => {
    if (!hasCategories) return;
    setCurrentIndex((index + categories.length) % categories.length);
  };

  const recordVisit = async (linkId: string) => {
    try {
      await fetch('/api/stats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ linkId }),
      });
    } catch (error) {
      console.error('记录访问失败:', error);
    }
  };

  const handleVisit = async (link: any) => {
    const id = parseId(link._id);
    if (id) await recordVisit(id);
    window.open(link.url, '_blank', 'noopener,noreferrer');
  };

  const handleDetail = (link: any) => {
    const id = parseId(link._id);
    if (!id) return;
    window.location.href = `/link/${id}`;
  };

  if (children) {
    return <>{children}</>;
  }

  return (
    <div className="relative min-h-screen overflow-hidden text-white">
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(135deg, ${gradientPair[0]}, ${gradientPair[1]})`,
        }}
      >
        <div className="absolute inset-0 bg-slate-950/70" />
      </div>

      <header className="relative z-10 border-b border-white/10">
        <div className="mx-auto flex w-full max-w-none flex-wrap items-center justify-between gap-4 px-10 py-6">
          <div className="flex items-center gap-4">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white/15 text-lg font-semibold text-white">
              {siteName?.charAt(0) ?? 'N'}
            </div>
            <div>
              <h1 className="text-2xl font-semibold">{siteName || 'NavGo'}</h1>
              <p className="text-sm text-white/70">全屏沉浸式导航体验</p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-sm">
            <button
              onClick={() => setAutoPlay(prev => !prev)}
              className={`rounded-full border border-white/20 px-4 py-2 font-medium transition hover:border-white/40 hover:text-white ${
                autoPlay ? 'bg-white/15' : 'bg-white/5'
              }`}
            >
              {autoPlay ? '暂停轮播' : '自动轮播'}
            </button>
            <button
              onClick={() => setShowSubmit(true)}
              className="rounded-full border border-white/20 px-4 py-2 font-medium text-white/80 transition hover:border-white/40 hover:text-white"
            >
              提交链接
            </button>
            <a
              href="/admin"
              className="rounded-full border border-white/20 px-4 py-2 font-medium text-white/80 transition hover:border-white/40 hover:text-white"
            >
              管理后台
            </a>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto flex min-h-[calc(100vh-140px)] w-full max-w-none flex-col justify-between px-10 py-10">
        <div className="flex flex-col gap-8 lg:flex-row">
          <div className="flex-1 space-y-6 pr-0 lg:pr-6">
            <div className="space-y-3">
              <p className="text-sm uppercase tracking-widest text-white/60">
                {hasCategories ? `分类 ${safeIndex + 1} / ${categories.length}` : '暂无分类'}
              </p>
              <h2 className="text-4xl font-semibold leading-tight lg:text-5xl">
                {activeCategory?.title || '请在后台新增分类'}
              </h2>
              {activeCategory?.description && (
                <p className="max-w-xl text-base text-white/70">
                  {activeCategory.description}
                </p>
              )}
            </div>

            <div className="flex flex-wrap gap-4 text-sm text-white/70">
              <span className="rounded-full border border-white/20 px-4 py-2">
                {activeLinks.length} 个精选站点
              </span>
              <span className="rounded-full border border-white/20 px-4 py-2">
                自动切换 {autoPlay ? '开启' : '关闭'}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => goTo(safeIndex - 1)}
                className="rounded-full border border-white/20 px-4 py-2 text-sm transition hover:border-white/40"
              >
                上一分类
              </button>
              <button
                onClick={() => goTo(safeIndex + 1)}
                className="rounded-full bg-white text-slate-900 px-4 py-2 text-sm font-medium transition hover:bg-white/90"
              >
                下一分类
              </button>
            </div>
          </div>

          <div className="grid flex-[1.6] gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {activeLinks.length === 0 && (
              <div className="col-span-2 grid h-56 place-items-center rounded-3xl border border-white/10 bg-white/5 text-sm text-white/60">
                该分类暂无站点，请前往后台添加。
              </div>
            )}

            {activeLinks.map(link => (
              <article
                key={parseId(link._id)}
                className="flex h-full flex-col justify-between rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur transition hover:border-white/20 hover:bg-white/15"
              >
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    {link.iconUrl ? (
                      <img
                        src={link.iconUrl}
                        alt={link.title}
                        className="h-10 w-10 rounded-2xl object-cover"
                      />
                    ) : (
                      <span className="grid h-10 w-10 place-items-center rounded-2xl bg-white/20 text-sm font-semibold">
                        {link.title?.charAt(0) ?? '•'}
                      </span>
                    )}
                    <div className="min-w-0">
                      <h3 className="truncate text-lg font-semibold">
                        {link.title}
                      </h3>
                      <p className="text-xs uppercase tracking-wide text-white/60">
                        {formatHost(link.url)}
                      </p>
                    </div>
                  </div>

                  {link.description && (
                    <p className="line-clamp-3 text-sm text-white/70">
                      {link.description}
                    </p>
                  )}

                  {link.tags && link.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 text-xs">
                      {link.tags.slice(0, 3).map((tag: string) => (
                        <span
                          key={tag}
                          className="rounded-full bg-white/10 px-2 py-1 text-white/70"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-4 flex items-center justify-between gap-3 text-sm">
                  <button
                    onClick={() => handleVisit(link)}
                    className="flex-1 rounded-full border border-white/20 px-4 py-2 transition hover:border-white/40"
                  >
                    访问站点
                  </button>
                  <button
                    onClick={() => handleDetail(link)}
                    className="flex-1 rounded-full border border-transparent bg-white text-slate-900 px-4 py-2 font-medium transition hover:bg-white/90"
                  >
                    详情
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-center gap-2">
          {categories.map((category, idx) => (
            <button
              key={parseId(category._id)}
              onClick={() => goTo(idx)}
              className={`h-2 rounded-full transition-all ${
                idx === safeIndex
                  ? 'w-12 bg-white'
                  : 'w-6 bg-white/40 hover:bg-white/60'
              }`}
              aria-label={`切换到 ${category.title}`}
            />
          ))}
        </div>
      </main>

      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-32"
        style={{
          background:
            'linear-gradient(0deg, rgba(15,23,42,0.8) 0%, rgba(15,23,42,0) 100%)',
        }}
      />

      <footer className="relative z-10 border-t border-white/10 bg-slate-950/70 px-10 py-6 text-sm text-white/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-none flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>© {currentYear} {siteName || 'NavGo'} · 全屏沉浸式导航</div>
          <div className="flex flex-wrap items-center gap-4 text-xs">
            <a href="/" className="hover:text-white">
              返回首页
            </a>
            <button
              onClick={() => setShowSubmit(true)}
              className="rounded-full border border-white/20 px-3 py-1 text-xs font-medium text-white transition hover:border-white/40" 
            >
              提交链接
            </button>
            <a href="/admin" className="hover:text-white">
              管理后台
            </a>
          </div>
        </div>
      </footer>

      <button
        onClick={() => setShowSubmit(true)}
        className="fixed bottom-6 right-6 z-[90] rounded-full px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:opacity-90"
        style={{ backgroundColor: accent }}
      >
        提交链接
      </button>

      <AddLinkModal
        open={showSubmit}
        onClose={() => setShowSubmit(false)}
        categories={categoriesForModal}
        accentColor={accent}
      />
    </div>
  );
}
