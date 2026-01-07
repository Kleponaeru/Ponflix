"use client";

import { JSX } from "react";
import MangaRow from "./MangaRow/MangaRow";
import MangaHeroBanner from "./BannerManga";
import { AlertCircle, RefreshCw } from "lucide-react";
import { useLatestMangas } from "@/hooks/useLatestMangas";

export default function MangaRows(): JSX.Element {
  const { data, loading, error, reload, apiBaseUrl } = useLatestMangas();

  if (error && !loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-6">
          <AlertCircle className="w-16 h-16 text-red-600 mx-auto" />
          <h2 className="text-2xl font-bold text-white">
            Oops! Something went wrong
          </h2>
          <p className="text-gray-400">{error}</p>

          <button
            onClick={reload}
            className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 text-white font-semibold rounded-md hover:bg-red-700"
          >
            <RefreshCw className="w-5 h-5" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <MangaHeroBanner
        apiUrl={`${apiBaseUrl}/api.php`}
        autoPlayInterval={5000}
        maxItems={5}
      />

      <div className="py-6 px-4 md:px-12">
        <MangaRow
          title="Latest Manga"
          mangas={data.manga}
          isLoading={loading}
        />
        <MangaRow
          title="Latest Manhwa"
          mangas={data.manhwa}
          isLoading={loading}
        />
        <MangaRow
          title="Latest Manhua"
          mangas={data.manhua}
          isLoading={loading}
        />
      </div>
    </>
  );
}
