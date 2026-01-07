import { useRef, useState, useEffect, useCallback } from "react";

export function useMangaRowScroll(dotCount: number) {
  const ref = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);
  const [activeDot, setActiveDot] = useState(0);

  const update = useCallback(() => {
    if (!ref.current) return;

    const { scrollLeft, scrollWidth, clientWidth } = ref.current;

    setCanLeft(scrollLeft > 0);
    setCanRight(scrollLeft < scrollWidth - clientWidth - 10);

    const maxScroll = scrollWidth - clientWidth;
    if (maxScroll <= 0) {
      setActiveDot(0);
      return;
    }

    const index = Math.min(
      dotCount - 1,
      Math.floor((scrollLeft / maxScroll) * dotCount)
    );

    setActiveDot(index);
  }, [dotCount]);

  useEffect(() => {
    update();
    ref.current?.addEventListener("scroll", update);
    return () => ref.current?.removeEventListener("scroll", update);
  }, [update]);

  const scrollBy = (dir: "left" | "right") => {
    if (!ref.current) return;

    const amount = ref.current.clientWidth * 0.85;

    ref.current.scrollBy({
      left: dir === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  return {
    ref,
    canLeft,
    canRight,
    activeDot,
    scrollBy,
  };
}
