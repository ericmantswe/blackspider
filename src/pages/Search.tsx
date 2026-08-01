import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { mockProvider } from '../api/mockProvider';
import { TorrentCard } from '../components/ui/TorrentCard';
import { Pagination } from '../components/ui/Pagination';
import { motion } from 'framer-motion';

const PAGE_SIZE = 20;

export function Search() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [page, setPage] = useState(1);

  // Reset to page 1 when search query changes
  useEffect(() => {
    setPage(1);
  }, [query]);

  // Debounce the query for the API call
  const [debouncedQuery, setDebouncedQuery] = useState(query);
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const { data, isLoading } = useQuery({
    queryKey: ['search', debouncedQuery],
    queryFn: () => mockProvider.search(debouncedQuery),
    enabled: !!debouncedQuery,
    staleTime: 60_000,
  });

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
            <span className="w-1 h-8 bg-primary" /> Search Results
          </h1>
          <p className="text-[#888] mt-2 hidden md:block text-sm">
            {query ? `Showing results for "${query}"` : 'Enter a search term above'}
          </p>
        </div>
        {!isLoading && allItems.length > 0 && (
          <span className="text-xs text-[#555] font-mono hidden md:block">
            {allItems.length} results · page {page}/{totalPages}
          </span>
        )}
      </div>

      {/* Grid */}
      {isLoading && !!debouncedQuery ? (
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
        debouncedQuery && !isLoading && (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <p className="text-lg">No results found for "{query}".</p>
          </div>
        )
      )}

      {/* Pagination */}
      {!!debouncedQuery && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}
