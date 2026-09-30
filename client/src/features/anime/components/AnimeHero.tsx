import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Info, Play } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { AnimeTitle } from "@/features/anime/types/anime";

export default function AnimeHero({ anime }: { anime: AnimeTitle[] }) {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const current = anime[currentIndex];

  useEffect(() => {
    setCurrentIndex(0);
  }, [anime]);

  useEffect(() => {
    if (isPaused || anime.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const interval = window.setInterval(() => {
      setCurrentIndex((index) => (index + 1) % anime.length);
    }, 6500);
    return () => window.clearInterval(interval);
  }, [anime.length, isPaused]);

  if (!current) return null;

  const showPrevious = () =>
    setCurrentIndex((index) => (index - 1 + anime.length) % anime.length);
  const showNext = () => setCurrentIndex((index) => (index + 1) % anime.length);

  return (
    <section
      aria-label="Featured anime"
      className="relative isolate min-h-[40rem] overflow-hidden bg-[#08090b] pt-16 md:min-h-[43rem]"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setIsPaused(false);
        }
      }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={current.slug}
          initial={{ opacity: 0.35 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.45 }}
          className="absolute inset-0"
        >
          <img
            src={current.thumbnail || "/placeholder.svg"}
            alt=""
            className="absolute inset-0 h-full w-full object-cover object-[center_28%] opacity-50 md:object-[center_22%] md:opacity-55"
            onError={(event) => {
              event.currentTarget.src = "/placeholder.svg";
              event.currentTarget.className += " object-contain p-16 opacity-10";
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#08090b] via-[#08090b]/80 to-[#08090b]/10" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#08090b] via-[#08090b]/10 to-black/25" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_72%_42%,transparent_0%,rgba(8,9,11,0.12)_38%,#08090b_100%)]" />
        </motion.div>
      </AnimatePresence>

      <div className="pointer-events-none absolute right-[9%] top-1/2 z-0 hidden w-[clamp(12rem,22vw,19rem)] -translate-y-[47%] xl:block">
        <AnimatePresence mode="wait">
          <motion.img
            key={`${current.slug}-poster`}
            src={current.thumbnail || "/placeholder.svg"}
            alt=""
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            className="aspect-[2/3] w-full rounded-xl object-cover shadow-2xl shadow-black/70 ring-1 ring-white/15"
            onError={(event) => {
              event.currentTarget.src = "/placeholder.svg";
            }}
          />
        </AnimatePresence>
      </div>

      <div className="content-shell relative z-10 flex min-h-[39rem] items-end pb-24 pt-16 md:min-h-[42rem] md:items-center md:pb-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${current.slug}-copy`}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            className="max-w-2xl xl:max-w-[58%]"
          >
            <p className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-white/65">
              <span className="h-5 w-1 rounded-full bg-[#e50914]" />
              Anime spotlight
            </p>
            <h1 className="max-w-2xl text-4xl font-bold leading-[1.04] tracking-[-0.04em] text-white drop-shadow-lg sm:text-5xl md:text-6xl lg:text-7xl">
              {current.title}
            </h1>
            <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-white/70">
              {current.currentEpisode && (
                <span className="font-semibold text-emerald-300">
                  New episode · {current.currentEpisode}
                </span>
              )}
              {current.type && <span>{current.type}</span>}
              {current.quality && <span>{current.quality}</span>}
              {current.totalEpisodes && <span>{current.totalEpisodes} episodes</span>}
            </div>
            <p className="mt-5 max-w-xl text-sm leading-6 text-white/60 sm:text-base">
              Find your next series to get lost in. New episodes and fan favorites, all in one place.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => navigate(`/anime/${current.slug}`)}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-white px-5 text-sm font-bold text-[#111] transition-colors hover:bg-white/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e50914]"
              >
                <Play className="h-4 w-4 fill-current" /> Explore series
              </button>
              <a
                href="#latest-anime"
                className="inline-flex min-h-12 items-center gap-2 rounded-lg bg-white/15 px-5 text-sm font-semibold text-white backdrop-blur transition-colors hover:bg-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e50914]"
              >
                <Info className="h-4 w-4" /> Browse latest
              </a>
            </div>
          </motion.div>
        </AnimatePresence>

        {anime.length > 1 && (
          <div className="absolute bottom-9 right-0 z-10 flex items-center gap-2">
            <span className="mr-2 text-xs tabular-nums text-white/55" aria-live="polite">
              {String(currentIndex + 1).padStart(2, "0")} / {String(anime.length).padStart(2, "0")}
            </span>
            <button
              type="button"
              onClick={showPrevious}
              aria-label="Previous featured anime"
              className="rounded-full border border-white/20 bg-black/25 p-2.5 text-white backdrop-blur transition-colors hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e50914]"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={showNext}
              aria-label="Next featured anime"
              className="rounded-full border border-white/20 bg-black/25 p-2.5 text-white backdrop-blur transition-colors hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e50914]"
            >
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#08090b] to-transparent" />
    </section>
  );
}
