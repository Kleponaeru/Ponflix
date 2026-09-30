import { Flame } from "lucide-react";
import AnimeCardRail from "@/features/anime/components/AnimeCardRail";
import type { AnimeTitle } from "@/features/anime/types/anime";

interface Props {
  anime: AnimeTitle[];
  loading: boolean;
}

export default function TrendingAnimeSection({ anime, loading }: Props) {
  if (!loading && anime.length === 0) return null;

  return (
    <section className="content-shell mt-9 sm:mt-11" aria-labelledby="trending-anime-title">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <p className="mb-1 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#e50914]">
            <Flame className="h-3.5 w-3.5" /> Popular right now
          </p>
          <h2 id="trending-anime-title" className="text-xl font-semibold tracking-tight sm:text-2xl">
            Top 10 anime today
          </h2>
        </div>
        {!loading && (
          <span className="pb-0.5 text-xs text-white/45">Ranked by popularity</span>
        )}
      </div>

      <AnimeCardRail anime={anime} loading={loading} ranked />
    </section>
  );
}
