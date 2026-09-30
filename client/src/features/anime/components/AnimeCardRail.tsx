import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import AnimeCard from "@/features/anime/components/AnimeCard";
import type { AnimeTitle } from "@/features/anime/types/anime";

interface Props {
  anime: AnimeTitle[];
  loading?: boolean;
  ranked?: boolean;
}

function AnimeRailSkeleton() {
  return (
    <div
      className="flex gap-3 overflow-hidden sm:gap-4 lg:gap-5"
      aria-hidden="true"
    >
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="w-[clamp(9.25rem,17vw,13.25rem)] shrink-0">
          <div className="aspect-[2/3] animate-pulse rounded-xl bg-white/[0.06]" />
          <div className="mt-3 h-3 w-3/4 animate-pulse rounded bg-white/[0.06]" />
          <div className="mt-2 h-3 w-1/2 animate-pulse rounded bg-white/[0.04]" />
        </div>
      ))}
    </div>
  );
}

function RankNumber({ value }: { value: number }) {
  const stroke = "rgba(220, 220, 220, 0.62)";

  if (value === 4) {
    return (
      <svg
        aria-hidden="true"
        viewBox="0 0 96 120"
        className="pointer-events-none absolute bottom-3 left-0 z-0 h-[6.4rem] w-[5.1rem] select-none overflow-visible sm:h-[7.3rem] sm:w-[5.85rem]"
      >
        <path
          d="M59 4 H81 V72 H94 V90 H81 V116 H59 V90 H2 V72 Z M59 35 V72 H29 Z"
          fill="none"
          stroke={stroke}
          strokeWidth="2"
          strokeLinejoin="miter"
          strokeMiterlimit="6"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    );
  }

  const isDouble = value >= 10;

  return (
    <span
      aria-hidden="true"
      className={`pointer-events-none absolute bottom-3 left-0 z-0 select-none font-black leading-[0.78] text-transparent text-[7.5rem] sm:text-[8.5rem] ${
        isDouble ? "tracking-[-0.02em]" : "tracking-[-0.12em]"
      }`}
      style={{ WebkitTextStroke: `2px ${stroke}` }}
    >
      {value}
    </span>
  );
}

export default function AnimeCardRail({
  anime,
  loading = false,
  ranked = false,
}: Props) {
  const [rail, setRail] = useState<HTMLDivElement | null>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  const updateScrollState = useCallback(() => {
    if (!rail) return;
    setCanLeft(rail.scrollLeft > 4);
    setCanRight(rail.scrollLeft + rail.clientWidth < rail.scrollWidth - 4);
  }, [rail]);

  useEffect(() => {
    if (!rail || loading) return;
    updateScrollState();

    const observer = new ResizeObserver(updateScrollState);
    observer.observe(rail);
    rail.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);

    return () => {
      observer.disconnect();
      rail.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, [rail, loading, updateScrollState]);

  const scroll = (direction: "left" | "right") => {
    if (!rail) return;
    const distance = Math.max(240, rail.clientWidth * 0.82);
    rail.scrollBy({
      left: direction === "left" ? -distance : distance,
      behavior: "smooth",
    });
  };

  if (loading) return <AnimeRailSkeleton />;

  return (
    <div className="group/rail relative">
      {canLeft && (
        <button
          type="button"
          onClick={() => scroll("left")}
          aria-label="Scroll anime left"
          className="absolute left-0 top-[38%] z-20 hidden h-20 w-11 -translate-y-1/2 items-center justify-center rounded-r-lg bg-black/70 text-white opacity-0 backdrop-blur-sm transition hover:bg-black/90 focus-visible:opacity-100 group-hover/rail:opacity-100 lg:flex"
        >
          <ChevronLeft className="h-7 w-7" />
        </button>
      )}

      <div
        ref={setRail}
        className="flex snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain pb-3 [scrollbar-width:none] sm:gap-4 lg:gap-5 [&::-webkit-scrollbar]:hidden"
      >
        {anime.slice(0, ranked ? 10 : undefined).map((item, index) => (
          <div
            key={item.slug}
            className={
              ranked
                ? "relative flex w-[clamp(11.25rem,17vw,15.25rem)] shrink-0 snap-start items-end pl-12 sm:pl-16"
                : "relative snap-start"
            }
          >
            {ranked && <RankNumber value={item.rank ?? index + 1} />}
            <div className={ranked ? "relative z-10 w-full" : undefined}>
              <AnimeCard
                anime={ranked ? { ...item, hot: false } : item}
                index={index}
                layout={ranked ? "ranked" : "rail"}
              />
            </div>
          </div>
        ))}
      </div>

      {canRight && (
        <button
          type="button"
          onClick={() => scroll("right")}
          aria-label="Scroll anime right"
          className="absolute right-0 top-[38%] z-20 hidden h-20 w-11 -translate-y-1/2 items-center justify-center rounded-l-lg bg-black/70 text-white opacity-0 backdrop-blur-sm transition hover:bg-black/90 focus-visible:opacity-100 group-hover/rail:opacity-100 lg:flex"
        >
          <ChevronRight className="h-7 w-7" />
        </button>
      )}
    </div>
  );
}
