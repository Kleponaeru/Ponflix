export function extractSlug(link?: string): string {
  if (!link) return "unknown";

  // example: /komik/one-piece/
  const komikMatch = link.split("/komik/")[1];
  if (komikMatch) {
    return komikMatch.replace(/\//g, "");
  }

  // fallback: take last segment
  return link.split("/").filter(Boolean).pop() || "unknown";
}
