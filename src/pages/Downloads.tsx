import React from 'react';
import { useHistoryStore } from '../store/useHistoryStore';
import { motion } from 'framer-motion';
import { Download, Copy, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { playClickSound, playHoverSound, playDownloadSound } from '../lib/sound';

export function Downloads() {
  const { history, clearHistory } = useHistoryStore();

  return (
    <div className="pb-12 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Download History</h1>
          <p className="text-muted-foreground mt-2">Torrents you've opened or copied.</p>
        </div>
        {history.length > 0 && (
          <button 
            onClick={() => {
              playClickSound();
              clearHistory();
            }}
            onMouseEnter={playHoverSound}
            className="flex items-center gap-2 px-4 py-2 text-sm text-destructive hover:bg-destructive/10 rounded-none transition-colors border hover:border-destructive/20"
          >
            <Trash2 className="w-4 h-4" />
            Clear History
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground bg-card rounded-none">
          <Download className="w-12 h-12 mb-4 opacity-50" />
          <p className="text-lg">No download history yet.</p>
        </div>
      ) : (
        <div className="bg-card rounded-none overflow-hidden">
          <div className="divide-y divide-border">
            {history.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: Math.min(i * 0.05, 0.5) }}
                className="p-4 hover:bg-secondary/30 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-none border ${
                      item.status === 'Opened' ? 'bg-primary/10 text-primary' : 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                    }`}>
                      {item.status}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(item.date).toLocaleString()}
                    </span>
                  </div>
                  <Link to={`/torrent/${item.torrentId}`} className="font-medium text-foreground hover:text-primary transition-colors block truncate">
                    {item.title}
                  </Link>
                </div>
                
                <div className="flex items-center gap-2 shrink-0">
                  <button 
                    onClick={() => {
                      playDownloadSound();
                      window.location.href = item.magnetLink;
                    }}
                    onMouseEnter={playHoverSound}
                    className="p-2 bg-secondary text-secondary-foreground rounded-none hover:bg-primary/20 hover:text-primary transition-colors border border-border"
                    title="Open Magnet"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => {
                      playDownloadSound();
                      navigator.clipboard.writeText(item.magnetLink);
                    }}
                    onMouseEnter={playHoverSound}
                    className="p-2 bg-secondary text-secondary-foreground rounded-none hover:bg-secondary/80 transition-colors border border-border"
                    title="Copy Magnet"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
