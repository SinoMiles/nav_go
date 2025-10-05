import { useEffect, useRef, useState } from "react";

export const useFloatingSidebar = (buffer = 120) => {
  const footerRef = useRef<HTMLElement | null>(null);
  const [floating, setFloating] = useState(true);

  useEffect(() => {
    const updateFloatingState = () => {
      const footer = footerRef.current;
      if (!footer) {
        setFloating(true);
        return;
      }

      const rect = footer.getBoundingClientRect();
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
      setFloating(rect.top > viewportHeight - buffer);
    };

    updateFloatingState();
    window.addEventListener("scroll", updateFloatingState, { passive: true });
    window.addEventListener("resize", updateFloatingState);

    return () => {
      window.removeEventListener("scroll", updateFloatingState);
      window.removeEventListener("resize", updateFloatingState);
    };
  }, [buffer]);

  return { footerRef, floating };
};
