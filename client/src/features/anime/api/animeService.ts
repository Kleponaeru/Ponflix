import type {
  AnimeDetails,
  AnimeEpisode,
  AnimePlayback,
  AnimeTitle,
} from "@/features/anime/types/anime";

const API_BASE_URL = "/ponflix-anime-api";

async function request<T>(path: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: { Accept: "application/json" },
    signal,
  });
  if (!response.ok) throw new Error(`Anime request failed (${response.status}).`);

  const payload = await response.json();
  if (!payload?.success) throw new Error(payload?.message || "Anime data is unavailable.");
  return payload as T;
}

export async function fetchLatestAnime(signal?: AbortSignal): Promise<AnimeTitle[]> {
  const payload = await request<{ data?: AnimeTitle[] }>("/api/latest", signal);
  return Array.isArray(payload.data) ? payload.data : [];
}

export async function searchAnime(
  query: string,
  signal?: AbortSignal
): Promise<AnimeTitle[]> {
  const payload = await request<{ data?: AnimeTitle[] }>(
    `/api/search?q=${encodeURIComponent(query)}`,
    signal
  );
  return Array.isArray(payload.data) ? payload.data : [];
}

export async function fetchAnimeDetails(
  slug: string,
  signal?: AbortSignal
): Promise<AnimeDetails> {
  const payload = await request<{ data?: AnimeDetails }>(
    `/api/anime/${encodeURIComponent(slug)}`,
    signal
  );
  if (!payload.data) throw new Error("Anime details are unavailable.");
  return payload.data;
}

export async function fetchAnimeEpisodes(
  slug: string,
  signal?: AbortSignal
): Promise<AnimeEpisode[]> {
  const payload = await request<{ data?: AnimeEpisode[] }>(
    `/api/anime/${encodeURIComponent(slug)}/episodes`,
    signal
  );
  return Array.isArray(payload.data) ? payload.data : [];
}

export async function fetchEpisodePlayback(
  episodeSlug: string,
  signal?: AbortSignal
): Promise<AnimePlayback> {
  const payload = await request<{ data?: AnimePlayback }>(
    `/api/episode/${encodeURIComponent(episodeSlug)}`,
    signal
  );
  if (!payload.data) throw new Error("Episode playback is unavailable.");
  return payload.data;
}
