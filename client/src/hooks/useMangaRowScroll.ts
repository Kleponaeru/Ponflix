import { useState, useEffect, useCallback } from "react";

export function useMangaRowScroll(dotCount: number) {
  const [scrollElement, setScrollElement] = useState<HTMLDivElement | null>(
    null
  );
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);
  const [activeDot, setActiveDot] = useState(0);

  const updateScrollState = useCallback(() => {
    const el = scrollElement; // ⭐ USE scrollElement, not rowRef!
    if (!el) {
      return;
    }

    const { scrollLeft, scrollWidth, clientWidth } = el;

    // Check if we can scroll
    const newCanLeft = scrollLeft > 5;
    const newCanRight =
      scrollWidth > clientWidth && scrollLeft < scrollWidth - clientWidth - 5;

    setCanLeft(newCanLeft);
    setCanRight(newCanRight);

    // Calculate active dot
    const maxScroll = scrollWidth - clientWidth;
    if (maxScroll > 0) {
      const ratio = scrollLeft / maxScroll;
      const rawDot = ratio * dotCount;
      const dot = Math.min(dotCount - 1, Math.floor(rawDot));

      setActiveDot(dot);
    } else {
      setActiveDot(0);
    }
  }, [scrollElement, dotCount]); // ⭐ Add scrollElement as dependency!

  useEffect(() => {
    if (!scrollElement) return;

    // Check immediately
    updateScrollState();

    // Check after delays for images loading
    const timer1 = setTimeout(updateScrollState, 300);
    const timer2 = setTimeout(updateScrollState, 1000);

    // Listen to scroll
    const handleScroll = () => {
      updateScrollState();
    };

    scrollElement.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", updateScrollState);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      scrollElement.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", updateScrollState);
    };
  }, [scrollElement, updateScrollState]);

  const scroll = useCallback(
    (direction: "left" | "right") => {
      if (!scrollElement) {
        return;
      }

      const scrollAmount = scrollElement.clientWidth * 0.8;
      const newPosition =
        direction === "left"
          ? scrollElement.scrollLeft - scrollAmount
          : scrollElement.scrollLeft + scrollAmount;

      scrollElement.scrollTo({
        left: newPosition,
        behavior: "smooth",
      });

      // Force update after scroll animation completes
      setTimeout(() => {
        updateScrollState();
      }, 500);
    },
    [scrollElement, updateScrollState]
  );

  return {
    rowRef: setScrollElement, // Callback ref
    canLeft,
    canRight,
    activeDot,
    scroll,
  };
}
