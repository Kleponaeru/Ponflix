// types/manga-list.ts
export interface MangaListItem {
  id: string;
  title: string;
  imageUrl: string;

  type: string; // Manga / Manhwa / Manhua
  status: string; // Colored / B&W
  isColored: boolean;

  latestChapter?: {
    title: string;
    slug: string;
    releasedAt: string;
  };
}
