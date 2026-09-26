import { useNavigate } from "react-router-dom";
import { Info, Play } from "lucide-react";
import type { AnimeTitle } from "@/features/anime/types/anime";

export default function AnimeHero({ anime }: { anime: AnimeTitle }) {
  const navigate = useNavigate();

  return (
    <section className="relative isolate min-h-[34rem] overflow-hidden bg-[#08090b] pt-16 md:min-h-[40rem]">
      <img
        src={anime.thumbnail || "/placeholder.svg"}
        alt=""
        className="absolute inset-0 -z-20 h-full w-full scale-110 object-cover object-[center_25%] opacity-45 blur-2xl"
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#08090b] via-[#08090b]/85 to-[#08090b]/20" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#08090b] via-transparent to-black/25" />

      <div className="content-shell relative flex min-h-[34rem] items-center py-14 md:min-h-[40rem]">
        <div className="max-w-2xl">
          <p className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-white/65">
            <span className="h-5 w-1 rounded-full bg-[#e50914]" />
            Anime spotlight
          </p>
          <h1 className="text-4xl font-bold leading-[1.04] tracking-[-0.04em] text-white drop-shadow-lg sm:text-5xl md:text-6xl lg:text-7xl">
            {anime.title}
          </h1>
          <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-white/70">
            {anime.currentEpisode && <span className="font-semibold text-emerald-300">Episode {anime.currentEpisode}</span>}
            {anime.type && <span>{anime.type}</span>}
            {anime.quality && <span>{anime.quality}</span>}
            {anime.totalEpisodes && <span>{anime.totalEpisodes} episodes</span>}
          </div>
          <p className="mt-5 max-w-xl text-sm leading-6 text-white/55">
            Find your next series to get lost in. New episodes and fan favorites, all in one place.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => navigate(`/anime/${anime.slug}`)}
              className="inline-flex min-h-12 items-center gap-2 rounded-lg bg-white px-5 text-sm font-bold text-[#111] transition hover:bg-white/85"
            >
              <Play className="h-4 w-4 fill-current" /> Explore anime
            </button>
            <a
              href="#latest-anime"
              className="inline-flex min-h-12 items-center gap-2 rounded-lg bg-white/15 px-5 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/25"
            >
              <Info className="h-4 w-4" /> Browse latest
            </a>
          </div>
        </div>

        <img
          src={anime.thumbnail || "/placeholder.svg"}
          alt=""
          className="absolute right-[8%] top-1/2 hidden max-h-[min(60vh,34rem)] w-[clamp(12rem,22vw,19rem)] -translate-y-1/2 rounded-xl object-cover shadow-2xl shadow-black/60 ring-1 ring-white/15 xl:block"
        />
      </div>
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#08090b] to-transparent" />
    </section>
  );
}
