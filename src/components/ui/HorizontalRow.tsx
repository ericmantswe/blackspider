import React, { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { TorrentResult } from '../../types';
import { TorrentCard } from './TorrentCard';
import { Link } from 'react-router-dom';
import { playScrollSound, playHoverSound, playClickSound } from '../../lib/sound';

interface HorizontalRowProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  viewAllLink?: string;
  items?: TorrentResult[];
  isLoading?: boolean;
}

export function HorizontalRow({
  title,
  subtitle,
  icon,
  viewAllLink,
  items = [],
  isLoading = false
}: HorizontalRowProps) {
  const rowRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (!rowRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = rowRef.current;
    setCanScrollLeft(scrollLeft > 5);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
  };

  useEffect(() => {
    checkScroll();
    const el = rowRef.current;
    if (el) {
      el.addEventListener('scroll', checkScroll, { passive: true });
      window.addEventListener('resize', checkScroll);
      return () => {
        el.removeEventListener('scroll', checkScroll);
        window.removeEventListener('resize', checkScroll);
      };
    }
  }, [items]);

  const scroll = (direction: 'left' | 'right') => {
    if (!rowRef.current) return;
    const scrollAmount = rowRef.current.clientWidth * 0.75;
    rowRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
  };

  return (
    <section className="relative space-y-4 group/row">
      {/* Header Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          {icon}
          <div>
            <h3 className="text-lg font-bold uppercase tracking-widest text-white flex items-center gap-2">
              {title}
            </h3>
            {subtitle && <p className="text-xs text-gray-400 font-mono mt-0.5">{subtitle}</p>}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {viewAllLink && (
            <Link
              to={viewAllLink}
              className="text-xs font-bold text-gray-400 hover:text-white transition-colors uppercase tracking-wider mr-2"
            >
              View All
            </Link>
          )}

          {/* Left / Right Control Buttons */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                playScrollSound();
                scroll('left');
              }}
              onMouseEnter={playHoverSound}
              disabled={!canScrollLeft}
              className={`p-2 rounded-none bg-black/60 border text-white backdrop-blur-md transition-all ${
                canScrollLeft
                  ? 'opacity-80 hover:opacity-100 hover:bg-[#e50914] hover:border-[#e50914] cursor-pointer'
                  : 'opacity-30 cursor-not-allowed'
              }`}
              title="Scroll Left"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                playScrollSound();
                scroll('right');
              }}
              onMouseEnter={playHoverSound}
              disabled={!canScrollRight}
              className={`p-2 rounded-none bg-black/60 border text-white backdrop-blur-md transition-all ${
                canScrollRight
                  ? 'opacity-80 hover:opacity-100 hover:bg-[#e50914] hover:border-[#e50914] cursor-pointer'
                  : 'opacity-30 cursor-not-allowed'
              }`}
              title="Scroll Right"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Horizontal Scroll Track */}
      {isLoading ? (
        <div className="flex gap-4 overflow-x-auto no-scrollbar py-2">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="flex-shrink-0 w-44 sm:w-52 aspect-[2/3] bg-[#2a2a2a] rounded-none border animate-pulse"
            />
          ))}
        </div>
      ) : (
        <div
          ref={rowRef}
          className="flex gap-4 overflow-x-auto no-scrollbar scroll-smooth py-2 px-0.5 snap-x snap-mandatory"
        >
          {items.map((torrent) => (
            <div
              key={torrent.id}
              className="flex-shrink-0 w-44 sm:w-52 snap-start transition-transform duration-300"
            >
              <TorrentCard torrent={torrent} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
