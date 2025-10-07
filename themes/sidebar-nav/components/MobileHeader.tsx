type MobileHeaderProps = {
  siteName?: string | null;
  accent: string;
  tagline?: string | null;
  onOpenMenu: () => void;
  submitHref: string;
};

const resolveTagline = (tagline?: string | null) => {
  if (!tagline) return "";
  const trimmed = tagline.trim();
  return trimmed.length > 0 ? trimmed : "";
};

export const MobileHeader = ({ siteName, accent, tagline, onOpenMenu, submitHref }: MobileHeaderProps) => {
  const displayTagline = resolveTagline(tagline);

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between rounded-3xl border border-white/10 bg-[color:var(--theme-surface)]/90 px-5 py-4 shadow-lg backdrop-blur lg:hidden">
      <button
        type="button"
        onClick={onOpenMenu}
        className="inline-flex items-center gap-2 rounded-full border border-slate-200/60 bg-white/70 px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-white"
      >
        <span className="inline-flex h-2.5 w-2.5 rounded-full" style={{ backgroundColor: accent }} />
        分类导航
      </button>
      <div className="flex flex-col items-center text-center">
        <p className="text-[11px] uppercase tracking-[0.3em] text-slate-400">NavGo</p>
        <h1 className="text-base font-semibold text-slate-900">{siteName || "NavGo"}</h1>
        {displayTagline ? (
          <p className="mt-1 text-sm text-slate-500">{displayTagline}</p>
        ) : null}
      </div>
      <a
        href={submitHref}
        className="inline-flex items-center justify-center rounded-full px-4 py-2 text-xs font-semibold text-white shadow-md transition hover:opacity-90"
        style={{ backgroundColor: accent }}
      >
        提交站点
      </a>
    </header>
  );
};


