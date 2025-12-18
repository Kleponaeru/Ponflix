"use client";

import { useState, useEffect, JSX } from "react";
import MangaRow from "./MangaRow";
import { AlertCircle, RefreshCw } from "lucide-react";
import type { Manga } from "@/types/manga";

type MangaData = {
  manga: Manga[];
  manhwa: Manga[];
  manhua: Manga[];
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

      // Helper to extract title from URL slug
      const extractTitle = (link: string): string => {
        const slug = link.split("/komik/")[1]?.split("/")[0] ?? "";

        return slug
          .split("-")
          .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ");
      };

      const mappedMangas: Manga[] = data.data.komik.map(
        (manga: any): Manga => ({
          id: manga.link.split("/").filter(Boolean).pop() as string,
          title:
            manga.judul === "Tidak ada judul"
              ? extractTitle(manga.link)
              : manga.judul,

          imageUrl: manga.gambar,

          rating:
            manga.rating && manga.rating !== ""
              ? Number.parseFloat(manga.rating)
              : null,

          year:
            manga.tahun && !isNaN(Number(manga.tahun))
              ? Number(manga.tahun)
              : null,

          episodes:
            manga.episode && !isNaN(Number(manga.episode))
              ? Number(manga.episode)
              : null,

          genre: manga.tipe || "Unknown",
          status: manga.warna === "Warna" ? "Colored" : "B&W",
          tipe: manga.tipe || "Unknown",
          description: manga.description || "No description available.",
        })
      );

      const manga = mappedMangas.filter(
        (m) => m.tipe.toLowerCase() === "manga"
      );

      const manhwa = mappedMangas.filter(
        (m) => m.tipe.toLowerCase() === "manhwa"
      );

      const manhua = mappedMangas.filter(
        (m) => m.tipe.toLowerCase() === "manhua"
      );

      setMangaData({ manga, manhwa, manhua });
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

  // ERROR STATE UI
  if (error && !loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-red-600 blur-2xl opacity-20" />
              <AlertCircle
                className="w-16 h-16 text-red-600 relative"
                strokeWidth={1.5}
              />
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-white">
              Oops! Something went wrong
            </h2>
            <p className="text-gray-400">{error}</p>
          </div>

          <button
            onClick={loadMangas}
            disabled={loading}
            className="group relative inline-flex items-center gap-2 px-6 py-3 bg-red-600 text-white font-semibold rounded-md transition-all hover:bg-red-700 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
          >
            <RefreshCw
              className={`w-5 h-5 transition-transform ${
                loading ? "animate-spin" : "group-hover:rotate-180"
              }`}
            />
            <span>{loading ? "Retrying..." : "Try Again"}</span>
          </button>

          <p className="text-gray-600 text-sm">
            Check your connection or try again in a moment
          </p>
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
