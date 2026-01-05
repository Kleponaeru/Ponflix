// src/utils/title.ts

/**
 * Generate a readable title from a manga link slug
 */
export function titleFromLink(link?: string): string {
  if (!link) return "Unknown Title";

  return link
    .replace("/komik/", "")
    .replace(/\//g, "")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Truncate title by character length
 */
export function truncateTitle(title: string, maxLength = 60): string {
  if (!title) return title;
  return title.length > maxLength
    ? title.slice(0, maxLength).trim() + "…"
    : title;
}

/**
 * Truncate title by word count (better for manga titles)
 */
export function truncateWords(title: string, maxWords = 7): string {
  if (!title) return title;
  const words = title.split(" ");
  return words.length > maxWords
    ? words.slice(0, maxWords).join(" ") + "…"
    : title;
}

/**
 * Normalize title from API (handles 'Tidak ada judul')
 */
export function normalizeTitle(
  judul?: string,
  link?: string,
  maxWords = 20
): string {
  const baseTitle =
    judul && !judul.toLowerCase().includes("tidak ada")
      ? judul
      : titleFromLink(link);

  return truncateWords(baseTitle, maxWords);
}
