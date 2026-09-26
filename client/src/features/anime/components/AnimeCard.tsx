import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Play } from "lucide-react";
import type { AnimeTitle } from "@/features/anime/types/anime";

interface Props {
  anime: AnimeTitle;
  index?: number;
  layout?: "rail" | "grid";
}

export default function AnimeCard({ anime, index = 0, layout = "rail" }: Props) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24, delay: Math.min(index, 8) * 0.02 }}
      whileHover={{ y: -4 }}
      className={`group min-w-0 ${layout === "grid" ? "w-full" : "w-[clamp(9.25rem,17vw,13.25rem)] shrink-0"}`}
    >
      <Link
        to={`/anime/${anime.slug}`}
        aria-label={`View ${anime.title}`}
        className="block min-w-0"
      >
        <div className="relative mb-2 aspect-[2/3] overflow-hidden rounded-xl bg-[#17181c] ring-1 ring-white/[0.07] transition duration-300 group-hover:ring-white/20 group-hover:shadow-[0_18px_50px_rgba(0,0,0,0.45)]">
          <img
            src={anime.thumbnail || "/placeholder.svg"}
            alt={anime.title}
            loading={index < 3 ? "eager" : "lazy"}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.045]"
            onError={(event) => {
              event.currentTarget.src = "/placeholder.svg";
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/5 to-black/25" />
          <span className="absolute right-2 top-2 rounded-md bg-black/60 px-2 py-1 text-[9px] font-bold uppercase tracking-wide text-white/85 backdrop-blur">
            {anime.quality || anime.type || "Anime"}
          </span>
          {anime.hot && (
            <span className="absolute left-2 top-2 rounded-md bg-[#e50914] px-2 py-1 text-[9px] font-bold uppercase tracking-wide text-white">
              Trending
            </span>
          )}
          <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-2.5 sm:p-3">
            <div className="min-w-0">
              <span className="mb-1 block text-[10px] font-medium uppercase tracking-[0.14em] text-white/60">
                {anime.type || "Anime"}
              </span>
              <h2 className="line-clamp-2 text-sm font-semibold leading-snug text-white sm:text-[15px]">
                {anime.title}
              </h2>
            </div>
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white text-[#111216] shadow-lg transition group-hover:bg-[#e50914] group-hover:text-white">
              <Play className="ml-0.5 h-3.5 w-3.5 fill-current" />
            </span>
          </div>
        </div>
        <p className="flex min-h-6 items-center justify-between gap-2 px-0.5 text-xs text-white/50">
          <span className="truncate">
            {anime.currentEpisode ? `Episode ${anime.currentEpisode}` : anime.timeAgo || "Explore series"}
          </span>
          {anime.totalEpisodes && <span className="shrink-0">{anime.totalEpisodes} eps</span>}
        </p>
      </Link>
    </motion.article>
  );
}
