import { useState } from "react";

import { ROOT_BUCKET } from "../utils/constants";
import type { NormalizedCategory, NormalizedLink } from "../types";
import { CategoryFilterChips } from "./CategoryFilterChips";
import { LinkGrid } from "./LinkGrid";

type SectionListItem = {
  root: NormalizedCategory;
  childCategories: NormalizedCategory[];
  bucket: ReadonlyMap<string, NormalizedLink[]>;
};

type SectionListProps = {
  sections: SectionListItem[];
  accent: string;
};

export const SectionList = ({ sections, accent }: SectionListProps) => {
  const [activeChildren, setActiveChildren] = useState<Record<string, string | null>>({});

  if (sections.length === 0) {
    return (
      <section className="rounded-3xl border border-dashed border-slate-200/80 bg-[color:var(--theme-surface)] px-6 py-16 text-center text-sm text-slate-400">
        暂无数据，欢迎添加新的优质站点～
      </section>
    );
  }

  return (
    <section className="space-y-6">
      {sections.map(section => {
        const activeChildId = activeChildren[section.root.id] ?? null;
        const links = collectLinks(section.bucket, section.childCategories, activeChildId);

        return (
          <div
            key={section.root.id}
            className="rounded-3xl border border-slate-200/80 bg-[color:var(--theme-surface)] px-6 py-6 shadow-xl"
          >
            <div className="flex flex-col gap-3 border-b border-slate-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">{section.root.title}</h3>
                {section.root.description ? (
                  <p className="text-xs text-slate-400">{section.root.description}</p>
                ) : null}
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="rounded-full bg-slate-100 px-3 py-1">{links.length} 个站点</span>
              </div>
            </div>

            {section.childCategories.length > 0 ? (
              <div className="mt-4">
                <CategoryFilterChips
                  categories={section.childCategories}
                  activeId={activeChildId}
                  onSelect={childId =>
                    setActiveChildren(prev => ({
                      ...prev,
                      [section.root.id]: childId,
                    }))
                  }
                  accent={accent}
                />
              </div>
            ) : null}

            <div className="mt-4">
              {links.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200/80 px-6 py-10 text-center text-sm text-slate-400">
                  暂无站点，欢迎补充推荐～
                </div>
              ) : (
                <LinkGrid links={links} accent={accent} />
              )}
            </div>
          </div>
        );
      })}
    </section>
  );
};

const collectLinks = (
  bucket: ReadonlyMap<string, NormalizedLink[]>,
  childCategories: NormalizedCategory[],
  activeChildId: string | null,
) => {
  if (activeChildId) {
    return (bucket.get(`child:${activeChildId}`) ?? []).slice();
  }

  const combined: NormalizedLink[] = [];
  combined.push(...(bucket.get(ROOT_BUCKET) ?? []));
  childCategories.forEach(child => {
    combined.push(...(bucket.get(`child:${child.id}`) ?? []));
  });
  return combined;
};
