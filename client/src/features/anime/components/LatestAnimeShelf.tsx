import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
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
            Latest anime
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
        <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-3 sm:gap-4">
          {anime.map((item, index) => (
            <div key={item.slug} className="snap-start">
              <AnimeCard anime={item} index={index} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
