import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { searchAnime } from "@/features/anime/api/animeService";
import type { AnimeTitle } from "@/features/anime/types/anime";

function getSeriesSearchTerm(slug: string) {
  const title = slug.replace(/[-_]+/g, " ").trim();
  const suffix = /\b(?:season(?:\s+\d+)?|s\d+|part(?:\s+\d+)?|specials?|ova|ona|movie|film|reawakening|recap|compilation)\b/i;
  const match = suffix.exec(title);
  return (match ? title.slice(0, match.index) : title).trim();
}

function normalize(value: string) {
  return value.toLocaleLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function filterRelatedTitles(results: AnimeTitle[], currentSlug: string, query: string) {
  const normalizedQuery = normalize(query);
  return results.filter((anime) => {
    if (anime.slug === currentSlug) return false;
    const searchableTitle = normalize(`${anime.title} ${anime.slug.replace(/-/g, " ")}`);
    return searchableTitle.includes(normalizedQuery);
  });
}

export default function RelatedAnimeRow({ currentSlug }: { currentSlug: string }) {
  const [relatedAnime, setRelatedAnime] = useState<AnimeTitle[]>([]);
  const searchTerm = getSeriesSearchTerm(currentSlug);

  useEffect(() => {
    if (!searchTerm) return;
    const controller = new AbortController();
    setRelatedAnime([]);

    const loadRelatedAnime = async () => {
      try {
        const results = await searchAnime(searchTerm, controller.signal);
        let matches = filterRelatedTitles(results, currentSlug, searchTerm);

        // Some catalog entries use only the Japanese franchise name in search indexing.
        // Retry with its first two words when the full English title has no matches.
        const fallbackTerm = searchTerm.split(/\s+/).slice(0, 2).join(" ");
        if (!matches.length && fallbackTerm && fallbackTerm !== searchTerm) {
          const fallbackResults = await searchAnime(fallbackTerm, controller.signal);
          matches = filterRelatedTitles(fallbackResults, currentSlug, fallbackTerm);
        }

        if (!controller.signal.aborted) setRelatedAnime(matches.slice(0, 8));
      } catch (error) {
        if ((error as Error).name !== "AbortError") setRelatedAnime([]);
      }
    };

    loadRelatedAnime();

    return () => controller.abort();
  }, [currentSlug, searchTerm]);

  if (!relatedAnime.length) return null;

  return (
    <section className="mt-9" aria-labelledby="related-anime-title">
      <div className="mb-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#ff6670]">
          More to explore
        </p>
        <h2 id="related-anime-title" className="mt-1 text-xl font-semibold sm:text-2xl">
          More in this series
        </h2>
      </div>
      <div className="flex flex-wrap gap-2">
        {relatedAnime.map((anime) => (
          <Link
            key={anime.slug}
            to={`/anime/${anime.slug}`}
            className="inline-flex min-h-10 max-w-full items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white/80 transition-colors hover:border-[#e50914]/50 hover:bg-[#e50914]/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e50914]"
          >
            <span className="truncate">{anime.title}</span>
            {anime.type && (
              <span className="shrink-0 rounded-full bg-white/[0.08] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white/50">
                {anime.type}
              </span>
            )}
          </Link>
        ))}
      </div>
    </section>
  );
}
