"use client";

import { useMemo, useState } from "react";

import AddLinkModal from "@/themes/shared/AddLinkModal";
import type { ThemeProps } from "@/lib/types/theme";

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

const normalizeTags = (source: any): string[] => {
  if (!source) return [];
  if (Array.isArray(source)) return source.map(tag => String(tag)).filter(Boolean);
  if (typeof source === "string")
    return source
      .split(/[,\s]+/)
      .map(tag => tag.trim())
      .filter(Boolean);
  return [];
};

type CategoryRecord = {
  _id: any;
  title?: string;
  description?: string;
  order?: number;
  parentId?: any;
};

type LinkRecord = {
  _id: any;
  title?: string;
  description?: string;
  url?: string;
  iconUrl?: string;
  categoryId?: any;
  order?: number;
  tags?: any;
};

type NavItem = {
  id: string;
  title: string;
  description?: string;
  count: number;
};

type NavCraftData = {
  navItems: NavItem[];
  categoryOptions: { id: string; title: string }[];
  categoryMap: Map<string, CategoryRecord>;
  aggregatedLinks: Map<string, LinkRecord[]>;
  initialActive: string | null;
};

export default function NavCraftTheme({ categories, links, config, siteName, children }: ThemeProps) {
  const accent = config?.primaryColor || "#2563eb";
  const defaultTagline = "Curated navigation experience";
  const headerTagline = (config?.headerTagline || defaultTagline).trim() || defaultTagline;

  const { navItems, categoryOptions, categoryMap, aggregatedLinks, initialActive } = useNavCraftData(
    categories,
    links,
  );

  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(initialActive);
  const [showSubmit, setShowSubmit] = useState(false);

  const activeCategory = activeCategoryId ? categoryMap.get(activeCategoryId) ?? null : null;
  const activeLinks = activeCategoryId ? aggregatedLinks.get(activeCategoryId) ?? [] : [];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto flex max-w-7xl gap-8 px-4 py-10 md:px-6 lg:px-10">
        <aside className="hidden w-60 flex-shrink-0 md:block">
          <div className="mb-8 space-y-1">
            <div className="flex items-center gap-2">
              {config?.logo ? (
                <img src={config.logo} alt={siteName} className="h-9 w-9 rounded-xl object-cover" />
              ) : (
                <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-sky-500 via-indigo-500 to-purple-500 text-sm font-semibold text-white">
                  {(siteName || "NavCraft").slice(0, 3)}
                </div>
              )}
              <div>
                <p className="text-lg font-semibold">{siteName || "NavCraft"}</p>
                <p className="text-xs text-slate-500">Site navigation</p>
              </div>
            </div>
          </div>

          <nav className="space-y-1 overflow-y-auto pr-1 text-sm">
            {navItems.map(item => {
              const active = item.id === activeCategoryId;
              const baseClasses = "flex w-full items-center justify-between rounded-2xl border px-4 py-3 transition";
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveCategoryId(item.id)}
                  className={
                    active
                      ? `${baseClasses} border-sky-300 bg-sky-500 text-white shadow`
                      : `${baseClasses} border-transparent text-slate-600 hover:border-slate-200 hover:bg-slate-100`
                  }
                >
                  <div className="flex flex-col items-start">
                    <span className={`text-sm font-medium ${active ? "text-white" : "text-slate-700"}`}>
                      {item.title}
                    </span>
                    {item.description && (
                      <span className={`text-xs ${active ? "text-sky-100" : "text-slate-500"}`}>{item.description}</span>
                    )}
                  </div>
                  <span
                    className={`min-w-[2.25rem] rounded-full px-2 py-1 text-center text-xs font-semibold ${
                      active ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {item.count}
                  </span>
                </button>
              );
            })}
          </nav>
        </aside>

        <main className="flex-1 space-y-8">
          <header className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm backdrop-blur md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                {activeCategory?.title || navItems[0]?.title || siteName}
              </p>
              <h1 className="mt-2 text-3xl font-semibold text-slate-900">
                {activeCategory?.title || siteName || "Featured navigation"}
              </h1>
              <p className="mt-2 text-sm text-slate-600">
                {activeCategory?.description || headerTagline}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => setShowSubmit(true)}
                className="inline-flex items-center gap-2 rounded-full border border-transparent bg-gradient-to-r from-sky-500 via-indigo-500 to-purple-500 px-5 py-2 text-sm font-semibold text-white shadow-lg transition hover:opacity-90"
              >
                Submit link
              </button>
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
              >
                Back to top
              </button>
            </div>
          </header>

          {activeLinks.length === 0 ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500 shadow-sm">
              No links yet. Share one!
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {activeLinks.map(link => (
                <LinkCard key={parseId(link._id)} link={link} accent={accent} />
              ))}
            </div>
          )}
        </main>
      </div>

      <AddLinkModal open={showSubmit} onClose={() => setShowSubmit(false)} categories={categoryOptions} accentColor={accent} />
      {children}
    </div>
  );
}

function useNavCraftData(categories: any[], links: any[]): NavCraftData {
  return useMemo(() => {
    const categoryRecords: CategoryRecord[] = Array.isArray(categories) ? categories : [];
    const linkRecords: LinkRecord[] = Array.isArray(links) ? links : [];

    const categoryMap = new Map<string, CategoryRecord>();
    const parentMap = new Map<string, string | null>();
    const childrenMap = new Map<string, string[]>();

    categoryRecords.forEach(category => {
      const id = parseId(category._id);
      categoryMap.set(id, category);
      const parentId = category.parentId ? parseId(category.parentId) : null;
      parentMap.set(id, parentId);
      if (parentId) {
        if (!childrenMap.has(parentId)) childrenMap.set(parentId, []);
        childrenMap.get(parentId)!.push(id);
      }
    });

    const collectDescendants = (rootId: string): Set<string> => {
      const visited = new Set<string>([rootId]);
      const queue = [...(childrenMap.get(rootId) ?? [])];
      while (queue.length) {
        const childId = queue.shift()!;
        if (visited.has(childId)) continue;
        visited.add(childId);
        queue.push(...(childrenMap.get(childId) ?? []));
      }
      return visited;
    };

    const directLinkBuckets = new Map<string, LinkRecord[]>();
    linkRecords.forEach(link => {
      const categoryId = parseId(link.categoryId) || "__uncategorized__";
      if (!directLinkBuckets.has(categoryId)) directLinkBuckets.set(categoryId, []);
      directLinkBuckets.get(categoryId)!.push(link);
    });

    const sortCategories = (list: CategoryRecord[]) =>
      list
        .slice()
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || (a.title ?? "").localeCompare(b.title ?? "", "zh-CN"));

    const rootCategories = sortCategories(
      categoryRecords.filter(category => !parentMap.get(parseId(category._id))),
    );

    const aggregatedLinks = new Map<string, LinkRecord[]>();

    const navItems: NavItem[] = rootCategories.map(category => {
      const id = parseId(category._id);
      const descendants = collectDescendants(id);
      const bucket: LinkRecord[] = [];
      let count = 0;
      descendants.forEach(descId => {
        const items = directLinkBuckets.get(descId);
        if (items && items.length) {
          count += items.length;
          bucket.push(...items);
        }
      });
      bucket.sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || (a.title ?? "").localeCompare(b.title ?? "", "zh-CN"));
      aggregatedLinks.set(id, bucket);
      return {
        id,
        title: category.title || "Untitled category",
        description: category.description,
        count,
      };
    });

    const uncategorizedId = "__uncategorized__";
    const uncategorizedLinks = directLinkBuckets.get(uncategorizedId) ?? [];
    if (uncategorizedLinks.length > 0) {
      uncategorizedLinks.sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || (a.title ?? "").localeCompare(b.title ?? "", "zh-CN"));
      aggregatedLinks.set(uncategorizedId, uncategorizedLinks);
      navItems.push({
        id: uncategorizedId,
        title: "Uncategorized",
        description: "Links waiting for classification",
        count: uncategorizedLinks.length,
      });
      categoryMap.set(uncategorizedId, {
        _id: uncategorizedId,
        title: "Uncategorized",
        description: "These sites are not yet assigned to a category",
      });
    }

    const itemsToUse = navItems.length > 0 ? navItems : [{ id: "__all__", title: "All", count: linkRecords.length }];
    if (!aggregatedLinks.has("__all__") && itemsToUse[0].id === "__all__") {
      aggregatedLinks.set("__all__", linkRecords.slice());
    }

    const categoryOptions = sortCategories(categoryRecords).map(category => ({
      id: parseId(category._id),
      title: category.title || "Untitled category",
    }));

    const initialActive = itemsToUse[0]?.id ?? null;

    return {
      navItems: itemsToUse,
      categoryOptions,
      categoryMap,
      aggregatedLinks,
      initialActive,
    } satisfies NavCraftData;
  }, [categories, links]);
}

function LinkCard({ link, accent }: { link: LinkRecord; accent: string }) {
  const tags = normalizeTags(link.tags);
  return (
    <a
      href={link.url || "#"}
      target={link.url ? "_blank" : undefined}
      rel={link.url ? "noreferrer" : undefined}
      className="group relative flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-slate-200 bg-slate-100">
        {link.iconUrl ? (
          <img src={link.iconUrl} alt={link.title || ""} className="h-10 w-10 rounded-md object-cover" />
        ) : (
          <span className="text-sm font-semibold text-slate-500">{(link.title || "?").slice(0, 2)}</span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2">
        <div>
          <p className="text-base font-semibold text-slate-900">{link.title || "Untitled"}</p>
          {link.description && <p className="text-sm text-slate-600">{link.description}</p>}
        </div>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.map(tag => (
              <span
                key={tag}
                style={{ color: accent }}
                className="rounded-full border border-current/30 bg-slate-100 px-2 py-1 text-xs font-medium"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </a>
  );
}
