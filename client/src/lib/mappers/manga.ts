import { Manga } from "@/types/manga";

export function cleanTitle(raw: string): string {
  return raw
    .replace(/^Komik\s+/i, "") // remove "Komik "
    .replace(/\s+/g, " ") // normalize spaces
    .trim();
}

export function mapMangaDetail(api: any): Manga {
  return {
    id: api.id,
    title: cleanTitle(api.judul),
    imageUrl: api.gambar,

    rating: api.rating ? Number(api.rating) : null,
    votes: api.votes ?? null,

    status: api.detail?.status ?? "-",
    type: api.detail?.jenis_komik ?? "-",
    author: api.detail?.pengarang ?? null,
    illustrator: api.detail?.ilustrator ?? null,

    genres: (api.genre ?? []).map((g: any) => ({
      name: g.nama,
      slug: g.link,
    })),

    description: api.desk ?? "",

    alternativeTitles: api.detail?.judul_alternatif
      ? api.detail.judul_alternatif.split(",").map((t: string) => t.trim())
      : [],

    firstChapter: api.chapter_awal
      ? {
          title: api.chapter_awal.judul_chapter,
          slug: api.chapter_awal.link_chapter,
          releasedAt: "Unknown",
        }
      : undefined,

    latestChapter: api.chapter_terbaru
      ? {
          title: api.chapter_terbaru.judul_chapter,
          slug: api.chapter_terbaru.link_chapter,
          releasedAt: "Unknown",
        }
      : undefined,

    chapters: (api.daftar_chapter ?? []).map((c: any) => ({
      title: c.judul_chapter,
      slug: c.link_chapter,
      releasedAt: c.waktu_rilis,
    })),

    spoilerImages: api.chapter_spoiler ?? [],
  };
}
