import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Play, Star } from "lucide-react";
import { movieImage, movieYear } from "@/features/movies/api/movieService";
import type { Movie } from "@/features/movies/types/movie";

export default function MovieCard({ movie, index = 0 }: { movie: Movie; index?: number }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: Math.min(index, 8) * 0.025 }}
      whileHover={{ y: -4 }}
      className="group min-w-0"
    >
      <Link to={`/movies/${movie.id}`} aria-label={`View ${movie.title}`} className="block min-w-0">
        <div className="relative mb-2 aspect-[2/3] overflow-hidden rounded-xl bg-[#17181c] ring-1 ring-white/[0.07] transition duration-300 group-hover:ring-white/20 group-hover:shadow-[0_18px_50px_rgba(0,0,0,0.45)]">
          <img
            src={movieImage(movie.poster_path)}
            alt={movie.title}
            loading={index < 4 ? "eager" : "lazy"}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.045]"
            onError={(event) => { event.currentTarget.src = "/placeholder.svg"; }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/5 to-black/15" />
          <span className="absolute left-2 top-2 rounded-md bg-black/60 px-2 py-1 text-[9px] font-bold uppercase tracking-wide text-white/85 backdrop-blur">
            {movieYear(movie.release_date)}
          </span>
          <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-2.5 sm:p-3">
            <h2 className="line-clamp-2 text-sm font-semibold leading-snug text-white sm:text-[15px]">{movie.title}</h2>
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white text-[#111216] shadow-lg transition group-hover:bg-[#e50914] group-hover:text-white">
              <Play className="ml-0.5 h-3.5 w-3.5 fill-current" />
            </span>
          </div>
        </div>
        <p className="flex min-h-6 items-center justify-between gap-2 px-0.5 text-xs text-white/50">
          <span className="truncate">{movie.original_title && movie.original_title !== movie.title ? movie.original_title : "Movie"}</span>
          {movie.vote_average ? <span className="inline-flex shrink-0 items-center gap-1 text-amber-200"><Star className="h-3 w-3 fill-current" />{movie.vote_average.toFixed(1)}</span> : null}
        </p>
      </Link>
    </motion.article>
  );
}
