import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Info, LoaderCircle, Play } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { fetchFirstChapterSlug } from "@/features/comics/api/mangaService";
import type { AnimeTitle } from "@/features/anime/types/anime";
import type { MangaListItem } from "@/features/comics/types/manga-list";

type FeaturedItem =
  | { kind: "anime"; id: string; title: string; image: string; anime: AnimeTitle }
  | { kind: "comic"; id: string; title: string; image: string; manga: MangaListItem };

interface Props {
  anime: AnimeTitle[];
  comics: MangaListItem[];
  animeLoading: boolean;
  comicsLoading: boolean;
}

export default function HomeFeaturedBanner({
  anime,
  comics,
  animeLoading,
  comicsLoading,
}: Props) {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isOpening, setIsOpening] = useState(false);

  const featured = useMemo(() => {
    const items: FeaturedItem[] = [];
    const count = Math.max(anime.length, comics.length);

    for (let index = 0; index < count; index += 1) {
      const animeItem = anime[index];
      const comicItem = comics[index];
      if (animeItem) {
        items.push({
          kind: "anime",
          id: animeItem.slug,
          title: animeItem.title,
          image: animeItem.thumbnail,
          anime: animeItem,
        });
      }
      if (comicItem) {
        items.push({
          kind: "comic",
          id: comicItem.id,
          title: comicItem.title,
          image: comicItem.imageUrl,
          manga: comicItem,
        });
      }
    }

    return items;
  }, [anime, comics]);

  useEffect(() => setCurrentIndex(0), [featured]);

  useEffect(() => {
    if (isPaused || featured.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const interval = window.setInterval(() => {
      setCurrentIndex((index) => (index + 1) % featured.length);
    }, 6500);
    return () => window.clearInterval(interval);
  }, [featured.length, isPaused]);

  const current = featured[currentIndex];

  const openComic = async () => {
    if (!current || current.kind !== "comic" || isOpening) return;
    setIsOpening(true);
    try {
      const chapterSlug = await fetchFirstChapterSlug(current.manga.id);
      navigate(
        chapterSlug
          ? `/comics/${current.manga.id}/chapter/${chapterSlug}`
          : `/comics/${current.manga.id}`
      );
    } catch {
      navigate(`/comics/${current.manga.id}`);
    } finally {
      setIsOpening(false);
    }
  };

  if (!current) {
    if (!animeLoading && !comicsLoading) return null;

    return (
      <section
        aria-label="Featured titles loading"
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

  const showPrevious = () =>
    setCurrentIndex((index) => (index - 1 + featured.length) % featured.length);
  const showNext = () => setCurrentIndex((index) => (index + 1) % featured.length);
  const isAnime = current.kind === "anime";

  return (
    <section
      aria-label="Featured anime and comics"
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
          key={`${current.kind}-${current.id}`}
          initial={{ opacity: 0.35 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.45 }}
          className="absolute inset-0"
        >
          <img
            src={current.image || "/placeholder.svg"}
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
        <img
          src={current.image || "/placeholder.svg"}
          alt=""
          className="aspect-[2/3] w-full rounded-xl object-cover shadow-2xl shadow-black/70 ring-1 ring-white/15"
          onError={(event) => {
            event.currentTarget.src = "/placeholder.svg";
          }}
        />
      </div>

      <div className="content-shell relative z-10 flex min-h-[39rem] items-end pb-24 pt-16 md:min-h-[42rem] md:items-center md:pb-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${current.kind}-${current.id}-copy`}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            className="max-w-2xl xl:max-w-[58%]"
          >
            <p className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-white/65">
              <span className="h-5 w-1 rounded-full bg-[#e50914]" />
              {isAnime ? "Anime spotlight" : "Comics spotlight"}
            </p>
            <h1 className="max-w-2xl text-4xl font-bold leading-[1.04] tracking-[-0.04em] text-white drop-shadow-lg sm:text-5xl md:text-6xl lg:text-7xl">
              {current.title}
            </h1>
            <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-white/70">
              {isAnime ? (
                <>
                  <span className="font-semibold text-emerald-300">New episodes</span>
                  {current.anime.currentEpisode && <span>Episode {current.anime.currentEpisode}</span>}
                  {current.anime.type && <span>{current.anime.type}</span>}
                  {current.anime.quality && <span>{current.anime.quality}</span>}
                </>
              ) : (
                <>
                  <span className="font-semibold text-emerald-300">New chapters</span>
                  <span>{current.manga.type}</span>
                  <span>{current.manga.isColored ? "Full color" : "Black & white"}</span>
                </>
              )}
            </div>
            {!isAnime && current.manga.latestChapter && (
              <p className="mt-4 max-w-xl text-sm leading-6 text-white/65 sm:text-base">
                Latest update: <span className="text-white">{current.manga.latestChapter.title}</span>
                {current.manga.latestChapter.releasedAt && (
                  <span className="text-white/35"> · {current.manga.latestChapter.releasedAt}</span>
                )}
              </p>
            )}
            <div className="mt-7 flex flex-wrap gap-3">
              {isAnime ? (
                <button
                  type="button"
                  onClick={() => navigate(`/anime/${current.anime.slug}`)}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-white px-5 text-sm font-bold text-[#111] transition-colors hover:bg-white/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e50914]"
                >
                  <Play className="h-4 w-4 fill-current" /> Explore series
                </button>
              ) : (
                <button
                  type="button"
                  onClick={openComic}
                  disabled={isOpening}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-white px-5 text-sm font-bold text-[#111] transition-colors hover:bg-white/85 disabled:cursor-wait disabled:opacity-75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e50914]"
                >
                  {isOpening ? (
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                  ) : (
                    <Play className="h-4 w-4 fill-current" />
                  )}
                  Read first chapter
                </button>
              )}
              {isAnime ? (
                <a
                  href="#latest-anime"
                  className="inline-flex min-h-12 items-center gap-2 rounded-lg bg-white/15 px-5 text-sm font-semibold text-white backdrop-blur transition-colors hover:bg-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e50914]"
                >
                  <Info className="h-4 w-4" /> Browse latest
                </a>
              ) : (
                <button
                  type="button"
                  onClick={() => navigate(`/comics/${current.manga.id}`)}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-white/15 px-5 text-sm font-semibold text-white backdrop-blur transition-colors hover:bg-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e50914]"
                >
                  <Info className="h-4 w-4" /> More info
                </button>
              )}
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
              aria-label="Previous featured title"
              className="rounded-full border border-white/20 bg-black/25 p-2.5 text-white backdrop-blur transition-colors hover:bg-white/15"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={showNext}
              aria-label="Next featured title"
              className="rounded-full border border-white/20 bg-black/25 p-2.5 text-white backdrop-blur transition-colors hover:bg-white/15"
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
