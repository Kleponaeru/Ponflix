import { useCallback, useEffect, useState } from "react";

export function useMangaRowScroll() {
  const [scrollElement, setScrollElement] = useState<HTMLDivElement | null>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  const updateScrollState = useCallback(() => {
    if (!scrollElement) return;
    setCanLeft(scrollElement.scrollLeft > 4);
    setCanRight(
      scrollElement.scrollLeft + scrollElement.clientWidth <
        scrollElement.scrollWidth - 4
    );
  }, [scrollElement]);

  useEffect(() => {
    if (!scrollElement) return;
    updateScrollState();

    const observer = new ResizeObserver(updateScrollState);
    observer.observe(scrollElement);
    scrollElement.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);

    return () => {
      observer.disconnect();
      scrollElement.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, [scrollElement, updateScrollState]);

  const scroll = useCallback(
    (direction: "left" | "right") => {
      if (!scrollElement) return;
      const distance = Math.max(240, scrollElement.clientWidth * 0.82);
      scrollElement.scrollBy({
        left: direction === "left" ? -distance : distance,
        behavior: "smooth",
      });
    },
    [scrollElement]
  );

  return { rowRef: setScrollElement, canLeft, canRight, scroll };
}
