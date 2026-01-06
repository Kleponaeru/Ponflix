import { fetchMangaByType } from "@/services/mangaService";
import { MangaListItem } from "@/types/manga-list";
import { useEffect, useState } from "react";

// hooks/useMangaCategory.ts
export function useMangaCategory(type?: string) {
  const [data, setData] = useState<MangaListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!type) return;

    setLoading(true);
    fetchMangaByType(type)
      .then(setData)
      .finally(() => setLoading(false));
  }, [type]);

  return { data, loading };
}
