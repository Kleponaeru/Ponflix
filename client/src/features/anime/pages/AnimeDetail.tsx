import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, BookOpen, ChevronLeft, ChevronRight, Play, RotateCw, Search, Star } from "lucide-react";
import { fetchAnimeDetails, fetchAnimeEpisodes } from "@/features/anime/api/animeService";
import type { AnimeDetails, AnimeEpisode } from "@/features/anime/types/anime";

const EPISODES_PER_PAGE = 24;

export default function AnimeDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [anime, setAnime] = useState<AnimeDetails | null>(null);
  const [episodes, setEpisodes] = useState<AnimeEpisode[]>([]);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [showFullSynopsis, setShowFullSynopsis] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!slug) return;
    const controller = new AbortController();
    setLoading(true);
    setError(false);
    setAnime(null);
    setEpisodes([]);
    setShowFullSynopsis(false);

    Promise.all([
      fetchAnimeDetails(slug, controller.signal),
      fetchAnimeEpisodes(slug, controller.signal).catch((episodeError) => {
        if ((episodeError as Error).name === "AbortError") throw episodeError;
        return [];
      }),
    ])
      .then(([details, animeEpisodes]) => {
        setAnime(details);
        setEpisodes(animeEpisodes);
      })
      .catch((loadError) => {
        if ((loadError as Error).name !== "AbortError") setError(true);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [slug]);

  const filteredEpisodes = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return normalized
      ? episodes.filter((episode) => episode.title.toLowerCase().includes(normalized))
      : episodes;
  }, [episodes, query]);
  const pageCount = Math.ceil(filteredEpisodes.length / EPISODES_PER_PAGE);
  const visibleEpisodes = filteredEpisodes.slice((page - 1) * EPISODES_PER_PAGE, page * EPISODES_PER_PAGE);

  useEffect(() => setPage(1), [query, slug]);

  if (loading) {
    return (
      <main className="content-shell grid min-h-[75vh] items-center gap-8 pt-20 md:grid-cols-[15rem_minmax(0,1fr)]">
        <div className="mx-auto aspect-[2/3] w-48 animate-pulse rounded-2xl bg-white/[0.06] md:w-full" />
        <div className="space-y-4"><div className="h-10 w-3/4 animate-pulse rounded bg-white/[0.06]" /><div className="h-24 max-w-2xl animate-pulse rounded bg-white/[0.04]" /></div>
      </main>
    );
  }

  if (error || !anime) {
    return (
      <main className="content-shell flex min-h-[75vh] items-center justify-center pt-20 text-center">
        <div>
          <h1 className="text-2xl font-semibold">Anime details couldn’t load.</h1>
          <p className="mt-2 text-sm text-white/55">The series may be unavailable right now.</p>
          <Link to="/anime" className="mt-5 inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-black"><ArrowLeft className="h-4 w-4" /> Browse anime</Link>
        </div>
      </main>
    );
  }

  const newestEpisode = episodes[episodes.length - 1];
  const changePage = (nextPage: number) => {
    setPage(nextPage);
    document.getElementById("anime-episodes")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <main className="min-h-screen bg-[#08090b] pb-16 pt-[4.25rem] text-white">
      <section className="relative isolate overflow-hidden border-b border-white/[0.06]">
        <img src={anime.thumbnail} alt="" className="absolute inset-0 -z-20 h-full w-full scale-110 object-cover opacity-20 blur-2xl" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#08090b] via-[#08090b]/90 to-[#08090b]/55" />
        <div className="content-shell grid gap-8 py-10 sm:py-14 md:min-h-[34rem] md:grid-cols-[15rem_minmax(0,1fr)] md:items-center md:gap-12 md:py-16">
          <img src={anime.thumbnail} alt={`${anime.title} poster`} className="mx-auto aspect-[2/3] w-44 rounded-2xl border border-white/10 object-cover shadow-2xl sm:w-52 md:w-full" />
          <div className="min-w-0 text-center md:text-left">
            <Link to="/anime" className="mb-6 inline-flex items-center gap-2 text-xs font-medium text-white/55 transition hover:text-white"><ArrowLeft className="h-4 w-4" /> Back to anime</Link>
            <div className="mb-4 flex flex-wrap justify-center gap-2 md:justify-start">
              <span className="rounded-md bg-[#e50914] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em]">Ponflix anime</span>
              {anime.type && <span className="rounded-md border border-white/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/75">{anime.type}</span>}
              {anime.status && <span className="rounded-md border border-white/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/75">{anime.status}</span>}
              {anime.quality && <span className="rounded-md border border-white/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/75">{anime.quality}</span>}
            </div>
            <h1 className="text-3xl font-bold leading-tight tracking-[-0.035em] sm:text-4xl md:text-5xl lg:text-6xl">{anime.title}</h1>
            <div className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-2 text-sm text-white/65 md:justify-start">
              {anime.score != null && <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-300"><Star className="h-4 w-4 fill-current" /> {Number(anime.score).toFixed(1)}</span>}
              {anime.aired && <span>{anime.aired}</span>}
              {anime.duration && <span>{anime.duration}</span>}
              {anime.totalEpisodes && <span>{anime.totalEpisodes} episodes</span>}
            </div>
            <div className="mt-5 max-w-4xl">
              <p
                id="anime-synopsis"
                className={`text-sm leading-7 text-white/70 sm:text-base ${showFullSynopsis ? "" : "line-clamp-4"}`}
              >
                {anime.synopsis || "No synopsis available."}
              </p>
              {anime.synopsis && anime.synopsis.length > 180 && (
                <button
                  type="button"
                  aria-expanded={showFullSynopsis}
                  aria-controls="anime-synopsis"
                  onClick={() => setShowFullSynopsis((expanded) => !expanded)}
                  className="mt-1 text-sm font-semibold text-white/60 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e50914] focus-visible:ring-offset-2 focus-visible:ring-offset-[#08090b]"
                >
                  {showFullSynopsis ? "See less" : "See more"}
                </button>
              )}
            </div>
            {anime.japaneseTitle && anime.japaneseTitle !== anime.title && <p className="mt-3 text-xs text-white/40">Also known as {anime.japaneseTitle}</p>}
            {!!anime.genres?.length && <div className="mt-4 flex flex-wrap justify-center gap-2 md:justify-start">{anime.genres.map((genre) => <span key={genre} className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/55">{genre}</span>)}</div>}
            {newestEpisode && <Link to={`/anime/${anime.slug}/episode/${newestEpisode.slug}`} className="mt-7 inline-flex min-h-12 items-center gap-2 rounded-lg bg-white px-5 text-sm font-bold text-black transition hover:bg-white/85"><Play className="h-4 w-4 fill-current" /> Watch latest episode</Link>}
          </div>
        </div>
      </section>

      <section id="anime-episodes" className="content-shell mt-10 scroll-mt-24 sm:mt-14" aria-labelledby="episodes-title">
        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div><p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#e50914]">Start watching</p><h2 id="episodes-title" className="text-xl font-semibold sm:text-2xl">Episodes <span className="ml-1 text-base font-normal text-white/40">({episodes.length})</span></h2></div>
          <label className="flex h-10 w-full items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-3 sm:max-w-xs"><Search className="h-4 w-4 shrink-0 text-white/40" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Find an episode" aria-label="Find an episode" className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-white/35" /></label>
        </div>

        {visibleEpisodes.length ? <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">{visibleEpisodes.map((episode) => <Link key={episode.slug} to={`/anime/${anime.slug}/episode/${episode.slug}`} className="group flex min-h-14 items-center justify-between gap-3 rounded-xl border border-white/[0.07] bg-white/[0.025] px-4 transition hover:border-white/15 hover:bg-white/[0.06]"><span className="flex min-w-0 items-center gap-3"><span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white/[0.05] text-white/45 transition group-hover:bg-[#e50914] group-hover:text-white"><Play className="ml-0.5 h-3.5 w-3.5 fill-current" /></span><span className="truncate text-sm font-medium text-white/80 group-hover:text-white">{episode.title}</span></span><ChevronRight className="h-4 w-4 shrink-0 text-white/30 transition group-hover:translate-x-0.5 group-hover:text-white/70" /></Link>)}</div> : <div className="rounded-xl border border-white/[0.08] bg-white/[0.025] px-5 py-12 text-center"><BookOpen className="mx-auto h-6 w-6 text-white/30" /><p className="mt-3 text-sm text-white/55">{episodes.length ? "No episodes match that search." : "No episodes are available yet."}</p></div>}

        {pageCount > 1 && <nav aria-label="Episode pages" className="mt-8 flex items-center justify-center gap-2"><button type="button" onClick={() => changePage(page - 1)} disabled={page === 1} aria-label="Previous page" className="grid h-10 w-10 place-items-center rounded-lg border border-white/10 text-white/70 transition hover:bg-white/10 disabled:opacity-30"><ChevronLeft className="h-4 w-4" /></button><span className="px-3 text-xs tabular-nums text-white/50">Page {page} of {pageCount}</span><button type="button" onClick={() => changePage(page + 1)} disabled={page === pageCount} aria-label="Next page" className="grid h-10 w-10 place-items-center rounded-lg border border-white/10 text-white/70 transition hover:bg-white/10 disabled:opacity-30"><ChevronRight className="h-4 w-4" /></button></nav>}
      </section>
    </main>
  );
}
