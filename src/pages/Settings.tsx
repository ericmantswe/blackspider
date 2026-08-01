import React, { useState } from 'react';
import { useSettingsStore } from '../store/useSettingsStore';
import { useHistoryStore } from '../store/useHistoryStore';
import { useFavoritesStore } from '../store/useFavoritesStore';
import { Trash2, Palette, Link as LinkIcon, Home, Volume2, Key, Globe } from 'lucide-react';
import { isSoundEnabled, setSoundEnabled, playClickSound } from '../lib/sound';

export function Settings() {
  const settings = useSettingsStore();
  const { clearHistory } = useHistoryStore();
  const [soundOn, setSoundOn] = useState(isSoundEnabled());

  const handleSoundToggle = (enabled: boolean) => {
    setSoundEnabled(enabled);
    setSoundOn(enabled);
    if (enabled) playClickSound();
  };

  return (
    <div className="pb-12 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-black tracking-tight text-white">Settings</h1>
        <p className="text-muted-foreground mt-2">Manage your Black Spider preferences.</p>
      </div>

      <div className="space-y-6">
        {/* Appearance & Sound */}
        <div className="bg-card rounded-none overflow-hidden">
          <div className="p-4 bg-secondary/50 border-b border-border flex items-center gap-2">
            <Palette className="w-5 h-5 text-primary" />
            <h2 className="font-bold text-white">Appearance & Audio</h2>
          </div>
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-white">Theme</div>
                <div className="text-sm text-muted-foreground">Choose between dark and light mode.</div>
              </div>
              <select 
                value={settings.theme}
                onChange={(e) => {
                  playClickSound();
                  settings.setTheme(e.target.value as 'dark' | 'light');
                }}
                className="bg-input rounded-none px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary text-white"
              >
                <option value="dark">Dark</option>
                <option value="light">Light</option>
              </select>
            </div>

            <div className="flex items-center justify-between border-t pt-4">
              <div>
                <div className="font-medium text-white flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-emerald-400" />
                  UI Sound Effects
                </div>
                <div className="text-sm text-muted-foreground">Enable audio cues for clicks, hovers, preloader, and downloads.</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer"
                  checked={soundOn}
                  onChange={(e) => handleSoundToggle(e.target.checked)}
                />
                <div className="w-11 h-6 bg-secondary peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Behavior */}
        <div className="bg-card rounded-none overflow-hidden">
          <div className="p-4 bg-secondary/50 border-b border-border flex items-center gap-2">
            <LinkIcon className="w-5 h-5 text-primary" />
            <h2 className="font-bold">Behavior</h2>
          </div>
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Auto-open Magnet Links</div>
                <div className="text-sm text-muted-foreground">Automatically launch your torrent client when clicking magnets.</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer"
                  checked={settings.autoOpenMagnet}
                  onChange={(e) => settings.setAutoOpen(e.target.checked)}
                />
                <div className="w-11 h-6 bg-secondary peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Auto-copy Magnet Links</div>
                <div className="text-sm text-muted-foreground">Copy magnet link to clipboard when clicked.</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer"
                  checked={settings.autoCopyMagnet}
                  onChange={(e) => settings.setAutoCopy(e.target.checked)}
                />
                <div className="w-11 h-6 bg-secondary peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Firecrawl API Integration */}
        <div className="bg-card rounded-none overflow-hidden">
          <div className="p-4 bg-secondary/50 border-b border-border flex items-center gap-2">
            <Key className="w-5 h-5 text-primary" />
            <h2 className="font-bold text-white">Firecrawl API Integration</h2>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-white mb-1.5">
                Firecrawl API Key
              </label>
              <div className="flex gap-2">
                <input
                  type="password"
                  value={settings.firecrawlApiKey}
                  onChange={(e) => {
                    settings.setFirecrawlApiKey(e.target.value);
                  }}
                  placeholder="fc-..."
                  className="flex-1 bg-input rounded-none border border-border px-3 py-2 text-sm text-white font-mono focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => {
                    playClickSound();
                    settings.setFirecrawlApiKey('fc-3539be5ea22744d4b084ed54c7a2777f');
                  }}
                  className="px-4 py-2 bg-secondary hover:bg-secondary/80 text-white rounded-none text-sm font-medium transition-colors border border-border"
                >
                  Reset Default
                </button>
              </div>
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                This key powers the **Blackspider Web Crawler & Scraper** to convert websites to markdown structure, extract links, or perform search-grounded crawls directly from your dashboard.
              </p>
            </div>
          </div>
        </div>

        {/* Data & Storage */}
        <div className="bg-card rounded-none overflow-hidden">
          <div className="p-4 bg-secondary/50 border-b border-border flex items-center gap-2">
            <Trash2 className="w-5 h-5 text-primary" />
            <h2 className="font-bold">Data & Storage</h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Clear Search & Download History</div>
                <div className="text-sm text-muted-foreground">Remove all locally stored history.</div>
              </div>
              <button 
                onClick={() => {
                  clearHistory();
                  alert('History cleared');
                }}
                className="px-4 py-2 bg-destructive/10 text-destructive hover:bg-destructive/20 rounded-none text-sm font-medium transition-colors border"
              >
                Clear History
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
