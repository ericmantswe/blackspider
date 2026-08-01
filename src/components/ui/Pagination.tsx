import React from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';
import { playClickSound, playHoverSound } from '../../lib/sound';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({ currentPage, totalPages, onPageChange, className }: PaginationProps) {
  if (totalPages <= 1) return null;

  // Build page number array with ellipsis
  const getPages = (): (number | '...')[] => {
    const pages: (number | '...')[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
      return pages;
    }
    pages.push(1);
    if (currentPage > 4) pages.push('...');
    const start = Math.max(2, currentPage - 2);
    const end = Math.min(totalPages - 1, currentPage + 2);
    for (let i = start; i <= end; i++) pages.push(i);
    if (currentPage < totalPages - 3) pages.push('...');
    pages.push(totalPages);
    return pages;
  };

  return (
    <div className={cn('flex items-center justify-center gap-1 mt-10 select-none', className)}>
      {/* Prev */}
      <button
        onClick={() => {
          playClickSound();
          onPageChange(currentPage - 1);
        }}
        onMouseEnter={playHoverSound}
        disabled={currentPage === 1}
        className="flex items-center gap-1 px-3 py-2 text-xs font-bold uppercase tracking-wider text-[#888] hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
      >
        <ChevronLeft className="w-3.5 h-3.5" /> Prev
      </button>

      {/* Page numbers */}
      {getPages().map((page, i) =>
        page === '...' ? (
          <span key={`ellipsis-${i}`} className="px-2 py-2 text-[#555] text-sm">
            ···
          </span>
        ) : (
          <motion.button
            key={page}
            onClick={() => {
              playClickSound();
              onPageChange(page);
            }}
            onMouseEnter={playHoverSound}
            whileTap={{ scale: 0.92 }}
            className={cn(
              'min-w-[36px] h-9 px-2 text-sm font-bold transition-all',
              currentPage === page
                ? 'bg-primary text-white'
                : 'text-[#888] hover:text-white hover:bg-white/5'
            )}
          >
            {page}
          </motion.button>
        )
      )}

      {/* Next */}
      <button
        onClick={() => {
          playClickSound();
          onPageChange(currentPage + 1);
        }}
        onMouseEnter={playHoverSound}
        disabled={currentPage === totalPages}
        className="flex items-center gap-1 px-3 py-2 text-xs font-bold uppercase tracking-wider text-[#888] hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
      >
        Next <ChevronRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
