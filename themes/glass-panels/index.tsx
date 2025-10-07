"use client";

import { useMemo, useState } from "react";
import type { ThemeProps } from "@/lib/types/theme";

interface CategoryGroup {
  id: string;
  title: string;
  description?: string;
  links: Array<{
    id: string;
    title: string;
    url?: string;
    description?: string;
    iconUrl?: string;
    tags?: string[];
  }>;
}

const parseId = (value: any): string => {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  if (typeof value === "object" && value !== null) {
    if (typeof value.toString === "function") return value.toString();
    if ("$oid" in value) return String((value as { $oid: string }).$oid);
  }
  return "";
};

const buildGroups = (categories: any[], links: any[]): CategoryGroup[] => {
  const categoryMap = new Map<string, CategoryGroup>();
  const sortedCategories = categories
    .slice()
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || (a.title ?? "").localeCompare(b.title ?? "", "zh-CN"));

  sortedCategories.forEach(category => {
    const id = parseId(category._id);
    if (!id) return;
    categoryMap.set(id, {
      id,
      title: category.title || "未命名分类",
      description: category.description,
      links: [],
    });
  });

  const sortedLinks = links
    .slice()
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || (a.title ?? "").localeCompare(b.title ?? "", "zh-CN"));

  sortedLinks.forEach(link => {
    const categoryId = parseId(link.categoryId);
    const target = categoryMap.get(categoryId);
    if (target) {
      target.links.push({
        id: parseId(link._id) || `${target.id}-${target.links.length}`,
        title: link.title || "未命名站点",
        url: link.url,
        description: link.description,
        iconUrl: link.iconUrl,
        tags: Array.isArray(link.tags) ? link.tags : undefined,
      });
    }
  });

  return Array.from(categoryMap.values()).filter(group => group.links.length > 0);
};

export default function GlassPanelsTheme({ categories, links, config, siteName }: ThemeProps) {
  const accent = config?.primaryColor || "#6366f1";
  const tagline = typeof config?.tagline === "string" && config.tagline.trim().length > 0
    ? config.tagline.trim()
    : "精选导航合集，覆盖工具、资讯与社区";
  const actionLabel = typeof config?.actionLabel === "string" && config.actionLabel.trim().length > 0
    ? config.actionLabel.trim()
    : "提交友链";

  const groups = useMemo(() => buildGroups(categories, links), [categories, links]);
  const [activeGroupId, setActiveGroupId] = useState<string>(() => groups[0]?.id ?? "");

  const activeGroup = groups.find(group => group.id === activeGroupId) ?? groups[0] ?? null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 bg-[radial-gradient(circle_at_top,#4338ca_0%,#1e1b4b_40%,#020617_100%)]"
          aria-hidden
        />
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 via-transparent to-sky-400/10" aria-hidden />
        <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 pb-16 pt-14 sm:px-10 lg:px-12">
          <header className="space-y-6">
            <span className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-4 py-1 text-xs uppercase tracking-[0.4em] text-indigo-100">
              Theme · Glass Panels
            </span>
            <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
              {siteName || "NavGo"}
            </h1>
            <p className="max-w-2xl text-base text-indigo-100/90 sm:text-lg">{tagline}</p>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => window.open("/submit", "_blank", "noopener,noreferrer")}
                className="inline-flex items-center gap-2 rounded-full border border-transparent bg-white px-5 py-2 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-slate-100"
              >
                {actionLabel}
              </button>
              <button
                type="button"
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-5 py-2 text-sm text-white transition hover:bg-white/20"
              >
                返回顶部
              </button>
            </div>
          </header>

          {groups.length > 1 ? (
            <div className="flex flex-wrap gap-3 overflow-x-auto pb-1">
              {groups.map(group => {
                const isActive = group.id === activeGroupId;
                return (
                  <button
                    key={group.id}
                    type="button"
                    onClick={() => setActiveGroupId(group.id)}
                    className={`rounded-full border px-4 py-2 text-sm transition ${
                      isActive
                        ? "border-white bg-white text-slate-900 shadow"
                        : "border-white/20 bg-white/5 text-indigo-100 hover:border-white/40 hover:bg-white/10"
                    }`}
                  >
                    {group.title}
                  </button>
                );
              })}
            </div>
          ) : null}
        </div>
      </section>

      <main className="mx-auto w-full max-w-6xl px-6 pb-16 sm:px-10 lg:px-12">
        {activeGroup ? (
          <>
            <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-2xl font-semibold text-white">{activeGroup.title}</h2>
                {activeGroup.description ? (
                  <p className="text-sm text-slate-400">{activeGroup.description}</p>
                ) : null}
              </div>
              <span className="rounded-full border border-white/10 bg-white/5 px-4 py-1 text-xs text-indigo-100">
                共 {activeGroup.links.length} 个站点
              </span>
            </div>

            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {activeGroup.links.map(link => (
                <article
                  key={link.id}
                  className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur transition hover:border-white/30 hover:bg-white/10"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/10">
                      {link.iconUrl ? (
                        <img src={link.iconUrl} alt={link.title} className="h-10 w-10 rounded-xl object-cover" />
                      ) : (
                        <span className="text-sm font-semibold text-indigo-100">{link.title.slice(0, 2)}</span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="truncate text-lg font-semibold text-white">{link.title}</h3>
                        {link.url ? (
                          <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs text-indigo-100">
                            外链
                          </span>
                        ) : null}
                      </div>
                      {link.description ? (
                        <p className="mt-1 line-clamp-2 text-sm text-slate-300">{link.description}</p>
                      ) : null}
                      {link.tags && link.tags.length > 0 ? (
                        <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-slate-200">
                          {link.tags.slice(0, 3).map(tag => (
                            <span
                              key={tag}
                              className="rounded-full border border-white/10 bg-white/10 px-2 py-1"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  </div>
                  {link.url ? (
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-indigo-100 transition hover:text-white"
                    >
                      访问站点
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="none"
                        className="h-4 w-4"
                        stroke="currentColor"
                        strokeWidth={1.5}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="m11 4 5 0 0 5" />
                        <path d="M17 3 9 11" />
                        <path d="M15 11.5 15 15a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h3.5" />
                      </svg>
                    </a>
                  ) : null}
                </article>
              ))}
            </div>
          </>
        ) : (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-10 text-center text-sm text-slate-300">
            暂无可展示的站点内容，请先在后台添加链接。
          </div>
        )}
      </main>
    </div>
  );
}
