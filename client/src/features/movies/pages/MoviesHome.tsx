import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ChevronRight, SlidersHorizontal, Sparkles } from "lucide-react";
import MovieCard from "@/features/movies/components/MovieCard";
import {
  discoverMovies,
  fetchMovieFeed,
  fetchMovieGenres,
  movieImage,
  movieYear,
  searchMovies,
} from "@/features/movies/api/movieService";
import type { Movie, MovieGenre } from "@/features/movies/types/movie";

const feeds = [
  { id: "trending", label: "Trending" },
  { id: "popular", label: "Popular" },
  { id: "now_playing", label: "Now playing" },
  { id: "upcoming", label: "Coming soon" },
  { id: "top_rated", label: "Top rated" },
] as const;

type Feed = (typeof feeds)[number]["id"];

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-7 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {Array.from({ length: 12 }, (_, index) => (
        <div key={index} className="animate-pulse">
          <div className="aspect-[2/3] rounded-xl bg-white/[0.06]" />
          <div className="mt-3 h-3 w-3/4 rounded bg-white/[0.06]" />
          <div className="mt-2 h-3 w-1/2 rounded bg-white/[0.04]" />
        </div>
      ))}
    </div>
  );
}

export default function MoviesHome() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [feed, setFeed] = useState<Feed>("trending");
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [debouncedQuery, setDebouncedQuery] = useState(searchParams.get("q") ?? "");
  const [genreId, setGenreId] = useState("");
  const [genres, setGenres] = useState<MovieGenre[]>([]);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    fetchMovieGenres(controller.signal)
      .then((payload) => setGenres(payload.genres ?? []))
      .catch(() => setGenres([]));
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const nextQuery = searchParams.get("q") ?? "";
    setQuery(nextQuery);
    setDebouncedQuery(nextQuery.trim());
  }, [searchParams]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 300);
    return () => window.clearTimeout(timeout);
  }, [query]);

  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    setLoading(page === 1);
    setLoadingMore(page > 1);
    setError("");

    const load = async () => {
      try {
        if (debouncedQuery) {
          const result = await searchMovies(debouncedQuery, page, controller.signal);
          if (!active) return;
          setMovies((current) => page === 1 ? result.data : [...current, ...result.data]);
          setTotalPages(result.totalPages);
        } else if (genreId) {
          const result = await discoverMovies({ page, genreId: Number(genreId) }, controller.signal);
          if (!active) return;
          setMovies((current) => page === 1 ? result.results : [...current, ...result.results]);
          setTotalPages(result.total_pages);
        } else {
          const result = await fetchMovieFeed(feed, page, controller.signal);
          if (!active) return;
          setMovies((current) => page === 1 ? result.results : [...current, ...result.results]);
          setTotalPages(result.total_pages);
        }
      } catch (cause) {
        if (active && (cause as Error).name !== "AbortError") {
          setError(cause instanceof Error ? cause.message : "Movies are unavailable right now.");
          if (page === 1) setMovies([]);
        }
      } finally {
        if (active) {
          setLoading(false);
          setLoadingMore(false);
        }
      }
    };

    void load();
    return () => {
      active = false;
      controller.abort();
    };
  }, [debouncedQuery, feed, genreId, page]);

  const hasSearch = Boolean(debouncedQuery);
  const featured = !hasSearch && !genreId ? movies[0] : undefined;
  const gridMovies = featured ? movies.slice(1) : movies;
  const heading = hasSearch
    ? `Results for “${debouncedQuery}”`
    : genreId
      ? `${genres.find((genre) => String(genre.id) === genreId)?.name ?? "Genre"} movies`
      : feeds.find((item) => item.id === feed)?.label ?? "Movies";
  const heroImage = movieImage(featured?.backdrop_path, "w1280");

  const updateFeed = (nextFeed: Feed) => {
    setFeed(nextFeed);
    setGenreId("");
    setQuery("");
    setDebouncedQuery("");
    setMovies([]);
    setSearchParams({}, { replace: true });
    setPage(1);
  };

  return (
    <main className="min-h-screen overflow-hidden bg-[#08090b] pb-16 text-white">
      <section className="relative isolate flex min-h-[29rem] items-end overflow-hidden pb-10 pt-28 sm:min-h-[34rem] sm:pb-14">
        {featured && featured.backdrop_path ? (
          <img src={heroImage} alt="" className="absolute inset-0 -z-30 h-full w-full object-cover object-center" />
        ) : null}
        <div className="absolute inset-0 -z-20 bg-gradient-to-t from-[#08090b] via-[#08090b]/65 to-[#08090b]/35" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#08090b] via-[#08090b]/75 to-transparent" />
        <div className="content-shell w-full">
          <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-[0.24em] text-[#ff6670]">
            <Sparkles className="h-3.5 w-3.5" /> Movie collection <span className="text-white/25">/</span> powered by TMDB
          </div>
          <div className="mt-5">
            <div className="max-w-3xl">
              {featured ? (
                <>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/55">Trending this week</p>
                  <h1 className="mt-2 text-4xl font-bold tracking-tight sm:text-6xl">{featured.title}</h1>
                  <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-white/65">
                    <span>{movieYear(featured.release_date)}</span>
                    {featured.vote_average ? <span className="text-amber-200">★ {featured.vote_average.toFixed(1)}</span> : null}
                    {featured.genre_ids?.slice(0, 3).map((id) => <span key={id}>{genres.find((genre) => genre.id === id)?.name}</span>)}
                  </div>
                  <p className="mt-4 line-clamp-3 max-w-2xl text-sm leading-6 text-white/65 sm:text-base">{featured.overview}</p>
                  <Link to={`/movies/${featured.id}`} className="mt-6 inline-flex h-11 items-center gap-2 rounded-lg bg-white px-5 text-sm font-semibold text-black transition hover:bg-white/85">
                    Explore movie <ChevronRight className="h-4 w-4" />
                  </Link>
                </>
              ) : (
                <>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#ff6670]">Ponflix movies</p>
                  <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-6xl">Your next movie night starts here.</h1>
                  <p className="mt-4 max-w-xl text-sm leading-6 text-white/60 sm:text-base">Browse the latest buzz, find a classic, or search the catalog.</p>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="content-shell mt-5" aria-labelledby="movie-results-title">
        <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#e50914]">Explore the catalog</p>
            <h2 id="movie-results-title" className="text-2xl font-semibold tracking-tight sm:text-3xl">{heading}</h2>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex max-w-full gap-1 overflow-x-auto rounded-full border border-white/[0.08] bg-white/[0.025] p-1">
              {feeds.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => updateFeed(item.id)}
                  aria-pressed={!hasSearch && !genreId && feed === item.id}
                  className={`shrink-0 rounded-full px-3.5 py-2 text-xs font-semibold transition ${!hasSearch && !genreId && feed === item.id ? "bg-white text-black" : "text-white/55 hover:text-white"}`}
                >{item.label}</button>
              ))}
            </div>
            <label className="flex h-10 items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.025] px-3 text-xs text-white/45">
              <SlidersHorizontal className="h-3.5 w-3.5" />
              <span className="sr-only">Filter by genre</span>
              <select
                value={genreId}
                onChange={(event) => { setGenreId(event.target.value); setQuery(""); setDebouncedQuery(""); setMovies([]); setSearchParams({}, { replace: true }); setPage(1); }}
                className="max-w-36 bg-transparent text-xs text-white/75 outline-none [&>option]:bg-[#17181c]"
              >
                <option value="">All genres</option>
                {genres.map((genre) => <option key={genre.id} value={genre.id}>{genre.name}</option>)}
              </select>
            </label>
          </div>
        </div>

        {error && <div role="alert" className="mb-5 rounded-xl border border-red-400/20 bg-red-500/[0.06] px-4 py-3 text-sm text-red-200">{error}</div>}
        {loading && movies.length === 0 ? <SkeletonGrid /> : gridMovies.length ? (
          <div className="grid grid-cols-2 gap-x-4 gap-y-7 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {gridMovies.map((movie, index) => <MovieCard key={movie.id} movie={movie} index={index} />)}
          </div>
        ) : !error ? (
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] px-5 py-16 text-center">
            <h3 className="text-lg font-semibold">No movies found</h3>
            <p className="mt-2 text-sm text-white/45">Try another title or choose a different collection.</p>
          </div>
        ) : null}
        {page < totalPages && movies.length > 0 && (
          <div className="mt-10 flex justify-center">
            <button type="button" onClick={() => setPage((current) => current + 1)} disabled={loadingMore} className="rounded-full border border-white/15 bg-white/[0.04] px-6 py-3 text-sm font-semibold text-white transition hover:border-white/30 hover:bg-white/[0.08] disabled:opacity-50">
              {loadingMore ? "Loading more..." : "Load more movies"}
            </button>
          </div>
        )}
      </section>
      <footer className="content-shell mt-16 border-t border-white/[0.08] pt-5 text-xs text-white/35">
        Movie metadata and images provided by TMDB.
      </footer>
    </main>
  );
}
