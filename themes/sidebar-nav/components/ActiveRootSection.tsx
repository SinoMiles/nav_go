import type { NormalizedCategory, NormalizedLink } from "../types";
import { CategoryFilterChips } from "./CategoryFilterChips";
import { LinkGrid } from "./LinkGrid";

type ActiveRootSectionProps = {
  root: NormalizedCategory;
  childCategories: NormalizedCategory[];
  links: NormalizedLink[];
  activeChildId: string | null;
  onChildSelect: (id: string | null) => void;
  accent: string;
};

export const ActiveRootSection = ({
  root,
  childCategories,
  links,
  activeChildId,
  onChildSelect,
  accent,
}: ActiveRootSectionProps) => (
  <section className="space-y-5 rounded-3xl border border-slate-200/80 bg-[color:var(--theme-surface)] px-6 py-6 shadow-xl">
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h3 className="text-lg font-semibold text-slate-900">{root.title}</h3>
        {root.description ? <p className="text-xs text-slate-400">{root.description}</p> : null}
      </div>
      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-500">{links.length} 个站点</span>
    </div>

    {childCategories.length > 0 && (
      <CategoryFilterChips
        categories={childCategories}
        activeId={activeChildId}
        onSelect={onChildSelect}
        accent={accent}
      />
    )}

    {links.length === 0 ? (
      <div className="py-16 text-center text-sm text-slate-400">该分类暂无站点，欢迎补充推荐～</div>
    ) : (
      <LinkGrid links={links} accent={accent} />
    )}
  </section>
);
