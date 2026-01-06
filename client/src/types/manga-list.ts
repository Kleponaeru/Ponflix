export interface MangaListItem {
  id: string;
  title: string;
  imageUrl: string;

  type: string; // Manga / Manhwa / Manhua

  status: "Colored" | "Black & White";
  isColored: boolean;

  latestChapter?: {
    title: string;
    slug: string;
    releasedAt?: string;
  };
}
