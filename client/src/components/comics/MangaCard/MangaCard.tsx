import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowUpRight, LoaderCircle, Play } from "lucide-react";
import { motion } from "framer-motion";
import type { MangaListItem } from "@/types/manga-list";
import { fetchFirstChapterSlug } from "@/services/mangaService";

interface Props {
  manga: MangaListItem;
  index?: number;
}

export default function MangaCard({ manga, index = 0 }: Props) {
  const navigate = useNavigate();
  const [isOpening, setIsOpening] = useState(false);

  const handleReadFirstChapter = async (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (isOpening) return;

    setIsOpening(true);
    try {
      const chapterSlug = await fetchFirstChapterSlug(manga.id);
      navigate(
        chapterSlug
          ? `/comics/${manga.id}/chapter/${chapterSlug}`
          : `/comics/${manga.id}`
      );
    } catch (error) {
      console.error("Could not open the first chapter:", error);
      navigate(`/comics/${manga.id}`);
    } finally {
      setIsOpening(false);
    }
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, delay: Math.min(index, 8) * 0.025 }}
      whileHover={{ y: -5 }}
      className="group relative w-[clamp(9.25rem,17vw,13.25rem)] shrink-0"
    >
      <div className="relative aspect-[2/3] overflow-hidden rounded-xl bg-[#17181c] ring-1 ring-white/[0.07] transition duration-300 group-hover:ring-white/20 group-hover:shadow-[0_18px_50px_rgba(0,0,0,0.5)]">
        <Link
          to={`/comics/${manga.id}`}
          aria-label={`View ${manga.title} details`}
          className="absolute inset-0 z-0"
        >
          <img
            src={manga.imageUrl || "/LY-logo.png"}
            alt={manga.title}
            loading={index === 0 ? "eager" : "lazy"}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.055]"
            onError={(event) => {
              event.currentTarget.src = "/LY-logo.png";
              event.currentTarget.className += " object-contain bg-[#111216] p-8";
            }}
          />
        </Link>

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/90 via-black/0 to-black/25" />

        {index === 0 && (
          <span className="pointer-events-none absolute left-2.5 top-2.5 inline-flex items-center gap-1 rounded-md bg-[#e50914] px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-white shadow-lg">
            Latest
          </span>
        )}

        <span
          className={`pointer-events-none absolute right-2.5 top-2.5 rounded-md px-2 py-1 text-[9px] font-bold uppercase tracking-[0.08em] backdrop-blur-md ${
            manga.isColored
              ? "bg-fuchsia-500/80 text-white"
              : "bg-black/55 text-white/85"
          }`}
        >
          {manga.isColored ? "Color" : "B&W"}
        </span>

        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-2.5 sm:p-3">
          <div className="min-w-0 translate-y-1 transition-transform duration-200 group-hover:translate-y-0">
            <span className="mb-1 block text-[10px] font-medium uppercase tracking-[0.14em] text-white/60">
              {manga.type || "Comic"}
            </span>
            <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-white sm:text-[15px]">
              {manga.title}
            </h3>
          </div>
          <button
            type="button"
            onClick={handleReadFirstChapter}
            disabled={isOpening}
            aria-label={`Read first chapter of ${manga.title}`}
            title="Read first chapter"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white text-[#111216] shadow-lg transition hover:scale-105 hover:bg-[#e50914] hover:text-white disabled:cursor-wait disabled:opacity-75"
          >
            {isOpening ? (
              <LoaderCircle className="h-4 w-4 animate-spin" />
            ) : (
              <Play className="ml-0.5 h-4 w-4 fill-current" />
            )}
          </button>
        </div>
      </div>

      <div className="flex min-h-12 items-start justify-between gap-2 px-0.5 pt-2">
        <Link
          to={`/comics/${manga.id}`}
          className="line-clamp-1 min-w-0 text-xs text-white/55 transition hover:text-white sm:text-[13px]"
        >
          {manga.latestChapter?.title || "Explore title"}
        </Link>
        <Link
          to={`/comics/${manga.id}`}
          aria-label={`More about ${manga.title}`}
          className="shrink-0 text-white/35 transition hover:text-white"
        >
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>
    </motion.article>
  );
}
