export interface Manga {
  id: string;
  title: string;
  imageUrl: string;

  rating: number | null;
  year: number | null;
  episodes: number | null;

  genre: string;
  status: string;
  tipe: string;
  description: string;
}
