import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TorrentResult } from '../../types';
import { formatBytes } from '../../lib/utils';
import { Film, Gamepad2, Tv, Music, List, Sparkles } from 'lucide-react';
import { playOpenSound, playHoverSound } from '../../lib/sound';

interface Props {
  torrent: TorrentResult;
}

export function formatCardTitle(rawTitle: string, uploadDate?: string): { titleText: string; yearText?: string } {
  // Extract 4-digit year if present
  const yearMatch = rawTitle.match(/\b(19\d{2}|20\d{2})\b/);
  let yearText = yearMatch ? yearMatch[1] : undefined;

  if (!yearText && uploadDate) {
    const dMatch = uploadDate.match(/\b(19\d{2}|20\d{2})\b/);
    if (dMatch) yearText = dMatch[1];
  }

  // Clean common torrent tags
  let cleaned = rawTitle
    .replace(/\[.*?\]|\(.*?\)/g, '')
    .replace(/\bv?\d+(\.\d+)+[a-z]?\b/gi, '')
    .replace(/-(ElAmigos|FitGirl|DODI|FLT|CODEX|SKIDROW|GOG|EMPRESS|RUNE|TENOKE|RAZOR58|CPY|HOODLUM|REPACK|UNLOCKED|PLAZA|BTM|AMZN|WEB-DL|DDP5\.1|H264|MP4)\b/gi, '')
    .replace(/\b(Repack|Multi\d*|GOG|BUILD\s*\d+|ISO|PROPER|READNFO|1080p|720p|2160p|4K|WEB-DL|AMZN|HDR|AAC|x264|x265|HEVC|Rip|BluRay)\b/gi, '')
    .replace(/[-_.]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!cleaned) cleaned = rawTitle;

  return { titleText: cleaned, yearText };
}

function getCategoryIcon(category: string) {
  switch (category) {
    case 'Movies':
    case 'Anime':
      return Film;
    case 'TV Shows':
      return Tv;
    case 'Games':
      return Gamepad2;
    case 'Audio':
      return Music;
    default:
      return List;
  }
}

export function TorrentCard({ torrent }: Props) {
  const { titleText, yearText } = formatCardTitle(torrent.title, torrent.uploadDate);
  const IconComponent = getCategoryIcon(torrent.category);
  const [poster, setPoster] = useState(torrent.poster);

  useEffect(() => {
    if (!poster && titleText && ['Movies', 'TV Shows', 'Anime'].includes(torrent.category)) {
      if (torrent.category === 'Anime') {
        fetch(`https://kitsu.io/api/edge/anime?filter[text]=${encodeURIComponent(titleText)}`)
          .then(r => r.json())
          .then(data => {
            if (data.data && data.data.length > 0) {
              const anime = data.data[0].attributes;
              const img = anime.posterImage?.large || anime.posterImage?.original;
              if (img) setPoster(img);
            }
          })
          .catch(() => {});
      } else {
        fetch(`https://www.omdbapi.com/?t=${encodeURIComponent(titleText)}&apikey=b9a5e69d`)
          .then(r => r.json())
          .then(data => {
            if (data.Poster && data.Poster !== 'N/A') {
              setPoster(data.Poster);
            }
          })
          .catch(() => {});
      }
    }
  }, [poster, titleText, torrent.category]);

  return (
    <Link 
      to={`/torrent/${torrent.id}`} 
      onClick={playOpenSound}
      onMouseEnter={playHoverSound}
      className="group block h-full"
    >
      <motion.div 
        whileHover={{ y: -4 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="flex flex-col h-full cursor-pointer"
      >
        {/* Poster Container */}
        <div className="aspect-[2/3] bg-[#2a2a2a] rounded-none overflow-hidden relative border shadow-lg group-hover:border-white/30 group-hover:shadow-2xl transition-all duration-300">
          {poster ? (
            <img 
              src={poster} 
              alt={torrent.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center bg-gradient-to-b from-[#1c1c1c] to-[#121212]">
              <IconComponent className="w-10 h-10 text-gray-600 mb-2" />
              <span className="text-xs font-semibold text-gray-400 line-clamp-2">{titleText}</span>
            </div>
          )}

          {/* Top Resolution / Quality Badge */}
          {(torrent.quality || torrent.resolution) && (
            <div className="absolute top-2.5 right-2.5">
              <span className="text-[10px] font-extrabold bg-black/80 backdrop-blur-md px-2 py-0.5 rounded-none text-white border uppercase tracking-wide">
                {torrent.quality || torrent.resolution}
              </span>
            </div>
          )}

          {/* Bottom Gradient Overlay for subtle tag display */}
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/80 via-black/30 to-transparent pointer-events-none" />

          {/* Seeds Pill */}
          <div className="absolute bottom-2.5 left-2.5">
            <span className="text-[10px] font-bold bg-black/75 backdrop-blur-md px-2 py-0.5 rounded-none text-emerald-400 border flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              {torrent.seeds > 1000 ? `${(torrent.seeds / 1000).toFixed(1)}k` : torrent.seeds} seeds
            </span>
          </div>
        </div>

        {/* Card Typography & Metadata */}
        <div className="mt-2.5 px-0.5 flex flex-col">
          {/* Main Title (Year) */}
          <h3 className="text-sm font-bold text-white tracking-tight leading-snug line-clamp-1 group-hover:text-primary transition-colors">
            {titleText}
            {yearText && <span className="text-gray-400 font-normal ml-1">({yearText})</span>}
          </h3>
          
          {/* Subtitle Line: Icon + Genre/Category + Size */}
          <div className="flex items-center justify-between text-xs text-[#888] font-medium mt-1">
            <div className="flex items-center gap-1.5 truncate">
              <IconComponent className="w-3.5 h-3.5 text-gray-500 shrink-0" />
              <span className="truncate">{torrent.genre?.[0] || torrent.category}</span>
            </div>
            <span className="text-[11px] text-gray-400 font-mono shrink-0 ml-2">
              {formatBytes(torrent.size)}
            </span>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
