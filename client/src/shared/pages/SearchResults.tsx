import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { LoaderCircle, Search } from "lucide-react";
import { searchAnime } from "@/features/anime/api/animeService";
import AnimeCard from "@/features/anime/components/AnimeCard";
import { searchMangaTitles } from "@/features/comics/api/mangaService";
import MangaCard from "@/features/comics/components/cards/MangaCard";
import type { AnimeTitle } from "@/features/anime/types/anime";
import type { MangaListItem } from "@/features/comics/types/manga-list";

interface Props {
  scope: "all" | "comics";
}

const comicCategories = ["Manhwa", "Manhua", "Manga"] as const;

function categoryForComic(type?: string) {
  const normalized = type?.toLowerCase() || "";
  if (normalized.includes("manhwa")) return "Manhwa";
  if (normalized.includes("manhua")) return "Manhua";
  return "Manga";
}

export default function SearchResults({ scope }: Props) {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q")?.trim() || "";
  const [anime, setAnime] = useState<AnimeTitle[]>([]);
  const [comics, setComics] = useState<MangaListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!query) {
      setAnime([]);
      setComics([]);
      setLoading(false);
      setError("");
      return;
    }

    const controller = new AbortController();
    setAnime([]);
    setComics([]);
    setLoading(true);
    setError("");

    const load = async () => {
      if (scope === "all") {
        const [animeResult, comicsResult] = await Promise.allSettled([
          searchAnime(query, controller.signal),
          searchMangaTitles(query, controller.signal),
        ]);
        if (controller.signal.aborted) return;
        if (animeResult.status === "fulfilled") setAnime(animeResult.value);
        if (comicsResult.status === "fulfilled") setComics(comicsResult.value);
        if (animeResult.status === "rejected" && comicsResult.status === "rejected") {
          setError("Search is unavailable right now. Please try again.");
        }
      } else {
        const [comicsResult] = await Promise.allSettled([
          searchMangaTitles(query, controller.signal),
        ]);
        if (controller.signal.aborted) return;
        if (comicsResult.status === "fulfilled") setComics(comicsResult.value);
        else setError("Comic search is unavailable right now. Please try again.");
      }
    };

    void load().finally(() => {
      if (!controller.signal.aborted) setLoading(false);
    });

    return () => controller.abort();
  }, [query, scope]);

  const hasResults = anime.length > 0 || comics.length > 0;
  const comicsByCategory = comics.reduce<Record<(typeof comicCategories)[number], MangaListItem[]>>(
    (groups, comic) => {
      groups[categoryForComic(comic.type)].push(comic);
      return groups;
    },
    { Manhwa: [], Manhua: [], Manga: [] }
  );

  return (
    <main className="min-h-[70vh] bg-[#08090b] px-4 pb-16 pt-28 text-white md:px-8">
      <div className="content-shell">
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#ff6670]">
          {scope === "all" ? "Ponflix search" : "Comics collection"}
        </p>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          {query ? <>Results for <span className="text-white/55">“{query}”</span></> : "Search titles"}
        </h1>

        {loading ? (
          <div className="mt-10 flex items-center gap-2 text-sm text-white/50">
            <LoaderCircle className="h-4 w-4 animate-spin" /> Searching titles…
          </div>
        ) : error && !hasResults ? (
          <p role="alert" className="mt-8 rounded-xl border border-red-500/20 bg-red-500/[0.06] p-5 text-sm text-white/70">
            {error}
          </p>
        ) : hasResults ? (
          <div className="mt-8 space-y-10">
            {anime.length > 0 && (
              <section aria-labelledby="anime-search-results">
                <div className="mb-4 flex items-end justify-between gap-4">
                  <h2 id="anime-search-results" className="text-xl font-semibold">Anime</h2>
                  <span className="text-xs text-white/40">{anime.length} titles</span>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                  {anime.map((item, index) => (
                    <AnimeCard key={item.slug} anime={item} index={index} layout="grid" />
                  ))}
                </div>
              </section>
            )}
            {comics.length > 0 && (
              <section className="space-y-9" aria-label="Comic search results">
                {comicCategories.map((category) => {
                  const categoryComics = comicsByCategory[category];
                  if (!categoryComics.length) return null;

                  return (
                    <section key={category} aria-labelledby={`search-${category.toLowerCase()}-results`}>
                      <div className="mb-4 flex items-end justify-between gap-4">
                        <h2 id={`search-${category.toLowerCase()}-results`} className="text-xl font-semibold">{category}</h2>
                        <span className="text-xs text-white/40">{categoryComics.length} titles</span>
                      </div>
                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                        {categoryComics.map((item, index) => (
                          <MangaCard key={item.id} manga={item} index={index} layout="grid" />
                        ))}
                      </div>
                    </section>
                  );
                })}
              </section>
            )}
            {error && <p className="text-sm text-white/45">{error}</p>}
          </div>
        ) : (
          <div className="mt-8 rounded-xl border border-white/[0.08] bg-white/[0.025] px-5 py-14 text-center">
            <Search className="mx-auto h-6 w-6 text-white/30" />
            <p className="mt-3 text-sm text-white/55">
              {query ? "No titles matched your search." : "Enter a title in the search bar above."}
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
