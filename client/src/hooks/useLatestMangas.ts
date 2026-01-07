import { useEffect, useState } from "react";
import { MangaListItem } from "@/types/manga-list";
import { mapMangaList } from "@/lib/mappers/manga-list";

export type MangaData = {
  manga: MangaListItem[];
  manhwa: MangaListItem[];
  manhua: MangaListItem[];
};

const API_BASE_URL = "https://ponmics-api.necode.id/Comics-API";

export function useLatestMangas() {
  const [data, setData] = useState<MangaData>({
    manga: [],
    manhwa: [],
    manhua: [],
  });

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const load = async (): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE_URL}/api.php?latest=1&page=1`, {
        headers: { Accept: "application/json" },
      });

      if (res.status === 429) {
        throw new Error("Rate limit exceeded. Please wait a moment.");
      }

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const json: {
        status: boolean;
        data?: { komik?: unknown[] };
        message?: string;
      } = await res.json();

      if (!json.status || !Array.isArray(json.data?.komik)) {
        throw new Error(json.message || "Invalid API response");
      }

      const mapped: MangaListItem[] = json.data.komik.map(
        (item): MangaListItem => mapMangaList(item)
      );

      setData({
        manga: mapped.filter((m: MangaListItem) => m.type === "Manga"),
        manhwa: mapped.filter((m: MangaListItem) => m.type === "Manhwa"),
        manhua: mapped.filter((m: MangaListItem) => m.type === "Manhua"),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      setData({ manga: [], manhwa: [], manhua: [] });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return {
    data,
    loading,
    error,
    reload: load,
    apiBaseUrl: API_BASE_URL,
  };
}
