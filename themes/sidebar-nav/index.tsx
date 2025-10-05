'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ThemeProps } from '@/lib/types/theme';
import AddLinkModal from '@/themes/shared/AddLinkModal';

interface UserData {
  id: string;
  name: string;
  email: string;
  role?: string;
}

interface LinkItem {
  _id?: { toString(): string } | string;
  title: string;
  url: string;
  description?: string;
  iconUrl?: string;
  tags?: string[];
  categoryId?: { toString(): string } | string;
}

type GroupNode = {
  id: string;
  title: string;
  description?: string;
  level: number;
  links: LinkItem[];
  children: GroupNode[];
};

const parseId = (value: LinkItem['_id']) =>
  typeof value === 'string' ? value : value?.toString() ?? '';

const parseCategoryId = (value: LinkItem['categoryId']) =>
  typeof value === 'string' ? value : value?.toString() ?? '';

const formatHost = (url: string) => {
  try {
    const { hostname } = new URL(url);
    return hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
};

const getParentId = (category: any) => {
  const parent = category?.parentId;
  if (!parent) return null;
  if (typeof parent === 'string') return parent;
  if (typeof parent === 'object') {
    if (parent._id) return parent._id.toString();
    if (typeof parent.toString === 'function') return parent.toString();
  }
  return null;
};

const buildCategoryOptions = (items: any[]) =>
  items.map(category => ({
    id: parseId(category._id),
    title: category.title,
  }));

export default function SidebarNavTheme({
  categories,
  links,
  config,
  siteName,
}: ThemeProps) {
  const [activeCategory, setActiveCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<LinkItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [darkMode, setDarkMode] = useState(() => Boolean(config?.defaultDarkMode));
  const [hotLinks, setHotLinks] = useState<any[]>([]);
  const [showSubmit, setShowSubmit] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const accent = config?.primaryColor || '#2563eb';
  const contentColor = config?.contentColor || (darkMode ? '#111827' : '#ffffff');
  const backgroundColor = config?.backgroundColor || (darkMode ? '#020617' : '#f8fafc');
  const borderMuted = darkMode ? 'rgba(148, 163, 184, 0.28)' : '#d7dde5';
  const textSecondary = darkMode ? '#94a3b8' : '#64748b';
  const friendLinks = config?.friendLinks ?? [];
  const currentYear = useMemo(() => new Date().getFullYear(), []);
  const themeVariables = useMemo(
    () => ({
      '--surface-color': contentColor,
      '--background-color': backgroundColor,
      '--border-muted': borderMuted,
      '--text-secondary': textSecondary,
      '--accent-color': accent,
    }),
    [contentColor, backgroundColor, borderMuted, textSecondary, accent]
  );
  const [groupedSelections, setGroupedSelections] = useState<Record<string, string | null>>({});

  const categoryOptions = useMemo(
    () => buildCategoryOptions(categories),
    [categories]
  );
  const [expandedRoots, setExpandedRoots] = useState<Set<string>>(new Set());

  useEffect(() => {
    const token = localStorage.getItem('token');
    const stored = localStorage.getItem('user');

    if (token && stored) {
      try {
        const parsed: UserData = JSON.parse(stored);
        if (parsed.role && parsed.role !== 'user') {
          return;
        }
        setUser(parsed);
        void loadFavorites(token);
      } catch (error) {
        console.error('记录访问失败:', error);
      }
    }

    void loadHotLinks();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 320);
    };

    handleScroll();

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const loadFavorites = async (token: string) => {
    try {
      const res = await fetch('/api/favorites', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      const favSet = new Set<string>(
        (data.favorites || []).map((fav: any) =>
          parseId(fav.linkId?._id ?? fav.linkId)
        )
      );
      setFavorites(favSet);
    } catch (error) {
      console.error('记录访问失败:', error);
    }
  };

  const loadHotLinks = async () => {
    try {
      const res = await fetch('/api/stats?days=7&limit=5');
      if (!res.ok) return;
      const data = await res.json();
      setHotLinks(data.hotLinks || []);
    } catch (error) {
      console.error('记录访问失败:', error);
    }
  };

  const handleSearch = useCallback(async (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      if (!res.ok) return;
      const data = await res.json();
      setSearchResults(data.links || []);
    } catch (error) {
      console.error('记录访问失败:', error);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const toggleFavorite = async (linkId: string) => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/login';
      return;
    }

    try {
      if (favorites.has(linkId)) {
        const res = await fetch(`/api/favorites?linkId=${linkId}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          setFavorites(prev => {
            const next = new Set(prev);
            next.delete(linkId);
            return next;
          });
        }
      } else {
        const res = await fetch('/api/favorites', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ linkId }),
        });
        if (res.ok) {
          setFavorites(prev => new Set(prev).add(linkId));
        }
      }
    } catch (error) {
      console.error('记录访问失败:', error);
    }
  };

  const handleRate = async (linkId: string, score: number) => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/login';
      return;
    }

    try {
      const res = await fetch('/api/ratings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ linkId, rating: score }),
      });
      if (res.ok) {
        setRatings(prev => ({ ...prev, [linkId]: score }));
      }
    } catch (error) {
      console.error('记录访问失败:', error);
    }
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

  const handleVisit = async (link: LinkItem) => {
    const id = parseId(link._id);
    if (id) await recordVisit(id);
    window.open(link.url, '_blank', 'noopener,noreferrer');
  };

  const handleDetail = (link: LinkItem) => {
    const id = parseId(link._id);
    if (!id) return;
    window.location.href = `/link/${id}`;
  };

  const countsMap = useMemo(() => {
    const map = new Map<string, number>();
    links.forEach(link => {
      const id = parseCategoryId(link.categoryId);
      if (!id) return;
      map.set(id, (map.get(id) || 0) + 1);
    });
    return map;
  }, [links]);

  const linksByCategory = useMemo(() => {
    const map = new Map<string, LinkItem[]>();
    links.forEach(link => {
      const id = parseCategoryId(link.categoryId);
      if (!id) return;
      const bucket = map.get(id);
      if (bucket) {
        bucket.push(link);
      } else {
        map.set(id, [link]);
      }
    });
    return map;
  }, [links]);

  const hierarchy = useMemo(() => {
    const children: Record<string, any[]> = {};
    const roots: any[] = [];

    categories.forEach(category => {
      const parentId = getParentId(category);
      if (parentId) {
        (children[parentId] = children[parentId] || []).push(category);
      } else {
        roots.push(category);
      }
    });

    const sortList = (list: any[]) =>
      list.sort((a, b) => {
        const orderDiff = (a.order ?? 0) - (b.order ?? 0);
        return orderDiff !== 0
          ? orderDiff
          : (a.title || '').localeCompare(b.title || '', 'zh-CN');
      });

    sortList(roots);
    Object.keys(children).forEach(key => sortList(children[key]));

    const childIds: Record<string, string[]> = {};
    Object.keys(children).forEach(key => {
      childIds[key] = children[key].map(child => parseId(child._id));
    });

    return { roots, children, childIds };
  }, [categories]);

  useEffect(() => {
    setExpandedRoots(prev => {
      const preserved = new Set<string>();

      hierarchy.roots.forEach(root => {
        const id = parseId(root._id);
        if (id && prev.has(id)) {
          preserved.add(id);
        }
      });

      if (preserved.size === prev.size) {
        let identical = true;
        prev.forEach(value => {
          if (!preserved.has(value)) {
            identical = false;
          }
        });
        if (identical) {
          return prev;
        }
      }

      return preserved;
    });
  }, [hierarchy.roots]);

  useEffect(() => {
    if (!activeCategory) {
      return;
    }

    const matchRoot = hierarchy.roots.find(root => {
      const rootId = parseId(root._id);
      if (!rootId) return false;
      if (rootId === activeCategory) return true;

      const queue = [...(hierarchy.childIds[rootId] || [])];
      while (queue.length) {
        const current = queue.shift()!;
        if (current === activeCategory) {
          return true;
        }
        const descendants = hierarchy.childIds[current];
        if (descendants && descendants.length > 0) {
          queue.push(...descendants);
        }
      }

      return false;
    });

    if (!matchRoot) {
      return;
    }

    const rootId = parseId(matchRoot._id);
    if (!rootId) {
      return;
    }

    setExpandedRoots(prev => {
      if (prev.has(rootId)) {
        return prev;
      }
      const next = new Set(prev);
      next.add(rootId);
      return next;
    });
  }, [activeCategory, hierarchy.childIds, hierarchy.roots]);

  const toggleRootExpansion = (rootId: string) => {
    setExpandedRoots(prev => {
      const next = new Set(prev);
      if (next.has(rootId)) {
        next.delete(rootId);
      } else {
        next.add(rootId);
      }
      return next;
    });
  };

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const displayedLinks = useMemo(() => {
    if (searchQuery.trim()) {
      return searchResults;
    }
    if (!activeCategory) {
      return links;
    }
    const linkCategoryId = (link: LinkItem) => parseCategoryId(link.categoryId);
    const childIds = hierarchy.childIds[activeCategory];
    if (childIds && childIds.length > 0) {
      const ids = new Set([activeCategory, ...childIds]);
      return links.filter(link => ids.has(linkCategoryId(link)));
    }
    return links.filter(link => linkCategoryId(link) === activeCategory);
  }, [activeCategory, hierarchy.childIds, links, searchQuery, searchResults]);

  const groupedSections = useMemo(() => {
    if (searchQuery.trim() || activeCategory) {
      return [] as GroupNode[];
    }

    const buildNode = (category: any, level = 0): GroupNode | null => {
      const id = parseId(category._id);
      if (!id) return null;

      const childrenNodes = (hierarchy.children[id] || [])
        .map(child => buildNode(child, level + 1))
        .filter((child): child is GroupNode => Boolean(child));

      const linksForCategory = linksByCategory.get(id) ?? [];

      if (linksForCategory.length === 0 && childrenNodes.length === 0) {
        return null;
      }

      return {
        id,
        title: category.title,
        description: category.description,
        level,
        links: linksForCategory,
        children: childrenNodes,
      };
    };

    return hierarchy.roots
      .map(root => buildNode(root, 0))
      .filter((node): node is GroupNode => Boolean(node));
  }, [activeCategory, hierarchy.children, hierarchy.roots, linksByCategory, searchQuery]);

  useEffect(() => {
    setGroupedSelections(prev => {
      const validRoots = new Set(groupedSections.map(node => node.id));
      let changed = false;
      const next: Record<string, string | null> = {};

      groupedSections.forEach(node => {
        const childIds = new Set(node.children.map(child => child.id));
        const previous = prev[node.id] ?? null;
        if (previous && !childIds.has(previous)) {
          changed = true;
          next[node.id] = null;
        } else {
          next[node.id] = previous ?? null;
          if (!(node.id in prev)) {
            changed = true;
          }
        }
      });

      Object.keys(prev).forEach(rootId => {
        if (!validRoots.has(rootId)) {
          changed = true;
        }
      });

      return changed ? next : prev;
    });
  }, [groupedSections]);

  const showGroupedView = !searchQuery.trim() && !activeCategory;

  const computeNodeLinkCount = (node: GroupNode): number =>
    node.links.length + node.children.reduce((sum, child) => sum + computeNodeLinkCount(child), 0);

  const collectNodeLinks = (node: GroupNode): LinkItem[] => {
    const aggregated: LinkItem[] = [...node.links];
    node.children.forEach(child => {
      aggregated.push(...collectNodeLinks(child));
    });
    return aggregated;
  };

  const handleGroupedSelection = (rootId: string, childId: string | null) => {
    setGroupedSelections(prev => {
      if ((prev[rootId] ?? null) === childId) {
        return prev;
      }
      return { ...prev, [rootId]: childId };
    });
  };

  const renderLinkCard = (link: LinkItem) => {
    const id = parseId(link._id);
    const isFavorite = favorites.has(id);
    const rating = ratings[id] || 0;

    return (
      <article
        key={id}
        className="flex h-full flex-col justify-between rounded-2xl border px-5 py-6 transition-all hover:-translate-y-0.5 hover:shadow-lg"
        style={{
          borderColor: borderMuted,
          backgroundColor: contentColor,
        }}
      >
        <div className="space-y-4">
          <div className="flex items-start gap-4">
            {link.iconUrl ? (
              <img src={link.iconUrl} alt={link.title} className="h-12 w-12 rounded-xl object-cover" />
            ) : (
              <span className="grid h-12 w-12 place-items-center rounded-xl bg-slate-200 text-base font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-200">
                {link.title?.charAt(0) ?? 'N'}
              </span>
            )}
            <div className="min-w-0 flex-1 space-y-2">
              <button
                onClick={() => handleDetail(link)}
                className="block truncate text-left text-lg font-semibold text-slate-900 transition hover:text-[color:var(--accent-color)] dark:text-slate-100"
                style={{ ['--accent-color' as any]: accent }}
              >
                {link.title}
              </button>
              {link.description && (
                <p className="line-clamp-2 text-sm" style={{ color: textSecondary }}>
                  {link.description}
                </p>
              )}
              <p
                className="text-xs uppercase tracking-wide"
                style={{ color: textSecondary }}
              >
                {formatHost(link.url)}
              </p>
            </div>
            {user && (
              <button
                onClick={() => toggleFavorite(id)}
                className={`text-lg transition-transform hover:scale-110 ${
                  isFavorite
                    ? 'text-[color:var(--accent-color)]'
                    : 'text-slate-300 hover:text-slate-400 dark:text-slate-600'
                }`}
                style={{ ['--accent-color' as any]: accent }}
                aria-label={isFavorite ? '取消收藏' : '收藏站点'}
              >
                {isFavorite ? '❤️' : '🤍'}
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-2 text-xs">
            {link.tags?.slice(0, 3).map(tag => (
              <span
                key={tag}
                className="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between text-sm">
          <div className="flex items-center gap-1 text-amber-500">
            {[1, 2, 3, 4, 5].map(star => (
              <button
                key={star}
                onClick={() => handleRate(id, star)}
                className={`transition-colors ${
                  rating >= star
                    ? 'text-amber-400'
                    : 'text-slate-300 hover:text-amber-300 dark:text-slate-600'
                }`}
                aria-label={`评分 ${star} 星`}
              >
                ★
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleVisit(link)}
              className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-800 dark:border-slate-700 dark:text-slate-300"
            >
              访问
            </button>
            <button
              onClick={() => handleDetail(link)}
              className="rounded-full bg-[color:var(--accent-color)] px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:opacity-90"
              style={{ ['--accent-color' as any]: accent }}
            >
              详情
            </button>
          </div>
        </div>
      </article>
    );
  };

  const renderGroupedNode = (node: GroupNode): JSX.Element => {
    const allCount = computeNodeLinkCount(node);
    const childSummaries = node.children.map(child => ({
      id: child.id,
      title: child.title,
      count: computeNodeLinkCount(child),
      node: child,
    }));
    const activeChildId = groupedSelections[node.id] ?? null;
    const activeChildSummary = activeChildId
      ? childSummaries.find(item => item.id === activeChildId)
      : undefined;
    const linksToDisplay = activeChildSummary
      ? collectNodeLinks(activeChildSummary.node)
      : collectNodeLinks(node);
    const description = activeChildSummary?.node.description ?? node.description;

    return (
      <div
        key={node.id}
        className="space-y-6 rounded-2xl border px-6 py-6 shadow-sm"
        style={{
          borderColor: borderMuted,
          backgroundColor: contentColor,
        }}
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">{node.title}</h3>
              <span
                className="rounded-full border px-3 py-1 text-xs font-medium"
                style={{ borderColor: borderMuted, color: textSecondary }}
              >
                共 {allCount} 个站点
              </span>
            </div>
            {description && (
              <p className="text-sm" style={{ color: textSecondary }}>
                {description}
              </p>
            )}
          </div>

          {childSummaries.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleGroupedSelection(node.id, null)}
                className={`inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                  activeChildId === null
                    ? 'bg-[color:var(--accent-color)] text-white shadow-sm'
                    : ''
                }`}
                style={
                  activeChildId === null
                    ? {
                        ['--accent-color' as any]: accent,
                        borderColor: accent,
                        backgroundColor: accent,
                        color: '#ffffff',
                      }
                    : {
                        borderColor: borderMuted,
                        backgroundColor: contentColor,
                        color: textSecondary,
                      }
                }
              >
                全部
                <span className="text-[10px] opacity-70">{allCount}</span>
              </button>
              {childSummaries.map(child => {
                const isActive = activeChildId === child.id;
                return (
                  <button
                    key={child.id}
                    type="button"
                    onClick={() => handleGroupedSelection(node.id, child.id)}
                    className={`inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                      isActive ? 'bg-[color:var(--accent-color)] text-white shadow-sm' : ''
                    }`}
                    style={
                      isActive
                        ? {
                            ['--accent-color' as any]: accent,
                            borderColor: accent,
                            backgroundColor: accent,
                            color: '#ffffff',
                          }
                        : {
                            borderColor: borderMuted,
                            backgroundColor: contentColor,
                            color: textSecondary,
                          }
                    }
                  >
                    {child.title}
                    <span className="text-[10px] opacity-70">{child.count}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {linksToDisplay.map(renderLinkCard)}
        </div>
      </div>
    );
  };

  const activeCategoryInfo = useMemo(() => {
    if (!activeCategory) {
      return { title: '全部站点', description: '分类精选导航' };
    }
    const active = categories.find(cat => parseId(cat._id) === activeCategory);
    if (active) {
      return {
        title: active.title,
        description: active.description || '分类精选导航',
      };
    }
    const parent = categories.find(cat => {
      const childIds = hierarchy.childIds[parseId(cat._id)] || [];
      return childIds.includes(activeCategory);
    });
    if (parent) {
      return {
        title: parent.title,
        description: parent.description || '分类精选导航',
      };
    }
    return { title: '全部站点', description: '分类精选导航' };
  }, [activeCategory, categories, hierarchy.childIds]);

  return (
    <div
      className={`relative min-h-screen ${
        darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
      } transition-colors`}
      style={{ ...(themeVariables as React.CSSProperties), backgroundColor }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          background: `radial-gradient(circle at 20% 20%, ${accent}33, transparent 45%),
            radial-gradient(circle at 80% 10%, #0ea5e966, transparent 40%),
            radial-gradient(circle at 30% 80%, #a855f766, transparent 45%)`,
        }}
      />

      <div className="relative z-10 flex min-h-screen flex-col">
        <header
          className={`border-b px-10 py-5 backdrop-blur ${
            darkMode ? 'border-slate-800 bg-slate-900/80' : 'border-white/70 bg-white/80'
          }`}
          style={{ borderBottomColor: borderMuted, backgroundColor: contentColor }}
        >
          <div className="mx-auto flex w-full max-w-none flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div
                className="grid h-12 w-12 place-items-center rounded-2xl bg-[color:var(--accent-color)] text-lg font-semibold text-white shadow-sm"
                style={{ ['--accent-color' as any]: accent }}
              >
                {siteName?.charAt(0) ?? 'N'}
              </div>
              <div>
                <h1 className="text-2xl font-semibold">{siteName || 'NavCraft'}</h1>
                <p className="text-sm" style={{ color: textSecondary }}>
                  精选导航 · 极速抵达想要的站点
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setDarkMode(prev => !prev)}
                className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition ${
                  darkMode
                    ? 'border-slate-700 text-slate-300 hover:border-slate-600'
                    : 'border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                {darkMode ? '🌞 浅色模式' : '🌙 深色模式'}
              </button>
              {user ? (
                <div className="flex items-center gap-2 rounded-full border border-transparent bg-slate-200/70 px-4 py-2 text-sm font-medium text-slate-700 dark:bg-slate-800/70 dark:text-slate-200">
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-white text-xs font-semibold text-slate-600 dark:bg-slate-700 dark:text-slate-100">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                  <span>{user.name}</span>
                </div>
              ) : (
                <a
                  href="/login"
                  className="rounded-full bg-[color:var(--accent-color)] px-5 py-2 text-sm font-medium text-white shadow-sm transition hover:opacity-90"
                  style={{ ['--accent-color' as any]: accent }}
                >
                  登录以收藏
                </a>
              )}
            </div>
          </div>
        </header>

        <div className="mx-auto flex w-full max-w-none flex-1 flex-col px-10 py-8 lg:flex-row lg:gap-10">
          <aside
            className="mb-8 w-full shrink-0 rounded-3xl border p-6 shadow-sm backdrop-blur lg:mb-0 lg:w-80"
            style={{
              borderColor: borderMuted,
              backgroundColor: contentColor,
            }}
          >
            <div className="space-y-6">
              <div>
                <p
                  className="text-xs uppercase tracking-wide"
                  style={{ color: textSecondary }}
                >
                  搜索站点
                </p>
                <div className="relative mt-3">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={event => handleSearch(event.target.value)}
                    placeholder="输入关键词或标签"
                    className={`w-full rounded-2xl border px-4 py-3 text-sm shadow-sm outline-none transition focus:ring-2 ${
                      darkMode
                        ? 'border-slate-700 bg-slate-900/40 text-slate-100 focus:ring-slate-600'
                        : 'border-slate-200 bg-white text-slate-900 focus:ring-slate-200'
                    }`}
                  />
                  <span
                    className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs"
                    style={{ color: textSecondary }}
                  >
                    {isSearching ? '搜索中…' : '⌘K'}
                  </span>
                </div>
              </div>

              <div>
                <p
                  className="text-xs uppercase tracking-wide"
                  style={{ color: textSecondary }}
                >
                  分类浏览
                </p>
                <div className="mt-3 space-y-2">
                  {hierarchy.roots.map(root => {
                    const rootId = parseId(root._id);
                    const childNodes = hierarchy.children[rootId] || [];
                    const childIds = hierarchy.childIds[rootId] || [];
                    const totalCount =
                      (countsMap.get(rootId) || 0) +
                      childIds.reduce(
                        (sum, childId) => sum + (countsMap.get(childId) || 0),
                        0
                      );
                    const rootActive =
                      activeCategory === rootId || childIds.includes(activeCategory);
                    const isExpanded = expandedRoots.has(rootId);
                    const expandButtonClass = `group/expand relative flex h-8 w-8 items-center justify-center rounded-full border text-xs font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent-color)] focus-visible:ring-offset-2 ${
                      rootActive
                        ? 'border-white/40 bg-white/15 text-white'
                        : isExpanded
                        ? 'border-slate-300 bg-slate-100 text-slate-600 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-100'
                        : darkMode
                        ? 'border-slate-700 bg-slate-900 text-slate-300 hover:border-slate-500 hover:bg-slate-800'
                        : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:bg-slate-50'
                    }`;
                    const childContainerClass = 'mt-2 space-y-2 rounded-2xl border p-3 shadow-sm transition';

                    return (
                      <div key={rootId} className="space-y-2">
                        <button
                          type="button"
                          onClick={() => {
                            setSearchQuery('');
                            setSearchResults([]);
                            setActiveCategory(prev => (prev === rootId ? '' : rootId));
                          }}
                          className={`group w-full rounded-2xl border px-4 py-3 text-left text-sm transition ${
                            rootActive
                              ? 'border-transparent bg-[color:var(--accent-color)] text-white shadow-md'
                              : darkMode
                              ? 'border-slate-800/70 bg-slate-900/40 text-slate-200 hover:border-slate-700 hover:bg-slate-900/60'
                              : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                          }`}
                          style={{ ['--accent-color' as any]: accent }}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                              {childNodes.length > 0 && (
                                <span
                                  role="button"
                                  tabIndex={0}
                                  aria-label={`${isExpanded ? '收起' : '展开'}${root.title}子分类`}
                                  title={`${isExpanded ? '收起' : '展开'}${root.title}子分类`}
                                  onClick={event => {
                                    event.preventDefault();
                                    event.stopPropagation();
                                    toggleRootExpansion(rootId);
                                  }}
                                  onKeyDown={event => {
                                    if (event.key === 'Enter' || event.key === ' ') {
                                      event.preventDefault();
                                      event.stopPropagation();
                                      toggleRootExpansion(rootId);
                                    }
                                  }}
                                  className={expandButtonClass}
                                  style={{
                                    ['--accent-color' as any]: accent,
                                    ...( !rootActive && isExpanded
                                      ? { borderColor: accent, color: accent }
                                      : {}),
                                  }}
                                >
                                  <svg
                                    className="h-3.5 w-3.5"
                                    viewBox="0 0 12 12"
                                    fill="none"
                                    aria-hidden="true"
                                  >
                                    <path
                                      d="M2 6h8"
                                      stroke="currentColor"
                                      strokeWidth="1.4"
                                      strokeLinecap="round"
                                    />
                                    {!isExpanded && (
                                      <path
                                        d="M6 2v8"
                                        stroke="currentColor"
                                        strokeWidth="1.4"
                                        strokeLinecap="round"
                                      />
                                    )}
                                  </svg>
                                  <span className="sr-only">
                                    {isExpanded ? '\u6536\u8d77\u5b50\u5206\u7c7b' : '\u5c55\u5f00\u5b50\u5206\u7c7b'}
                                  </span>
                                </span>
                              )}
                              <span className="font-medium">{root.title}</span>
                            </div>
                            <span
                              className="rounded-full px-2 py-0.5 text-xs transition"
                              style={
                                rootActive
                                  ? {
                                      ['--accent-color' as any]: accent,
                                      backgroundColor: accent,
                                      color: '#ffffff',
                                    }
                                  : {
                                      backgroundColor: darkMode
                                        ? 'rgba(148, 163, 184, 0.15)'
                                        : '#f1f5f9',
                                      color: textSecondary,
                                    }
                              }
                            >
                              {totalCount}
                            </span>
                          </div>
                        </button>

                        {childNodes.length > 0 && isExpanded && (
                          <div
                            className={childContainerClass}
                            style={{
                              borderColor: borderMuted,
                              backgroundColor: contentColor,
                              ['--accent-color' as any]: accent,
                            }}
                          >
                            {childNodes.map(child => {
                              const childId = parseId(child._id);
                              const childCount = countsMap.get(childId) || 0;
                              const isActiveChild = activeCategory === childId;
                              const childBadgeClass = 'rounded-full px-2 py-0.5 text-[10px] transition';
                              return (
                                <button
                                  key={childId}
                                  type="button"
                                  onClick={() => {
                                    setSearchQuery('');
                                    setSearchResults([]);
                                    setActiveCategory(prev => (prev === childId ? '' : childId));
                                  }}
                                  className="w-full rounded-xl border px-3 py-2 text-left text-xs transition hover:-translate-y-0.5"
                                  style={
                                    isActiveChild
                                      ? {
                                          ['--accent-color' as any]: accent,
                                          borderColor: accent,
                                          color: accent,
                                          backgroundColor: contentColor,
                                        }
                                      : {
                                          borderColor: borderMuted,
                                          backgroundColor: contentColor,
                                          color: textSecondary,
                                        }
                                  }
                                >
                                  <div className="flex items-center justify-between">
                                    <span>{child.title}</span>
                                    <span
                                      className={childBadgeClass}
                                      style={
                                        isActiveChild
                                          ? {
                                              ['--accent-color' as any]: accent,
                                              backgroundColor: accent,
                                              color: '#ffffff',
                                            }
                                          : {
                                              backgroundColor: darkMode ? 'rgba(148, 163, 184, 0.15)' : '#f1f5f9',
                                              color: textSecondary,
                                            }
                                      }
                                    >
                                      {childCount}
                                    </span>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {hotLinks.length > 0 && (
                <div>
                  <p
                    className="text-xs uppercase tracking-wide"
                    style={{ color: textSecondary }}
                  >
                    热门站点
                  </p>
                  <div className="mt-3 space-y-3">
                    {hotLinks.map(item => (
                      <button
                        key={item.linkId}
                        onClick={() => handleVisit({
                          _id: item.linkId,
                          title: item.title,
                          url: item.url,
                          iconUrl: item.iconUrl,
                        })}
                        className="flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left text-sm transition hover:-translate-y-0.5"
                        style={{
                          borderColor: borderMuted,
                          backgroundColor: contentColor,
                        }}
                      >
                        {item.iconUrl ? (
                          <img
                            src={item.iconUrl}
                            alt={item.title}
                            className="h-10 w-10 rounded-xl object-cover"
                          />
                        ) : (
                          <span className="grid h-10 w-10 place-items-center rounded-xl bg-slate-200 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-200">
                            {item.title?.charAt(0) ?? 'N'}
                          </span>
                        )}
                        <div className="min-w-0">
                          <p className="truncate font-medium text-slate-800 dark:text-slate-200">
                            {item.title}
                          </p>
                          <p className="text-xs" style={{ color: textSecondary }}>
                            {item.clicks} 次访问                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </aside>

          <section
            className="flex-[2] rounded-3xl border p-6 shadow-sm backdrop-blur"
            style={{
              borderColor: borderMuted,
              backgroundColor: contentColor,
            }}
          >
            <div className="flex flex-col gap-4 pb-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm" style={{ color: textSecondary }}>
                  {searchQuery
                    ? `搜索 “${searchQuery}” 的结果`
                    : activeCategoryInfo.description}
                </p>
                <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
                  {searchQuery ? '匹配到的站点' : activeCategoryInfo.title}
                </h2>
              </div>
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSearchResults([]);
                  }}
                  className="self-start rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-800 dark:border-slate-700 dark:text-slate-300"
                >
                  清除搜索
                </button>
              )}
            </div>

            {showGroupedView ? (
              groupedSections.length > 0 ? (
                <div className="space-y-8">
                  {groupedSections.map(node => renderGroupedNode(node))}
                </div>
              ) : (
                <div
                  className="py-20 text-center text-sm"
                  style={{ color: textSecondary }}
                >
                  暂未收录站点
                </div>
              )
            ) : (
              <>
                <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {displayedLinks.map(renderLinkCard)}
                </div>

                {displayedLinks.length === 0 && (
                  <div
                    className="py-20 text-center text-sm"
                    style={{ color: textSecondary }}
                  >
                    {searchQuery ? '没有找到匹配的站点' : '该分类暂未添加站点'}
                  </div>
                )}
              </>
            )}
          </section>
      </div>
    </div>

      <AddLinkModal
        open={showSubmit}
        onClose={() => setShowSubmit(false)}
        categories={categoryOptions}
        accentColor={accent}
      />

      <footer
        className={`mt-12 rounded-t-3xl border-t px-10 py-10 text-sm ${
          darkMode
            ? 'text-slate-200 shadow-[0_-30px_60px_-40px_rgba(15,23,42,0.9)]'
            : 'text-slate-600 shadow-[0_-30px_60px_-40px_rgba(15,23,42,0.25)]'
        }`}
        style={{
          borderTopColor: borderMuted,
          backgroundImage: `linear-gradient(135deg, ${backgroundColor}, ${darkMode ? '#0f172a' : '#ffffff'})`,
        }}
      >
        <div className="mx-auto flex w-full max-w-none flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div
                className="grid h-12 w-12 place-items-center rounded-2xl bg-[color:var(--accent-color)] text-lg font-semibold text-white shadow-lg"
                style={{ ['--accent-color' as any]: accent }}
              >
                {siteName?.charAt(0) ?? 'N'}
              </div>
              <div>
                <p className="text-xl font-semibold text-slate-900 dark:text-white">
                  {siteName || 'NavCraft'}
                </p>
                <p className="text-xs" style={{ color: textSecondary }}>
                  © {currentYear} {siteName || 'NavCraft'} · Curated navigation library
                </p>
              </div>
            </div>
            <p className="max-w-xl text-sm" style={{ color: textSecondary }}>
              We continue to refine the catalog so discovery, saving, and sharing stay effortless.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => setShowSubmit(true)}
                className="inline-flex items-center gap-2 rounded-full bg-[color:var(--accent-color)] px-5 py-2 text-sm font-medium text-white shadow-sm transition hover:opacity-90"
                style={{ ['--accent-color' as any]: accent }}
              >
                Submit a site
              </button>
              <button
                onClick={scrollToTop}
                className="inline-flex items-center gap-2 rounded-full border px-5 py-2 text-sm font-medium transition hover:-translate-y-0.5"
                style={{
                  borderColor: borderMuted,
                  backgroundColor: contentColor,
                  color: textSecondary,
                }}
              >
                ↑ Back to top
              </button>
            </div>
          </div>

          <div className="w-full max-w-md space-y-4">
            <div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Partner links</p>
              <p className="text-xs" style={{ color: textSecondary }}>Trusted partners keep the ecosystem fresh.</p>
            </div>
            {friendLinks.length > 0 ? (
              <div className="flex flex-wrap gap-3">
                {friendLinks.map(link => (
                  <a
                    key={`${link.title}-${link.url}`}
                    href={link.url}
                    className="rounded-full border px-4 py-1.5 text-xs font-medium transition hover:-translate-y-0.5"
                    style={{
                      borderColor: borderMuted,
                      backgroundColor: contentColor,
                      color: textSecondary,
                    }}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {link.title}
                  </a>
                ))}
              </div>
            ) : (
              <p className="text-xs" style={{ color: textSecondary }}>
                We welcome link exchanges to share great resources together.
              </p>
            )}
          </div>
        </div>
      </footer>
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-10 right-10 z-40 flex h-12 w-12 items-center justify-center rounded-full border text-lg font-semibold shadow-lg transition hover:-translate-y-1"
          style={{
            borderColor: borderMuted,
            backgroundColor: contentColor,
            color: textSecondary,
          }}
          aria-label="Back to top"
        >
          ↑
        </button>
      )}
    </div>
  );
}
