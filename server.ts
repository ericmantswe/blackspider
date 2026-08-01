import express from 'express';
import path from 'path';
import axios from 'axios';

const app = express();
const PORT = 3000;

app.use(express.json());

// API Base URLs & Credentials from environment variables
const APIBAY_BASE_URL = process.env.APIBAY_BASE_URL || 'https://apibay.org';
const OMDB_BASE_URL = process.env.OMDB_BASE_URL || 'https://img.omdbapi.com';
const OMDB_API_KEY = process.env.OMDB_API_KEY || 'b9a5e69d';
const TWITCH_OAUTH_URL = process.env.TWITCH_OAUTH_URL || 'https://id.twitch.tv/oauth2/token';
const IGDB_BASE_URL = process.env.IGDB_BASE_URL || 'https://api.igdb.com/v4';
const STEAM_STORE_SEARCH_URL = process.env.STEAM_STORE_SEARCH_URL || 'https://store.steampowered.com/api/storesearch';
const STEAM_STATIC_ASSETS_URL = process.env.STEAM_STATIC_ASSETS_URL || 'https://shared.steamstatic.com/store_item_assets/steam/apps';
const YOUTUBE_SEARCH_URL = process.env.YOUTUBE_SEARCH_URL || 'https://www.youtube.com/results';
const YOUTUBE_EMBED_URL = process.env.YOUTUBE_EMBED_URL || 'https://www.youtube-nocookie.com/embed';

const TRACKERS = [
  'udp://tracker.coppersurfer.tk:6969/announce',
  'udp://tracker.openbittorrent.com:6969/announce',
  'udp://tracker.opentrackr.org:1337',
  'udp://tracker.leechers-paradise.org:6969/announce',
  'udp://tracker.dler.org:6969/announce',
  'udp://opentracker.i2p.rocks:6969/announce',
  'udp://47.ip-51-68-199.eu:6969/announce'
];

function formatBytes(bytes: number) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KiB', 'MiB', 'GiB', 'TiB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function mapCategory(catId: string | number) {
  const strId = String(catId);
  if (strId.startsWith('1')) {
    if (strId === '102') return 'Books';
    return 'Music';
  }
  if (strId.startsWith('2')) {
    if (strId === '205' || strId === '208' || strId === '213') return 'TV Shows';
    return 'Movies';
  }
  if (strId.startsWith('3')) return 'Applications';
  if (strId.startsWith('4')) return 'Games';
  if (strId.startsWith('5')) return 'Porn';
  if (strId.startsWith('6')) {
    if (strId === '601' || strId === '602') return 'Books';
    return 'Other';
  }
  return 'Movies';
}

let twitchToken: { access_token: string; expires_at: number } | null = null;

async function getTwitchToken() {
  const clientId = process.env.TWITCH_CLIENT_ID || process.env.IGDB_CLIENT_ID;
  const clientSecret = process.env.TWITCH_CLIENT_SECRET || process.env.IGDB_CLIENT_SECRET;

  if (!clientId || !clientSecret) return null;

  if (twitchToken && Date.now() < twitchToken.expires_at - 60000) {
    return twitchToken.access_token;
  }

  try {
    const res = await axios.post(TWITCH_OAUTH_URL, null, {
      params: {
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'client_credentials'
      }
    });
    if (res.data?.access_token) {
      twitchToken = {
        access_token: res.data.access_token,
        expires_at: Date.now() + (res.data.expires_in || 3600) * 1000
      };
      return twitchToken.access_token;
    }
  } catch (err: any) {
    console.error('Error fetching Twitch token for IGDB:', err?.response?.data || err.message);
  }
  return null;
}

function cleanGameTitle(rawTitle: string): string {
  return rawTitle
    .replace(/\[.*?\]|\(.*?\)/g, '')
    .replace(/\bv?\d+(\.\d+)+[a-z]?\b/gi, '')
    .replace(/-(ElAmigos|FitGirl|DODI|FLT|CODEX|SKIDROW|GOG|EMPRESS|RUNE|TENOKE|RAZOR58|CPY|HOODLUM|REPACK|UNLOCKED|PLAZA|DARKSiDERS|TiNYiSO|DEVIANCE|FAIRLIGHT)\b/gi, '')
    .replace(/\b(Repack|Multi\d*|GOG|BUILD\s*\d+|ISO|PROPER|READNFO|PC|GAME|GOTY|Edition|Deluxe|v\d+)\b/gi, '')
    .replace(/[-_.]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

interface GameMeta {
  poster?: string;
  summary?: string;
  rating?: number;
  genres?: string[];
  platforms?: string[];
  releaseYear?: string;
  igdbUrl?: string;
}

const gameMetaCache = new Map<string, GameMeta>();

async function getGameMetadata(rawTitle: string): Promise<GameMeta | null> {
  const clean = cleanGameTitle(rawTitle);
  if (!clean) return null;

  const cacheKey = clean.toLowerCase();
  if (gameMetaCache.has(cacheKey)) {
    return gameMetaCache.get(cacheKey)!;
  }

  const clientId = process.env.TWITCH_CLIENT_ID || process.env.IGDB_CLIENT_ID;
  const token = await getTwitchToken();

  if (clientId && token) {
    try {
      const queryBody = `search "${clean.replace(/"/g, '\\"')}"; fields name, cover.url, summary, rating, first_release_date, genres.name, platforms.name, url; limit 1;`;
      const igdbRes = await axios.post(`${IGDB_BASE_URL}/games`, queryBody, {
        headers: {
          'Client-ID': clientId,
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'text/plain'
        }
      });

      if (Array.isArray(igdbRes.data) && igdbRes.data.length > 0) {
        const game = igdbRes.data[0];
        let poster = '';
        if (game.cover && game.cover.url) {
          const rawUrl = game.cover.url.startsWith('//') ? `https:${game.cover.url}` : game.cover.url;
          poster = rawUrl.replace('/t_thumb/', '/t_cover_big_2x/');
        }

        const meta: GameMeta = {
          poster,
          summary: game.summary,
          rating: game.rating ? Math.round((game.rating / 10) * 10) / 10 : undefined,
          genres: game.genres ? game.genres.map((g: any) => g.name) : [],
          platforms: game.platforms ? game.platforms.map((p: any) => p.name) : [],
          releaseYear: game.first_release_date ? new Date(game.first_release_date * 1000).getFullYear().toString() : undefined,
          igdbUrl: game.url
        };
        gameMetaCache.set(cacheKey, meta);
        return meta;
      }
    } catch (err: any) {
      console.error('IGDB lookup error:', err?.response?.data || err.message);
    }
  }

  // Steam Fallback
  try {
    const steamRes = await axios.get(`${STEAM_STORE_SEARCH_URL}/?term=${encodeURIComponent(clean)}&l=english&cc=US`, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
    });
    if (steamRes.data?.items?.length > 0) {
      const item = steamRes.data.items[0];
      const poster = `${STEAM_STATIC_ASSETS_URL}/${item.id}/library_600x900_2x.jpg`;
      const meta: GameMeta = {
        poster,
        summary: `Steam Game: ${item.name}`
      };
      gameMetaCache.set(cacheKey, meta);
      return meta;
    }
  } catch (e) {
    // Ignore fallback failure
  }

  return null;
}

async function fetchTPBApi(url: string) {

  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    
    if (!Array.isArray(response.data)) return [];
    if (response.data.length > 0 && response.data[0].id === '0') return []; 
    
    return response.data.map((item: any) => {
      const trackers = TRACKERS.map(t => `tr=${encodeURIComponent(t)}`).join('&');
      const magnet = `magnet:?xt=urn:btih:${item.info_hash}&dn=${encodeURIComponent(item.name)}&${trackers}`;
      
      const date = new Date(parseInt(item.added) * 1000).toLocaleDateString('en-US', {
        month: '2-digit', day: '2-digit', year: 'numeric'
      }).replace(/\//g, '-');
      
      return {
        id: item.id,
        category: mapCategory(item.category),
        title: item.name,
        link: `${APIBAY_BASE_URL}/t.php?id=${item.id}`,
        date: date,
        size: formatBytes(parseInt(item.size || '0')),
        seeds: item.seeders,
        peers: item.leechers,
        uploader: item.username,
        magnet: magnet,
        imdb: item.imdb
      };
    });
  } catch (error: any) {
    console.error('Error fetching TPB API:', error);
    throw error;
  }
}

const trailerCache = new Map<string, { videoId: string; cleanTitle: string; embedUrl: string }>();

app.get('/api/trailer', async (req, res) => {
  try {
    const rawTitle = (req.query.title as string) || '';
    if (!rawTitle) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const cleanTitle = rawTitle
      .replace(/\[.*?\]|\(.*?\)/g, '')
      .replace(/\bv?\d+(\.\d+)+[a-z]?\b/gi, '')
      .replace(/-(ElAmigos|FitGirl|DODI|FLT|CODEX|SKIDROW|GOG|EMPRESS|RUNE|TENOKE|RAZOR58|CPY|HOODLUM|REPACK|UNLOCKED|PLAZA|BTM|AMZN|WEB-DL|DDP5\.1|H264|MP4)\b/gi, '')
      .replace(/\b(Repack|Multi\d*|GOG|BUILD\s*\d+|ISO|PROPER|READNFO|1080p|720p|2160p|4K|WEB-DL|AMZN|HDR|AAC|x264|x265|HEVC|Rip|BluRay)\b/gi, '')
      .replace(/[-_.]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    const cacheKey = cleanTitle.toLowerCase();
    if (trailerCache.has(cacheKey)) {
      return res.json(trailerCache.get(cacheKey));
    }

    const searchQuery = `${cleanTitle} official trailer`;
    const ytRes = await axios.get(`${YOUTUBE_SEARCH_URL}?search_query=${encodeURIComponent(searchQuery)}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      timeout: 5000
    });

    const matches = [...ytRes.data.matchAll(/"videoId":"([a-zA-Z0-9_-]{11})"/g)];
    const uniqueVideoIds = Array.from(new Set(matches.map((m: any) => m[1])));

    let videoId = uniqueVideoIds[0];
    if (!videoId) {
      videoId = '6ZfuNTqbHE8'; // Avengers trailer fallback
    }

    const result = {
      videoId,
      cleanTitle,
      embedUrl: `${YOUTUBE_EMBED_URL}/${videoId}?autoplay=1&rel=0`
    };

    trailerCache.set(cacheKey, result);
    return res.json(result);
  } catch (error: any) {
    console.error('Trailer search error:', error?.message);
    return res.json({
      videoId: '6ZfuNTqbHE8',
      cleanTitle: (req.query.title as string) || 'Movie Trailer',
      embedUrl: `${YOUTUBE_EMBED_URL}/6ZfuNTqbHE8?autoplay=1&rel=0`
    });
  }
});

app.get('/api/poster', async (req, res) => {
  try {
    const title = (req.query.title as string) || '';
    const category = (req.query.category as string) || '';
    const imdb = (req.query.imdb as string) || '';

    if (category === 'Games' && title) {
      const meta = await getGameMetadata(title);
      if (meta?.poster) {
        return res.json({ poster: meta.poster, gameMeta: meta });
      }
    }

    if (imdb) {
      return res.json({ poster: `${OMDB_BASE_URL}/?i=${imdb}&apikey=${OMDB_API_KEY}&h=600` });
    }

    res.json({ poster: '' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/search', async (req, res) => {
  try {
    const query = (req.query.q as string) || '';
    if (!query) return res.json([]);
    const torrents = await fetchTPBApi(`${APIBAY_BASE_URL}/q.php?q=${encodeURIComponent(query)}`);
    res.json(torrents);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/trending', async (req, res) => {
  try {
    const torrents = await fetchTPBApi(`${APIBAY_BASE_URL}/precompiled/data_top100_all.json`);
    res.json(torrents);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/top100', async (req, res) => {
  try {
    const torrents = await fetchTPBApi(`${APIBAY_BASE_URL}/precompiled/data_top100_all.json`);
    res.json(torrents);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/category/:category', async (req, res) => {
  try {
    const category = req.params.category;
    const catLower = category.toLowerCase();

    // Special case: TPB has no dedicated Anime top100, so we query search directly
    if (catLower === 'anime') {
      const torrents = await fetchTPBApi(`${APIBAY_BASE_URL}/q.php?q=anime`);
      // Force category label since mapCategory defaults to Movies for video torrents
      const animeTorrents = torrents.map((t: any) => ({ ...t, category: 'Anime' }));
      return res.json(animeTorrents);
    }

    let catId = 'all';

    if (/^\d+$/.test(category)) {
      catId = category;
    } else {
      switch (catLower) {
        case 'movies': catId = '200'; break;
        case 'tv shows': catId = '205'; break;
        case 'games': catId = '400'; break;
        case 'music': catId = '100'; break;
        case 'applications': catId = '300'; break;
        case 'books': catId = '600'; break;
        default: catId = 'all'; break;
      }
    }

    const torrents = await fetchTPBApi(`${APIBAY_BASE_URL}/precompiled/data_top100_${catId}.json`);
    
    // Safety check: ensure only matching items are returned
    let filtered = torrents;
    if (catId === '400' || catLower === 'games') {
      filtered = torrents.filter(t => t.category === 'Games');
    } else if (catId === '100' || catLower === 'music') {
      filtered = torrents.filter(t => t.category === 'Music' || t.category === 'Audio');
    } else if (catId === '200' || catLower === 'movies') {
      filtered = torrents.filter(t => t.category === 'Movies' || t.category === 'Video');
    } else if (catId === '205' || catLower === 'tv shows') {
      filtered = torrents.filter(t => t.category === 'TV Shows');
    } else if (catId === '300' || catLower === 'applications') {
      filtered = torrents.filter(t => t.category === 'Applications');
    } else if (catId === '600' || catLower === 'books') {
      filtered = torrents.filter(t => t.category === 'Books');
    }

    res.json(filtered);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/details/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const response = await axios.get(`${APIBAY_BASE_URL}/t.php?id=${id}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    if (!response.data || response.data.id === '0') {
      return res.status(404).json({ error: 'Not found' });
    }

    const item = response.data;
    const trackers = TRACKERS.map(t => `tr=${encodeURIComponent(t)}`).join('&');
    const magnet = `magnet:?xt=urn:btih:${item.info_hash}&dn=${encodeURIComponent(item.name)}&${trackers}`;
    
    const date = new Date(parseInt(item.added) * 1000).toLocaleDateString('en-US', {
      month: '2-digit', day: '2-digit', year: 'numeric'
    }).replace(/\//g, '-');

    let files = [];
    try {
      const filesRes = await axios.get(`${APIBAY_BASE_URL}/f.php?id=${id}`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });
      if (Array.isArray(filesRes.data)) {
        files = filesRes.data.map((f: any) => ({
          name: f.name?.[0] || 'Unknown',
          size: typeof f.size?.[0] === 'number' ? f.size[0] : parseInt(f.size?.[0] || '0')
        }));
      }
    } catch (e) {
      console.error('Failed to fetch files:', e);
    }

    const category = mapCategory(item.category);
    let gameMeta: GameMeta | null = null;
    let poster = item.imdb ? `${OMDB_BASE_URL}/?i=${item.imdb}&apikey=${OMDB_API_KEY}&h=600` : '';

    if (category === 'Games') {
      gameMeta = await getGameMetadata(item.name);
      if (gameMeta?.poster) {
        poster = gameMeta.poster;
      }
    }

    res.json({
      id: item.id,
      category: category,
      title: item.name,
      link: `${APIBAY_BASE_URL}/t.php?id=${item.id}`,
      date: date,
      size: formatBytes(parseInt(item.size || '0')),
      seeds: item.seeders,
      peers: item.leechers,
      uploader: item.username,
      magnet: magnet,
      description: item.descr,
      imdb: item.imdb,
      info_hash: item.info_hash,
      num_files: item.num_files,
      files: files,
      poster: poster,
      gameMeta: gameMeta
    });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production' && process.env.VERCEL !== '1') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

if (process.env.VERCEL !== '1') {
  startServer();
}

export default app;
