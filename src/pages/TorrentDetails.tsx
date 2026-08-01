import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { mockProvider } from '../api/mockProvider';
import { formatBytes } from '../lib/utils';
import { useFavoritesStore } from '../store/useFavoritesStore';
import { useHistoryStore } from '../store/useHistoryStore';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Download, Copy, Share2, Heart, ExternalLink, HardDrive, 
  Users, ArrowDownToLine, Hash, Calendar, ShieldCheck, 
  Play, Film, Tv, Star, Check, Sparkles, FolderArchive 
} from 'lucide-react';
import { VideoStreamPlayer } from '../components/VideoStreamPlayer';
import { TorrentCard, formatCardTitle } from '../components/ui/TorrentCard';
import { playClickSound, playDownloadSound, playOpenSound, playHoverSound } from '../lib/sound';

type TabType = 'overview' | 'stream' | 'files' | 'details';

function cleanOverviewDescription(desc: string | undefined, titleText: string, category: string): string {
  if (!desc) {
    return `${titleText} is available in high quality ${category.toLowerCase()} format.`;
  }

  // Strip brackets, tags, and URLs (image links like postimg, vlcsnap, etc.)
  let text = desc
    .replace(/\[.*?\]/g, '')
    .replace(/https?:\/\/\S+/gi, '')
    .trim();

  // Filter out MediaInfo / NFO lines and technical dumps
  const lines = text.split('\n');
  const cleanLines = lines.filter(line => {
    const l = line.trim();
    if (!l) return false;

    // Section headers like "Video", "Audio", "Text #1", "Text #2", "General", "ID : 1"
    if (/^(General|Video|Audio|Text(\s*#\d+)?|Menus?|ID\s*:\s*\d+)\s*$/i.test(l)) {
      return false;
    }

    // MediaInfo key-value lines (e.g., "Key : Value", "Key, Subkey : Value", "Format settings, CABAC : Yes")
    if (/^(Format|Codec|File size|Duration|Bit rate|Frame rate|Title|Encoded|Tagged|Writing|Cover|Video|Audio|Text|Width|Height|Display|Color|Chroma|Bit depth|Scan|Bits|Stream|Language|Transfer|Matrix|Menus|mdhd|Commercial|Sampling|Channel|Compression|Service|Default|Alternate|Dialog|Dialogue|Muxing|Forced|Count|ID|Nominal|Minimum|Maximum|Overall)\b.*:/i.test(l)) {
      return false;
    }

    // Any line with MediaInfo specific terms or units
    if (/\b(kb\/s|mb\/s|gb\/s|FPS|GiB|MiB|KiB|CABAC|avcC|tx3g|ec-3|sbtl|BT\.709|YUV|4:2:0|DDP5\.1|24000\/1001|normalization)\b/i.test(l)) {
      return false;
    }

    // Language lists like "ENG ESP FRE POR TUR SUBS" or "SUBS : ENG FRE..."
    if (/\b(ENG|ESP|FRE|GER|ITA|POR|RUS|TUR|SPA|SUBS|SUBTITLES)\b/i.test(l) && (l.length < 60 || l.includes(':'))) {
      return false;
    }

    // Technical release filename strings like Obsession.2026.1080p.AMZN.WEB-DL
    if (/\.(mkv|mp4|avi|iso|rar|zip|7z)\b/i.test(l) || (/WEB-DL|DDP5\.1|H264|x264|x265|HEVC|1080p|720p|2160p/i.test(l) && l.length < 80)) {
      return false;
    }

    return true;
  });

  const cleanedText = cleanLines.join('\n').trim();

  if (cleanedText.length < 15) {
    return `${titleText} is available in high definition format with clean audio and video streams.`;
  }

  return cleanedText;
}

export function TorrentDetails() {
  const { id } = useParams<{ id: string }>();
  const { isFavorite, addFavorite, removeFavorite } = useFavoritesStore();
  const { addHistory } = useHistoryStore();
  
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [selectedStreamTitle, setSelectedStreamTitle] = useState<string>('');
  const [copied, setCopied] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['torrent', id],
    queryFn: () => mockProvider.details(id!)
  });

  // Fetch related torrents in same category for "More Like This"
  const { data: relatedData } = useQuery({
    queryKey: ['related', data?.category],
    queryFn: () => mockProvider.category(data?.category || 'Movies', 1),
    enabled: !!data?.category
  });

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto p-4 space-y-8 animate-pulse">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-80 aspect-[2/3] bg-white/5 rounded-none" />
          <div className="flex-1 space-y-4">
            <div className="h-10 w-2/3 bg-white/5 rounded-none" />
            <div className="h-6 w-1/3 bg-white/5 rounded-none" />
            <div className="h-32 w-full bg-white/5 rounded-none" />
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-20 text-gray-400">
        <h2 className="text-2xl font-bold mb-2">Torrent Not Found</h2>
        <p className="text-sm">The requested item could not be retrieved.</p>
      </div>
    );
  }

  const favorite = isFavorite(data.id);
  const { titleText, yearText } = formatCardTitle(data.title, data.uploadDate);

  const handleFavorite = () => {
    playClickSound();
    if (favorite) removeFavorite(data.id);
    else addFavorite(data);
  };

  const handleOpenMagnet = () => {
    playDownloadSound();
    addHistory({
      torrentId: data.id,
      title: data.title,
      category: data.category,
      magnetLink: data.magnetLink,
      status: 'Opened'
    });
    window.location.href = data.magnetLink;
  };

  const handleCopyMagnet = () => {
    playDownloadSound();
    addHistory({
      torrentId: data.id,
      title: data.title,
      category: data.category,
      magnetLink: data.magnetLink,
      status: 'Copied'
    });
    navigator.clipboard.writeText(data.magnetLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const startStream = (streamName?: string) => {
    playOpenSound();
    setSelectedStreamTitle(streamName || data.title);
    setActiveTab('stream');
    window.scrollTo({ top: 100, behavior: 'smooth' });
  };

  // Filter out current item from recommendations
  const relatedList = (relatedData || [])
    .filter(item => item.id !== data.id)
    .slice(0, 4);

  // Extract fake or real rating
  const numericRating = data.gameMeta?.rating 
    ? (data.gameMeta.rating / 10).toFixed(1) 
    : (data.seeds > 100 ? '9.0' : '8.4');

  const genresDisplay = data.genre && data.genre.length > 0 
    ? data.genre.join(', ') 
    : `${data.category}, High Definition`;

  return (
    <div className="pb-16 max-w-6xl mx-auto px-2 sm:px-4">
      {/* Top Banner & Main Details Container */}
      <div className="flex flex-col lg:flex-row gap-8 items-start mb-10">
        
        {/* Left Column: Poster with Red Play Button Overlay */}
        <div className="w-full lg:w-[340px] shrink-0 relative group">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative rounded-none overflow-hidden bg-[#222222] border shadow-2xl"
          >
            {data.poster ? (
              <img 
                src={data.poster} 
                alt={data.title} 
                className="w-full h-auto aspect-[2/3] object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="w-full aspect-[2/3] bg-gradient-to-br from-[#1f1f1f] to-[#0d0d0d] flex flex-col items-center justify-center p-6 text-center">
                <Film className="w-16 h-16 text-gray-600 mb-3" />
                <span className="text-sm font-bold text-gray-400">{titleText}</span>
              </div>
            )}

            {/* Overlapping Red Play Button (Matching UX Screenshot) */}
            <button
              onClick={() => startStream()}
              className="absolute bottom-4 right-4 bg-[#e50914] hover:bg-[#ff0f1a] text-white px-6 py-3 rounded-none font-black text-sm uppercase tracking-wider shadow-[0_10px_25px_rgba(229,9,20,0.6)] flex items-center gap-2.5 transition-all duration-300 hover:scale-105 active:scale-95 z-20 cursor-pointer"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>Play</span>
            </button>
          </motion.div>
        </div>

        {/* Right Column: Title, Rating, Sub-bar, Tabs & Content */}
        <div className="flex-1 w-full flex flex-col">
          
          {/* Header Row: Title & Star Rating */}
          <div className="flex items-start justify-between gap-4 mb-2">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
              {titleText}
            </h1>
            
            {/* Rating Display */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border rounded-none text-yellow-400 font-bold text-lg shrink-0">
              <span>{numericRating}</span>
              <Star className="w-5 h-5 fill-current" />
            </div>
          </div>

          {/* Subtitle Info Line: Year | Size | Category | Rating Tag */}
          <div className="flex flex-wrap items-center gap-3 text-sm font-medium text-gray-400 mb-6">
            {yearText && <span>{yearText}</span>}
            {yearText && <span>•</span>}
            <span className="font-mono text-gray-300">{formatBytes(data.size)}</span>
            <span>•</span>
            <span className="px-2 py-0.5 bg-white/10 text-white rounded text-xs font-semibold">
              {data.quality || data.resolution || 'HD'}
            </span>
            <span>•</span>
            <span className="text-emerald-400 font-bold">{data.seeds} Seeds</span>
          </div>

          {/* Navigation Tabs (OVERVIEW | TRAILERS & MORE | FILES | DETAILS) */}
          <div className="flex items-center gap-8 border-b mb-6 overflow-x-auto no-scrollbar">
            {[
              { id: 'overview', label: 'OVERVIEW' },
              { id: 'stream', label: 'TRAILERS & MORE' },
              { id: 'files', label: `FILES (${data.files.length})` },
              { id: 'details', label: 'DETAILS' }
            ].map(tab => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`pb-3 text-xs sm:text-sm font-extrabold uppercase tracking-widest transition-all relative whitespace-nowrap ${
                    isActive ? 'text-white' : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  {tab.label}
                  {isActive && (
                    <motion.div 
                      layoutId="activeTabUnderline"
                      className="absolute bottom-0 left-0 right-0 h-1 bg-[#e50914] rounded-full"
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Tab Content Container */}
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                {/* Description Paragraph */}
                <p className="text-gray-300 text-sm sm:text-base leading-relaxed whitespace-pre-line font-normal">
                  {data.gameMeta?.summary || cleanOverviewDescription(data.description, titleText, data.category)}
                </p>

                {/* Key Metadata Table */}
                <div className="space-y-3 text-sm text-gray-400 border-t border-b py-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <span className="text-gray-500 font-semibold">Uploader / Source</span>
                    <span className="sm:col-span-2 text-white font-medium">{data.uploader}</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <span className="text-gray-500 font-semibold">Category / Format</span>
                    <span className="sm:col-span-2 text-white font-medium">{data.category} ({data.quality || 'Standard'})</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <span className="text-gray-500 font-semibold">Genre</span>
                    <span className="sm:col-span-2 text-emerald-400 font-medium">{genresDisplay}</span>
                  </div>
                </div>

                {/* Quick Action Buttons */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button 
                    onClick={handleOpenMagnet}
                    className="flex items-center gap-2 px-6 py-3 bg-[#e50914] hover:bg-[#ff0f1a] text-white font-bold rounded-none text-xs uppercase tracking-wider transition-all shadow-lg"
                  >
                    <Download className="w-4 h-4" /> Download Magnet
                  </button>
                  <button 
                    onClick={handleCopyMagnet}
                    className="flex items-center gap-2 px-5 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-none text-xs uppercase tracking-wider border transition-all"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    {copied ? 'Copied Link' : 'Copy Link'}
                  </button>
                  <button 
                    onClick={handleFavorite}
                    className={`p-3 rounded-none border transition-all ${
                      favorite 
                        ? 'bg-[#e50914]/20 border-[#e50914]/40 text-[#e50914]' 
                        : 'bg-white/5 text-gray-400 hover:text-white'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${favorite ? 'fill-current' : ''}`} />
                  </button>
                </div>

                {/* Related Movies / More Like This Section */}
                {relatedList.length > 0 && (
                  <div className="pt-6">
                    <h3 className="text-base font-bold text-white mb-4 tracking-tight flex items-center gap-2">
                      <Film className="w-4 h-4 text-[#e50914]" />
                      <span>More Like This</span>
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {relatedList.map(item => (
                        <div key={item.id} className="h-full">
                          <TorrentCard torrent={item} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'stream' && (
              <motion.div
                key="stream"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-rose-500 uppercase tracking-wider flex items-center gap-2">
                    <Film className="w-4 h-4" /> Official YouTube Trailers & Previews
                  </h3>
                  <span className="text-xs text-gray-400 font-mono">
                    HD Trailer Preview
                  </span>
                </div>

                <VideoStreamPlayer 
                  title={selectedStreamTitle || data.title}
                  defaultQuality={data.quality || data.resolution || '1080p'}
                  poster={data.poster}
                />
              </motion.div>
            )}

            {activeTab === 'files' && (
              <motion.div
                key="files"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-[#2a2a2a] border rounded-none overflow-hidden"
              >
                <div className="p-4 bg-white/5 border-b flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FolderArchive className="w-4 h-4 text-[#e50914]" />
                    <span className="font-bold text-white text-xs uppercase tracking-wider">Package Contents ({data.files.length})</span>
                  </div>
                  <span className="text-xs text-gray-400 font-mono">Total: {formatBytes(data.size)}</span>
                </div>

                <div className="divide-y divide-white/5 max-h-[420px] overflow-y-auto">
                  {data.files.map((file, i) => {
                    const isVideoFile = /\.(mp4|mkv|avi|mov|webm|m4v)$/i.test(file.name) || ['Movies', 'TV Shows', 'Anime'].includes(data.category);
                    return (
                      <div key={i} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors group">
                        <div className="text-sm font-medium truncate pr-4 text-gray-200 flex items-center gap-2.5">
                          {isVideoFile ? (
                            <Film className="w-4 h-4 text-emerald-400 shrink-0" />
                          ) : (
                            <FolderArchive className="w-4 h-4 text-gray-500 shrink-0" />
                          )}
                          <span className="truncate">{file.name}</span>
                        </div>
                        <div className="flex items-center gap-4 shrink-0">
                          <span className="text-xs text-gray-400 font-mono">{formatBytes(file.size)}</span>
                          {isVideoFile && (
                            <button
                              onClick={() => startStream(file.name)}
                              className="px-3 py-1 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white rounded text-xs font-bold transition-all flex items-center gap-1.5 border border-emerald-500/20"
                            >
                              <Play className="w-3 h-3 fill-current" /> Stream
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {activeTab === 'details' && (
              <motion.div
                key="details"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-[#2a2a2a] border rounded-none p-6 space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                  <div>
                    <div className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Info Hash</div>
                    <div className="font-mono text-xs text-gray-200 break-all bg-black/50 p-3 rounded-none border">
                      {data.hash}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Category & Subtype</div>
                    <div className="font-medium text-white">{data.category}</div>
                  </div>

                  <div>
                    <div className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Seeders / Leechers</div>
                    <div className="font-medium text-white flex items-center gap-3">
                      <span className="text-emerald-400 font-bold">{data.seeds} Seeds</span>
                      <span className="text-rose-400 font-bold">{data.leeches} Leeches</span>
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Upload Timestamp</div>
                    <div className="font-medium text-white">{new Date(data.uploadDate).toLocaleString()}</div>
                  </div>

                  {data.imdbRating && (
                    <div>
                      <div className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">IMDb Reference</div>
                      <a href={`${import.meta.env.VITE_IMDB_BASE_URL || 'https://www.imdb.com/title'}/${data.imdbRating}`} target="_blank" rel="noopener noreferrer" className="text-[#e50914] font-bold hover:underline inline-flex items-center gap-1">
                        {data.imdbRating} <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  )}
                </div>

                {data.description && (
                  <div className="pt-4 border-t">
                    <div className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-2">Technical Specifications & MediaInfo</div>
                    <pre className="font-mono text-xs text-gray-400 bg-black/60 p-4 rounded-none border overflow-x-auto whitespace-pre-wrap max-h-60 leading-relaxed">
                      {data.description}
                    </pre>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
