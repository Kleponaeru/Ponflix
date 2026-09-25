import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  BookOpen,
  CalendarDays,
  ChevronRight,
  Clock3,
  LoaderCircle,
  Play,
  Search,
  Star,
} from "lucide-react";
import type { Manga } from "@/features/comics/types/manga";
import { mapMangaDetail } from "@/features/comics/lib/mappers/manga";
import { parseIndoTimeAgo } from "@/features/comics/utils/timeAgo";
import { extractSlug } from "@/features/comics/utils/extractSlug";

export default function MangaDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [manga, setManga] = useState<Manga | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [chapterSearch, setChapterSearch] = useState("");

  useEffect(() => {
    if (!id) return;
    const controller = new AbortController();

    const fetchManga = async () => {
      setLoading(true);
      setError(false);
      try {
        const response = await fetch(
          `https://ponmics-api.necode.id/Comics-API/api.php?komik=${encodeURIComponent(id)}`,
          { signal: controller.signal }
        );
        if (!response.ok) throw new Error("Manga details could not be loaded.");
        const json = await response.json();
        if (!json?.status || !json?.data) throw new Error("Manga was not found.");
        setManga(mapMangaDetail(json.data));
      } catch (fetchError) {
        if ((fetchError as Error).name !== "AbortError") {
          setError(true);
          setManga(null);
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    fetchManga();
    return () => controller.abort();
  }, [id]);

  const filteredChapters = useMemo(() => {
    const query = chapterSearch.trim().toLowerCase();
    if (!query) return manga?.chapters ?? [];
    return (manga?.chapters ?? []).filter((chapter) =>
      chapter.title.toLowerCase().includes(query)
    );
  }, [chapterSearch, manga?.chapters]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#08090b] pt-[4.25rem]">
        <div className="content-shell grid min-h-[34rem] items-center gap-10 py-12 md:grid-cols-[16rem_1fr]">
          <div className="mx-auto aspect-[2/3] w-52 animate-pulse rounded-2xl bg-white/[0.06] md:w-full" />
          <div className="space-y-4">
            <div className="h-4 w-32 animate-pulse rounded bg-white/[0.06]" />
            <div className="h-12 w-3/4 animate-pulse rounded bg-white/[0.06]" />
            <div className="h-20 max-w-xl animate-pulse rounded bg-white/[0.04]" />
          </div>
        </div>
      </main>
    );
  }

  if (error || !manga) {
    return (
      <main className="content-shell flex min-h-[70vh] flex-col items-center justify-center pt-16 text-center">
        <BookOpen className="h-10 w-10 text-[#e50914]" />
        <h1 className="mt-5 text-2xl font-semibold text-white">We couldn’t find that title.</h1>
        <p className="mt-2 max-w-sm text-sm leading-6 text-white/55">
          The details may be temporarily unavailable. Head back and try another comic.
        </p>
        <button
          type="button"
          onClick={() => navigate("/comics")}
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-white/85"
        >
          <ArrowLeft className="h-4 w-4" />
          Browse comics
        </button>
      </main>
    );
  }

  const status = manga.status === "Berjalan" ? "Ongoing" : manga.status || "Unknown";
  const openChapter = (chapterSlug?: string) => {
    if (id && chapterSlug) navigate(`/comics/${id}/chapter/${extractSlug(chapterSlug)}`);
  };

  return (
    <main className="min-h-screen bg-[#08090b] pb-16 pt-[4.25rem]">
      <section className="relative isolate overflow-hidden border-b border-white/[0.06]">
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <img
            src={manga.imageUrl || "/LY-logo.png"}
            alt=""
            className="h-full w-full scale-110 object-cover object-center opacity-20 blur-2xl"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#08090b] via-[#08090b]/90 to-[#08090b]/55" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#08090b] via-transparent to-[#08090b]/50" />
        </div>

        <div className="content-shell grid gap-8 py-10 sm:py-14 md:min-h-[34rem] md:grid-cols-[15rem_minmax(0,1fr)] md:items-center md:gap-12 md:py-16">
          <div className="mx-auto w-44 shrink-0 sm:w-52 md:w-full">
            <div className="aspect-[2/3] overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-2xl shadow-black/50">
              <img
                src={manga.imageUrl || "/LY-logo.png"}
                alt={`${manga.title} cover`}
                className="h-full w-full object-cover"
              />
            </div>
          </div>

          <div className="min-w-0 text-center md:text-left">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="mb-6 inline-flex items-center gap-2 text-xs font-medium text-white/55 transition hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" /> Back to browsing
            </button>

            <div className="mb-4 flex flex-wrap items-center justify-center gap-2 md:justify-start">
              <span className="rounded-md bg-[#e50914] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-white">
                Ponflix comics
              </span>
              <span className="rounded-md border border-white/15 bg-black/20 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/75">
                {manga.type}
              </span>
              {manga.genres.slice(0, 2).map((genre) => (
                <span
                  key={genre.slug}
                  className="rounded-md border border-white/15 bg-black/20 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/75"
                >
                  {genre.name}
                </span>
              ))}
            </div>

            <h1 className="max-w-5xl text-3xl font-bold leading-tight tracking-[-0.035em] text-white sm:text-4xl md:text-5xl lg:text-6xl">
              {manga.title}
            </h1>

            <div className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm text-white/65 md:justify-start">
              {manga.rating && (
                <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-300">
                  <Star className="h-4 w-4 fill-current" /> {manga.rating.toFixed(1)}
                </span>
              )}
              <span className="inline-flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> {status}
              </span>
              {manga.author && <span>By {manga.author}</span>}
              {manga.votes && <span>{manga.votes}</span>}
            </div>

            <p className="mt-5 max-w-4xl text-sm leading-7 text-white/70 sm:text-base">
              {manga.description || "No description available."}
            </p>

            {manga.alternativeTitles.length > 0 && (
              <p className="mt-3 text-xs text-white/40">
                Also known as {manga.alternativeTitles.slice(0, 2).join(" · ")}
              </p>
            )}

            <div className="mt-7 flex flex-wrap justify-center gap-3 md:justify-start">
              {manga.firstChapter && (
                <button
                  type="button"
                  onClick={() => openChapter(manga.firstChapter?.slug)}
                  className="inline-flex min-h-12 items-center gap-2 rounded-lg bg-white px-5 text-sm font-bold text-black transition hover:bg-white/85"
                >
                  <BookOpen className="h-4 w-4" /> Read first chapter
                </button>
              )}
              {manga.latestChapter && (
                <button
                  type="button"
                  onClick={() => openChapter(manga.latestChapter?.slug)}
                  className="inline-flex min-h-12 items-center gap-2 rounded-lg bg-white/15 px-5 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/25"
                >
                  <Play className="h-4 w-4 fill-current" /> Latest chapter
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="content-shell mt-10 sm:mt-14" aria-labelledby="chapter-list-title">
        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#e50914]">
              Start reading
            </p>
            <h2 id="chapter-list-title" className="text-xl font-semibold tracking-tight text-white sm:text-2xl">
              Chapters <span className="ml-1 text-base font-normal text-white/40">({manga.chapters.length})</span>
            </h2>
          </div>
          <label className="flex h-10 w-full items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-3 sm:max-w-xs">
            <Search className="h-4 w-4 shrink-0 text-white/40" />
            <input
              value={chapterSearch}
              onChange={(event) => setChapterSearch(event.target.value)}
              placeholder="Find a chapter"
              aria-label="Find a chapter"
              className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/35"
            />
          </label>
        </div>

        {filteredChapters.length ? (
          <div className="overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.025]">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-4 border-b border-white/[0.07] px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/35 sm:px-5">
              <span>Chapter</span>
              <span>Updated</span>
            </div>
            <div className="max-h-[34rem] overflow-y-auto">
              {filteredChapters.map((chapter) => (
                <button
                  type="button"
                  key={chapter.slug}
                  onClick={() => openChapter(chapter.slug)}
                  className="group grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-4 border-b border-white/[0.05] px-4 py-3.5 text-left transition last:border-0 hover:bg-white/[0.055] sm:px-5"
                >
                  <span className="flex min-w-0 items-center gap-3">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white/[0.05] text-white/45 transition group-hover:bg-[#e50914] group-hover:text-white">
                      <BookOpen className="h-4 w-4" />
                    </span>
                    <span className="truncate text-sm font-medium text-white/85 group-hover:text-white">
                      {chapter.title}
                    </span>
                  </span>
                  <span className="flex items-center gap-1.5 whitespace-nowrap text-xs text-white/40">
                    <Clock3 className="hidden h-3.5 w-3.5 sm:block" />
                    {chapter.releasedAt ? parseIndoTimeAgo(chapter.releasedAt) : "—"}
                    <ChevronRight className="ml-1 h-4 w-4 text-white/25 transition group-hover:translate-x-0.5 group-hover:text-white/70" />
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-white/[0.08] bg-white/[0.025] px-5 py-12 text-center">
            <CalendarDays className="mx-auto h-6 w-6 text-white/30" />
            <p className="mt-3 text-sm text-white/55">No chapters match that search.</p>
          </div>
        )}
      </section>
    </main>
  );
}
