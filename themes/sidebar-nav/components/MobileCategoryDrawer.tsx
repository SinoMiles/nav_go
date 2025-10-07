import type { NormalizedCategory } from "../types";
import { CategoryFilterChips } from "./CategoryFilterChips";

type MobileCategoryDrawerProps = {
  open: boolean;
  onClose: () => void;
  siteName?: string | null;
  accent: string;
  roots: NormalizedCategory[];
  childMap: ReadonlyMap<string, NormalizedCategory[]>;
  activeRoot: string | null;
  activeChild: string | null;
  onRootSelect: (rootId: string | null) => void;
  onChildSelect: (childId: string | null) => void;
  submitHref: string;
};

export const MobileCategoryDrawer = ({
  open,
  onClose,
  siteName,
  accent,
  roots,
  childMap,
  activeRoot,
  activeChild,
  onRootSelect,
  onChildSelect,
  submitHref,
}: MobileCategoryDrawerProps) => {
  const handleRootClick = (rootId: string) => {
    onRootSelect(rootId);
  };

  return (
    <div
      className={`fixed inset-0 z-50 transition ${open ? "pointer-events-auto" : "pointer-events-none"}`}
      aria-hidden={!open}
    >
      <div
        className={`absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity ${
          open ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />

      <section
        className={`absolute inset-x-0 bottom-0 max-h-[85vh] transform rounded-t-3xl border border-slate-200/70 bg-[color:var(--theme-surface)] p-6 shadow-[0_-20px_60px_-30px_rgba(15,23,42,0.65)] transition-all ${
          open ? "translate-y-0" : "translate-y-full"
        }`}
        role="dialog"
        aria-modal="true"
      >
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.3em] text-slate-400">NavGo · 分类</p>
            <h2 className="text-lg font-semibold text-slate-900">{siteName || "NavGo"}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-slate-200 px-4 py-2 text-xs text-slate-500 transition hover:bg-slate-100"
          >
            收起
          </button>
        </div>

        <div className="space-y-5 overflow-y-auto pr-2">
          {roots.map(root => {
            const childCategories = childMap.get(root.id) ?? [];
            const active = activeRoot === root.id;

            return (
              <div key={root.id} className="rounded-2xl border border-slate-200/70 bg-white/80 p-5 shadow-sm">
                <button
                  type="button"
                  onClick={() => handleRootClick(root.id)}
                  className={`flex w-full items-center justify-between gap-3 text-left transition ${
                    active ? "text-[color:var(--theme-accent)]" : "text-slate-700 hover:text-[color:var(--theme-accent)]"
                  }`}
                  style={{ ['--theme-accent' as any]: accent }}
                >
                  <div className="flex-1">
                    <p className="text-base font-semibold">{root.title}</p>
                    {root.description ? (
                      <p className="mt-1 text-xs text-slate-400">{root.description}</p>
                    ) : null}
                  </div>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="none"
                    className={`h-4 w-4 transition-transform ${active ? "rotate-90" : "rotate-0"}`}
                    stroke="currentColor"
                    strokeWidth={1.6}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m7 5 5 5-5 5" />
                  </svg>
                </button>

                {active && childCategories.length > 0 ? (
                  <div className="mt-4">
                    <CategoryFilterChips
                      categories={childCategories}
                      activeId={activeChild}
                      onSelect={id => onChildSelect(id)}
                      accent={accent}
                    />
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>

        <div className="mt-6 flex gap-3">
          <a
            href={submitHref}
            onClick={onClose}
            className="flex-1 rounded-full px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:opacity-90"
            style={{ backgroundColor: accent }}
          >
            提交站点
          </a>
          <button
            type="button"
            onClick={() => {
              onRootSelect(null);
              onChildSelect(null);
              onClose();
            }}
            className="rounded-full border border-slate-200 px-5 py-3 text-sm text-slate-500 transition hover:bg-slate-100"
          >
            浏览全部
          </button>
        </div>
      </section>
    </div>
  );
};

