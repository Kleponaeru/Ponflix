// types/manga-detail.ts
export interface MangaDetail {
  id: string;
  title: string;
  imageUrl: string;

  rating: number | null;
  votes: string | null;

  status: string;
  type: string;

  author: string | null;
  illustrator: string | null;

  genres: {
    name: string;
    slug: string;
  }[];

  description: string;

  chapters: {
    title: string;
    slug: string;
    releasedAt: string;
  }[];
}
