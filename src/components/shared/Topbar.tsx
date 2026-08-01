import React, { useState } from 'react';
import { Search, Bell, Mic, Menu, LogIn, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSettingsStore } from '../../store/useSettingsStore';
import { playClickSound, playHoverSound } from '../../lib/sound';

export function Topbar({ 
  onMenuClick,
  onDownloadClick
}: { 
  onMenuClick: () => void;
  onDownloadClick: () => void;
}) {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const { theme, setTheme } = useSettingsStore();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      playClickSound();
      navigate(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  const startVoiceSearch = () => {
    playClickSound();
    if ('webkitSpeechRecognition' in window) {
      const recognition = new (window as any).webkitSpeechRecognition();
      recognition.lang = 'en-US';
      recognition.start();
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setQuery(transcript);
        navigate(`/search?q=${encodeURIComponent(transcript)}`);
      };
    } else {
      alert('Voice search is not supported in your browser.');
    }
  };

  return (
    <header className="h-14 flex items-center justify-between px-4 md:px-6 border-b shrink-0 bg-[#1a1a1a]/90 backdrop-blur-xl sticky top-0 z-40">
      {/* Left — hamburger + search */}
      <div className="flex items-center flex-1 gap-4 max-w-xl">
        <button
          onClick={() => {
            playClickSound();
            onMenuClick();
          }}
          onMouseEnter={playHoverSound}
          className="p-2 -ml-2 text-[#666] hover:text-white rounded-full transition-colors md:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>

        <form onSubmit={handleSearch} className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search movies, games, anime…"
            className="w-full bg-white/5 border rounded-full py-1.5 pl-10 pr-9 text-sm focus:outline-none focus:border-primary/60 focus:bg-white/8 transition-all placeholder:text-[#444] text-white"
          />
          <button
            type="button"
            onClick={startVoiceSearch}
            onMouseEnter={playHoverSound}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#555] hover:text-primary transition-colors"
          >
            <Mic className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Right — notifications + login */}
      <div className="flex items-center gap-3 ml-4 md:ml-6">
        {/* Download App Button */}
        <button
          onClick={() => {
            playClickSound();
            onDownloadClick();
          }}
          onMouseEnter={playHoverSound}
          className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-white/5 hover:bg-white/10 text-white border border-white/5 transition-all duration-200 active:scale-95 cursor-pointer shadow-[0_0_8px_rgba(255,255,255,0.02)]"
        >
          <Download className="w-3.5 h-3.5 text-primary" />
          <span>Download App</span>
        </button>

        {/* Notification Bell */}
        <button
          onClick={playClickSound}
          onMouseEnter={playHoverSound}
          className="relative p-2 text-[#666] hover:text-white rounded-full hover:bg-white/5 transition-all"
          title="Notifications"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
        </button>

        {/* Login Button */}
        <button
          onClick={playClickSound}
          onMouseEnter={playHoverSound}
          id="login-btn"
          className="flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold bg-primary hover:bg-[#d91424] text-white border shadow-[0_0_14px_rgba(193,18,31,0.25)] hover:shadow-[0_0_20px_rgba(193,18,31,0.45)] transition-all duration-200 active:scale-95"
        >
          <LogIn className="w-4 h-4" />
          <span>Login</span>
        </button>
      </div>
    </header>
  );
}

