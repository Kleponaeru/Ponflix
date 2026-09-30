import { AlertCircle, RotateCw } from "lucide-react";
import { useLatestMangas } from "@/features/comics/hooks/useLatestMangas";
import MangaHeroBanner from "./BannerManga";
import MangaRow from "@/features/comics/components/rows/MangaRow";
import LatestAnimeShelf from "@/features/anime/components/LatestAnimeShelf";

export default function MangaRows() {
  const { data, loading, error, reload } = useLatestMangas();

  return (
    <main className="overflow-hidden bg-[#08090b] pb-16">
      <MangaHeroBanner
        featured={data.featured}
        isLoading={loading}
        error={error}
        onRetry={reload}
      />

      <div className="relative z-10 mt-6 space-y-9 pb-8 sm:mt-8 sm:space-y-12 md:mt-10 md:space-y-14">
        {error && !loading && (
          <div className="content-shell flex flex-col gap-4 rounded-xl border border-red-500/20 bg-red-500/[0.06] p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-400" />
              <div>
                <p className="text-sm font-medium text-white">We couldn’t load the shelves.</p>
                <p className="mt-1 text-xs text-white/55">{error}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={reload}
              className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg border border-white/15 px-4 text-sm font-medium text-white transition hover:bg-white/10"
            >
              <RotateCw className="h-4 w-4" />
              Retry
            </button>
          </div>
        )}

        <MangaRow title="Latest manga" mangas={data.manga} isLoading={loading} />
        <MangaRow title="Latest manhwa" mangas={data.manhwa} isLoading={loading} />
        <MangaRow title="Latest manhua" mangas={data.manhua} isLoading={loading} />
      </div>

      <LatestAnimeShelf />
    </main>
  );
}
