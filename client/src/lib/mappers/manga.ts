import type { Manga } from "@/types/manga";

export function mapMangaDetail(data: any): Manga {
  return {
    id: data.id,
    title: data.judul,
    imageUrl: data.gambar,

    rating: data.rating ? Number(data.rating) : null,
    year: data.tahun ? Number(data.tahun) : null,
    episodes: data.episode ? Number(data.episode) : null,

    genre: data.genre ?? "",
    status: data.status ?? "",
    tipe: data.tipe ?? "",
    description: data.sinopsis ?? "",
  };
}
