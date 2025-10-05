"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { CSSProperties, FormEvent } from "react";
import AddLinkModal from "@/themes/shared/AddLinkModal";
import type { ThemeProps } from "@/lib/types/theme";

type CategoryNode = {
  id: string;
  title: string;
  description: string;
  order: number;
  parentId: string | null;
  children: CategoryNode[];
};

type LinkRecord = {
  id: string;
  title: string;
  url: string;
  description: string;
  host: string;
  categoryId: string | null;
  tags: string[];
};

type SearchEngine = {
  key: string;
  name: string;
  urlTemplate: string;
  order: number;
  isDefault: boolean;
};

type SearchGroup = {
  id: string;
  name: string;
  order: number;
  engines: SearchEngine[];
};

const INTERNAL_GROUP_ID = "internal";
const INTERNAL_ENGINE_KEY = "internal-site";
const ROOT_BUCKET = "__root__";

const valueToString = (value: unknown): string => {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (typeof value === "object" && typeof (value as { toString?: () => string }).toString === "function") {
    return (value as { toString(): string }).toString();
  }
  return "";
};

const resolveParentId = (category: any): string | null => {
  const parent = category?.parentId ?? null;
  if (!parent) return null;
  if (typeof parent === "string") return parent;
  if (typeof parent === "object") {
    if (parent._id) return valueToString(parent._id);
    if (typeof parent.toString === "function") return valueToString(parent.toString());
  }
  return null;
};

const createCategoryData = (raw: any[]) => {
  const nodes: CategoryNode[] = (raw || []).map(item => ({
    id: valueToString(item?._id),
    title: valueToString(item?.title) || "未命名分类",
    description: valueToString(item?.description),
    order: typeof item?.order === "number" ? item.order : 0,
    parentId: resolveParentId(item),
    children: [],
  }));

  const nodeMap = new Map<string, CategoryNode>();
  nodes.forEach(node => {
    if (node.id) nodeMap.set(node.id, node);
  });

  const roots: CategoryNode[] = [];
  nodes.forEach(node => {
    if (node.parentId && nodeMap.has(node.parentId)) {
      nodeMap.get(node.parentId)!.children.push(node);
    } else {
      roots.push(node);
    }
  });

  const sortNodes = (items: CategoryNode[]) => {
    items.sort((a, b) => a.order - b.order || a.title.localeCompare(b.title, "zh-CN"));
  };

  sortNodes(roots);
  roots.forEach(root => sortNodes(root.children));

  const childMap = new Map<string, CategoryNode[]>();
  roots.forEach(root => {
    childMap.set(root.id, root.children);
  });

  const rootByChild = new Map<string, string>();
  roots.forEach(root => {
    root.children.forEach(child => rootByChild.set(child.id, root.id));
  });

  return { roots, childMap, rootByChild, nodeMap, allNodes: nodes };
};

const normalizeLinks = (raw: any[]): LinkRecord[] => {
  return (raw || []).map(link => {
    const url = valueToString(link?.url) || "#";
    let host = url;
    try {
      const parsed = new URL(url);
      host = parsed.hostname.replace(/^www\./, "");
    } catch {
      host = url;
    }

    return {
      id: valueToString(link?._id) || url,
      title: valueToString(link?.title) || "未命名链接",
      url,
      description: valueToString(link?.description),
      host,
      categoryId: link?.categoryId ? valueToString(link.categoryId) : null,
      tags: Array.isArray(link?.tags) ? link.tags.map(valueToString).filter(Boolean) : [],
    };
  });
};

const buildLinkBuckets = (roots: CategoryNode[], rootByChild: Map<string, string>, links: LinkRecord[]) => {
  const rootIds = new Set(roots.map(root => root.id));
  const buckets = new Map<string, Map<string, LinkRecord[]>>();
  roots.forEach(root => buckets.set(root.id, new Map()));

  const uncategorized: LinkRecord[] = [];

  links.forEach(link => {
    const categoryId = link.categoryId;
    let rootId: string | null = null;
    let key = ROOT_BUCKET;

    if (categoryId && rootByChild.has(categoryId)) {
      rootId = rootByChild.get(categoryId)!;
      key = `child:${categoryId}`;
    } else if (categoryId && rootIds.has(categoryId)) {
      rootId = categoryId;
    }

    if (rootId && buckets.has(rootId)) {
      const map = buckets.get(rootId)!;
      const list = map.get(key) ?? [];
      list.push(link);
      map.set(key, list);
    } else {
      uncategorized.push(link);
    }
  });

  return { buckets, uncategorized };
};

const normalizeSearchGroups = (raw: any[]): SearchGroup[] => {
  return (raw || [])
    .map(group => {
      const engines = Array.isArray(group?.engines)
        ? group.engines
            .map((engine: any, index: number): SearchEngine | null => {
              const name = valueToString(engine?.name);
              const urlTemplate = valueToString(engine?.urlTemplate);
              if (!name || !urlTemplate) return null;
              return {
                key: `${name}::${urlTemplate}`,
                name,
                urlTemplate,
                order: Number.isFinite(engine?.order) ? Number(engine.order) : index,
                isDefault: Boolean(engine?.isDefault),
              };
            })
            .filter(Boolean) as SearchEngine[]
        : [];

      engines.sort((a, b) => a.order - b.order || a.name.localeCompare(b.name, "zh-CN"));

      return {
        id: valueToString(group?._id) || valueToString(group?.name),
        name: valueToString(group?.name) || "未命名分组",
        order: Number.isFinite(group?.order) ? Number(group.order) : 0,
        engines,
      };
    })
    .filter(group => group.engines.length > 0)
    .sort((a, b) => a.order - b.order || a.name.localeCompare(b.name, "zh-CN"));
};

const matchQuery = (link: LinkRecord, keyword: string) => {
  const lower = keyword.trim().toLowerCase();
  if (!lower) return true;
  return (
    link.title.toLowerCase().includes(lower) ||
    link.description.toLowerCase().includes(lower) ||
    link.host.toLowerCase().includes(lower) ||
    link.tags.some(tag => tag.toLowerCase().includes(lower))
  );
};

const buildSearchUrl = (template: string, keyword: string) => {
  const encoded = encodeURIComponent(keyword);
  return template.includes("{query}") ? template.replaceAll("{query}", encoded) : `${template}${encoded}`;
};

export default function SidebarNavTheme({ categories, links, config, siteName }: ThemeProps) {
  const { roots, childMap, rootByChild, nodeMap, allNodes } = useMemo(
    () => createCategoryData(categories || []),
    [categories],
  );
  const normalizedLinks = useMemo(() => normalizeLinks(links || []), [links]);
  const { buckets, uncategorized } = useMemo(
    () => buildLinkBuckets(roots, rootByChild, normalizedLinks),
    [roots, rootByChild, normalizedLinks],
  );

  const [activeRoot, setActiveRoot] = useState<string | null>(null);
  const [activeChild, setActiveChild] = useState<string | null>(null);
  const [expandedRoots, setExpandedRoots] = useState<Set<string>>(new Set());

  const [searchGroups, setSearchGroups] = useState<SearchGroup[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState(INTERNAL_GROUP_ID);
  const [selectedEngines, setSelectedEngines] = useState<Record<string, string>>({
    [INTERNAL_GROUP_ID]: INTERNAL_ENGINE_KEY,
  });
  const [searchInput, setSearchInput] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [searchResults, setSearchResults] = useState<LinkRecord[]>([]);

  const [showSubmit, setShowSubmit] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const accent = config?.primaryColor || "#eb247a";
  const surface = config?.contentColor || "#ffffff";
  const background = config?.backgroundColor || "#f8fafc";

  useEffect(() => {
    const controller = new AbortController();
    const loadGroups = async () => {
      try {
        const res = await fetch("/api/search-engines", { signal: controller.signal });
        if (!res.ok) return;
        const data = await res.json();
        setSearchGroups(normalizeSearchGroups(data?.groups ?? []));
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          console.error("加载搜索引擎失败:", error);
        }
      }
    };
    void loadGroups();
    return () => controller.abort();
  }, []);

  const effectiveGroups = useMemo<SearchGroup[]>(() => {
    const builtIn: SearchGroup = {
      id: INTERNAL_GROUP_ID,
      name: "站内搜索",
      order: -Infinity,
      engines: [
        {
          key: INTERNAL_ENGINE_KEY,
          name: "站内搜索",
          urlTemplate: "",
          order: 0,
          isDefault: true,
        },
      ],
    };
    return [builtIn, ...searchGroups];
  }, [searchGroups]);

  useEffect(() => {
    setSelectedEngines(prev => {
      const next = { ...prev };
      effectiveGroups.forEach(group => {
        if (next[group.id]) return;
        const defaultEngine = group.engines.find(item => item.isDefault) ?? group.engines[0];
        if (defaultEngine) next[group.id] = defaultEngine.key;
      });
      return next;
    });
  }, [effectiveGroups]);

  useEffect(() => {
    if (!effectiveGroups.some(group => group.id === selectedGroupId)) {
      setSelectedGroupId(INTERNAL_GROUP_ID);
    }
  }, [effectiveGroups, selectedGroupId]);

  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 320);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const selectedGroup = useMemo(
    () => effectiveGroups.find(group => group.id === selectedGroupId) ?? effectiveGroups[0],
    [effectiveGroups, selectedGroupId],
  );
  const selectedEngineKey = selectedGroup ? selectedEngines[selectedGroup.id] ?? selectedGroup.engines[0]?.key : INTERNAL_ENGINE_KEY;
  const selectedEngine = selectedGroup?.engines.find(engine => engine.key === selectedEngineKey) ?? selectedGroup?.engines[0];

  const toggleRoot = (rootId: string) => {
    setExpandedRoots(prev => {
      const next = new Set(prev);
      if (next.has(rootId)) next.delete(rootId);
      else next.add(rootId);
      return next;
    });
  };

  const handleRootSelect = (rootId: string | null) => {
    setActiveRoot(prev => (prev === rootId ? null : rootId));
    setActiveChild(null);
    if (rootId) {
      setExpandedRoots(prev => new Set(prev).add(rootId));
    }
  };

  const handleChildSelect = (childId: string | null) => {
    setActiveChild(childId);
  };

  const handleGroupSelect = (groupId: string) => {
    setSelectedGroupId(groupId);
    setSearchKeyword("");
    setSearchResults([]);
  };

  const handleEngineSelect = (groupId: string, engineKey: string) => {
    setSelectedEngines(prev => ({ ...prev, [groupId]: engineKey }));
  };

  const clearSearch = () => {
    setSearchInput("");
    setSearchKeyword("");
    setSearchResults([]);
  };

  const handleSearchSubmit = useCallback(
    (event?: FormEvent<HTMLFormElement>) => {
      event?.preventDefault();
      const keyword = searchInput.trim();
      if (!keyword || !selectedGroup || !selectedEngine) {
        clearSearch();
        return;
      }

      if (selectedGroup.id === INTERNAL_GROUP_ID) {
        const filtered = normalizedLinks.filter(link => matchQuery(link, keyword));
        setSearchKeyword(keyword);
        setSearchResults(filtered);
      } else {
        const target = buildSearchUrl(selectedEngine.urlTemplate, keyword);
        window.open(target, "_blank", "noopener,noreferrer");
        clearSearch();
      }
    },
    [normalizedLinks, searchInput, selectedEngine, selectedGroup],
  );

  const themeVars: CSSProperties = useMemo(
    () => ({
      "--theme-accent": accent,
      "--theme-surface": surface,
      "--theme-background": background,
    }),
    [accent, surface, background],
  );

  const displaySections = useMemo(() => {
    if (searchKeyword) return [];

    if (activeRoot) {
      const sections: Array<{ id: string; title: string; description: string; links: LinkRecord[] }> = [];
      const rootNode = nodeMap.get(activeRoot);
      const bucket = buckets.get(activeRoot) ?? new Map();

      if (activeChild) {
        const childNode = nodeMap.get(activeChild);
        sections.push({
          id: activeChild,
          title: childNode?.title ?? "未命名分类",
          description: childNode?.description ?? "",
          links: bucket.get(`child:${activeChild}`) ?? [],
        });
      } else {
        sections.push({
          id: `${activeRoot}-root`,
          title: rootNode?.title ?? "未命名分类",
          description: rootNode?.description ?? "",
          links: bucket.get(ROOT_BUCKET) ?? [],
        });
        (childMap.get(activeRoot) ?? []).forEach(child => {
          sections.push({
            id: child.id,
            title: child.title,
            description: child.description,
            links: bucket.get(`child:${child.id}`) ?? [],
          });
        });
      }

      return sections.filter(section => section.links.length > 0);
    }

    const sections: Array<{ id: string; title: string; description: string; links: LinkRecord[] }> = [];
    roots.forEach(root => {
      const bucket = buckets.get(root.id) ?? new Map();
      const rootLinks = bucket.get(ROOT_BUCKET) ?? [];
      if (rootLinks.length > 0) {
        sections.push({ id: `${root.id}-root`, title: root.title, description: root.description, links: rootLinks });
      }
      root.children.forEach(child => {
        const childLinks = bucket.get(`child:${child.id}`) ?? [];
        if (childLinks.length > 0) {
          sections.push({ id: child.id, title: child.title, description: child.description, links: childLinks });
        }
      });
    });

    if (uncategorized.length > 0) {
      sections.push({ id: "uncategorized", title: "未分组资源", description: "", links: uncategorized });
    }

    return sections;
  }, [activeChild, activeRoot, buckets, childMap, nodeMap, roots, searchKeyword, uncategorized]);

  return (
    <div className="min-h-screen bg-[color:var(--theme-background)] text-slate-800" style={themeVars}>
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-10 lg:grid lg:grid-cols-[18rem_minmax(0,1fr)] lg:items-start lg:px-10">
        <aside className="hidden lg:sticky lg:top-10 lg:flex lg:h-max lg:flex-col lg:gap-6">
          <div className="rounded-3xl border border-slate-200/80 bg-[color:var(--theme-surface)] px-6 py-6 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[color:var(--theme-accent)] text-lg font-semibold text-white">
                {siteName?.charAt(0) ?? "N"}
              </div>
              <div className="space-y-1">
                <p className="text-lg font-semibold text-slate-900">{siteName || "导航站"}</p>
                <p className="text-xs text-slate-500">精选优质站点，助你快捷抵达</p>
              </div>
            </div>
            <button
              onClick={() => setShowSubmit(true)}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[color:var(--theme-accent)] px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:opacity-90"
            >
              提交新网站
            </button>
          </div>

          <div className="rounded-3xl border border-slate-200/80 bg-[color:var(--theme-surface)] px-4 py-5 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-800">导航分类</h3>
              <button
                onClick={() => handleRootSelect(null)}
                className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-500 transition hover:border-[color:var(--theme-accent)]/60 hover:text-[color:var(--theme-accent)]"
              >
                全部
              </button>
            </div>

            <ul className="mt-4 space-y-3 text-sm">
              {roots.map(root => {
                const expanded = expandedRoots.has(root.id);
                const active = activeRoot === root.id;
                const children = childMap.get(root.id) ?? [];
                return (
                  <li key={root.id} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleRootSelect(root.id)}
                        className={`flex-1 rounded-2xl border px-3 py-2 text-left transition ${
                          active
                            ? "border-[color:var(--theme-accent)] bg-[color:var(--theme-accent)]/15 text-[color:var(--theme-accent)] shadow-sm"
                            : "border-transparent hover:border-slate-200/80 hover:bg-slate-50"
                        }`}
                      >
                        <span className="font-medium">{root.title}</span>
                      </button>
                      <button
                        onClick={() => toggleRoot(root.id)}
                        className={`grid h-9 w-9 place-items-center rounded-2xl border border-slate-200 text-xs transition hover:border-[color:var(--theme-accent)]/60 hover:text-[color:var(--theme-accent)] ${
                          expanded ? "rotate-180" : ""
                        }`}
                        aria-label="展开子分类"
                      >
                        ▼
                      </button>
                    </div>

                    {expanded && children.length > 0 && (
                      <div className="ml-3 flex flex-wrap gap-2">
                        {children.map(child => {
                          const childActive = activeChild === child.id;
                          return (
                            <button
                              key={child.id}
                              onClick={() => handleChildSelect(childActive ? null : child.id)}
                              className={`rounded-full border px-3 py-1 text-xs transition ${
                                childActive
                                  ? "border-[color:var(--theme-accent)] bg-[color:var(--theme-accent)]/20 text-[color:var(--theme-accent)]"
                                  : "border-slate-200 text-slate-500 hover:border-[color:var(--theme-accent)]/50 hover:text-[color:var(--theme-accent)]"
                              }`}
                            >
                              {child.title}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </aside>

        <main className="space-y-8">
          <section className="space-y-4 rounded-3xl border border-slate-200/80 bg-[color:var(--theme-surface)] px-6 py-6 shadow-2xl">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">智能搜索</h2>
                <p className="text-sm text-slate-500">选择搜索引擎或直接搜索站内资源。</p>
              </div>
            </div>

            <form onSubmit={handleSearchSubmit} className="space-y-4">
              <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500">
                {effectiveGroups.map(group => {
                  const active = selectedGroup?.id === group.id;
                  return (
                    <button
                      key={group.id}
                      type="button"
                      onClick={() => handleGroupSelect(group.id)}
                      className={`rounded-full border px-3 py-1 transition ${
                        active
                          ? "border-[color:var(--theme-accent)] bg-[color:var(--theme-accent)]/20 text-[color:var(--theme-accent)]"
                          : "border-transparent bg-slate-100 text-slate-500 hover:border-[color:var(--theme-accent)]/40 hover:text-[color:var(--theme-accent)]"
                      }`}
                    >
                      {group.name}
                    </button>
                  );
                })}
              </div>

              {selectedGroup && selectedGroup.engines.length > 1 && (
                <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                  {selectedGroup.engines.map(engine => {
                    const active = selectedEngine?.key === engine.key;
                    return (
                      <button
                        key={engine.key}
                        type="button"
                        onClick={() => handleEngineSelect(selectedGroup.id, engine.key)}
                        className={`rounded-full border px-3 py-1 transition ${
                          active
                            ? "border-[color:var(--theme-accent)] bg-[color:var(--theme-accent)]/20 text-[color:var(--theme-accent)]"
                            : "border-slate-200 text-slate-500 hover:border-[color:var(--theme-accent)]/40 hover:text-[color:var(--theme-accent)]"
                        }`}
                      >
                        {engine.name}
                      </button>
                    );
                  })}
                </div>
              )}

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                  <input
                    type="search"
                    value={searchInput}
                    onChange={event => setSearchInput(event.target.value)}
                    placeholder="输入关键词，搜索导航站"
                    className="w-full rounded-2xl border border-slate-200/80 bg-white px-5 py-3 text-sm text-slate-700 shadow-inner focus:border-[color:var(--theme-accent)] focus:outline-none"
                  />
                  {searchInput && (
                    <button
                      type="button"
                      onClick={clearSearch}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-[color:var(--theme-accent)]"
                    >
                      清除
                    </button>
                  )}
                </div>
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[color:var(--theme-accent)] px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:opacity-90"
                >
                  开始搜索
                </button>
              </div>

              {searchKeyword && (
                <p className="text-xs text-slate-400">
                  共找到 {searchResults.length} 条与 “{searchKeyword}” 相关的站点
                </p>
              )}
            </form>
          </section>

          {searchKeyword ? (
            <section className="space-y-4 rounded-3xl border border-slate-200/80 bg-[color:var(--theme-surface)] px-6 py-6 shadow-xl">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900">站内搜索结果</h3>
                <button onClick={clearSearch} className="text-xs text-[color:var(--theme-accent)] hover:underline">
                  返回全部
                </button>
              </div>
              {searchResults.length === 0 ? (
                <div className="py-16 text-center text-sm text-slate-400">没有匹配的内容，换个关键词试试吧。</div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {searchResults.map(link => (
                    <a
                      key={link.id}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white px-5 py-4 transition hover:-translate-y-1 hover:border-[color:var(--theme-accent)]/60 hover:shadow-xl"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-2">
                          <h4 className="text-base font-semibold text-slate-900 group-hover:text-[color:var(--theme-accent)]">
                            {link.title}
                          </h4>
                          <p className="line-clamp-2 text-xs text-slate-500">{link.description || "暂无描述"}</p>
                        </div>
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-500">{link.host}</span>
                      </div>
                      <div className="mt-3 inline-flex items-center gap-1 text-xs text-[color:var(--theme-accent)]">
                        访问站点
                        <span>→</span>
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </section>
          ) : (
            <section className="space-y-6">
              {displaySections.length > 0 ? (
                displaySections.map(section => (
                  <div
                    key={section.id}
                    className="rounded-3xl border border-slate-200/80 bg-[color:var(--theme-surface)] px-6 py-6 shadow-xl"
                  >
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900">{section.title}</h3>
                        {section.description ? (
                          <p className="text-xs text-slate-400">{section.description}</p>
                        ) : null}
                      </div>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-500">{section.links.length} 个站点</span>
                    </div>

                    <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                      {section.links.map(link => (
                        <a
                          key={link.id}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white px-5 py-4 transition hover:-translate-y-1 hover:border-[color:var(--theme-accent)]/60 hover:shadow-xl"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="space-y-2">
                              <h4 className="text-base font-semibold text-slate-900 group-hover:text-[color:var(--theme-accent)]">
                                {link.title}
                              </h4>
                              <p className="line-clamp-2 text-xs text-slate-500">{link.description || "暂无描述"}</p>
                            </div>
                            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-500">{link.host}</span>
                          </div>
                          <div className="mt-3 inline-flex items-center gap-1 text-xs text-[color:var(--theme-accent)]">
                            访问站点
                            <span>→</span>
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-3xl border border-dashed border-slate-200/80 bg-white/70 px-6 py-16 text-center text-sm text-slate-400">
                  暂无数据，欢迎添加新的优质站点。
                </div>
              )}
            </section>
          )}
        </main>

        <footer className="rounded-3xl border border-slate-200/80 bg-[color:var(--theme-surface)] px-6 py-6 shadow-xl lg:col-span-2">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-slate-900">{siteName || "导航站"} · 精选资源</h3>
              <p className="text-sm text-slate-500">我们持续优化分类与站点信息，确保浏览体验清晰、舒适。</p>
              <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                <span className="rounded-full bg-slate-100 px-3 py-1">人工甄选</span>
                <span className="rounded-full bg-slate-100 px-3 py-1">结构清晰</span>
                <span className="rounded-full bg-slate-100 px-3 py-1">定期巡检</span>
              </div>
            </div>

            <div className="w-full max-w-md space-y-3">
              <h4 className="text-sm font-semibold text-slate-800">友情链接</h4>
              {Array.isArray(config?.friendLinks) && config.friendLinks.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {config.friendLinks.map(item => (
                    <a
                      key={`${item.title}-${item.url}`}
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-500 transition hover:border-[color:var(--theme-accent)]/60 hover:text-[color:var(--theme-accent)]"
                    >
                      {item.title}
                    </a>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400">欢迎合作互换链接，共建高质量导航生态。</p>
              )}
            </div>
          </div>
          <div className="mt-6 flex flex-col gap-2 border-t border-slate-200 pt-4 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
            <span>© {new Date().getFullYear()} {siteName || "导航站"} 版权所有</span>
            <span>界面由 NavSite 设计与驱动</span>
          </div>
        </footer>
      </div>

      <AddLinkModal
        open={showSubmit}
        onClose={() => setShowSubmit(false)}
        categories={allNodes.map(item => ({ id: item.id, title: item.title }))}
        accentColor={accent}
      />

      {showScrollTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-8 right-8 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-[color:var(--theme-accent)] text-lg font-semibold text-white shadow-xl transition hover:-translate-y-1 hover:opacity-90"
          aria-label="返回顶部"
        >
          ↑
        </button>
      )}
    </div>
  );
}
