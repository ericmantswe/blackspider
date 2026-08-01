/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_APIBAY_BASE_URL?: string;
  readonly VITE_OMDB_BASE_URL?: string;
  readonly VITE_OMDB_API_KEY?: string;
  readonly VITE_YOUTUBE_SEARCH_URL?: string;
  readonly VITE_YOUTUBE_EMBED_URL?: string;
  readonly VITE_IMDB_BASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
