import { Category, TorrentDetails, TorrentProvider, TorrentResult } from '../types';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';
const OMDB_BASE = import.meta.env.VITE_OMDB_BASE_URL || 'https://img.omdbapi.com';
const OMDB_KEY = import.meta.env.VITE_OMDB_API_KEY || 'b9a5e69d';

function parseSize(sizeStr: string): number {
  if (!sizeStr) return 0;
  // Sizes like '1.2 GB', '800 MB'
  const match = sizeStr.match(/([\d.]+)\s*([KMGT]i?B)/i);
  if (!match) return 0;
  const num = parseFloat(match[1]);
  const unit = match[2].toUpperCase();
  const mult = unit.includes('K') ? 1024 : unit.includes('M') ? 1024 ** 2 : unit.includes('G') ? 1024 ** 3 : unit.includes('T') ? 1024 ** 4 : 1;
  return num * mult;
}

const getPosterUrl = (t: any) => {
  if (t.poster) return t.poster;
  if (t.imdb) return `${OMDB_BASE}/?i=${t.imdb}&apikey=${OMDB_KEY}&h=600`;
  return '';
};

export const mockProvider: TorrentProvider = {
  search: async (query) => {
    if (!query) return [];
    try {
      const res = await fetch(`${API_BASE}/search?q=${encodeURIComponent(query)}`);
      if (!res.ok) return [];
      const data = await res.json();
      if (!Array.isArray(data)) return [];
      return data.map((t: any) => ({
        id: t.id || t.link || Math.random().toString(),
        title: t.title,
        category: t.category,
        size: parseSize(t.size),
        seeds: parseInt(t.seeds || '0'),
        leeches: parseInt(t.peers || t.leechers || '0'),
        uploadDate: t.time || new Date().toISOString(),
        uploader: t.provider || t.uploader || 'Unknown',
        magnetLink: t.magnet,
        poster: getPosterUrl(t),
        hash: t.magnet?.match(/btih:([a-zA-Z0-9]+)/i)?.[1] || '',
        quality: t.title.match(/(1080p|720p|2160p|4K)/i)?.[0],
        resolution: t.title.match(/(1080p|720p|2160p|4K)/i)?.[0],
      }));
    } catch {
      return [];
    }
  },
  trending: async () => {
    try {
      const res = await fetch(`${API_BASE}/trending`);
      if (!res.ok) return [];
      const data = await res.json();
      if (!Array.isArray(data)) return [];
      return data.map((t: any) => ({
        id: t.id || t.link || Math.random().toString(),
        title: t.title,
        category: t.category,
        size: parseSize(t.size),
        seeds: parseInt(t.seeds || '0'),
        leeches: parseInt(t.peers || t.leechers || '0'),
        uploadDate: t.time || new Date().toISOString(),
        uploader: t.provider || t.uploader || 'Unknown',
        magnetLink: t.magnet,
        poster: getPosterUrl(t),
        hash: t.magnet?.match(/btih:([a-zA-Z0-9]+)/i)?.[1] || '',
        quality: t.title.match(/(1080p|720p|2160p|4K)/i)?.[0],
        resolution: t.title.match(/(1080p|720p|2160p|4K)/i)?.[0],
      }));
    } catch {
      return [];
    }
  },
  top100: async () => {
    try {
      const res = await fetch(`${API_BASE}/top100`);
      if (!res.ok) return [];
      const data = await res.json();
      if (!Array.isArray(data)) return [];
      return data.map((t: any) => ({
        id: t.id || t.link || Math.random().toString(),
        title: t.title,
        category: t.category,
        size: parseSize(t.size),
        seeds: parseInt(t.seeds || '0'),
        leeches: parseInt(t.peers || t.leechers || '0'),
        uploadDate: t.time || new Date().toISOString(),
        uploader: t.provider || t.uploader || 'Unknown',
        magnetLink: t.magnet,
        poster: getPosterUrl(t),
        hash: t.magnet?.match(/btih:([a-zA-Z0-9]+)/i)?.[1] || '',
        quality: t.title.match(/(1080p|720p|2160p|4K)/i)?.[0],
        resolution: t.title.match(/(1080p|720p|2160p|4K)/i)?.[0],
      }));
    } catch {
      return [];
    }
  },
  category: async (category, page = 1) => {
    const catCodeMap: Record<string, string> = {
      'Movies': '200',
      'TV Shows': '205',
      'Games': '400',
      'Music': '100',
      'Applications': '300',
      'Books': '600',
    };
    const catParam = catCodeMap[category as string] || category;
    try {
      const res = await fetch(`${API_BASE}/category/${catParam}`);
      if (!res.ok) return [];
      const data = await res.json();
      if (!Array.isArray(data)) return [];
      return data.map((t: any) => ({
        id: t.id || t.link || Math.random().toString(),
        title: t.title,
        category: t.category,
        size: parseSize(t.size),
        seeds: parseInt(t.seeds || '0'),
        leeches: parseInt(t.peers || t.leechers || '0'),
        uploadDate: t.time || new Date().toISOString(),
        uploader: t.provider || t.uploader || 'Unknown',
        magnetLink: t.magnet,
        poster: getPosterUrl(t),
        hash: t.magnet?.match(/btih:([a-zA-Z0-9]+)/i)?.[1] || '',
        quality: t.title.match(/(1080p|720p|2160p|4K)/i)?.[0],
        resolution: t.title.match(/(1080p|720p|2160p|4K)/i)?.[0],
      }));
    } catch {
      return [];
    }
  },
  details: async (id) => {
    let torrentInfo;
    try {
      const res = await fetch(`${API_BASE}/details/${id}`);
      if (!res.ok) throw new Error('Not found');
      torrentInfo = await res.json();
    } catch {
      throw new Error('Not found');
    }
    
    let poster = torrentInfo.poster || (torrentInfo.gameMeta?.poster) || getPosterUrl(torrentInfo);

    if (!poster) {
      try {
        const cleanTitle = torrentInfo.title
          .replace(/\[.*?\]|\(.*?\)/g, '')
          .replace(/\bv?\d+(\.\d+)+[a-z]?\b/gi, '')
          .replace(/-(ElAmigos|FitGirl|DODI|FLT|CODEX|SKIDROW|GOG|EMPRESS|RUNE|TENOKE|RAZOR58|CPY|HOODLUM|REPACK|UNLOCKED|PLAZA|BTM|AMZN|WEB-DL|DDP5\.1|H264|MP4)\b/gi, '')
          .replace(/\b(Repack|Multi\d*|GOG|BUILD\s*\d+|ISO|PROPER|READNFO|1080p|720p|2160p|4K|WEB-DL|AMZN|HDR|AAC|x264|x265|HEVC|Rip|BluRay)\b/gi, '')
          .replace(/[-_.]/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();
        
        if (cleanTitle && ['Movies', 'TV Shows', 'Anime'].includes(torrentInfo.category || '')) {
          if (torrentInfo.category === 'Anime') {
            const r = await fetch(`https://kitsu.io/api/edge/anime?filter[text]=${encodeURIComponent(cleanTitle)}`);
            const d = await r.json();
            if (d.data && d.data.length > 0) {
              const anime = d.data[0].attributes;
              poster = anime.posterImage?.large || anime.posterImage?.original;
              
              // We inject anime synopsis into description and rating into gameMeta to reuse UI
              torrentInfo.description = `[Anime Synopsis]\n${anime.synopsis || 'No synopsis available.'}\n\n[Torrent Description]\n${torrentInfo.description}`;
              torrentInfo.gameMeta = { ...torrentInfo.gameMeta, rating: anime.averageRating ? parseFloat(anime.averageRating) / 10 : undefined };
            }
          } else {
            const r = await fetch(`https://www.omdbapi.com/?t=${encodeURIComponent(cleanTitle)}&apikey=${OMDB_KEY}`);
            const d = await r.json();
            if (d.Poster && d.Poster !== 'N/A') poster = d.Poster;
          }
        }
      } catch (e) {}
    }

    return {
      id: torrentInfo.id || id,
      title: torrentInfo.title,
      category: torrentInfo.category || 'Unknown',
      size: parseSize(torrentInfo.size),
      seeds: parseInt(torrentInfo.seeds || '0'),
      leeches: parseInt(torrentInfo.peers || torrentInfo.leechers || '0'),
      uploadDate: torrentInfo.date || new Date().toISOString(),
      uploader: torrentInfo.provider || torrentInfo.uploader || 'Unknown',
      magnetLink: torrentInfo.magnet,
      poster: poster,
      hash: torrentInfo.info_hash || torrentInfo.magnet?.match(/btih:([a-zA-Z0-9]+)/i)?.[1] || '',
      quality: torrentInfo.title.match(/(1080p|720p|2160p|4K)/i)?.[0],
      resolution: torrentInfo.title.match(/(1080p|720p|2160p|4K)/i)?.[0],
      description: torrentInfo.gameMeta?.summary 
        ? `[IGDB Game Summary]\n${torrentInfo.gameMeta.summary}\n\n[Torrent Description]\n${torrentInfo.description}`
        : (torrentInfo.description || 'Fetched from API'),
      files: torrentInfo.files || [],
      genre: torrentInfo.gameMeta?.genres || [],
      platform: torrentInfo.gameMeta?.platforms?.join(', '),
      imdbRating: torrentInfo.gameMeta?.rating ? `Rating: ${torrentInfo.gameMeta.rating}/10 (IGDB)` : torrentInfo.imdb,
      gameMeta: torrentInfo.gameMeta,
    };
  }
};


