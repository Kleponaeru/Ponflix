import type { MangaListItem } from "@/features/comics/types/manga-list";
import { normalizeManga } from "@/features/comics/utils/normalizeManga";
import { extractSlug } from "@/features/comics/utils/extractSlug";

const API_BASE_URL = "https://ponmics-api.necode.id/Comics-API/api.php";

export async function fetchFirstChapterSlug(
  mangaId: string
): Promise<string | undefined> {
  const res = await fetch(`${API_BASE_URL}?komik=${encodeURIComponent(mangaId)}`);
  if (!res.ok) return undefined;

  const json = await res.json();
  const chapterLink = json?.data?.chapter_awal?.link_chapter;
  return chapterLink ? extractSlug(chapterLink) : undefined;
}

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
      `${API_BASE_URL}${endpoint}${page}`,
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
