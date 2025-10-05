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
}: SearchPanelProps) => (
  <section className="space-y-4 rounded-3xl border border-slate-200/80 bg-[color:var(--theme-surface)] px-6 py-6 shadow-2xl">
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">智能搜索</h2>
        <p className="text-sm text-slate-500">选择搜索引擎或直接搜索站内资源。</p>
      </div>
    </div>

    <form onSubmit={onSubmit} className="space-y-4">
      <SearchEngineTabs
        groups={groups}
        selectedGroupId={selectedGroupId}
        onSelect={onGroupSelect}
        accent={accent}
      />

      {selectedGroup && selectedGroup.engines.length > 1 && (
        <EngineSelector
          group={selectedGroup}
          selectedKey={selectedEngineKey}
          onSelect={onEngineSelect}
          accent={accent}
        />
      )}

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <input
            type="search"
            value={searchInput}
            onChange={event => onSearchInputChange(event.target.value)}
            onKeyDown={event => {
              if (event.key === "Escape") {
                onSearchClear();
              }
            }}
            placeholder="输入关键词，搜索导航内容"
            className="w-full rounded-2xl border border-slate-200/80 bg-white px-5 py-3 text-sm text-slate-700 shadow-inner focus:border-[color:var(--theme-accent)] focus:outline-none"
            style={{ ['--theme-accent' as any]: accent }}
          />
          {searchInput && (
            <button
              type="button"
              onClick={onSearchClear}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400 transition hover:text-[color:var(--theme-accent)]"
              style={{ ['--theme-accent' as any]: accent }}
            >
              清除
            </button>
          )}
        </div>
        <button
          type="submit"
          className="inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:opacity-90"
          style={{ backgroundColor: accent }}
        >
          开始搜索
        </button>
      </div>

      {searchKeyword && (
        <p className="text-xs text-slate-400">
          共找到 {resultCount} 条与 “{searchKeyword}” 相关的站点。
        </p>
      )}
    </form>
  </section>
);

type SearchEngineTabsProps = {
  groups: SearchGroup[];
  selectedGroupId: string;
  onSelect: (groupId: string) => void;
  accent: string;
};

const SearchEngineTabs = ({ groups, selectedGroupId, onSelect, accent }: SearchEngineTabsProps) => (
  <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500">
    {groups.map(group => {
      const active = group.id === selectedGroupId;
      return (
        <button
          key={group.id}
          type="button"
          onClick={() => onSelect(group.id)}
          className={`rounded-full border px-3 py-1 transition ${
            active
              ? "border-[color:var(--theme-accent)] bg-[color:var(--theme-accent)]/20 text-[color:var(--theme-accent)]"
              : "border-transparent bg-slate-100 text-slate-500 hover:border-[color:var(--theme-accent)]/40 hover:text-[color:var(--theme-accent)]"
          }`}
          style={{ ['--theme-accent' as any]: accent }}
        >
          {group.name}
        </button>
      );
    })}
  </div>
);

type EngineSelectorProps = {
  group: SearchGroup;
  selectedKey?: string;
  onSelect: (key: string) => void;
  accent: string;
};

const EngineSelector = ({ group, selectedKey, onSelect, accent }: EngineSelectorProps) => (
  <div className="flex flex-wrap gap-2 text-xs text-slate-500">
    {group.engines.map((engine: SearchEngine) => {
      const active = engine.key === selectedKey;
      return (
        <button
          key={engine.key}
          type="button"
          onClick={() => onSelect(engine.key)}
          className={`rounded-full border px-3 py-1 transition ${
            active
              ? "border-[color:var(--theme-accent)] bg-[color:var(--theme-accent)]/20 text-[color:var(--theme-accent)]"
              : "border-slate-200 text-slate-500 hover:border-[color:var(--theme-accent)]/40 hover:text-[color:var(--theme-accent)]"
          }`}
          style={{ ['--theme-accent' as any]: accent }}
        >
          {engine.name}
        </button>
      );
    })}
  </div>
);
