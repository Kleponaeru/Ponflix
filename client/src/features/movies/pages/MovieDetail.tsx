import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowUpRight, Clock3, Play, Star } from "lucide-react";
import MovieCard from "@/features/movies/components/MovieCard";
import {
  fetchMovieCredits,
  fetchMovieDetails,
  fetchMovieProviders,
  fetchMovieRecommendations,
  movieImage,
  movieYear,
} from "@/features/movies/api/movieService";
import type { Movie, MoviePerson, MovieProviderRegion, MovieVideo } from "@/features/movies/types/movie";

function formatRuntime(minutes?: number | null) {
  if (!minutes) return "Runtime unavailable";
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return hours ? `${hours}h ${remainder}m` : `${remainder}m`;
}

function PersonCard({ person }: { person: MoviePerson }) {
  return (
    <article className="flex min-w-0 items-center gap-3 rounded-xl border border-white/[0.07] bg-white/[0.025] p-3">
      <img
        src={person.profile_path ? movieImage(person.profile_path, "w185") : "/placeholder.svg"}
        alt=""
        loading="lazy"
        className="h-12 w-12 shrink-0 rounded-lg bg-white/5 object-cover"
        onError={(event) => { event.currentTarget.src = "/placeholder.svg"; }}
      />
      <div className="min-w-0">
        <p className="truncate text-xs font-semibold text-white">{person.name}</p>
        <p className="mt-1 truncate text-[11px] text-white/45">{person.character || "Cast"}</p>
      </div>
    </article>
  );
}

function ProviderSection({ providers }: { providers: { region: string; data: MovieProviderRegion } | null }) {
  const regionName = providers?.region === "ID" ? "Indonesia" : providers?.region ?? "region";
  const availability = providers?.data;
  const groups = [
    ["Subscription", availability?.flatrate],
    ["Free", availability?.free],
    ["With ads", availability?.ads],
    ["Rent", availability?.rent],
    ["Buy", availability?.buy],
  ] as const;
  const hasProviders = groups.some(([, items]) => (items?.length ?? 0) > 0);

  return (
    <section className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5">
      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40">Where to watch · {regionName}</p>
      {hasProviders ? (
        <div className="mt-4 space-y-4">
          {groups.filter(([, items]) => (items?.length ?? 0) > 0).map(([label, items]) => (
            <div key={label}>
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/40">{label}</p>
              <div className="flex flex-wrap gap-2">
                {items?.slice(0, 6).map((provider) => (
                  <span key={provider.provider_id} title={provider.provider_name} className="inline-flex items-center gap-2 rounded-lg border border-white/[0.08] bg-black/20 px-2.5 py-2 text-xs text-white/75">
                    {provider.logo_path ? <img src={movieImage(provider.logo_path, "w92")} alt="" className="h-5 w-5 rounded object-cover" /> : null}
                    {provider.provider_name}
                  </span>
                ))}
              </div>
            </div>
          ))}
          {availability?.link ? <a href={availability.link} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 pt-1 text-xs font-semibold text-white/65 transition hover:text-white">View all availability <ArrowUpRight className="h-3.5 w-3.5" /></a> : null}
        </div>
      ) : <p className="mt-3 text-sm leading-6 text-white/45">No availability was listed for Indonesia.</p>}
      <p className="mt-4 border-t border-white/[0.07] pt-3 text-[10px] leading-4 text-white/30">Streaming availability by JustWatch via TMDB. Availability links open TMDB.</p>
    </section>
  );
}

export default function MovieDetail() {
  const { id = "" } = useParams();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [cast, setCast] = useState<MoviePerson[]>([]);
  const [recommendations, setRecommendations] = useState<Movie[]>([]);
  const [providers, setProviders] = useState<{ region: string; data: MovieProviderRegion } | null>(null);
  const [trailer, setTrailer] = useState<MovieVideo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    setLoading(true);
    setError("");
    setMovie(null);
    setCast([]);
    setRecommendations([]);
    setProviders(null);
    setTrailer(null);

    const load = async () => {
      try {
        const details = await fetchMovieDetails(id, controller.signal);
        if (!active) return;
        setMovie(details);
        setTrailer(
          details.videos?.results?.find((video) => video.site === "YouTube" && video.type === "Trailer") ??
          details.videos?.results?.find((video) => video.site === "YouTube") ?? null,
        );

        const settled = <T,>(promise: Promise<T>) => promise.then(
          (data) => ({ ok: true as const, data }),
          () => ({ ok: false as const, data: null }),
        );
        const [creditsResult, recommendationsResult, providersResult] = await Promise.all([
          settled(fetchMovieCredits(id, controller.signal)),
          settled(fetchMovieRecommendations(id, controller.signal)),
          settled(fetchMovieProviders(id, controller.signal)),
        ]);
        if (!active) return;
        if (creditsResult.ok) setCast(creditsResult.data.cast ?? []);
        if (recommendationsResult.ok) {
          setRecommendations(recommendationsResult.data.results ?? []);
        }
        if (providersResult.ok) {
          const regions = providersResult.data.results ?? {};
          const region = regions.ID ? "ID" : regions.US ? "US" : Object.keys(regions)[0];
          setProviders(region ? { region, data: regions[region] } : null);
        }
      } catch (cause) {
        if (active && (cause as Error).name !== "AbortError") {
          setError(cause instanceof Error ? cause.message : "Could not load this movie.");
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    void load();
    return () => {
      active = false;
      controller.abort();
    };
  }, [id]);

  if (loading) {
    return (
      <main className="content-shell min-h-[75vh] animate-pulse py-28">
        <div className="h-[28rem] rounded-3xl bg-white/[0.05]" />
        <div className="mt-10 h-6 w-48 rounded bg-white/[0.05]" />
        <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-5">
          {Array.from({ length: 5 }, (_, index) => <div key={index} className="aspect-[2/3] rounded-xl bg-white/[0.05]" />)}
        </div>
      </main>
    );
  }

  if (!movie || error) {
    return (
      <main className="content-shell flex min-h-[70vh] items-center justify-center pt-24 text-center">
        <div className="max-w-lg rounded-2xl border border-white/[0.08] bg-white/[0.025] p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#ff6670]">Movie unavailable</p>
          <h1 className="mt-3 text-2xl font-semibold">We couldn’t load this title.</h1>
          <p className="mt-2 text-sm leading-6 text-white/45">{error || "The movie may have been removed or the ID is invalid."}</p>
          <Link to="/movies" className="mt-6 inline-flex h-10 items-center gap-2 rounded-lg bg-white px-4 text-sm font-semibold text-black"><ArrowLeft className="h-4 w-4" /> Back to movies</Link>
        </div>
      </main>
    );
  }

  const backdrop = movie.backdrop_path ? movieImage(movie.backdrop_path, "original") : "";

  return (
    <main className="min-h-screen overflow-hidden bg-[#08090b] pb-16 text-white">
      <section className="relative isolate min-h-[34rem] overflow-hidden pb-10 pt-28 sm:min-h-[39rem] sm:pb-14">
        {backdrop ? <img src={backdrop} alt="" className="absolute inset-0 -z-30 h-full w-full object-cover object-center" /> : null}
        <div className="absolute inset-0 -z-20 bg-gradient-to-t from-[#08090b] via-[#08090b]/80 to-[#08090b]/45" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#08090b] via-[#08090b]/70 to-transparent" />
        <div className="content-shell flex min-h-[34rem] flex-col justify-end sm:min-h-[39rem]">
          <Link to="/movies" className="mb-auto inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-black/30 px-4 py-2 text-sm text-white/80 backdrop-blur transition hover:border-white/30 hover:text-white"><ArrowLeft className="h-4 w-4" /> All movies</Link>
          <div className="grid gap-8 md:grid-cols-[12rem_1fr] md:items-end lg:grid-cols-[15rem_1fr]">
            <div className="hidden md:block">
              <img src={movieImage(movie.poster_path)} alt={`${movie.title} poster`} className="aspect-[2/3] w-full rounded-2xl bg-white/5 object-cover shadow-2xl shadow-black/60" />
            </div>
            <div className="max-w-4xl">
              <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#ff6670]">Movie <span className="px-1.5 text-white/30">/</span> TMDB</p>
              <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-6xl">{movie.title}</h1>
              {movie.tagline ? <p className="mt-3 text-lg italic text-white/65">“{movie.tagline}”</p> : null}
              <div className="mt-5 flex flex-wrap items-center gap-2.5 text-sm text-white/70">
                <span className="rounded-full border border-white/15 bg-black/20 px-3 py-1.5">{movieYear(movie.release_date)}</span>
                <span className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-black/20 px-3 py-1.5"><Clock3 className="h-3.5 w-3.5" />{formatRuntime(movie.runtime)}</span>
                {movie.vote_average ? <span className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-black/20 px-3 py-1.5 text-amber-200"><Star className="h-3.5 w-3.5 fill-current" />{movie.vote_average.toFixed(1)} / 10</span> : null}
                {movie.genres?.map((genre) => <span key={genre.id} className="rounded-full border border-white/15 bg-black/20 px-3 py-1.5">{genre.name}</span>)}
              </div>
              <p className="mt-6 max-w-3xl text-sm leading-7 text-white/70 sm:text-base">{movie.overview || "No synopsis is available for this movie yet."}</p>
              <div className="mt-7 flex flex-wrap gap-3">
                {trailer ? <a href={`https://www.youtube.com/watch?v=${encodeURIComponent(trailer.key)}`} target="_blank" rel="noreferrer" className="inline-flex h-11 items-center gap-2 rounded-lg bg-white px-5 text-sm font-semibold text-black transition hover:bg-white/85"><Play className="h-4 w-4 fill-current" /> Watch trailer</a> : null}
                {providers?.data.link ? <a href={providers.data.link} target="_blank" rel="noreferrer" className="inline-flex h-11 items-center gap-2 rounded-lg border border-white/20 bg-black/20 px-5 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/10">Where to watch <ArrowUpRight className="h-4 w-4" /></a> : null}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="content-shell mt-10 grid gap-12 lg:grid-cols-[1fr_19rem]">
        <div className="space-y-12">
          {trailer ? (
            <section aria-labelledby="trailer-title">
              <div className="mb-4 flex items-end justify-between gap-4"><div><p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#e50914]">Preview</p><h2 id="trailer-title" className="text-2xl font-semibold">Official trailer</h2></div><a href={`https://www.youtube.com/watch?v=${encodeURIComponent(trailer.key)}`} target="_blank" rel="noreferrer" className="text-xs font-medium text-white/55 hover:text-white">Open on YouTube ↗</a></div>
              <div className="aspect-video overflow-hidden rounded-2xl border border-white/[0.08] bg-black shadow-2xl shadow-black/30"><iframe className="h-full w-full" src={`https://www.youtube-nocookie.com/embed/${encodeURIComponent(trailer.key)}`} title={`${movie.title} official trailer`} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen /></div>
            </section>
          ) : null}

          {cast.length ? (
            <section aria-labelledby="cast-title">
              <div className="mb-5"><p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#e50914]">The people</p><h2 id="cast-title" className="text-2xl font-semibold">Top cast</h2></div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">{cast.slice(0, 12).map((person) => <PersonCard key={person.id} person={person} />)}</div>
            </section>
          ) : null}

          {recommendations.length ? (
            <section aria-labelledby="recommendations-title">
              <div className="mb-5"><p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#e50914]">Keep exploring</p><h2 id="recommendations-title" className="text-2xl font-semibold">You might also like</h2></div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-7 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">{recommendations.slice(0, 10).map((item, index) => <MovieCard key={item.id} movie={item} index={index} />)}</div>
            </section>
          ) : null}
        </div>

        <aside className="space-y-4">
          <section className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40">Movie details</p>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between gap-4"><dt className="text-white/40">Release date</dt><dd className="text-right text-white/80">{movie.release_date || "TBA"}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-white/40">Runtime</dt><dd className="text-right text-white/80">{formatRuntime(movie.runtime)}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-white/40">Rating</dt><dd className="text-right text-white/80">{movie.vote_average ? `${movie.vote_average.toFixed(1)} / 10` : "—"}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-white/40">TMDB ID</dt><dd className="font-mono text-xs text-white/70">{movie.id}</dd></div>
            </dl>
          </section>
          <ProviderSection providers={providers} />
          <p className="px-2 text-[10px] leading-4 text-white/30">Movie metadata and images provided by TMDB.</p>
        </aside>
      </div>
    </main>
  );
}
