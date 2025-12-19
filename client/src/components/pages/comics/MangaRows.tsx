"use client";

import { useState, useEffect, JSX } from "react";
import MangaRow from "./MangaRow";
import { AlertCircle, RefreshCw } from "lucide-react";
import { MangaListItem } from "@/types/manga-list";
import { mapMangaList } from "@/lib/mappers/manga-list";

type MangaData = {
  manga: MangaListItem[];
  manhwa: MangaListItem[];
  manhua: MangaListItem[];
};

export default function MangaRows(): JSX.Element {
  const [mangaData, setMangaData] = useState<MangaData>({
    manga: [],
    manhwa: [],
    manhua: [],
  });

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const apiBaseUrl = "http://localhost/comics-api";

  const loadMangas = async (): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${apiBaseUrl}/api.php?latest=1&page=1`, {
        headers: { Accept: "application/json" },
      });

      if (response.status === 429) {
        throw new Error("Rate limit exceeded. Please wait a moment.");
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      if (!data?.status || !data?.data?.komik) {
        throw new Error(data?.message || "Failed to fetch manga list");
      }

      const mappedMangas: MangaListItem[] = data.data.komik.map(mapMangaList);

      setMangaData({
        manga: mappedMangas.filter((m) => m.type === "Manga"),
        manhwa: mappedMangas.filter((m) => m.type === "Manhwa"),
        manhua: mappedMangas.filter((m) => m.type === "Manhua"),
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
      setMangaData({ manga: [], manhwa: [], manhua: [] });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMangas();
  }, []);

  // ❌ ERROR STATE
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
            onClick={loadMangas}
            className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 text-white font-semibold rounded-md hover:bg-red-700"
          >
            <RefreshCw className="w-5 h-5" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // ✅ NORMAL UI
  return (
    <div className="py-6 px-4 md:px-12">
      <MangaRow
        title="Latest Manga"
        mangas={mangaData.manga}
        accentColor="red"
        genreId="manga"
        isLoading={loading}
      />

      <MangaRow
        title="Latest Manhwa"
        mangas={mangaData.manhwa}
        accentColor="red"
        genreId="manhwa"
        isLoading={loading}
      />

      <MangaRow
        title="Latest Manhua"
        mangas={mangaData.manhua}
        accentColor="red"
        genreId="manhua"
        isLoading={loading}
      />
    </div>
  );
}
