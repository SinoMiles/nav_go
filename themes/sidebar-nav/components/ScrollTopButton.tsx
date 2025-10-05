type ScrollTopButtonProps = {
  visible: boolean;
  accent: string;
};

export const ScrollTopButton = ({ visible, accent }: ScrollTopButtonProps) => {
  if (!visible) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="fixed bottom-8 right-8 z-40 flex h-12 w-12 items-center justify-center rounded-full text-lg font-semibold text-white shadow-xl transition hover:-translate-y-1 hover:opacity-90"
      style={{ backgroundColor: accent }}
      aria-label="返回顶部"
    >
      ↑
    </button>
  );
};
