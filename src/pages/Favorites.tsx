import React from 'react';
import { useFavoritesStore } from '../store/useFavoritesStore';
import { TorrentCard } from '../components/ui/TorrentCard';
import { motion } from 'framer-motion';

export function Favorites() {
  const { favorites } = useFavoritesStore();

  return (
    <div className="pb-12">
      <div className="mb-8">
        <h1 className="text-3xl font-black tracking-tight">Your Favorites</h1>
        <p className="text-muted-foreground mt-2">Torrents you've saved for later.</p>
      </div>

      {favorites.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <p className="text-lg">No favorites yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
          {favorites.map((torrent, i) => (
            <motion.div
              key={torrent.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2, delay: i * 0.05 }}
            >
              <TorrentCard torrent={torrent} />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
