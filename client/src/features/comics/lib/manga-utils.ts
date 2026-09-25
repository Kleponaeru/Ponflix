export function titleFromLink(link: string): string {
  const cleaned = link
    .replace("/komik/", "")
    .replace(/-/g, " ")
    .replace(/\//g, "")
    .trim();

  // Convert to Title Case
  return cleaned.replace(/\b\w/g, (char) => char.toUpperCase());
}
