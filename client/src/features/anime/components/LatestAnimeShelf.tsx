import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, RotateCw } from "lucide-react";
import { fetchLatestAnime } from "@/features/anime/api/animeService";
import AnimeCard from "@/features/anime/components/AnimeCard";
import type { AnimeTitle } from "@/features/anime/types/anime";

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

export default function LatestAnimeShelf() {
  const [anime, setAnime] = useState<AnimeTitle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");

    fetchLatestAnime(controller.signal)
      .then(setAnime)
      .catch((loadError) => {
        if ((loadError as Error).name !== "AbortError") {
          setError("Anime titles couldn’t load right now.");
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [reloadKey]);

  return (
    <section className="content-shell mt-12 sm:mt-14" aria-labelledby="home-anime-title">
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
      ) : error ? (
        <div className="flex flex-col gap-3 rounded-xl border border-white/[0.08] bg-white/[0.025] px-4 py-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-white/55">{error}</p>
          <button
            type="button"
            onClick={() => setReloadKey((key) => key + 1)}
            className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 self-start rounded-lg border border-white/15 px-4 text-sm font-medium text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e50914] sm:self-auto"
          >
            <RotateCw className="h-4 w-4" /> Retry
          </button>
        </div>
      ) : anime.length ? (
        <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-3 sm:gap-4">
          {anime.map((item, index) => (
            <div key={item.slug} className="snap-start">
              <AnimeCard anime={item} index={index} />
            </div>
          ))}
        </div>
      ) : (
        <p className="rounded-xl border border-white/[0.08] bg-white/[0.025] px-5 py-8 text-center text-sm text-white/55">
          No latest anime titles are available right now.
        </p>
      )}
    </section>
  );
}
