import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  LoaderCircle,
  MonitorPlay,
  Play,
  Search,
} from "lucide-react";
import {
  fetchAnimeEpisodes,
  fetchEpisodePlayback,
} from "@/features/anime/api/animeService";
import type { AnimeEpisode, AnimePlayback } from "@/features/anime/types/anime";

const EPISODES_PER_PAGE = 24;

function safeHttpsUrl(value?: string | null) {
  if (!value) return "";
  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url.toString() : "";
  } catch {
    return "";
  }
}

export default function AnimeWatch() {
  const { slug = "", episodeSlug = "" } = useParams<{
    slug: string;
    episodeSlug: string;
  }>();
  const [playback, setPlayback] = useState<AnimePlayback | null>(null);
  const [selectedServer, setSelectedServer] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [episodes, setEpisodes] = useState<AnimeEpisode[]>([]);
  const [episodesLoading, setEpisodesLoading] = useState(true);
  const [episodesError, setEpisodesError] = useState(false);
  const [episodeQuery, setEpisodeQuery] = useState("");
  const [episodePage, setEpisodePage] = useState(1);

  // Fetch the series list once per anime, independently of playback changes.
  useEffect(() => {
    if (!slug) return;
    const controller = new AbortController();
    setEpisodes([]);
    setEpisodeQuery("");
    setEpisodePage(1);
    setEpisodesLoading(true);
    setEpisodesError(false);

    fetchAnimeEpisodes(slug, controller.signal)
      .then(setEpisodes)
      .catch((loadError) => {
        if ((loadError as Error).name !== "AbortError") setEpisodesError(true);
      })
      .finally(() => {
        if (!controller.signal.aborted) setEpisodesLoading(false);
      });

    return () => controller.abort();
  }, [slug]);

  useEffect(() => {
    if (!episodeSlug) return;
    const controller = new AbortController();
    setPlayback(null);
    setSelectedServer("");
    setLoading(true);
    setError(false);

    fetchEpisodePlayback(episodeSlug, controller.signal)
      .then((data) => {
        setPlayback(data);
        setSelectedServer(data.servers?.[0]?.url || data.iframe || "");
      })
      .catch((loadError) => {
        if ((loadError as Error).name !== "AbortError") setError(true);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [episodeSlug]);

  const playerUrl = useMemo(
    () => safeHttpsUrl(selectedServer || playback?.iframe),
    [playback?.iframe, selectedServer]
  );
  const filteredEpisodes = useMemo(() => {
    const query = episodeQuery.trim().toLocaleLowerCase();
    if (!query) return episodes;
    return episodes.filter((episode) =>
      `${episode.title} ${episode.number}`.toLocaleLowerCase().includes(query)
    );
  }, [episodeQuery, episodes]);
  const episodePageCount = Math.ceil(filteredEpisodes.length / EPISODES_PER_PAGE);
  const visibleEpisodes = filteredEpisodes.slice(
    (episodePage - 1) * EPISODES_PER_PAGE,
    episodePage * EPISODES_PER_PAGE
  );

  useEffect(() => {
    if (episodeQuery) {
      setEpisodePage(1);
      return;
    }
    const currentIndex = episodes.findIndex((episode) => episode.slug === episodeSlug);
    if (currentIndex >= 0) {
      setEpisodePage(Math.floor(currentIndex / EPISODES_PER_PAGE) + 1);
    }
  }, [episodeSlug, episodeQuery, episodes]);

  return (
    <main className="min-h-screen bg-[#08090b] px-4 pb-14 pt-24 text-white md:px-8">
      <div className="content-shell">
        <Link
          to={`/anime/${slug}`}
          className="mb-5 inline-flex items-center gap-2 text-sm text-white/55 transition hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" /> Back to series
        </Link>

        <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#ff6670]">
              Now playing
            </p>
            <h1 className="mt-1 text-xl font-semibold sm:text-2xl">
              {playback?.title || episodeSlug.replace(/-/g, " ")}
            </h1>
          </div>
          {!!playback?.servers?.length && (
            <label className="flex items-center gap-2 text-xs text-white/50">
              Server
              <select
                value={selectedServer}
                onChange={(event) => setSelectedServer(event.target.value)}
                className="h-10 max-w-[min(18rem,65vw)] rounded-lg border border-white/10 bg-[#17181c] px-3 text-sm text-white outline-none focus-visible:ring-2 focus-visible:ring-[#e50914]"
              >
                {playback.servers.map((server, index) => (
                  <option
                    key={`${server.provider}-${server.value}-${index}`}
                    value={server.url}
                  >
                    {server.name || server.quality || `Server ${index + 1}`}
                  </option>
                ))}
              </select>
            </label>
          )}
        </div>

        <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-black shadow-2xl shadow-black/40">
          {loading ? (
            <div className="flex aspect-video items-center justify-center">
              <LoaderCircle className="h-8 w-8 animate-spin text-white/50" />
            </div>
          ) : error ? (
            <div className="flex aspect-video flex-col items-center justify-center px-4 text-center">
              <MonitorPlay className="h-8 w-8 text-white/35" />
              <p className="mt-3 text-sm text-white/60">
                This episode&apos;s player couldn&apos;t be loaded.
              </p>
            </div>
          ) : playerUrl && playback?.playbackAvailable !== false ? (
            <iframe
              title={playback?.title || "Anime episode player"}
              src={playerUrl}
              referrerPolicy="no-referrer"
              allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
              allowFullScreen
              className="aspect-video w-full bg-black"
            />
          ) : (
            <div className="flex aspect-video flex-col items-center justify-center px-4 text-center">
              <MonitorPlay className="h-8 w-8 text-white/35" />
              <p className="mt-3 text-sm text-white/60">
                No playable source is available for this episode.
              </p>
              {playback?.iframe && (
                <a
                  href={safeHttpsUrl(playback.iframe)}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-flex items-center gap-2 text-sm text-white/70 underline underline-offset-4 hover:text-white"
                >
                  Try the source directly <ExternalLink className="h-4 w-4" />
                </a>
              )}
            </div>
          )}
        </div>
        <p className="mt-3 text-xs leading-5 text-white/40">
          If playback doesn&apos;t start, try another available server.
        </p>

        <section
          className="mt-10 border-t border-white/10 pt-7"
          aria-labelledby="episode-list-title"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#ff6670]">
                Keep watching
              </p>
              <h2 id="episode-list-title" className="mt-1 text-xl font-semibold sm:text-2xl">
                Episodes
              </h2>
              {!episodesLoading && !episodesError && (
                <p className="mt-1 text-sm text-white/45">{episodes.length} episodes</p>
              )}
            </div>
            {!episodesLoading && !episodesError && episodes.length > 0 && (
              <label className="relative block w-full sm:w-64">
                <span className="sr-only">Search episodes</span>
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                <input
                  type="search"
                  value={episodeQuery}
                  onChange={(event) => {
                    setEpisodeQuery(event.target.value);
                    setEpisodePage(1);
                  }}
                  placeholder="Search episodes"
                  className="h-10 w-full rounded-lg border border-white/10 bg-white/[0.04] pl-9 pr-3 text-sm text-white outline-none placeholder:text-white/35 focus-visible:border-white/30 focus-visible:ring-2 focus-visible:ring-[#e50914]/60"
                />
              </label>
            )}
          </div>

          {episodesLoading ? (
            <div className="mt-5 flex items-center gap-2 py-8 text-sm text-white/50">
              <LoaderCircle className="h-4 w-4 animate-spin" /> Loading episodes…
            </div>
          ) : episodesError ? (
            <p className="mt-5 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-6 text-sm text-white/55">
              The episode list couldn&apos;t be loaded. You can still watch using the player above.
            </p>
          ) : episodes.length === 0 ? (
            <p className="mt-5 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-6 text-sm text-white/55">
              No episodes are listed for this series yet.
            </p>
          ) : visibleEpisodes.length === 0 ? (
            <p className="mt-5 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-6 text-sm text-white/55">
              No episodes match &ldquo;{episodeQuery}&rdquo;.
            </p>
          ) : (
            <>
              <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
                {visibleEpisodes.map((episode) => {
                  const isCurrent = episode.slug === episodeSlug;
                  return (
                    <Link
                      key={episode.slug}
                      to={`/anime/${slug}/episode/${episode.slug}`}
                      aria-current={isCurrent ? "page" : undefined}
                      className={`group flex min-h-14 items-center gap-3 rounded-xl border px-3 py-2.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e50914] ${
                        isCurrent
                          ? "border-[#e50914]/50 bg-[#e50914]/10 text-white"
                          : "border-white/[0.08] bg-white/[0.03] text-white/70 hover:border-white/20 hover:bg-white/[0.07] hover:text-white"
                      }`}
                    >
                      <span
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                          isCurrent
                            ? "bg-[#e50914] text-white"
                            : "bg-white/[0.07] text-white/55 group-hover:text-white"
                        }`}
                      >
                        {isCurrent ? (
                          <Play className="h-3.5 w-3.5 fill-current" />
                        ) : (
                          <span className="text-xs font-semibold">{episode.number}</span>
                        )}
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium">
                          {episode.title || `Episode ${episode.number}`}
                        </span>
                        {isCurrent && (
                          <span className="mt-0.5 block text-[10px] font-semibold uppercase tracking-wider text-[#ff6670]">
                            Now playing
                          </span>
                        )}
                      </span>
                    </Link>
                  );
                })}
              </div>

              {episodePageCount > 1 && (
                <nav className="mt-5 flex items-center justify-center gap-3" aria-label="Episode pages">
                  <button
                    type="button"
                    onClick={() => setEpisodePage((page) => Math.max(1, page - 1))}
                    disabled={episodePage <= 1}
                    className="inline-flex h-9 items-center gap-1 rounded-lg border border-white/10 px-3 text-sm text-white/70 transition hover:bg-white/[0.07] hover:text-white disabled:cursor-not-allowed disabled:opacity-35"
                  >
                    <ChevronLeft className="h-4 w-4" /> Previous
                  </button>
                  <span className="text-xs tabular-nums text-white/45">
                    Page {episodePage} of {episodePageCount}
                  </span>
                  <button
                    type="button"
                    onClick={() => setEpisodePage((page) => Math.min(episodePageCount, page + 1))}
                    disabled={episodePage >= episodePageCount}
                    className="inline-flex h-9 items-center gap-1 rounded-lg border border-white/10 px-3 text-sm text-white/70 transition hover:bg-white/[0.07] hover:text-white disabled:cursor-not-allowed disabled:opacity-35"
                  >
                    Next <ChevronRight className="h-4 w-4" />
                  </button>
                </nav>
              )}
            </>
          )}
        </section>
      </div>
    </main>
  );
}
