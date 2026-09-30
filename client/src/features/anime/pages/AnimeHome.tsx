import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, RotateCw } from "lucide-react";
import {
  fetchLatestAnime,
  fetchSpotlightAnime,
  fetchTrendingAnime,
} from "@/features/anime/api/animeService";
import AnimeCardRail from "@/features/anime/components/AnimeCardRail";
import AnimeHero from "@/features/anime/components/AnimeHero";
import TrendingAnimeSection from "@/features/anime/components/TrendingAnimeSection";
import type { AnimeTitle } from "@/features/anime/types/anime";

export default function AnimeHome() {
  const [spotlight, setSpotlight] = useState<AnimeTitle[]>([]);
  const [latest, setLatest] = useState<AnimeTitle[]>([]);
  const [trending, setTrending] = useState<AnimeTitle[]>([]);
  const [spotlightLoading, setSpotlightLoading] = useState(true);
  const [latestLoading, setLatestLoading] = useState(true);
  const [trendingLoading, setTrendingLoading] = useState(true);
  const [spotlightError, setSpotlightError] = useState("");
  const [latestError, setLatestError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setSpotlightLoading(true);
    setLatestLoading(true);
    setTrendingLoading(true);
    setSpotlightError("");
    setLatestError("");

    fetchSpotlightAnime(controller.signal)
      .then(setSpotlight)
      .catch((loadError) => {
        if ((loadError as Error).name !== "AbortError") {
          setSpotlight([]);
          setSpotlightError("Anime titles couldn’t load. Please try again.");
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setSpotlightLoading(false);
      });

    fetchLatestAnime(controller.signal)
      .then(setLatest)
      .catch((loadError) => {
        if ((loadError as Error).name !== "AbortError") {
          setLatest([]);
          setLatestError("Latest completed anime couldn’t load right now.");
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLatestLoading(false);
      });

    fetchTrendingAnime(controller.signal)
      .then(setTrending)
      .catch((loadError) => {
        if ((loadError as Error).name !== "AbortError") setTrending([]);
      })
      .finally(() => {
        if (!controller.signal.aborted) setTrendingLoading(false);
      });

    return () => controller.abort();
  }, [reloadKey]);

  return (
    <main className="overflow-hidden bg-[#08090b] pb-16 text-white">
      {spotlight.length ? (
        <AnimeHero anime={spotlight} />
      ) : spotlightLoading ? (
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
            <h1 className="text-2xl font-semibold">Anime spotlight is unavailable right now.</h1>
            <p className="mt-2 text-sm leading-6 text-white/55">{spotlightError || "No spotlight titles were returned."}</p>
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

      <TrendingAnimeSection anime={trending} loading={trendingLoading} />

      <section id="latest-anime" className="content-shell mt-9 scroll-mt-24 sm:mt-11" aria-labelledby="latest-anime-title">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#e50914]">Freshly updated</p>
            <h2 id="latest-anime-title" className="text-xl font-semibold tracking-tight sm:text-2xl">Latest completed anime</h2>
          </div>
          <Link to="/anime/search?q=" className="group inline-flex items-center gap-1 pb-0.5 text-xs font-medium text-white/55 transition hover:text-white sm:text-sm">
            Discover more <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        {latestLoading ? (
          <AnimeCardRail anime={[]} loading />
        ) : latest.length ? (
          <AnimeCardRail anime={latest} />
        ) : (
          <p className="rounded-xl border border-white/[0.08] bg-white/[0.025] px-5 py-10 text-center text-sm text-white/55">
            {latestError || "No latest titles are available."}
          </p>
        )}
      </section>
    </main>
  );
}
