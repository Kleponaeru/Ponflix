import { MangaListItem } from "@/types/manga-list";
import { normalizeTitle } from "@/utils/title";

const extractSlug = (link?: string): string => {
  if (!link) return "unknown";
  return (
    link.split("/komik/")[1]?.replace(/\//g, "") ||
    link.split("/").filter(Boolean).pop() ||
    "unknown"
  );
};

export function normalizeManga(apiManga: any[]): MangaListItem[] {
  return apiManga.map((manga) => {
    const isColored = manga.warna === "Warna";

    return {
      id: extractSlug(manga.link),
      title: normalizeTitle(manga.judul, manga.link, 7),
      imageUrl: manga.gambar || "/placeholder.svg",

      type: manga.tipe || "Manga",
      status: manga.status || "Unknown",
      isColored,

      latestChapter: manga.chapter?.[0]
        ? {
            title: manga.chapter[0].judul_chapter,
            slug: extractSlug(manga.chapter[0].link),
            releasedAt: manga.chapter[0].tanggal || "",
          }
        : undefined,
    };
  });
}
