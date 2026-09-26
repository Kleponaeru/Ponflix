import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, RotateCw } from "lucide-react";
import { fetchLatestAnime } from "@/features/anime/api/animeService";
import AnimeCard from "@/features/anime/components/AnimeCard";
import AnimeHero from "@/features/anime/components/AnimeHero";
import type { AnimeTitle } from "@/features/anime/types/anime";

function AnimeShelfSkeleton() {
  return (
    <div className="content-shell grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6" aria-hidden="true">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index}>
          <div className="aspect-[2/3] animate-pulse rounded-xl bg-white/[0.06]" />
          <div className="mt-3 h-3 w-3/4 animate-pulse rounded bg-white/[0.06]" />
          <div className="mt-2 h-3 w-1/2 animate-pulse rounded bg-white/[0.04]" />
        </div>
      ))}
    </div>
  );
}

export default function AnimeHome() {
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
          setError("Anime titles couldn’t load. Please try again.");
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [reloadKey]);

  const featured = anime[0];

  return (
    <main className="min-h-screen overflow-hidden bg-[#08090b] pb-16 text-white">
      {featured ? (
        <AnimeHero anime={featured} />
      ) : loading ? (
        <section className="content-shell flex min-h-[34rem] items-end py-14 md:min-h-[40rem]">
          <div className="w-full max-w-2xl space-y-5">
            <div className="h-4 w-36 animate-pulse rounded bg-white/10" />
            <div className="h-12 w-4/5 animate-pulse rounded bg-white/10 sm:h-16" />
            <div className="h-4 w-64 animate-pulse rounded bg-white/10" />
          </div>
        </section>
      ) : (
        <section className="content-shell flex min-h-[34rem] items-center pt-16 md:min-h-[40rem]">
          <div className="max-w-xl rounded-2xl border border-white/10 bg-white/[0.035] p-7">
            <h1 className="text-2xl font-semibold">Anime is unavailable right now.</h1>
            <p className="mt-2 text-sm leading-6 text-white/55">{error || "No titles were returned."}</p>
            <button
              type="button"
              onClick={() => setReloadKey((key) => key + 1)}
              className="mt-5 inline-flex min-h-10 items-center gap-2 rounded-lg bg-white px-4 text-sm font-semibold text-black transition hover:bg-white/85"
            >
              <RotateCw className="h-4 w-4" /> Try again
            </button>
          </div>
        </section>
      )}

      <section id="latest-anime" className="content-shell mt-8 scroll-mt-24 sm:mt-10" aria-labelledby="latest-anime-title">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#e50914]">Freshly updated</p>
            <h2 id="latest-anime-title" className="text-xl font-semibold tracking-tight sm:text-2xl">Latest anime</h2>
          </div>
          <Link to="/anime/search?q=" className="group inline-flex items-center gap-1 pb-0.5 text-xs font-medium text-white/55 transition hover:text-white sm:text-sm">
            Discover more <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        {loading ? (
          <AnimeShelfSkeleton />
        ) : anime.length ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {anime.map((item, index) => <AnimeCard key={item.slug} anime={item} index={index} layout="grid" />)}
          </div>
        ) : (
          <p className="rounded-xl border border-white/[0.08] bg-white/[0.025] px-5 py-10 text-center text-sm text-white/55">
            {error || "No latest titles are available."}
          </p>
        )}
      </section>
    </main>
  );
}
