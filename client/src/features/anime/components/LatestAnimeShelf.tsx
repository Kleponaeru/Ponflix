import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import AnimeCard from "@/features/anime/components/AnimeCard";
import type { AnimeTitle } from "@/features/anime/types/anime";

interface Props {
  anime: AnimeTitle[];
  loading: boolean;
}

function AnimeShelfSkeleton() {
  return (
    <div className="flex gap-3 overflow-hidden sm:gap-4" aria-hidden="true">
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

export default function LatestAnimeShelf({ anime, loading }: Props) {
  const [rail, setRail] = useState<HTMLDivElement | null>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  const updateScrollState = useCallback(() => {
    if (!rail) return;
    setCanLeft(rail.scrollLeft > 4);
    setCanRight(rail.scrollLeft + rail.clientWidth < rail.scrollWidth - 4);
  }, [rail]);

  useEffect(() => {
    if (!rail) return;
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
  }, [rail, updateScrollState]);

  const scroll = (direction: "left" | "right") => {
    if (!rail) return;
    const distance = Math.max(240, rail.clientWidth * 0.82);
    rail.scrollBy({ left: direction === "left" ? -distance : distance, behavior: "smooth" });
  };

  if (!loading && anime.length === 0) return null;

  return (
    <section
      id="latest-anime"
      className="content-shell mt-8 scroll-mt-24 sm:mt-10"
      aria-labelledby="home-anime-title"
    >
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#e50914]">
            Freshly updated
          </p>
          <h2 id="home-anime-title" className="text-xl font-semibold tracking-tight sm:text-2xl">
            Latest completed anime
          </h2>
        </div>
        <Link
          to="/anime"
          className="group inline-flex items-center gap-1 pb-0.5 text-xs font-medium text-white/55 transition-colors hover:text-white sm:text-sm"
        >
          See all <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>

      {loading ? (
        <AnimeShelfSkeleton />
      ) : (
        <div className="group/rail relative">
          {canLeft && (
            <button
              type="button"
              onClick={() => scroll("left")}
              aria-label="Scroll latest anime left"
              className="absolute left-0 top-[38%] z-20 hidden h-20 w-11 -translate-y-1/2 items-center justify-center rounded-r-lg bg-black/70 text-white opacity-0 backdrop-blur-sm transition hover:bg-black/90 focus-visible:opacity-100 group-hover/rail:opacity-100 lg:flex"
            >
              <ChevronLeft className="h-7 w-7" />
            </button>
          )}

          <div
            ref={setRail}
            className="flex snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain pb-3 [scrollbar-width:none] sm:gap-4 lg:gap-5 [&::-webkit-scrollbar]:hidden"
          >
            {anime.map((item, index) => (
              <div key={item.slug} className="snap-start">
                <AnimeCard anime={item} index={index} />
              </div>
            ))}
          </div>

          {canRight && (
            <button
              type="button"
              onClick={() => scroll("right")}
              aria-label="Scroll latest anime right"
              className="absolute right-0 top-[38%] z-20 hidden h-20 w-11 -translate-y-1/2 items-center justify-center rounded-l-lg bg-black/70 text-white opacity-0 backdrop-blur-sm transition hover:bg-black/90 focus-visible:opacity-100 group-hover/rail:opacity-100 lg:flex"
            >
              <ChevronRight className="h-7 w-7" />
            </button>
          )}
        </div>
      )}
    </section>
  );
}
