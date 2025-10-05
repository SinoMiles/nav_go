import type { NormalizedCategory } from "../types";

type CategoryFilterChipsProps = {
  categories: NormalizedCategory[];
  activeId: string | null;
  onSelect: (id: string | null) => void;
  accent: string;
};

export const CategoryFilterChips = ({ categories, activeId, onSelect, accent }: CategoryFilterChipsProps) => (
  <div className="flex flex-wrap gap-2 text-xs text-slate-500">
    <button
      type="button"
      onClick={() => onSelect(null)}
      className={`rounded-full border px-3 py-1 transition ${
        activeId === null
          ? "border-[color:var(--theme-accent)] bg-[color:var(--theme-accent)]/20 text-[color:var(--theme-accent)]"
          : "border-slate-200 text-slate-500 hover:border-[color:var(--theme-accent)]/50 hover:text-[color:var(--theme-accent)]"
      }`}
      style={{ ['--theme-accent' as any]: accent }}
    >
      全部
    </button>
    {categories.map(category => {
      const active = category.id === activeId;
      return (
        <button
          key={category.id}
          type="button"
          onClick={() => onSelect(active ? null : category.id)}
          className={`rounded-full border px-3 py-1 transition ${
            active
              ? "border-[color:var(--theme-accent)] bg-[color:var(--theme-accent)]/20 text-[color:var(--theme-accent)]"
              : "border-slate-200 text-slate-500 hover:border-[color:var(--theme-accent)]/50 hover:text-[color:var(--theme-accent)]"
          }`}
          style={{ ['--theme-accent' as any]: accent }}
        >
          {category.title}
        </button>
      );
    })}
  </div>
);
