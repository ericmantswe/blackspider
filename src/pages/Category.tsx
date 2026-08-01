import React, { useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { mockProvider } from '../api/mockProvider';
import { TorrentCard } from '../components/ui/TorrentCard';
import { Pagination } from '../components/ui/Pagination';
import { Category as CategoryType } from '../types';
import { motion } from 'framer-motion';

const PAGE_SIZE = 20;

export function Category() {
  const { categoryName } = useParams<{ categoryName: string }>();
  const location = useLocation();
  const [page, setPage] = useState(1);

  const isTrending = location.pathname.includes('/trending');
  const isTop100 = location.pathname.includes('/top100');

  const title = categoryName || (isTrending ? 'Trending' : isTop100 ? 'Top 100' : 'Category');

  const { data, isLoading } = useQuery({
    queryKey: ['category', title, page],
    queryFn: () => {
      if (isTrending) return mockProvider.trending();
      if (isTop100) return mockProvider.top100();
      return mockProvider.category(categoryName as CategoryType, page);
    },
    staleTime: 60_000,
  });

  // Paginate client-side if the API returns all results at once
  const allItems = data ?? [];
  const totalPages = Math.max(1, Math.ceil(allItems.length / PAGE_SIZE));
  const paginatedItems = allItems.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handlePageChange = (p: number) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="pb-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-widest italic flex items-center gap-3 text-white">
            <span className="w-1 h-8 bg-primary" /> {title}
          </h1>
          <p className="text-[#888] mt-2 hidden md:block text-sm">
            Browse the latest and most popular {title.toLowerCase()}.
          </p>
        </div>
        {!isLoading && allItems.length > 0 && (
          <span className="text-xs text-[#555] font-mono hidden md:block">
            {allItems.length} results · page {page}/{totalPages}
          </span>
        )}
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
          {[...Array(PAGE_SIZE)].map((_, i) => (
            <div key={i} className="bg-card rounded-none aspect-[2/3] animate-pulse" />
          ))}
        </div>
      ) : paginatedItems.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
          {paginatedItems.map((torrent, i) => (
            <motion.div
              key={torrent.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.18, delay: Math.min(i * 0.03, 0.4) }}
            >
              <TorrentCard torrent={torrent} />
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <p className="text-lg">No torrents found in this category.</p>
        </div>
      )}

      {/* Pagination */}
      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
}
