"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { CSSProperties, FormEvent } from "react";

import AddLinkModal from "@/themes/shared/AddLinkModal";
import type { ThemeProps } from "@/lib/types/theme";

import { ScrollTopButton } from "./components/ScrollTopButton";
import { Sidebar } from "./components/Sidebar";
import { MobileHeader } from "./components/MobileHeader";
import { MobileCategoryDrawer } from "./components/MobileCategoryDrawer";
import { MobileBottomBar } from "./components/MobileBottomBar";
import { SearchPanel } from "./components/SearchPanel";
import { ActiveRootSection } from "./components/ActiveRootSection";
import { SectionList } from "./components/SectionList";
import { useCategoryData } from "./hooks/useCategoryData";
import { useSearchEngines } from "./hooks/useSearchEngines";
import { useFloatingSidebar } from "./hooks/useFloatingSidebar";
import { INTERNAL_ENGINE_KEY, INTERNAL_GROUP_ID, ROOT_BUCKET } from "./utils/constants";
import { buildSearchUrl } from "./utils/normalize";
import type { NormalizedCategory, NormalizedLink } from "./types";

const UNCATEGORIZED_ID = "__uncategorized__";

export default function SidebarNavTheme({ categories, links, config, siteName }: ThemeProps) {
  const { roots, childMap, nodeMap, allCategories, normalizedLinks, buckets, uncategorized } = useCategoryData(
    categories,
    links,
  );

  const [activeRoot, setActiveRoot] = useState<string | null>(null);
  const [activeChild, setActiveChild] = useState<string | null>(null);

  const { effectiveGroups, selectedGroupId, setSelectedGroupId, selectedEngines, setSelectedEngines } =
    useSearchEngines();

  const [searchInput, setSearchInput] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [searchResults, setSearchResults] = useState<NormalizedLink[]>([]);
  const [showSubmit, setShowSubmit] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const accent = config?.primaryColor || "#eb247a";
  const surface = config?.contentColor || "#ffffff";
  const background = config?.backgroundColor || "#f8fafc";
  const headerTagline = typeof (config as any)?.headerTagline === "string" ? (config as any).headerTagline : null;
  const resolvedTagline = useMemo(() => {
    if (typeof headerTagline === "string") {
      const trimmed = headerTagline.trim();
      if (trimmed.length > 0) return trimmed;
    }
    return "优雅 永不过时...";
  }, [headerTagline]);

  const themeVars = useMemo(
    () =>
      ({
        "--theme-accent": accent,
        "--theme-surface": surface,
        "--theme-background": background,
      }) as CSSProperties,
    [accent, surface, background],
  );

  const { footerRef, offset: sidebarOffset } = useFloatingSidebar(160);

  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 320);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const selectedGroup = useMemo(
    () => effectiveGroups.find(group => group.id === selectedGroupId),
    [effectiveGroups, selectedGroupId],
  );

  const selectedEngineKey = useMemo(() => {
    if (!selectedGroup) return INTERNAL_ENGINE_KEY;
    return selectedEngines[selectedGroup.id] ?? selectedGroup.engines[0]?.key ?? INTERNAL_ENGINE_KEY;
  }, [selectedGroup, selectedEngines]);

  const selectedEngine = useMemo(() => {
    if (!selectedGroup) return undefined;
    return selectedGroup.engines.find(engine => engine.key === selectedEngineKey) ?? selectedGroup.engines[0];
  }, [selectedGroup, selectedEngineKey]);

  const activeRootSection = useMemo(() => {
    if (!activeRoot) return null;
    const root = nodeMap.get(activeRoot);
    if (!root) return null;

    const childCategories = childMap.get(activeRoot) ?? [];
    const bucket = buckets.get(activeRoot) ?? new Map<string, NormalizedLink[]>();

    const collectLinks = (childId: string | null) => {
      if (childId) return (bucket.get(`child:${childId}`) ?? []).slice();

      const combined: NormalizedLink[] = [];
      combined.push(...(bucket.get(ROOT_BUCKET) ?? []));
      childCategories.forEach(child => {
        combined.push(...(bucket.get(`child:${child.id}`) ?? []));
      });
      return combined;
    };

    return {
      root,
      childCategories,
      links: collectLinks(activeChild),
    };
  }, [activeChild, activeRoot, buckets, childMap, nodeMap]);

  const aggregatedSections = useMemo(() => {
    if (searchKeyword || activeRootSection) return [];

    const sections = roots
      .map(root => ({
        root,
        childCategories: childMap.get(root.id) ?? [],
        bucket: buckets.get(root.id) ?? new Map<string, NormalizedLink[]>(),
      }))
      .filter(section => {
        const hasRootLinks = (section.bucket.get(ROOT_BUCKET) ?? []).length > 0;
        const hasChildLinks = section.childCategories.some(
          child => (section.bucket.get(`child:${child.id}`) ?? []).length > 0,
        );
        return hasRootLinks || hasChildLinks;
      });

    if (uncategorized.length > 0) {
      const pseudoRoot: NormalizedCategory = {
        id: UNCATEGORIZED_ID,
        title: "未分组资源",
        description: "暂未归档的站点",
        order: Number.MAX_SAFE_INTEGER,
        parentId: null,
      };

      const bucket = new Map<string, NormalizedLink[]>();
      bucket.set(ROOT_BUCKET, uncategorized);
      sections.push({ root: pseudoRoot, childCategories: [], bucket });
    }

    return sections;
  }, [activeRootSection, buckets, childMap, roots, searchKeyword, uncategorized]);

  const handleRootSelect = useCallback((rootId: string | null) => {
    setActiveRoot(prev => (prev === rootId ? null : rootId));
    setActiveChild(null);
  }, []);

  const handleChildSelect = useCallback((childId: string | null) => {
    setActiveChild(childId);
  }, []);

  const handleGroupSelect = useCallback(
    (groupId: string) => {
      setSelectedGroupId(groupId);
      setSearchKeyword("");
      setSearchResults([]);
      setSelectedEngines(prev => {
        const next = { ...prev };
        if (!next[groupId]) {
          const group = effectiveGroups.find(item => item.id === groupId);
          const defaultEngine = group?.engines.find(engine => engine.isDefault) ?? group?.engines[0];
          if (defaultEngine) next[groupId] = defaultEngine.key;
        }
        return next;
      });
    },
    [effectiveGroups, setSelectedEngines, setSelectedGroupId],
  );

  const handleEngineSelect = useCallback(
    (engineKey: string) => {
      const groupId = selectedGroup?.id ?? INTERNAL_GROUP_ID;
      setSelectedEngines(prev => ({
        ...prev,
        [groupId]: engineKey,
      }));
    },
    [selectedGroup, setSelectedEngines],
  );

  const handleSearchSubmit = useCallback(
    (event?: FormEvent<HTMLFormElement>) => {
      event?.preventDefault();
      const keyword = searchInput.trim();
      if (!keyword || !selectedGroup || !selectedEngine) {
        setSearchKeyword("");
        setSearchResults([]);
        return;
      }

      if (selectedGroup.id === INTERNAL_GROUP_ID) {
        const lower = keyword.toLowerCase();
        const filtered = normalizedLinks.filter(link =>
          link.title.toLowerCase().includes(lower) ||
          link.description.toLowerCase().includes(lower) ||
          link.host.toLowerCase().includes(lower),
        );
        setSearchKeyword(keyword);
        setSearchResults(filtered);
      } else {
        const target = buildSearchUrl(selectedEngine.urlTemplate, keyword);
        window.open(target, "_blank", "noopener,noreferrer");
        setSearchKeyword("");
        setSearchResults([]);
      }
    },
    [normalizedLinks, searchInput, selectedEngine, selectedGroup],
  );

  const handleSearchClear = useCallback(() => {
    setSearchInput("");
    setSearchKeyword("");
    setSearchResults([]);
  }, []);

  const openMobileMenu = useCallback(() => {
    setMobileMenuOpen(true);
  }, []);

  const closeMobileMenu = useCallback(() => {
    setMobileMenuOpen(false);
  }, []);

  const openSubmitModal = useCallback(() => {
    setShowSubmit(true);
  }, []);

  const closeSubmitModal = useCallback(() => {
    setShowSubmit(false);
  }, []);

  const handleScrollTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleClearFilter = useCallback(() => {
    setActiveRoot(null);
    setActiveChild(null);
    setSearchKeyword("");
    setSearchResults([]);
    setSearchInput("");
    closeMobileMenu();
  }, [closeMobileMenu]);

  return (
    <div className="min-h-screen bg-[color:var(--theme-background)] text-slate-800" style={themeVars}>
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-10">
        <div className="flex flex-col gap-6 lg:gap-10">
          <MobileHeader
            siteName={siteName}
            accent={accent}
            tagline={resolvedTagline}
            onOpenMenu={openMobileMenu}
            onOpenSubmit={openSubmitModal}
          />

          <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[18rem_minmax(0,1fr)] lg:items-start lg:gap-10">
            <Sidebar
              siteName={siteName}
              accent={accent}
              roots={roots}
              activeRoot={activeRoot}
              onRootSelect={handleRootSelect}
              footerOffset={sidebarOffset}
              tagline={resolvedTagline}
            />

            <main className="space-y-6 sm:space-y-8 lg:space-y-10">
              <SearchPanel
                accent={accent}
                searchInput={searchInput}
                onSearchInputChange={setSearchInput}
                onSearchClear={handleSearchClear}
                onSubmit={handleSearchSubmit}
                searchKeyword={searchKeyword}
                resultCount={searchResults.length}
                groups={effectiveGroups}
                selectedGroupId={selectedGroupId}
                onGroupSelect={handleGroupSelect}
                selectedGroup={selectedGroup}
                selectedEngineKey={selectedEngineKey}
                onEngineSelect={handleEngineSelect}
                activeRootTitle={activeRootSection?.root.title ?? null}
              />

              {searchKeyword ? (
                <section className="space-y-4 rounded-3xl border border-slate-200/80 bg-[color:var(--theme-surface)] px-5 py-6 shadow-xl sm:px-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-slate-900">站内搜索结果</h3>
                    <button
                      type="button"
                      onClick={handleSearchClear}
                      className="text-xs text-[color:var(--theme-accent)] hover:underline"
                      style={{ ["--theme-accent" as any]: accent }}
                    >
                      返回全部
                    </button>
                  </div>
                  {searchResults.length === 0 ? (
                    <div className="py-14 text-center text-sm text-slate-400">没有匹配的内容，换个关键词试试吧～</div>
                  ) : (
                    <SectionList
                      sections={[
                        {
                          root: {
                            id: "search",
                            title: `关键词：${searchKeyword}`,
                            description: "站内匹配到的链接",
                            order: 0,
                            parentId: null,
                          },
                          childCategories: [],
                          bucket: buildSearchBucket(searchResults),
                        },
                      ]}
                      accent={accent}
                    />
                  )}
                </section>
              ) : activeRootSection ? (
                <ActiveRootSection
                  root={activeRootSection.root}
                  childCategories={activeRootSection.childCategories}
                  links={activeRootSection.links}
                  activeChildId={activeChild}
                  onChildSelect={handleChildSelect}
                  accent={accent}
                />
              ) : (
                <SectionList sections={aggregatedSections} accent={accent} />
              )}
            </main>
          </div>

          <footer
            ref={footerRef}
            className="rounded-3xl border border-slate-200/80 bg-[color:var(--theme-surface)] px-5 py-6 shadow-xl sm:px-6"
          >
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-slate-900">{siteName || "NavGo"} · 精选资源</h3>
                <p className="text-sm text-slate-500">我们持续优化分类与站点，确保浏览体验始终清晰、舒适。</p>
                <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                  <span className="rounded-full bg-slate-100 px-3 py-1">人工甄选</span>
                  <span className="rounded-full bg-slate-100 px-3 py-1">结构清晰</span>
                  <span className="rounded-full bg-slate-100 px-3 py-1">定期巡检</span>
                </div>
              </div>

              <div className="w-full max-w-md space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h4 className="text-sm font-semibold text-slate-800">友情链接</h4>
                  <button
                    type="button"
                    onClick={openSubmitModal}
                    className="inline-flex items-center gap-2 rounded-full border border-[color:var(--theme-accent)]/40 bg-[color:var(--theme-accent)]/10 px-4 py-2 text-xs font-semibold text-[color:var(--theme-accent)] transition hover:bg-[color:var(--theme-accent)]/20"
                    style={{ ['--theme-accent' as any]: accent }}
                  >
                    提交站点
                  </button>
                </div>
                {Array.isArray(config?.friendLinks) && config.friendLinks.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {config.friendLinks.map(item => (
                      <a
                        key={`${item.title}-${item.url}`}
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-500 transition hover:border-[color:var(--theme-accent)]/60 hover:text-[color:var(--theme-accent)]"
                        style={{ ["--theme-accent" as any]: accent }}
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
              <span>© {new Date().getFullYear()} {siteName || "NavGo"} 保留所有权利</span>
              <span>界面由 NavGo 设计与驱动</span>
            </div>
          </footer>
        </div>
      </div>

      <AddLinkModal
        open={showSubmit}
        onClose={closeSubmitModal}
        categories={allCategories.map(item => ({ id: item.id, title: item.title }))}
        accentColor={accent}
      />

      <MobileCategoryDrawer
        open={mobileMenuOpen}
        onClose={closeMobileMenu}
        siteName={siteName}
        accent={accent}
        roots={roots}
        childMap={childMap}
        activeRoot={activeRoot}
        activeChild={activeChild}
        onRootSelect={handleRootSelect}
        onChildSelect={handleChildSelect}
        onOpenSubmit={openSubmitModal}
      />

      <MobileBottomBar
        accent={accent}
        hasActiveFilter={Boolean(activeRoot || searchKeyword)}
        onOpenMenu={openMobileMenu}
        onOpenSubmit={openSubmitModal}
        onClearFilter={handleClearFilter}
        onScrollTop={handleScrollTop}
      />

      <ScrollTopButton visible={showScrollTop} accent={accent} />
    </div>
  );
}

const buildSearchBucket = (links: NormalizedLink[]) => {
  const bucket = new Map<string, NormalizedLink[]>();
  bucket.set(ROOT_BUCKET, links);
  return bucket;
};
