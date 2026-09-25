import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Info,
  LoaderCircle,
  Play,
  Sparkles,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { fetchFirstChapterSlug } from "@/features/comics/api/mangaService";
import type { MangaListItem } from "@/features/comics/types/manga-list";

interface Props {
  featured: MangaListItem[];
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
}

export default function MangaHeroBanner({
  featured,
  isLoading,
  error,
  onRetry,
}: Props) {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isOpening, setIsOpening] = useState(false);

  useEffect(() => {
    if (currentIndex >= featured.length) setCurrentIndex(0);
  }, [currentIndex, featured.length]);

  useEffect(() => {
    if (isPaused || featured.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const interval = window.setInterval(() => {
      setCurrentIndex((index) => (index + 1) % featured.length);
    }, 6500);
    return () => window.clearInterval(interval);
  }, [featured.length, isPaused]);

  const currentManga = featured[currentIndex];

  const openFirstChapter = async () => {
    if (!currentManga || isOpening) return;
    setIsOpening(true);
    try {
      const chapterSlug = await fetchFirstChapterSlug(currentManga.id);
      navigate(
        chapterSlug
          ? `/comics/${currentManga.id}/chapter/${chapterSlug}`
          : `/comics/${currentManga.id}`
      );
    } catch (openError) {
      console.error("Could not open the first chapter:", openError);
      navigate(`/comics/${currentManga.id}`);
    } finally {
      setIsOpening(false);
    }
  };

  if (isLoading) {
    return (
      <section
        aria-label="Featured comics loading"
        className="relative min-h-[31rem] overflow-hidden bg-[#111216] pt-16 md:min-h-[40rem]"
      >
        <div className="content-shell flex min-h-[29rem] items-end pb-16 md:min-h-[38rem] md:pb-24">
          <div className="w-full max-w-xl space-y-5">
            <div className="h-4 w-36 animate-pulse rounded bg-white/10" />
            <div className="h-12 w-4/5 animate-pulse rounded bg-white/10 md:h-16" />
            <div className="h-4 w-64 animate-pulse rounded bg-white/10" />
            <div className="h-11 w-44 animate-pulse rounded-lg bg-white/10" />
          </div>
        </div>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent" />
      </section>
    );
  }

  if (error || !currentManga) {
    return (
      <section className="content-shell flex min-h-[25rem] items-center pt-20">
        <div className="max-w-lg rounded-2xl border border-white/10 bg-white/[0.035] p-7">
          <Sparkles className="mb-4 h-6 w-6 text-[#e50914]" />
          <h1 className="text-2xl font-semibold">Your next favorite is waiting.</h1>
          <p className="mt-2 text-sm leading-6 text-white/55">
            {error || "Featured titles could not be loaded."}
          </p>
          <button
            type="button"
            onClick={onRetry}
            className="mt-5 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-white/85"
          >
            Try again
          </button>
        </div>
      </section>
    );
  }

  const showPrevious = () =>
    setCurrentIndex((index) => (index - 1 + featured.length) % featured.length);
  const showNext = () => setCurrentIndex((index) => (index + 1) % featured.length);

  return (
    <section
      aria-label="Featured comics"
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
          key={currentManga.id}
          initial={{ opacity: 0.35 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.45 }}
          className="absolute inset-0"
        >
          <img
            src={currentManga.imageUrl || "/LY-logo.png"}
            alt=""
            className="absolute inset-0 h-full w-full object-cover object-[center_28%] opacity-50 md:object-[center_22%] md:opacity-55"
            onError={(event) => {
              event.currentTarget.src = "/LY-logo.png";
              event.currentTarget.className += " object-contain p-16 opacity-10";
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#08090b] via-[#08090b]/80 to-[#08090b]/10" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#08090b] via-[#08090b]/10 to-black/25" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_72%_42%,transparent_0%,rgba(8,9,11,0.12)_38%,#08090b_100%)]" />
        </motion.div>
      </AnimatePresence>

      <div className="pointer-events-none absolute right-[9%] top-1/2 z-0 hidden w-[clamp(12rem,22vw,19rem)] -translate-y-[47%] xl:block">
        <img
          src={currentManga.imageUrl || "/placeholder.svg"}
          alt=""
          className="aspect-[2/3] w-full rounded-xl object-cover shadow-2xl shadow-black/70 ring-1 ring-white/15"
        />
      </div>

      <div className="content-shell relative z-10 flex min-h-[39rem] items-end pb-24 pt-16 md:min-h-[42rem] md:items-center md:pb-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${currentManga.id}-copy`}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            className="max-w-2xl xl:max-w-[58%]"
          >
            <p className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-white/65">
              <span className="h-5 w-1 rounded-full bg-[#e50914]" />
              Featured on Ponflix
            </p>
            <h1 className="max-w-2xl text-4xl font-bold leading-[1.04] tracking-[-0.04em] text-white drop-shadow-lg sm:text-5xl md:text-6xl lg:text-7xl">
              {currentManga.title}
            </h1>
            <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-white/70">
              <span className="font-semibold text-emerald-300">New chapters</span>
              <span className="text-white/25">•</span>
              <span>{currentManga.type}</span>
              <span className="text-white/25">•</span>
              <span>{currentManga.isColored ? "Full color" : "Black & white"}</span>
            </div>
            {currentManga.latestChapter && (
              <p className="mt-4 max-w-xl text-sm leading-6 text-white/65 sm:text-base">
                Latest update: <span className="text-white">{currentManga.latestChapter.title}</span>
                {currentManga.latestChapter.releasedAt && (
                  <span className="text-white/35"> · {currentManga.latestChapter.releasedAt}</span>
                )}
              </p>
            )}
            <div className="mt-7 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={openFirstChapter}
                disabled={isOpening}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-white px-5 text-sm font-bold text-[#111] transition hover:bg-white/85 disabled:cursor-wait disabled:opacity-75"
              >
                {isOpening ? (
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                ) : (
                  <Play className="h-4 w-4 fill-current" />
                )}
                Read first chapter
              </button>
              <button
                type="button"
                onClick={() => navigate(`/comics/${currentManga.id}`)}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-white/15 px-5 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/25"
              >
                <Info className="h-4 w-4" />
                More info
              </button>
            </div>
          </motion.div>
        </AnimatePresence>

        {featured.length > 1 && (
          <div className="absolute bottom-9 right-0 z-10 flex items-center gap-2">
            <span className="mr-2 text-xs tabular-nums text-white/55">
              {String(currentIndex + 1).padStart(2, "0")} / {String(featured.length).padStart(2, "0")}
            </span>
            <button
              type="button"
              onClick={showPrevious}
              aria-label="Previous featured comic"
              className="rounded-full border border-white/20 bg-black/25 p-2.5 text-white backdrop-blur transition hover:bg-white/15"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={showNext}
              aria-label="Next featured comic"
              className="rounded-full border border-white/20 bg-black/25 p-2.5 text-white backdrop-blur transition hover:bg-white/15"
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
