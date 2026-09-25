import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { BookOpen, ChevronLeft, ChevronRight, RotateCw, Search } from "lucide-react";
import { fetchMangaByType } from "@/features/comics/api/mangaService";
import type { MangaListItem } from "@/features/comics/types/manga-list";
import { normalizeTitle } from "@/features/comics/utils/title";
import MangaCard from "@/features/comics/components/cards/MangaCard";

const ITEMS_PER_PAGE = 20;

function titleForType(type?: string) {
  if (!type) return "Comics";
  if (type.toLowerCase() === "ongoing") return "Ongoing comics";
  if (type.toLowerCase() === "completed") return "Completed comics";
  return `Explore ${normalizeTitle(undefined, type, 3)}`;
}

function CategorySkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5 lg:gap-5" aria-hidden="true">
      {Array.from({ length: 10 }).map((_, index) => (
        <div key={index}>
          <div className="aspect-[2/3] animate-pulse rounded-xl bg-white/[0.06]" />
          <div className="mt-3 h-3 w-3/4 animate-pulse rounded bg-white/[0.06]" />
          <div className="mt-2 h-3 w-1/2 animate-pulse rounded bg-white/[0.04]" />
        </div>
      ))}
    </div>
  );
}

export default function CategoriesManga() {
  const { type } = useParams<{ type: string }>();
  const [mangas, setMangas] = useState<MangaListItem[]>([]);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [reloadKey, setReloadKey] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!type) return;
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    fetchMangaByType(type, 10, { signal: controller.signal })
      .then((results) => {
        setMangas(results);
        setPage(1);
      })
      .catch((fetchError) => {
        if (fetchError.name !== "AbortError") {
          setError("We couldn’t load this collection. Please try again.");
          setMangas([]);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [type, reloadKey]);

  const filteredMangas = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return mangas;
    return mangas.filter((manga) =>
      manga.title.toLowerCase().includes(normalizedQuery)
    );
  }, [mangas, query]);

  const pageCount = Math.ceil(filteredMangas.length / ITEMS_PER_PAGE);
  const visibleMangas = filteredMangas.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  useEffect(() => setPage(1), [query]);

  const title = titleForType(type);
  const changePage = (nextPage: number) => {
    setPage(nextPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <main className="min-h-screen bg-[#08090b] px-4 pb-16 pt-[5.75rem] text-white md:px-8">
      <div className="content-shell">
        <section className="relative isolate mb-8 overflow-hidden rounded-2xl border border-white/[0.07] bg-[#111216] px-5 py-8 sm:px-8 sm:py-10 md:px-12">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_85%_5%,rgba(229,9,20,0.22),transparent_48%),linear-gradient(115deg,#1b1013,#111216_58%,#0c0d10)]" />
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#ff6670]">
            Browse the library
          </p>
          <h1 className="flex items-center gap-3 text-3xl font-bold tracking-tight sm:text-4xl">
            <BookOpen className="h-6 w-6 shrink-0 text-[#e50914]" />
            {title}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/60 sm:text-base">
            Find your next series from the Ponflix collection. Browse recent releases and discover a new world to get lost in.
          </p>
        </section>

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm font-medium">
            <Link to="/comics" className="text-white/50 transition hover:text-white">
              Comics
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-white/30" />
            <span className="text-white">{title}</span>
          </nav>
          <label className="flex h-11 w-full items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-3 transition focus-within:border-white/25 sm:max-w-sm">
            <Search className="h-4 w-4 shrink-0 text-white/40" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search this collection"
              aria-label="Search this collection"
              className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/35"
            />
          </label>
        </div>

        {!loading && !error && (
          <p className="mb-5 text-xs text-white/45">
            {filteredMangas.length} {filteredMangas.length === 1 ? "title" : "titles"}
            {query && ` matching “${query}”`}
          </p>
        )}

        {loading ? (
          <CategorySkeleton />
        ) : error ? (
          <div className="rounded-xl border border-red-500/20 bg-red-500/[0.06] px-5 py-10 text-center">
            <p className="text-sm text-white/70">{error}</p>
            <button
              type="button"
              onClick={() => setReloadKey((key) => key + 1)}
              className="mt-4 inline-flex h-10 items-center gap-2 rounded-lg border border-white/15 px-4 text-sm font-medium transition hover:bg-white/10"
            >
              <RotateCw className="h-4 w-4" /> Try again
            </button>
          </div>
        ) : visibleMangas.length ? (
          <motion.div
            key={`${type}-${page}`}
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { staggerChildren: 0.025 } },
            }}
            className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5 lg:gap-5"
          >
            {visibleMangas.map((manga, index) => (
              <motion.div
                key={manga.id}
                variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
              >
                <MangaCard manga={manga} index={index} layout="grid" />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="rounded-xl border border-white/[0.08] bg-white/[0.025] px-5 py-14 text-center">
            <Search className="mx-auto h-6 w-6 text-white/30" />
            <p className="mt-3 text-sm text-white/55">No titles match this search.</p>
          </div>
        )}

        {pageCount > 1 && (
          <nav aria-label="Collection pages" className="mt-10 flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => changePage(page - 1)}
              disabled={page === 1}
              aria-label="Previous page"
              className="grid h-10 w-10 place-items-center rounded-lg border border-white/10 text-white/70 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="px-3 text-xs tabular-nums text-white/50">Page {page} of {pageCount}</span>
            <button
              type="button"
              onClick={() => changePage(page + 1)}
              disabled={page === pageCount}
              aria-label="Next page"
              className="grid h-10 w-10 place-items-center rounded-lg border border-white/10 text-white/70 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </nav>
        )}
      </div>
    </main>
  );
}
