import type { ReactNode } from "react";

type MobileBottomBarProps = {
  accent: string;
  hasActiveFilter: boolean;
  onOpenMenu: () => void;
  onOpenSubmit: () => void;
  onClearFilter: () => void;
  onScrollTop: () => void;
};

const ActionButton = ({
  label,
  onClick,
  active,
  accent,
  icon,
}: {
  label: string;
  onClick: () => void;
  active?: boolean;
  accent: string;
  icon: ReactNode;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex flex-1 flex-col items-center gap-1 text-[11px] font-medium transition ${
      active ? "text-[color:var(--theme-accent)]" : "text-slate-500"
    }`}
    style={{ ['--theme-accent' as any]: accent }}
  >
    <span
      className={`flex h-10 w-10 items-center justify-center rounded-full border text-sm transition ${
        active
          ? "border-[color:var(--theme-accent)] bg-[color:var(--theme-accent)]/15"
          : "border-slate-200 bg-white"
      }`}
    >
      {icon}
    </span>
    {label}
  </button>
);

export const MobileBottomBar = ({
  accent,
  hasActiveFilter,
  onOpenMenu,
  onOpenSubmit,
  onClearFilter,
  onScrollTop,
}: MobileBottomBarProps) => (
  <nav className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex justify-center lg:hidden">
    <div className="pointer-events-auto flex w-[min(440px,92%)] items-center justify-between rounded-3xl border border-white/25 bg-[color:var(--theme-surface)]/95 px-4 py-3 shadow-2xl backdrop-blur">
      <ActionButton
        label="分类"
        onClick={onOpenMenu}
        accent={accent}
        icon={
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 18 18"
            fill="none"
            className="h-4 w-4"
            stroke="currentColor"
            strokeWidth={1.6}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 5h12M3 9h12M3 13h12" />
          </svg>
        }
      />
      <ActionButton
        label="全部"
        onClick={onClearFilter}
        active={!hasActiveFilter}
        accent={accent}
        icon={
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 18 18"
            fill="none"
            className="h-4 w-4"
            stroke="currentColor"
            strokeWidth={1.6}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3.5 9a5.5 5.5 0 1 1 11 0 5.5 5.5 0 0 1-11 0Z" />
            <path d="M6.8 9h4.4M9 6.8v4.4" />
          </svg>
        }
      />
      <ActionButton
        label="投稿"
        onClick={onOpenSubmit}
        accent={accent}
        icon={
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 18 18"
            fill="none"
            className="h-4 w-4"
            stroke="currentColor"
            strokeWidth={1.6}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4.5 9V4.5a2 2 0 0 1 2-2h5a2 2 0 0 1 2 2V9" />
            <path d="M3 9h12v5a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 3 14V9Z" />
          </svg>
        }
      />
      <ActionButton
        label="顶部"
        onClick={onScrollTop}
        accent={accent}
        icon={
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 18 18"
            fill="none"
            className="h-4 w-4"
            stroke="currentColor"
            strokeWidth={1.6}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 4.5v9" />
            <path d="m5.25 8.25 3.75-3.75 3.75 3.75" />
          </svg>
        }
      />
    </div>
  </nav>
);
