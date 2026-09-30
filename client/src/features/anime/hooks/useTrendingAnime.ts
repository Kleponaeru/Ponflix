import { useEffect, useState } from "react";
import { fetchTrendingAnime } from "@/features/anime/api/animeService";
import type { AnimeTitle } from "@/features/anime/types/anime";

export function useTrendingAnime() {
  const [anime, setAnime] = useState<AnimeTitle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    fetchTrendingAnime(controller.signal)
      .then(setAnime)
      .catch((error) => {
        if ((error as Error).name !== "AbortError") setAnime([]);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, []);

  return { anime, loading };
}
