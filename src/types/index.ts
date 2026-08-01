export type Category = 'Movies' | 'TV Shows' | 'Games' | 'Anime' | 'Music' | 'Applications' | 'Books';

export interface TorrentResult {
  id: string;
  title: string;
  category: Category;
  size: number;
  seeds: number;
  leeches: number;
  uploadDate: string;
  uploader: string;
  magnetLink: string;
  poster?: string;
  hash: string;
  quality?: string;
  resolution?: string;
  platform?: string; // Games
  genre?: string[];
  episodes?: number; // Anime, TV
  seasons?: number; // TV
  version?: string; // Games, Apps
  artist?: string; // Music
  album?: string; // Music
}

export interface TorrentDetails extends TorrentResult {
  description: string;
  files: { name: string; size: number }[];
  genre?: string[];
  imdbRating?: string;
  gameMeta?: {
    summary?: string;
    rating?: number;
    genres?: string[];
    platforms?: string[];
    releaseYear?: string;
  };
}

export interface TorrentProvider {
  search(query: string, filters?: any): Promise<TorrentResult[]>;
  trending(): Promise<TorrentResult[]>;
  top100(): Promise<TorrentResult[]>;
  category(category: Category | string, page?: number): Promise<TorrentResult[]>;
  details(id: string): Promise<TorrentDetails>;
}
