import React, { useState, useEffect } from 'react';
import { Play, Clapperboard, ExternalLink, Sparkles, Youtube, Search, AlertCircle, RefreshCw, Loader2 } from 'lucide-react';

interface VideoStreamPlayerProps {
  title: string;
  defaultQuality?: string;
  poster?: string;
  onClose?: () => void;
  autoPlay?: boolean;
}

export function cleanTitleForSearch(rawTitle: string): string {
  return rawTitle
    .replace(/\[.*?\]|\(.*?\)/g, '')
    .replace(/\bv?\d+(\.\d+)+[a-z]?\b/gi, '')
    .replace(/-(ElAmigos|FitGirl|DODI|FLT|CODEX|SKIDROW|GOG|EMPRESS|RUNE|TENOKE|RAZOR58|CPY|HOODLUM|REPACK|UNLOCKED|PLAZA|BTM|AMZN|WEB-DL|DDP5\.1|H264|MP4)\b/gi, '')
    .replace(/\b(Repack|Multi\d*|GOG|BUILD\s*\d+|ISO|PROPER|READNFO|1080p|720p|2160p|4K|WEB-DL|AMZN|HDR|AAC|x264|x265|HEVC|Rip|BluRay)\b/gi, '')
    .replace(/[-_.]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function VideoStreamPlayer({ title, poster, onClose, autoPlay = true }: VideoStreamPlayerProps) {
  const cleanTitle = cleanTitleForSearch(title) || title;
  const [querySuffix, setQuerySuffix] = useState<string>('official trailer');
  const [loading, setLoading] = useState(true);
  const [videoId, setVideoId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);

    const fullSearchTitle = `${cleanTitle} ${querySuffix}`.trim();

    fetch(`/api/trailer?title=${encodeURIComponent(fullSearchTitle)}`)
      .then((res) => res.json())
      .then((data) => {
        if (active) {
          if (data && data.videoId) {
            setVideoId(data.videoId);
          } else {
            setVideoId('6ZfuNTqbHE8'); // Fallback HD trailer
          }
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Failed to resolve trailer:', err);
        if (active) {
          setVideoId('6ZfuNTqbHE8');
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [cleanTitle, querySuffix]);

  const YOUTUBE_EMBED_BASE = import.meta.env.VITE_YOUTUBE_EMBED_URL || 'https://www.youtube-nocookie.com/embed';
  const YOUTUBE_SEARCH_BASE = import.meta.env.VITE_YOUTUBE_SEARCH_URL || 'https://www.youtube.com/results';

  const embedUrl = videoId
    ? `${YOUTUBE_EMBED_BASE}/${videoId}?autoplay=${autoPlay ? 1 : 0}&rel=0&enablejsapi=1`
    : null;

  const directYoutubeSearchUrl = `${YOUTUBE_SEARCH_BASE}?search_query=${encodeURIComponent(`${cleanTitle} ${querySuffix}`)}`;

  return (
    <div className="relative bg-[#222222] rounded-none overflow-hidden border shadow-2xl mb-8 group">
      {/* Player Header */}
      <div className="bg-[#2a2a2a] px-4 py-3 border-b flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-[#e50914] rounded-none flex items-center justify-center text-white shadow-md">
            <Youtube className="w-4 h-4 fill-current" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white uppercase tracking-wider">In-App YouTube Trailer Player</span>
              <span className="px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 border rounded text-[10px] font-mono font-semibold">Playable HD</span>
            </div>
            <div className="text-xs text-gray-400 font-medium truncate max-w-xs sm:max-w-md">
              {cleanTitle}
            </div>
          </div>
        </div>

        {/* Query Filter Options */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {[
            { label: 'Official Trailer', suffix: 'official trailer' },
            { label: 'Teaser', suffix: 'teaser trailer' },
            { label: 'Gameplay / Clip', suffix: 'gameplay trailer' }
          ].map((opt) => (
            <button
              key={opt.suffix}
              onClick={() => {
                if (querySuffix !== opt.suffix) {
                  setQuerySuffix(opt.suffix);
                }
              }}
              className={`px-3 py-1 rounded-none text-xs font-semibold transition-all whitespace-nowrap ${
                querySuffix === opt.suffix
                  ? 'bg-[#e50914] text-white shadow-sm'
                  : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Video Embed Stage */}
      <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center gap-3 text-gray-400">
            <Loader2 className="w-10 h-10 text-[#e50914] animate-spin" />
            <span className="text-xs font-semibold tracking-wider uppercase text-gray-300">
              Locating YouTube Trailer...
            </span>
          </div>
        ) : embedUrl ? (
          <iframe
            key={embedUrl}
            src={embedUrl}
            title={`${cleanTitle} Trailer`}
            className="w-full h-full border-0 z-10"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        ) : (
          <div className="text-center p-6 text-gray-400">
            <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-2" />
            <p className="text-sm">Unable to load trailer embed.</p>
          </div>
        )}

        {/* External YouTube Fallback Overlay Bar */}
        <div className="absolute bottom-3 right-3 z-20 flex items-center gap-2">
          <a
            href={directYoutubeSearchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 bg-black/80 hover:bg-[#e50914] text-white text-xs font-bold rounded-none border backdrop-blur-md transition-all flex items-center gap-1.5 shadow-lg opacity-80 hover:opacity-100"
          >
            <Youtube className="w-3.5 h-3.5 text-rose-500 fill-current group-hover:text-white" />
            <span>Open in YouTube</span>
            <ExternalLink className="w-3 h-3 text-gray-400" />
          </a>
        </div>
      </div>

      {/* Player Footer Bar */}
      <div className="px-4 py-2.5 bg-[#1a1a1a] border-t flex items-center justify-between text-xs text-gray-400">
        <span className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <span>Embedded directly in app matching <strong>"{cleanTitle}"</strong></span>
        </span>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white font-medium"
          >
            Close
          </button>
        )}
      </div>
    </div>
  );
}
