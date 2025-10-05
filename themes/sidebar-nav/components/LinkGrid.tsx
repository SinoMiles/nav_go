import type { NormalizedLink } from "../types";

type LinkGridProps = {
  links: NormalizedLink[];
  accent: string;
};

export const LinkGrid = ({ links, accent }: LinkGridProps) => (
  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
    {links.map(link => (
      <a
        key={link.id}
        href={link.url}
        target="_blank"
        rel="noopener noreferrer"
        className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white px-5 py-4 transition hover:-translate-y-1 hover:border-[color:var(--theme-accent)]/60 hover:shadow-xl"
        style={{ ['--theme-accent' as any]: accent }}
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
          <span aria-hidden>→</span>
        </div>
      </a>
    ))}
  </div>
);
