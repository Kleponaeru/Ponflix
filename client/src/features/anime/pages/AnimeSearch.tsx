import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search } from "lucide-react";
import { searchAnime } from "@/features/anime/api/animeService";
import AnimeCard from "@/features/anime/components/AnimeCard";
import type { AnimeTitle } from "@/features/anime/types/anime";

export default function AnimeSearch() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q")?.trim() || "";
  const [results, setResults] = useState<AnimeTitle[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!query) {
      setResults([]);
      setLoading(false);
      setError("");
      return;
    }
    const controller = new AbortController();
    setLoading(true);
    setError("");
    searchAnime(query, controller.signal)
      .then(setResults)
      .catch((searchError) => {
        if ((searchError as Error).name !== "AbortError") {
          setError("Search is unavailable. Please try again.");
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [query]);

  return (
    <main className="min-h-screen bg-[#08090b] px-4 pb-16 pt-28 text-white md:px-8">
      <div className="content-shell">
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#ff6670]">Anime collection</p>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          {query ? <>Results for <span className="text-white/55">“{query}”</span></> : "Discover anime"}
        </h1>
        {loading ? (
          <p className="mt-8 text-sm text-white/50">Searching anime…</p>
        ) : error ? (
          <p role="alert" className="mt-8 rounded-xl border border-red-500/20 bg-red-500/[0.06] p-5 text-sm text-white/70">{error}</p>
        ) : results.length ? (
          <>
            <p className="mb-5 mt-4 text-xs text-white/45">{results.length} titles found</p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {results.map((item, index) => <AnimeCard key={item.slug} anime={item} index={index} layout="grid" />)}
            </div>
          </>
        ) : (
          <div className="mt-8 rounded-xl border border-white/[0.08] bg-white/[0.025] px-5 py-14 text-center">
            <Search className="mx-auto h-6 w-6 text-white/30" />
            <p className="mt-3 text-sm text-white/55">{query ? "No anime matched your search." : "Search for a series from the bar above."}</p>
          </div>
        )}
      </div>
    </main>
  );
}
