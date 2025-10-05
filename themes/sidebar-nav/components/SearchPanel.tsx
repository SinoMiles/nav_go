import type { FormEvent } from "react";

import type { SearchEngine, SearchGroup } from "../types";

type SearchPanelProps = {
  accent: string;
  searchInput: string;
  onSearchInputChange: (value: string) => void;
  onSearchClear: () => void;
  onSubmit: (event?: FormEvent<HTMLFormElement>) => void;
  searchKeyword: string;
  resultCount: number;
  groups: SearchGroup[];
  selectedGroupId: string;
  onGroupSelect: (groupId: string) => void;
  selectedGroup?: SearchGroup;
  selectedEngineKey?: string;
  onEngineSelect: (engineKey: string) => void;
  activeRootTitle?: string | null;
};

export const SearchPanel = ({
  accent,
  searchInput,
  onSearchInputChange,
  onSearchClear,
  onSubmit,
  searchKeyword,
  resultCount,
  groups,
  selectedGroupId,
  onGroupSelect,
  selectedGroup,
  selectedEngineKey,
  onEngineSelect,
  activeRootTitle,
}: SearchPanelProps) => {
  const showEngineOptions = Boolean(selectedGroup && selectedGroup.engines.length > 1);

  return (
    <section className="space-y-5 rounded-3xl border border-slate-200/80 bg-[color:var(--theme-surface)] px-5 py-6 shadow-2xl sm:px-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold text-slate-900">智能搜索</h2>
          <p className="text-sm text-slate-500">选择搜索分组，切换引擎或直接搜索站内资源。</p>
        </div>
        {activeRootTitle ? (
          <div className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white/80 px-3 py-2 text-xs text-slate-500">
            <span className="inline-flex h-2 w-2 rounded-full" style={{ backgroundColor: accent }} />
            当前分类：<span className="font-medium text-slate-700">{activeRootTitle}</span>
          </div>
        ) : null}
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white/90 shadow-sm">
          <div className="border-b border-slate-200/70 bg-white/80 px-5 py-4">
            <SearchEngineTabs
              groups={groups}
              selectedGroupId={selectedGroupId}
              onSelect={onGroupSelect}
              accent={accent}
            />
          </div>
          <div className="px-5 py-5">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <input
                  type="search"
                  value={searchInput}
                  onChange={event => onSearchInputChange(event.target.value)}
                  onKeyDown={event => {
                    if (event.key === "Escape") onSearchClear();
                  }}
                  placeholder="输入关键词，搜索导航内容"
                  className="w-full rounded-2xl border border-slate-200/80 bg-white px-5 py-3 text-sm text-slate-700 shadow-inner focus:border-[color:var(--theme-accent)] focus:outline-none"
                  style={{ ['--theme-accent' as any]: accent }}
                />
                {searchInput ? (
                  <button
                    type="button"
                    onClick={onSearchClear}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400 transition hover:text-[color:var(--theme-accent)]"
                    style={{ ['--theme-accent' as any]: accent }}
                  >
                    清除
                  </button>
                ) : null}
              </div>
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:opacity-90"
                style={{ backgroundColor: accent }}
              >
                开始搜索
              </button>
            </div>
            {showEngineOptions && selectedGroup ? (
              <EngineOptions
                group={selectedGroup}
                selectedKey={selectedEngineKey}
                onSelect={onEngineSelect}
                accent={accent}
              />
            ) : null}
          </div>
        </div>

        {searchKeyword ? (
          <p className="text-xs text-slate-400">
            共找到 {resultCount} 条与 “{searchKeyword}” 相关的站点。
          </p>
        ) : null}
      </form>
    </section>
  );
};

type SearchEngineTabsProps = {
  groups: SearchGroup[];
  selectedGroupId: string;
  onSelect: (groupId: string) => void;
  accent: string;
};

const SearchEngineTabs = ({ groups, selectedGroupId, onSelect, accent }: SearchEngineTabsProps) => (
  <div className="flex flex-wrap gap-2">
    {groups.map(group => {
      const active = group.id === selectedGroupId;
      return (
        <button
          key={group.id}
          type="button"
          onClick={() => onSelect(group.id)}
          className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold transition ${
            active
              ? "border-[color:var(--theme-accent)] bg-[color:var(--theme-accent)]/15 text-[color:var(--theme-accent)] shadow-sm"
              : "border-transparent bg-white/70 text-slate-500 hover:border-[color:var(--theme-accent)]/40 hover:bg-[color:var(--theme-accent)]/10 hover:text-[color:var(--theme-accent)]"
          }`}
          style={{ ['--theme-accent' as any]: accent }}
        >
          {group.name}
          {active ? (
            <span className="inline-flex h-1.5 w-1.5 rounded-full bg-[color:var(--theme-accent)]" />
          ) : null}
        </button>
      );
    })}
  </div>
);

type EngineOptionsProps = {
  group: SearchGroup;
  selectedKey?: string;
  onSelect: (key: string) => void;
  accent: string;
};

const EngineOptions = ({ group, selectedKey, onSelect, accent }: EngineOptionsProps) => (
  <div className="mt-3 flex flex-wrap gap-2">
    {group.engines.map((engine: SearchEngine) => {
      const active = engine.key === selectedKey;
      return (
        <button
          key={engine.key}
          type="button"
          onClick={() => onSelect(engine.key)}
          className={`inline-flex items-center rounded-full border px-4 py-2 text-sm transition ${
            active
              ? "border-[color:var(--theme-accent)] bg-[color:var(--theme-accent)]/15 text-[color:var(--theme-accent)] shadow-sm"
              : "border-slate-200 bg-white text-slate-500 hover:border-[color:var(--theme-accent)]/40 hover:bg-[color:var(--theme-accent)]/10 hover:text-[color:var(--theme-accent)]"
          }`}
          style={{ ['--theme-accent' as any]: accent }}
        >
          {engine.name}
        </button>
      );
    })}
  </div>
);
