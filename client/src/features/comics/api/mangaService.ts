import type { MangaListItem } from "@/features/comics/types/manga-list";
import type { MangaChapter } from "@/features/comics/types/manga";
import { normalizeManga } from "@/features/comics/utils/normalizeManga";
import { extractSlug } from "@/features/comics/utils/extractSlug";

const API_BASE_URL = "https://ponflix-comics-api.vercel.app/api.php";
const CHAPTER_CACHE_TTL = 5 * 60 * 1000;
const chapterCache = new Map<
  string,
  { chapters: MangaChapter[]; expiresAt: number }
>();

export async function fetchFirstChapterSlug(
  mangaId: string
): Promise<string | undefined> {
  const res = await fetch(`${API_BASE_URL}?komik=${encodeURIComponent(mangaId)}`);
  if (!res.ok) return undefined;

  const json = await res.json();
  const chapterLink = json?.data?.chapter_awal?.link_chapter;
  return chapterLink ? extractSlug(chapterLink) : undefined;
}

export async function fetchMangaChapters(
  mangaId: string,
  signal?: AbortSignal
): Promise<MangaChapter[]> {
  if (signal?.aborted) throw new DOMException("The request was aborted.", "AbortError");

  const cached = chapterCache.get(mangaId);
  if (cached && cached.expiresAt > Date.now()) return cached.chapters;
  if (cached) chapterCache.delete(mangaId);

  const response = await fetch(
    `${API_BASE_URL}?komik=${encodeURIComponent(mangaId)}`,
    { signal }
  );
  if (!response.ok) throw new Error("Comic chapters could not be loaded.");

  const json = await response.json();
  const chapters = json?.data?.daftar_chapter;
  if (!Array.isArray(chapters)) return [];

  const mappedChapters = chapters
    .map((chapter: any) => ({
      title: chapter.judul_chapter || "Untitled chapter",
      slug: extractSlug(chapter.link_chapter),
      releasedAt: chapter.waktu_rilis || "",
    }))
    .filter((chapter: MangaChapter) => chapter.slug !== "unknown");

  if (!signal?.aborted) {
    chapterCache.set(mangaId, {
      chapters: mappedChapters,
      expiresAt: Date.now() + CHAPTER_CACHE_TTL,
    });
  }

  return mappedChapters;
}

export async function fetchMangaByType(
  type: string,
  maxPages = 10,
  options?: {
    signal?: AbortSignal;
    onFirstPage?: (items: MangaListItem[]) => void;
  }
) {
  const baseParams = new URLSearchParams(
    type === "ongoing"
      ? { status: "ongoing" }
      : type === "completed"
        ? { status: "completed" }
        : { type }
  );

  const fetchPage = async (page: number) => {
    const params = new URLSearchParams(baseParams);
    params.set("page", String(page));
    const res = await fetch(`${API_BASE_URL}?${params}`, {
      signal: options?.signal,
    });
    if (!res.ok) throw new Error(`Failed to fetch page ${page}`);

    const json = await res.json();
    return {
      items: Array.isArray(json?.data?.komik)
        ? normalizeManga(json.data.komik)
        : [],
      totalPages: Number(json?.data?.total_halaman) || maxPages,
    };
  };

  const firstPage = await fetchPage(1);
  const all = [...firstPage.items];
  options?.onFirstPage?.(firstPage.items);

  const lastPage = Math.min(maxPages, firstPage.totalPages);
  const pagesPerBatch = 3;
  for (let start = 2; start <= lastPage; start += pagesPerBatch) {
    const pageNumbers = Array.from(
      { length: Math.min(pagesPerBatch, lastPage - start + 1) },
      (_, index) => start + index
    );
    const batch = await Promise.all(pageNumbers.map(fetchPage));
    batch.forEach(({ items }) => all.push(...items));
  }

  return all;
}
