import React from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { 
  Home, Film, Tv, Gamepad2, Play, Music, 
  AppWindow, Book, TrendingUp, Trophy, 
  Heart, Download, Settings, Bug
} from 'lucide-react';
import { playClickSound, playHoverSound } from '../../lib/sound';

const navSections = [
  {
    title: 'Library',
    items: [
      { icon: Home, label: 'Home', path: '/' },
      { icon: Film, label: 'Movies', path: '/category/Movies' },
      { icon: Tv, label: 'TV Shows', path: '/category/TV Shows' },
      { icon: Gamepad2, label: 'Games', path: '/category/Games' },
      { icon: Play, label: 'Anime', path: '/category/Anime' },
      { icon: Music, label: 'Music', path: '/category/Music' },
      { icon: AppWindow, label: 'Applications', path: '/category/Applications' },
      { icon: Book, label: 'Books', path: '/category/Books' },
    ]
  },
  {
    title: 'Discover',
    items: [
      { icon: TrendingUp, label: 'Trending', path: '/trending' },
      { icon: Trophy, label: 'Top 100', path: '/top100' },
    ]
  },
  {
    title: 'My Collection',
    items: [
      { icon: Heart, label: 'Favorites', path: '/favorites' },
      { icon: Download, label: 'Downloads', path: '/downloads' },
      { icon: Settings, label: 'Settings', path: '/settings' },
    ]
  }
];

export function Sidebar({ 
  isOpen, 
  onClose,
  onDownloadClick
}: { 
  isOpen: boolean; 
  onClose: () => void;
  onDownloadClick: () => void;
}) {
  return (
    <aside className={cn(
      "w-60 bg-[#222222] border-r flex flex-col fixed left-0 top-0 h-full z-50 transition-transform duration-300 md:translate-x-0 shrink-0",
      isOpen ? "translate-x-0" : "-translate-x-full"
    )}>
      <div className="p-6 flex items-center gap-3 mb-4">
        <img 
          src="/BlackSpiderlogo.png" 
          alt="Black Spider Logo" 
          className="w-9 h-9 object-contain filter drop-shadow-[0_0_10px_rgba(193,18,31,0.6)]" 
        />
        <span className="text-xl font-bold tracking-tighter uppercase italic text-white">
          Black Spider
        </span>
      </div>
      
      <nav className="flex-1 px-4 pb-6 space-y-1 overflow-y-auto">
        {navSections.map((section, sectionIdx) => (
          <React.Fragment key={section.title}>
            <div className={cn(
              "text-[10px] uppercase text-[#666] font-bold tracking-widest px-2 mb-2",
              sectionIdx > 0 && "mt-6"
            )}>
              {section.title}
            </div>
            {section.items.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => {
                    playClickSound();
                    onClose();
                  }}
                  onMouseEnter={playHoverSound}
                  className={({ isActive }) => cn(
                    "flex items-center gap-3 px-3 py-2 transition-colors",
                    isActive 
                      ? "bg-primary/10 border-l-2 border-primary text-white" 
                      : "text-[#888] hover:text-white"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{item.label}</span>
                </NavLink>
              );
            })}
          </React.Fragment>
        ))}
      </nav>

      {/* Desktop App Banner */}
      <div className="px-4 py-3 shrink-0">
        <button
          onClick={() => {
            playClickSound();
            onDownloadClick();
            onClose();
          }}
          onMouseEnter={playHoverSound}
          className="w-full p-3 rounded-xl bg-gradient-to-r from-primary/25 via-primary/5 to-white/3 border border-primary/25 text-left hover:border-primary/50 transition-all cursor-pointer group shadow-[0_0_12px_rgba(193,18,31,0.1)] hover:shadow-[0_0_16px_rgba(193,18,31,0.2)]"
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold text-white uppercase tracking-wider">Desktop App</span>
            <span className="text-[9px] bg-primary/25 text-primary border border-primary/40 px-2 py-0.5 rounded font-extrabold tracking-wider">
              Bypass Blocks
            </span>
          </div>
          <p className="text-[10px] text-[#999] leading-normal group-hover:text-white transition-colors">
            Run on local residential IP to unlock unlimited results.
          </p>
        </button>
      </div>

      {/* Developer credit */}
      <div className="p-4 border-t border-white/5 text-center text-[10px] uppercase tracking-[0.2em] text-[#555] font-medium shrink-0">
        Developed by <span className="text-primary/70">Eric Mantswe</span>
      </div>
    </aside>
  );
}
