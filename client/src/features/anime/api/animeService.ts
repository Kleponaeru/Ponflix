import type {
  AnimeDetails,
  AnimeEpisode,
  AnimePlayback,
  AnimeTitle,
} from "@/features/anime/types/anime";

const API_BASE_URL = "/ponflix-anime-api";
const FEED_CACHE_TTL: Record<string, number> = {
  "/api/latest": 60_000,
  "/api/spotlight": 120_000,
  "/api/trending": 300_000,
};

const feedCache = new Map<string, { payload: unknown; expiresAt: number }>();
const pendingFeedRequests = new Map<string, Promise<unknown>>();

function createAbortError() {
  return new DOMException("The request was aborted.", "AbortError");
}

function resolveWithSignal<T>(promise: Promise<T>, signal?: AbortSignal): Promise<T> {
  if (!signal) return promise;
  if (signal.aborted) return Promise.reject(createAbortError());

  return new Promise((resolve, reject) => {
    const abort = () => reject(createAbortError());
    signal.addEventListener("abort", abort, { once: true });

    promise.then(
      (value) => {
        signal.removeEventListener("abort", abort);
        if (signal.aborted) reject(createAbortError());
        else resolve(value);
      },
      (error: unknown) => {
        signal.removeEventListener("abort", abort);
        reject(error);
      }
    );
  });
}

async function fetchPayload(path: string, signal?: AbortSignal): Promise<unknown> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: { Accept: "application/json" },
    signal,
  });
  if (!response.ok) throw new Error(`Anime request failed (${response.status}).`);

  const payload = await response.json();
  if (!payload?.success) throw new Error(payload?.message || "Anime data is unavailable.");
  return payload;
}

async function request<T>(path: string, signal?: AbortSignal): Promise<T> {
  const ttl = FEED_CACHE_TTL[path];
  if (!ttl) return (await fetchPayload(path, signal)) as T;
  if (signal?.aborted) throw createAbortError();

  const cached = feedCache.get(path);
  if (cached && cached.expiresAt > Date.now()) return cached.payload as T;
  if (cached) feedCache.delete(path);

  let pending = pendingFeedRequests.get(path);
  if (!pending) {
    pending = fetchPayload(path).then((payload) => {
      feedCache.set(path, { payload, expiresAt: Date.now() + ttl });
      return payload;
    });
    pendingFeedRequests.set(path, pending);
    void pending.then(
      () => pendingFeedRequests.delete(path),
      () => pendingFeedRequests.delete(path)
    );
  }

  return (await resolveWithSignal(pending, signal)) as T;
}

export async function fetchLatestAnime(signal?: AbortSignal): Promise<AnimeTitle[]> {
  const payload = await request<{ data?: AnimeTitle[] }>("/api/latest", signal);
  return Array.isArray(payload.data) ? payload.data : [];
}

export async function fetchSpotlightAnime(signal?: AbortSignal): Promise<AnimeTitle[]> {
  const payload = await request<{ data?: AnimeTitle[] }>("/api/spotlight", signal);
  return Array.isArray(payload.data) ? payload.data : [];
}

export async function fetchTrendingAnime(signal?: AbortSignal): Promise<AnimeTitle[]> {
  const payload = await request<{ data?: AnimeTitle[] }>("/api/trending", signal);
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
