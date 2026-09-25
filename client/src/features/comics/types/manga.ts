export interface MangaChapter {
  title: string;
  slug: string;
  releasedAt: string;
}

export interface MangaGenre {
  name: string;
  slug: string;
}

export interface Manga {
  id: string;
  title: string;
  imageUrl: string;

  rating: number | null;
  votes: string | null;

  status: string;
  type: string;

  author: string | null;
  illustrator: string | null;
  alternativeTitles: string[];

  genres: MangaGenre[];

  description: string;

  firstChapter?: MangaChapter | null;
  latestChapter?: MangaChapter | null;

  chapters: MangaChapter[];
  spoilerImages: string[];
}
