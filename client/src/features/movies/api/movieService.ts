import type {
  Movie,
  MovieGenre,
  MoviePerson,
  MovieProviderRegion,
} from "@/features/movies/types/movie";

const API_BASE_URL = "/ponflix-movie-api";

export type MoviePage = {
  page: number;
  results: Movie[];
  total_pages: number;
  total_results: number;
};

export type MovieSearchPage = {
  page: number;
  data: Movie[];
  totalPages: number;
  total: number;
};

export type MovieCredits = { cast: MoviePerson[]; crew: MoviePerson[] };
export type MovieProviders = { id: number; results: Record<string, MovieProviderRegion> };

async function request<T>(path: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: { Accept: "application/json" },
    signal,
  });
  const payload = await response.json();
  if (!response.ok || payload?.success === false) {
    throw new Error(payload?.error || `Movie request failed (${response.status}).`);
  }
  return payload as T;
}

export function fetchMovieFeed(
  feed: "trending" | "popular" | "now_playing" | "upcoming" | "top_rated",
  page = 1,
  signal?: AbortSignal,
) {
  const path = feed === "trending"
    ? `/api/tmdb/v3/trending/movie/week?page=${page}`
    : `/api/tmdb/v3/movie/${feed}?page=${page}`;
  return request<MoviePage>(path, signal);
}

export function discoverMovies(
  options: { page?: number; genreId?: number; sortBy?: string } = {},
  signal?: AbortSignal,
) {
  const params = new URLSearchParams({
    page: String(options.page ?? 1),
    sort_by: options.sortBy ?? "popularity.desc",
  });
  if (options.genreId) params.set("with_genres", String(options.genreId));
  return request<MoviePage>(`/api/tmdb/v3/discover/movie?${params.toString()}`, signal);
}

export function searchMovies(query: string, page = 1, signal?: AbortSignal) {
  const params = new URLSearchParams({ query, page: String(page) });
  return request<MovieSearchPage>(`/api/tmdb/search?${params.toString()}`, signal);
}

export function fetchMovieGenres(signal?: AbortSignal) {
  return request<{ genres: MovieGenre[] }>("/api/tmdb/v3/genre/movie/list", signal);
}

export function fetchMovieDetails(id: string, signal?: AbortSignal) {
  return request<{ success: true; data: Movie }>(
    `/api/tmdb/movie/${encodeURIComponent(id)}?append_to_response=videos,images`,
    signal,
  ).then((payload) => payload.data);
}

export function fetchMovieCredits(id: string, signal?: AbortSignal) {
  return request<MovieCredits>(`/api/tmdb/v3/movie/${encodeURIComponent(id)}/credits`, signal);
}

export function fetchMovieRecommendations(id: string, signal?: AbortSignal) {
  return request<MoviePage>(`/api/tmdb/v3/movie/${encodeURIComponent(id)}/recommendations`, signal);
}

export function fetchMovieProviders(id: string, signal?: AbortSignal) {
  return request<MovieProviders>(`/api/tmdb/v3/movie/${encodeURIComponent(id)}/watch/providers`, signal);
}

export function movieImage(path: string | null | undefined, size = "w500") {
  return path ? `https://image.tmdb.org/t/p/${size}${path}` : "/placeholder.svg";
}

export function movieYear(date?: string) {
  return date?.slice(0, 4) || "Coming soon";
}
