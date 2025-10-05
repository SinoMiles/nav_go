import { useEffect, useMemo, useState } from "react";

import type { NormalizedCategory } from "../types";

type SidebarProps = {
  siteName?: string | null;
  accent: string;
  roots: NormalizedCategory[];
  activeRoot: string | null;
  onRootSelect: (rootId: string | null) => void;
  footerOffset: number;
  tagline?: string | null;
};

export const Sidebar = ({
  siteName,
  accent,
  roots,
  activeRoot,
  onRootSelect,
  footerOffset,
  tagline,
}: SidebarProps) => {
  const displayTagline = useMemo(
    () => (tagline && tagline.trim().length > 0 ? tagline.trim() : "优雅 永不过时..."),
    [tagline],
  );
  const [typedText, setTypedText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [pause, setPause] = useState(false);
  const [caretVisible, setCaretVisible] = useState(true);

  useEffect(() => {
    setTypedText("");
    setIsDeleting(false);
    setPause(false);
  }, [displayTagline]);

  useEffect(() => {
    const caretTimer = setInterval(() => {
      setCaretVisible(prev => !prev);
    }, 650);
    return () => clearInterval(caretTimer);
  }, []);

  useEffect(() => {
    if (pause) {
      const pauseTimer = setTimeout(() => setPause(false), isDeleting ? 420 : 1100);
      return () => clearTimeout(pauseTimer);
    }

    const fullText = displayTagline;
    const typingTimer = setTimeout(() => {
      setTypedText(prev => {
        if (!isDeleting) {
          const next = fullText.slice(0, prev.length + 1);
          if (next === fullText) {
            setPause(true);
            setIsDeleting(true);
          }
          return next;
        }

        const next = fullText.slice(0, Math.max(prev.length - 1, 0));
        if (next.length === 0) {
          setPause(true);
          setIsDeleting(false);
        }
        return next;
      });
    }, isDeleting ? 70 : 120);

    return () => clearTimeout(typingTimer);
  }, [displayTagline, isDeleting, pause, typedText]);

  const style = footerOffset > 0 ? { paddingBottom: `${footerOffset}px` } : undefined;

  return (
    <aside
      className="hidden flex-col gap-6 lg:flex lg:self-start lg:sticky lg:top-10"
      style={style}
    >
      <div className="rounded-3xl border border-slate-200/80 bg-gradient-to-br from-white via-white to-slate-50 px-6 py-6 shadow-xl">
        <div className="space-y-3">
          <h1 className="text-2xl font-semibold text-slate-900">{siteName || "NavGo"}</h1>
          <div
            className="min-h-[2.75rem] text-[30px] leading-tight tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-slate-400 via-slate-700 to-[color:var(--theme-accent)]"
            style={{ ['--theme-accent' as any]: accent, fontFamily: '"Playfair Display", "Times New Roman", serif' }}
          >
            <span className="whitespace-pre">{typedText}</span>
            <span
              className={`ml-1 inline-block h-7 w-[2px] bg-[color:var(--theme-accent)] transition-opacity duration-300 ${caretVisible ? "opacity-90" : "opacity-20"}`}
              style={{ ['--theme-accent' as any]: accent }}
            />
          </div>
          <p className="text-sm text-slate-500">精选优质站点，快速抵达你的灵感目的地。</p>
        </div>
      </div>

      <nav className="rounded-3xl border border-slate-200/80 bg-[color:var(--theme-surface)] px-5 py-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
          <span>全部分类</span>
          <span>{roots.length}</span>
        </div>

        <ul className="flex flex-col gap-2 text-sm text-slate-600">
          {roots.map((root, index) => {
            const active = activeRoot === root.id;
            return (
              <li key={root.id}>
                <button
                  type="button"
                  onClick={() => onRootSelect(root.id)}
                  className={`group relative flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left transition-all duration-150 ${
                    active
                      ? "border-[color:var(--theme-accent)]/40 bg-[color:var(--theme-accent)]/10 text-[color:var(--theme-accent)] shadow-sm"
                      : "border-transparent bg-white/60 hover:border-[color:var(--theme-accent)]/30 hover:bg-white hover:text-[color:var(--theme-accent)]"
                  }`}
                  style={{ ['--theme-accent' as any]: accent }}
                >
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-xl border text-xs font-semibold transition-all duration-150 ${
                      active
                        ? "border-[color:var(--theme-accent)]/60 bg-[color:var(--theme-accent)]/20 text-[color:var(--theme-accent)]"
                        : "border-slate-200 bg-white text-slate-400 group-hover:border-[color:var(--theme-accent)]/40 group-hover:bg-[color:var(--theme-accent)]/10 group-hover:text-[color:var(--theme-accent)]"
                    }`}
                  >
                    {index + 1}
                  </span>
                  <div className="flex-1">
                    <span className="block text-sm font-semibold">{root.title}</span>
                    <span className={`mt-1 block text-[11px] tracking-wide ${active ? "text-[color:var(--theme-accent)]/80" : "text-slate-400 group-hover:text-[color:var(--theme-accent)]/80"}`}>
                      点击查看所属站点
                    </span>
                  </div>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="none"
                    className={`h-4 w-4 transition-transform duration-150 ${active ? "translate-x-0.5" : "group-hover:translate-x-0.5"}`}
                    stroke="currentColor"
                    strokeWidth={1.6}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m7 5 5 5-5 5" />
                  </svg>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
};
