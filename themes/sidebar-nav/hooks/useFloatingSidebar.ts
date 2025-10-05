import { useEffect, useRef, useState } from "react";

export const useFloatingSidebar = (buffer = 160) => {
  const footerRef = useRef<HTMLElement | null>(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const updateOffset = () => {
      const footer = footerRef.current;
      if (!footer) {
        setOffset(0);
        return;
      }

      const rect = footer.getBoundingClientRect();
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
      const distance = rect.top - viewportHeight;
      const overlap = distance < buffer ? buffer - distance : 0;
      setOffset(overlap > 0 ? overlap : 0);
    };

    updateOffset();
    window.addEventListener("scroll", updateOffset, { passive: true });
    window.addEventListener("resize", updateOffset);

    return () => {
      window.removeEventListener("scroll", updateOffset);
      window.removeEventListener("resize", updateOffset);
    };
  }, [buffer]);

  return { footerRef, offset };
};
