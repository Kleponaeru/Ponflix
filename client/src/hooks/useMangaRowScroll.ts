import { useState, useRef, useEffect, useCallback } from "react";

export function useMangaRowScroll(dotCount: number) {
  const rowRef = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);
  const [activeDot, setActiveDot] = useState(0);

  const updateScrollState = useCallback(() => {
    const el = rowRef.current;
    if (!el) {
      return;
    }

    const { scrollLeft, scrollWidth, clientWidth } = el;

    console.log("📏 Scroll event fired:", {
      scrollLeft: Math.round(scrollLeft),
      scrollWidth,
      clientWidth,
    });

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

      console.log("🎯 Dot calculation:", {
        scrollLeft: Math.round(scrollLeft),
        maxScroll,
        ratio: ratio.toFixed(3),
        rawDot: rawDot.toFixed(2),
        finalDot: dot,
        dotCount,
        currentActiveDot: activeDot,
      });

      setActiveDot(dot);
    } else {
      setActiveDot(0);
    }
  }, [dotCount, activeDot]);

  useEffect(() => {
    const el = rowRef.current;
    console.log(
      "🔧 Setting up listeners, element:",
      el ? "found" : "not found"
    );

    if (!el) return;

    // Check immediately
    updateScrollState();

    // Check after delays for images loading
    const timer1 = setTimeout(updateScrollState, 300);
    const timer2 = setTimeout(updateScrollState, 1000);

    // Listen to scroll with passive: false to ensure it fires
    const handleScroll = () => {
      console.log("📜 Scroll event detected!");
      updateScrollState();
    };

    el.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", updateScrollState);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      el.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", updateScrollState);
    };
  }, [updateScrollState]);

  const scroll = useCallback(
    (direction: "left" | "right") => {
      const el = rowRef.current;
      if (!el) {
        return;
      }

      console.log("⬅️➡️ Scrolling:", direction);

      const scrollAmount = el.clientWidth * 0.8;
      const newPosition =
        direction === "left"
          ? el.scrollLeft - scrollAmount
          : el.scrollLeft + scrollAmount;

      console.log("📍 Scroll to:", Math.round(newPosition));

      el.scrollTo({
        left: newPosition,
        behavior: "smooth",
      });

      // Force update after scroll animation completes
      setTimeout(() => {
        console.log("⏰ Force update after scroll");
        updateScrollState();
      }, 500);
    },
    [updateScrollState]
  );

  return {
    rowRef,
    canLeft,
    canRight,
    activeDot,
    scroll,
  };
}
