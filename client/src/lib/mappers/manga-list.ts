import type { MangaListItem } from "@/types/manga-list";

const cleanTitle = (raw: string): string =>
  raw
    .replace(/^Komik\s+/i, "")
    .replace(/\s+/g, " ")
    .trim();

const extractTitleFromLink = (link: string): string => {
  const slug =
    link
      .replace(/^\/|\/$/g, "")
      .split("/")
      .pop() ?? "unknown";

  return slug
    .replace(/^\d+-/, "")
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
};

export function mapMangaList(api: any): MangaListItem {
  const isColored = api.warna === "Warna";

  return {
    id: String(api.link.split("/").filter(Boolean).pop()),

    title:
      api.judul && api.judul !== "Tidak ada judul"
        ? cleanTitle(api.judul)
        : extractTitleFromLink(api.link),

    imageUrl: api.gambar,
    type: api.tipe,
    status: isColored ? "Colored" : "B&W",
    isColored,

    latestChapter: api.chapter?.[0]
      ? {
          title: api.chapter[0].judul,
          slug: api.chapter[0].link.replace(/^\/|\/$/g, ""),
          releasedAt: api.chapter[0].tanggal_rilis,
        }
      : undefined,
  };
}
