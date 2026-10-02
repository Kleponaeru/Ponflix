export interface Movie {
  id: number;
  title: string;
  original_title?: string;
  overview?: string;
  poster_path: string | null;
  backdrop_path?: string | null;
  release_date?: string;
  vote_average?: number;
  vote_count?: number;
  genre_ids?: number[];
  genres?: MovieGenre[];
  runtime?: number | null;
  tagline?: string;
  videos?: { results?: MovieVideo[] };
}

export interface MovieGenre {
  id: number;
  name: string;
}

export interface MovieVideo {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
}

export interface MoviePerson {
  id: number;
  name: string;
  character?: string;
  profile_path: string | null;
}

export interface MovieProvider {
  provider_id: number;
  provider_name: string;
  logo_path: string | null;
}

export interface MovieProviderRegion {
  link?: string;
  flatrate?: MovieProvider[];
  free?: MovieProvider[];
  ads?: MovieProvider[];
  rent?: MovieProvider[];
  buy?: MovieProvider[];
}
