import React, { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { mockProvider } from '../api/mockProvider';
import { formatCardTitle } from '../components/ui/TorrentCard';
import { HorizontalRow } from '../components/ui/HorizontalRow';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, Trophy, Sparkles, Download, Info, Film, Gamepad2, Music } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatBytes } from '../lib/utils';
import { useHistoryStore } from '../store/useHistoryStore';
import { playDownloadSound, playOpenSound, playScrollSound, playHoverSound } from '../lib/sound';
import CoverflowCarousel, { type CoverflowImage } from '../components/ui/CoverflowCarousel';

export function Home() {
  const navigate = useNavigate();
  const { addHistory } = useHistoryStore();
  const [billboardIndex, setBillboardIndex] = useState(0);

  const { data: trending, isLoading: isLoadingTrending } = useQuery({
    queryKey: ['trending'],
    queryFn: () => mockProvider.trending()
  });

  const { data: top100, isLoading: isLoadingTop } = useQuery({
    queryKey: ['top100'],
    queryFn: () => mockProvider.top100()
  });

  const { data: movies, isLoading: isLoadingMovies } = useQuery({
    queryKey: ['category-Movies'],
    queryFn: () => mockProvider.category('Movies')
  });

  const { data: games, isLoading: isLoadingGames } = useQuery({
    queryKey: ['category-Games'],
    queryFn: () => mockProvider.category('Games')
  });

  const { data: music, isLoading: isLoadingMusic } = useQuery({
    queryKey: ['category-Music'],
    queryFn: () => mockProvider.category('Music')
  });

  // Billboard items — use first 10 trending items that have a poster
  const billboardItems = useMemo(() => {
    if (!trending) return [];
    return trending.filter(t => t.poster).slice(0, 10);
  }, [trending]);

  const coverflowImages: CoverflowImage[] = useMemo(() =>
    billboardItems.map(t => ({ srcUrl: t.poster!, alt: t.title })),
    [billboardItems]
  );

  const currentBillboard = billboardItems[billboardIndex] || billboardItems[0];

  const handleDownloadMagnet = (item: typeof currentBillboard) => {
    if (!item) return;
    addHistory({
      torrentId: item.id,
      title: item.title,
      category: item.category,
      magnetLink: item.magnetLink,
      status: 'Opened'
    });
    window.location.href = item.magnetLink;
  };

  return (
    <div className="pb-16 space-y-10">

      {/* ── Movie Billboard — Coverflow Carousel ───────────────── */}
      <section className="relative rounded-none overflow-hidden border shadow-2xl bg-[#222222]">
        {/* Blurred backdrop from active poster */}
        <AnimatePresence mode="sync">
          {currentBillboard?.poster && (
            <motion.div
              key={currentBillboard.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
              className="absolute inset-0 z-0"
            >
              <img
                src={currentBillboard.poster}
                alt=""
                className="w-full h-full object-cover scale-110 blur-2xl opacity-20"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-[#222222]/40 via-[#222222]/60 to-[#222222]" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Coverflow Carousel */}
        <div className="relative z-10" style={{ height: 440 }}>
          {isLoadingTrending || coverflowImages.length === 0 ? (
            <div className="h-full flex items-center justify-center text-gray-500">
              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-full border-2 border-t-primary animate-spin" />
                <span className="text-sm font-semibold tracking-wide">Loading Billboard…</span>
              </div>
            </div>
          ) : (
            <CoverflowCarousel
              images={coverflowImages}
              activeWidth={520}
              activeHeight={340}
              restWidth={160}
              restHeight={240}
              gap={24}
              radius={3}
              showArrows={true}
              arrowColor="#ffffff"
              arrowBackground="rgba(193,18,31,0.75)"
              arrowSize={44}
              arrowPosition={92}
              autoplay={true}
              autoplayDirection="rightToLeft"
              transition={{ type: "tween", duration: 0.4, delay: 2.5, ease: "easeInOut" }}
              style={{ height: "100%" }}
              onIndexChange={setBillboardIndex}
            />
          )}
        </div>

        {/* Info panel — syncs with the autoplay via an interval that mirrors carousel dwell */}
        {currentBillboard && (() => {
          const { titleText, yearText } = formatCardTitle(currentBillboard.title, currentBillboard.uploadDate);
          return (
            <div className="relative z-10 px-6 pb-6 pt-2 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentBillboard.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col gap-2"
                >
                  {/* Badges row */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="bg-primary text-white text-[10px] font-black px-2.5 py-0.5 rounded-none uppercase tracking-widest flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3 fill-current" />
                      Billboard Pick
                    </span>
                    <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/20">
                      {currentBillboard.seeds.toLocaleString()} Seeds
                    </span>
                    <span className="text-[11px] font-mono text-gray-400 bg-white/8 px-2.5 py-0.5 rounded">
                      {formatBytes(currentBillboard.size)}
                    </span>
                    {currentBillboard.quality && (
                      <span className="text-[11px] font-bold text-white bg-white/10 px-2.5 py-0.5 rounded uppercase tracking-wide">
                        {currentBillboard.quality}
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight leading-tight">
                    {titleText}
                    {yearText && <span className="text-gray-500 font-light ml-2 text-xl">({yearText})</span>}
                  </h2>
                </motion.div>
              </AnimatePresence>

              {/* Action buttons */}
              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={() => { playDownloadSound(); handleDownloadMagnet(currentBillboard); }}
                  onMouseEnter={playHoverSound}
                  className="bg-primary hover:bg-[#d91424] text-white font-bold text-xs uppercase tracking-wider px-5 py-2.5 rounded-none shadow-lg flex items-center gap-2 transition-all hover:scale-105 active:scale-95 shadow-primary/25"
                >
                  <Download className="w-4 h-4" />
                  <span>Download</span>
                </button>
                <button
                  onClick={() => { playOpenSound(); navigate(`/torrent/${currentBillboard.id}`); }}
                  onMouseEnter={playHoverSound}
                  className="bg-white/8 hover:bg-white/15 text-white font-bold text-xs uppercase tracking-wider px-5 py-2.5 rounded-none border backdrop-blur-md flex items-center gap-2 transition-all"
                >
                  <Info className="w-4 h-4 text-gray-300" />
                  <span>Details</span>
                </button>
              </div>
            </div>
          );
        })()}

        {/* Dot indicators */}
        {billboardItems.length > 1 && (
          <div className="relative z-10 flex justify-center gap-1.5 pb-4">
            {billboardItems.map((_, i) => (
              <button
                key={i}
                onClick={() => setBillboardIndex(i)}
                className={`rounded-full transition-all duration-300 ${
                  i === billboardIndex
                    ? 'w-5 h-1.5 bg-primary'
                    : 'w-1.5 h-1.5 bg-white/25 hover:bg-white/50'
                }`}
              />
            ))}
          </div>
        )}
      </section>

      {/* 1. Recommended Picks Horizontal Category Row */}
      <HorizontalRow
        title="Recommended For You"
        subtitle="Curated High-Seed Torrents"
        icon={<Sparkles className="w-5 h-5 text-[#e50914]" />}
        items={trending}
        isLoading={isLoadingTrending}
      />

      {/* 2. Trending Today Horizontal Category Row */}
      <HorizontalRow
        title="Trending Today"
        subtitle="Most Active Peers & Downloads"
        icon={<TrendingUp className="w-5 h-5 text-emerald-400" />}
        viewAllLink="/trending"
        items={trending ? trending.slice().reverse() : []}
        isLoading={isLoadingTrending}
      />

      {/* 3. Movies & Video Horizontal Category Row */}
      <HorizontalRow
        title="Movies & Cinema"
        subtitle="1080p, 4K UHD & WEB-DL Releases"
        icon={<Film className="w-5 h-5 text-rose-500" />}
        viewAllLink="/category/Movies"
        items={movies}
        isLoading={isLoadingMovies}
      />

      {/* 4. Games & Repacks Horizontal Category Row */}
      <HorizontalRow
        title="Games & PC Repacks"
        subtitle="FitGirl, DODI & GOG Game Releases"
        icon={<Gamepad2 className="w-5 h-5 text-purple-400" />}
        viewAllLink="/category/Games"
        items={games}
        isLoading={isLoadingGames}
      />

      {/* 5. Music & Audio Horizontal Category Row */}
      <HorizontalRow
        title="Music & Lossless Audio"
        subtitle="FLAC, MP3 320kbps & Full Discographies"
        icon={<Music className="w-5 h-5 text-amber-400" />}
        viewAllLink="/category/Music"
        items={music}
        isLoading={isLoadingMusic}
      />

      {/* 6. Top 100 Releases Horizontal Category Row */}
      <HorizontalRow
        title="Top 100 Releases"
        subtitle="All-Time Most Seeded Downloads"
        icon={<Trophy className="w-5 h-5 text-amber-300" />}
        viewAllLink="/latest"
        items={top100}
        isLoading={isLoadingTop}
      />
    </div>
  );
}
