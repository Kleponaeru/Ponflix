/** Build equivalent query forms so punctuation and spacing differences still match. */
export function searchQueryVariants(query: string): string[] {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const spaced = trimmed
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
  const hyphenated = spaced.replace(/\s+/g, "-");

  return [...new Set([trimmed, spaced, hyphenated].filter(Boolean))];
}
