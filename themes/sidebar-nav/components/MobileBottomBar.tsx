import type { ReactNode } from "react";

type MobileBottomBarProps = {
  accent: string;
  hasActiveFilter: boolean;
  onOpenMenu: () => void;
  onClearFilter: () => void;
  onScrollTop: () => void;
  submitHref: string;
};

type ActionButtonProps = {
  label: string;
  icon: ReactNode;
  active?: boolean;
  onClick?: () => void;
  href?: string;
};

const ActionButton = ({ label, icon, active, onClick, href }: ActionButtonProps) => {
  const className = `flex flex-1 flex-col items-center gap-1 text-[11px] font-medium transition ${
    active ? "text-white" : "text-white/70"
  }`;

  const content = (
    <>
      <span
        className={`flex h-10 w-10 items-center justify-center rounded-full border text-sm transition ${
          active ? "border-white bg-white/20" : "border-white/30 bg-white/10"
        }`}
      >
        {icon}
      </span>
      {label}
    </>
  );

  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
        {content}
      </a>
    );
  }

  return (
    <button type="button" onClick={onClick} className={className}>
      {content}
    </button>
  );
};

export const MobileBottomBar = ({
  accent,
  hasActiveFilter,
  onOpenMenu,
  onClearFilter,
  onScrollTop,
  submitHref,
}: MobileBottomBarProps) => (
  <nav className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex justify-center lg:hidden">
    <div
      className="pointer-events-auto flex w-[min(440px,92%)] items-center justify-between rounded-3xl border border-white/20 px-4 py-3 text-white shadow-2xl backdrop-blur"
      style={{ backgroundColor: accent }}
    >
      <ActionButton
        label="分类菜单"
        onClick={onOpenMenu}
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
        label="全部分类"
        onClick={onClearFilter}
        active={!hasActiveFilter}
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
        label="提交站点"
        href={submitHref}
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
        label="返回顶部"
        onClick={onScrollTop}
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
