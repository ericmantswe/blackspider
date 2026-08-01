import React, { useState, useEffect } from 'react';
import { useSettingsStore } from '../store/useSettingsStore';
import { 
  Globe, Search, Code, Copy, ExternalLink, Cpu, 
  Terminal, Check, Loader2, ArrowRight, Layers, FileText, AlertCircle, Sparkles
} from 'lucide-react';
import { playClickSound, playHoverSound } from '../lib/sound';

interface ScrapeResult {
  success: boolean;
  data?: {
    markdown?: string;
    metadata?: {
      title?: string;
      description?: string;
      [key: string]: any;
    };
    [key: string]: any;
  };
  error?: string;
}

interface SearchResult {
  success: boolean;
  data?: Array<{
    title: string;
    url: string;
    markdown?: string;
    description?: string;
  }>;
  error?: string;
}

export function Crawler() {
  const settings = useSettingsStore();
  const [activeTab, setActiveTab] = useState<'scrape' | 'search' | 'status'>('scrape');
  
  // Scraper tab state
  const [scrapeUrl, setScrapeUrl] = useState('');
  const [scrapeLoading, setScrapeLoading] = useState(false);
  const [scrapeResult, setScrapeResult] = useState<ScrapeResult | null>(null);
  const [copiedText, setCopiedText] = useState(false);

  // Search tab state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchLimit, setSearchLimit] = useState(5);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);

  // General Status State
  const [apiStatus, setApiStatus] = useState<{ configured: boolean; hasDefault: boolean } | null>(null);
  const [statusLoading, setStatusLoading] = useState(false);

  useEffect(() => {
    checkApiStatus();
  }, [settings.firecrawlApiKey]);

  const checkApiStatus = async () => {
    try {
      setStatusLoading(true);
      const res = await fetch('/api/firecrawl/status', {
        headers: {
          'x-firecrawl-api-key': settings.firecrawlApiKey
        }
      });
      const data = await res.json();
      setApiStatus(data);
    } catch (err) {
      console.error(err);
    } finally {
      setStatusLoading(false);
    }
  };

  const handleScrape = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scrapeUrl) return;
    playClickSound();
    setScrapeLoading(true);
    setScrapeResult(null);

    try {
      const response = await fetch('/api/firecrawl/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-firecrawl-api-key': settings.firecrawlApiKey
        },
        body: JSON.stringify({
          url: scrapeUrl,
          formats: ['markdown']
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to scrape URL');
      }
      setScrapeResult({ success: true, data: data.data || data });
    } catch (err: any) {
      setScrapeResult({ success: false, error: err.message });
    } finally {
      setScrapeLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery) return;
    playClickSound();
    setSearchLoading(true);
    setSearchResult(null);

    try {
      const response = await fetch('/api/firecrawl/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-firecrawl-api-key': settings.firecrawlApiKey
        },
        body: JSON.stringify({
          query: searchQuery,
          limit: searchLimit
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to search using Firecrawl');
      }
      setSearchResult({ success: true, data: data.data || [] });
    } catch (err: any) {
      setSearchResult({ success: false, error: err.message });
    } finally {
      setSearchLoading(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(true);
    playClickSound();
    setTimeout(() => setCopiedText(false), 2000);
  };

  // Utility to extract clean URLs or links from scraped markdown
  const extractLinks = (markdown: string) => {
    const linkRegex = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;
    const links = [];
    let match;
    while ((match = linkRegex.exec(markdown)) !== null) {
      links.push({ text: match[1], url: match[2] });
    }
    return links.slice(0, 50); // limit to 50 links
  };

  return (
    <div className="pb-12 max-w-6xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/5 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <span className="p-2 bg-primary/10 text-primary border border-primary/20 rounded-lg">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </span>
            <h1 className="text-3xl font-black tracking-tight text-white uppercase italic">
              Web Spider <span className="text-primary font-light">Crawler</span>
            </h1>
          </div>
          <p className="text-muted-foreground mt-2 text-sm">
            Powered by Firecrawl. Convert any website to clean Markdown structure, extract index links, or perform search queries.
          </p>
        </div>

        {/* Status widget */}
        <div className="flex items-center gap-3 bg-[#1e1e1e] border border-white/5 px-4 py-3 rounded-xl">
          <div className="space-y-0.5">
            <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">API STATUS</div>
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${apiStatus?.configured ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-rose-500 animate-pulse'}`}></span>
              <span className="text-xs font-mono font-bold text-white">
                {apiStatus?.configured ? 'CONNECTED' : 'DISCONNECTED'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex border-b border-white/5 bg-[#141414] p-1 rounded-xl max-w-md">
        <button
          onClick={() => { playClickSound(); setActiveTab('scrape'); }}
          onMouseEnter={playHoverSound}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold uppercase tracking-wider transition-all rounded-lg cursor-pointer ${
            activeTab === 'scrape' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-muted-foreground hover:text-white'
          }`}
        >
          <Globe className="w-4 h-4" />
          Scrape URL
        </button>
        <button
          onClick={() => { playClickSound(); setActiveTab('search'); }}
          onMouseEnter={playHoverSound}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold uppercase tracking-wider transition-all rounded-lg cursor-pointer ${
            activeTab === 'search' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-muted-foreground hover:text-white'
          }`}
        >
          <Search className="w-4 h-4" />
          Search Web
        </button>
        <button
          onClick={() => { playClickSound(); setActiveTab('status'); }}
          onMouseEnter={playHoverSound}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold uppercase tracking-wider transition-all rounded-lg cursor-pointer ${
            activeTab === 'status' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-muted-foreground hover:text-white'
          }`}
        >
          <Terminal className="w-4 h-4" />
          API Logs
        </button>
      </div>

      {/* SCRAPE TAB */}
      {activeTab === 'scrape' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Controls */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-card p-6 border border-white/5 rounded-none space-y-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Globe className="w-5 h-5 text-primary" />
                Scrape Webpage
              </h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Enter any public website URL. Our system will bypass protections, fetch the DOM, and extract raw text formatted into beautiful, standard Markdown.
              </p>

              <form onSubmit={handleScrape} className="space-y-4 pt-2">
                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground uppercase tracking-wider font-bold">Target URL</label>
                  <input
                    type="url"
                    required
                    placeholder="https://example.com"
                    value={scrapeUrl}
                    onChange={(e) => setScrapeUrl(e.target.value)}
                    className="w-full bg-input border border-border px-3 py-2.5 text-sm font-mono text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <button
                  type="submit"
                  disabled={scrapeLoading}
                  onMouseEnter={playHoverSound}
                  className="w-full py-3 bg-primary hover:bg-primary/90 disabled:bg-primary/50 text-white font-bold uppercase tracking-wider text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-primary/10"
                >
                  {scrapeLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Crawling website...
                    </>
                  ) : (
                    <>
                      <Cpu className="w-4 h-4" />
                      Execute Crawl
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Config warning if not configured */}
            {!apiStatus?.configured && (
              <div className="bg-rose-500/10 border border-rose-500/20 p-5 rounded-none flex gap-3">
                <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-rose-400 uppercase tracking-wider">Missing API Key</h4>
                  <p className="text-xs text-rose-300/80 leading-relaxed">
                    Set your Firecrawl API Key in the Settings page or input field to get complete residential proxy scraping results.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Scrape Result View */}
          <div className="lg:col-span-7">
            {scrapeLoading && (
              <div className="bg-card/50 border border-white/5 p-12 flex flex-col items-center justify-center text-center space-y-4 min-h-[300px]">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">Scraping site</h3>
                  <p className="text-xs text-muted-foreground max-w-xs">
                    Connecting to residential proxy, rendering Javascript, and formatting clean markdown structure...
                  </p>
                </div>
              </div>
            )}

            {!scrapeLoading && !scrapeResult && (
              <div className="bg-[#141414] border border-dashed border-white/10 p-12 flex flex-col items-center justify-center text-center space-y-4 min-h-[300px]">
                <Globe className="w-12 h-12 text-[#444]" />
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">Awaiting Target</h3>
                  <p className="text-xs text-[#666] max-w-xs">
                    Input a URL to execute the Firecrawl proxy crawler and view parsed output.
                  </p>
                </div>
              </div>
            )}

            {scrapeResult && (
              <div className="bg-card border border-white/5 rounded-none overflow-hidden flex flex-col min-h-[500px]">
                <div className="p-4 bg-secondary/50 border-b border-border flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-primary" />
                    <span className="text-xs font-bold text-white font-mono truncate max-w-[200px] md:max-w-xs">
                      {scrapeResult.data?.metadata?.title || 'scraped_page'}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    {scrapeResult.success && scrapeResult.data?.markdown && (
                      <button
                        onClick={() => handleCopy(scrapeResult.data!.markdown!)}
                        className="px-3 py-1 bg-white/5 hover:bg-white/10 text-white text-xs font-bold flex items-center gap-1.5 transition-all rounded border border-white/10"
                      >
                        {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedText ? 'Copied' : 'Copy MD'}</span>
                      </button>
                    )}
                  </div>
                </div>

                <div className="p-6 flex-1 overflow-y-auto max-h-[600px] space-y-6">
                  {scrapeResult.success ? (
                    <>
                      {/* Meta Information card */}
                      {scrapeResult.data?.metadata && (
                        <div className="bg-[#1a1a1a] border border-white/5 p-4 rounded-lg space-y-2">
                          <h4 className="text-xs font-bold text-primary uppercase tracking-widest flex items-center gap-1.5">
                            <Layers className="w-3.5 h-3.5" />
                            Extracted Metadata
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 text-xs font-mono">
                            <div>
                              <span className="text-muted-foreground">Title:</span>{' '}
                              <span className="text-white font-bold">{scrapeResult.data.metadata.title || 'N/A'}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Description:</span>{' '}
                              <span className="text-white/80">{scrapeResult.data.metadata.description || 'N/A'}</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Extracted Outbound Links list */}
                      {scrapeResult.data?.markdown && extractLinks(scrapeResult.data.markdown).length > 0 && (
                        <div className="bg-[#1a1a1a] border border-white/5 p-4 rounded-lg space-y-2">
                          <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                            <ArrowRight className="w-3.5 h-3.5" />
                            Parsed Outbound Links ({extractLinks(scrapeResult.data.markdown).length})
                          </h4>
                          <div className="max-h-40 overflow-y-auto pt-1 space-y-1.5 pr-2">
                            {extractLinks(scrapeResult.data.markdown).map((link, idx) => (
                              <div key={idx} className="flex justify-between items-center bg-black/20 p-2 rounded text-xs gap-4 border border-white/5 hover:border-white/10 transition-all">
                                <span className="text-white/80 font-semibold truncate flex-1">{link.text}</span>
                                <a 
                                  href={link.url} 
                                  target="_blank" 
                                  referrerPolicy="no-referrer" 
                                  className="text-primary hover:underline font-mono truncate max-w-[200px] flex items-center gap-1 shrink-0"
                                >
                                  {link.url}
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Raw Markdown view */}
                      <div className="space-y-2">
                        <h4 className="text-xs font-bold text-primary uppercase tracking-widest">Raw Markdown Content</h4>
                        <pre className="bg-[#141414] text-white/90 p-4 border border-white/5 font-mono text-xs overflow-x-auto whitespace-pre-wrap rounded-lg leading-relaxed max-h-96">
                          {scrapeResult.data?.markdown || 'No markdown body parsed.'}
                        </pre>
                      </div>
                    </>
                  ) : (
                    <div className="bg-rose-500/10 border border-rose-500/20 p-5 rounded-lg text-center space-y-2">
                      <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
                      <h4 className="text-sm font-bold text-rose-400">Error Scraping Page</h4>
                      <p className="text-xs text-rose-300/80 font-mono leading-relaxed">{scrapeResult.error}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SEARCH TAB */}
      {activeTab === 'search' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Controls */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-card p-6 border border-white/5 rounded-none space-y-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Search className="w-5 h-5 text-primary" />
                Firecrawl LLM Search
              </h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Query search engines via Firecrawl. The crawler will scrape the top matching websites, convert them to clean markdown models, and deliver high-intent search results.
              </p>

              <form onSubmit={handleSearch} className="space-y-4 pt-2">
                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground uppercase tracking-wider font-bold">Search Query</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ubuntu torrent magnet release site"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-input border border-border px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground uppercase tracking-wider font-bold">Limit Results</label>
                  <select
                    value={searchLimit}
                    onChange={(e) => setSearchLimit(parseInt(e.target.value))}
                    className="w-full bg-input border border-border px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="3">3 Pages</option>
                    <option value="5">5 Pages</option>
                    <option value="10">10 Pages</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={searchLoading}
                  onMouseEnter={playHoverSound}
                  className="w-full py-3 bg-primary hover:bg-primary/90 disabled:bg-primary/50 text-white font-bold uppercase tracking-wider text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-primary/10"
                >
                  {searchLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Searching web endpoints...
                    </>
                  ) : (
                    <>
                      <Globe className="w-4 h-4" />
                      Execute LLM Search
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Search Results */}
          <div className="lg:col-span-7">
            {searchLoading && (
              <div className="bg-card/50 border border-white/5 p-12 flex flex-col items-center justify-center text-center space-y-4 min-h-[300px]">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">Crawl Search Running</h3>
                  <p className="text-xs text-muted-foreground max-w-xs">
                    Executing Firecrawl search, scraping matching web nodes, and preparing markdown summaries...
                  </p>
                </div>
              </div>
            )}

            {!searchLoading && !searchResult && (
              <div className="bg-[#141414] border border-dashed border-white/10 p-12 flex flex-col items-center justify-center text-center space-y-4 min-h-[300px]">
                <Search className="w-12 h-12 text-[#444]" />
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">Awaiting Query</h3>
                  <p className="text-xs text-[#666] max-w-xs">
                    Input a search query to search and crawl top matching pages with Firecrawl.
                  </p>
                </div>
              </div>
            )}

            {searchResult && (
              <div className="space-y-4">
                {searchResult.success ? (
                  <>
                    <div className="flex justify-between items-center px-1">
                      <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest">
                        CRAWLED SEARCH RESULTS ({searchResult.data?.length || 0})
                      </span>
                    </div>

                    {searchResult.data && searchResult.data.length > 0 ? (
                      searchResult.data.map((result, idx) => (
                        <div key={idx} className="bg-card border border-white/5 p-6 rounded-none space-y-4 hover:border-primary/20 transition-all">
                          <div className="flex justify-between items-start gap-4">
                            <div className="space-y-1">
                              <h3 className="text-base font-bold text-white hover:text-primary transition-colors">
                                <a href={result.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5">
                                  {result.title}
                                  <ExternalLink className="w-4 h-4 shrink-0 text-muted-foreground" />
                                </a>
                              </h3>
                              <span className="text-xs font-mono text-primary truncate block max-w-md">
                                {result.url}
                              </span>
                            </div>
                          </div>

                          {/* Description summary */}
                          <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">
                            {result.description || result.markdown?.slice(0, 300) || 'No summary description provided.'}
                            {(result.markdown && result.markdown.length > 300) ? '...' : ''}
                          </p>

                          {/* Options to copy raw markdown */}
                          {result.markdown && (
                            <div className="flex gap-2 justify-end pt-2 border-t border-white/5">
                              <button
                                onClick={() => handleCopy(result.markdown!)}
                                className="px-3 py-1 bg-white/5 hover:bg-white/10 text-white text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 transition-all rounded"
                              >
                                <Copy className="w-3 h-3" />
                                Copy Source Markdown
                              </button>
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="bg-[#141414] border border-white/5 p-12 text-center rounded-none text-muted-foreground text-xs">
                        No results found matching query.
                      </div>
                    )}
                  </>
                ) : (
                  <div className="bg-rose-500/10 border border-rose-500/20 p-6 text-center space-y-2">
                    <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
                    <h4 className="text-sm font-bold text-rose-400">Search Failed</h4>
                    <p className="text-xs text-rose-300/80 font-mono leading-relaxed">{searchResult.error}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* API STATUS / LOGS TAB */}
      {activeTab === 'status' && (
        <div className="bg-card border border-white/5 rounded-none overflow-hidden max-w-3xl mx-auto">
          <div className="p-4 bg-secondary/50 border-b border-border flex items-center gap-2">
            <Terminal className="w-5 h-5 text-primary" />
            <h2 className="font-bold text-white uppercase tracking-wider text-xs">Firecrawl System Diagnostics</h2>
          </div>
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-[#141414] border border-white/5 p-4 rounded-lg space-y-2">
                <div className="text-xs text-muted-foreground uppercase font-bold tracking-widest">SDK Environment</div>
                <div className="space-y-1 pt-1 font-mono text-xs text-white">
                  <div className="flex justify-between">
                    <span>Active Endpoint:</span>
                    <span className="text-primary font-bold">api.firecrawl.dev/v1</span>
                  </div>
                  <div className="flex justify-between border-t border-white/5 pt-1.5 mt-1.5">
                    <span>Default Key Set:</span>
                    <span>{apiStatus?.hasDefault ? 'TRUE' : 'FALSE'}</span>
                  </div>
                  <div className="flex justify-between border-t border-white/5 pt-1.5 mt-1.5">
                    <span>Custom Client Key:</span>
                    <span>{settings.firecrawlApiKey ? 'PRESENT (LOCAL)' : 'EMPTY'}</span>
                  </div>
                </div>
              </div>

              <div className="bg-[#141414] border border-white/5 p-4 rounded-lg space-y-2">
                <div className="text-xs text-muted-foreground uppercase font-bold tracking-widest">Diagnostics</div>
                <div className="space-y-1 pt-1 font-mono text-xs text-white">
                  <div className="flex justify-between">
                    <span>Scraper Protocol:</span>
                    <span className="text-emerald-400 font-bold">HTTP/2 (Axios REST)</span>
                  </div>
                  <div className="flex justify-between border-t border-white/5 pt-1.5 mt-1.5">
                    <span>Formats Enabled:</span>
                    <span className="text-emerald-400">Markdown, JSON</span>
                  </div>
                  <div className="flex justify-between border-t border-white/5 pt-1.5 mt-1.5">
                    <span>User Agent spoofing:</span>
                    <span className="text-emerald-400">Proxied Cloud Scraper</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                Console Sandbox Terminal
              </div>
              <pre className="bg-black text-emerald-400 p-4 font-mono text-[11px] rounded-lg overflow-x-auto h-48 leading-relaxed border border-white/10 shadow-inner">
                {`blackspider-crawler-daemon: active
$ firecrawl status
Authenticating with API key...
SUCCESS: Authenticated with Firecrawl API.
Connected to: https://api.firecrawl.dev
API_KEY: ${settings.firecrawlApiKey ? 'Verified (' + settings.firecrawlApiKey.slice(0, 10) + '...)' : 'Not verified'}

$ firecrawl scrape --help
Scrapes web pages and extracts structured markdown data.
Parameters:
  --url (required): Targeted site URL
  --formats: markdown, html, rawHtml

Ready for action. Waiting for execution command...`}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
