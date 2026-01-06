import { MangaListItem } from "@/types/manga-list";
import { normalizeManga } from "@/utils/normalizeManga";

export async function fetchMangaByType(
  type: string,
  maxPages = 10,
  options?: { signal?: AbortSignal }
) {
  let page = 1;
  let all: MangaListItem[] = [];

  const endpoint =
    type === "ongoing"
      ? `?status=ongoing&page=`
      : type === "completed"
      ? `?status=completed&page=`
      : `?type=${type}&page=`;

  while (page <= maxPages) {
    const res = await fetch(
      `https://ponmics-api.necode.id/Comics-API/api.php${endpoint}${page}`,
      { signal: options?.signal }
    );

    if (!res.ok) {
      throw new Error(`Failed to fetch page ${page}`);
    }

    const json = await res.json();

    if (!json?.data?.komik?.length) break;

    all.push(...normalizeManga(json.data.komik));
    page++;
  }

  return all;
}
