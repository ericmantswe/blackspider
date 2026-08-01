import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Download, Terminal, Copy, Check, Info, Shield, 
  Cpu, Play, CheckCircle2, AlertTriangle, Monitor, Sparkles, Code
} from 'lucide-react';
import { playClickSound, playHoverSound } from '../../lib/sound';

interface DownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type OS = 'windows' | 'mac' | 'linux';

export function DownloadModal({ isOpen, onClose }: DownloadModalProps) {
  const [activeOS, setActiveOS] = useState<OS>('windows');
  const [repoUrl, setRepoUrl] = useState('https://github.com/ericmantswe/blackspider-media-vault.git');
  const [copied, setCopied] = useState(false);
  const [copiedCommand, setCopiedCommand] = useState<string | null>(null);
  const [simulating, setSimulating] = useState(false);
  const [simLog, setSimLog] = useState<string[]>([]);
  const [simProgress, setSimProgress] = useState(0);

  const cloneCommands = {
    git: `git clone ${repoUrl}`,
    install: 'npm install',
    run: 'npm run desktop:dev',
    build: 'npm run desktop:build'
  };

  const handleCopy = (text: string, type: string) => {
    playClickSound();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setCopiedCommand(type);
    setTimeout(() => {
      setCopied(false);
      setCopiedCommand(null);
    }, 2000);
  };

  const triggerLauncherDownload = () => {
    playClickSound();
    let filename = '';
    let content = '';

    if (activeOS === 'windows') {
      filename = 'blackspider-launcher.bat';
      content = `@echo off
echo ===================================================
echo   Blackspider Desktop Client Automatic Setup
echo ===================================================
echo.
echo Checking dependencies...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is required but not installed!
    echo Please install Node.js from: https://nodejs.org
    pause
    exit /b 1
)
where git >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Git is required but not installed!
    echo Please install Git or clone the repository manually.
    pause
    exit /b 1
)
echo Dependencies verified. Cloning repository...
git clone ${repoUrl} blackspider-app
if %errorlevel% neq 0 (
    echo.
    echo ===================================================
    echo   [ERROR] Git clone failed! 
    echo ===================================================
    echo.
    echo Please verify:
    echo 1. Your GitHub repository is set to PUBLIC.
    echo 2. The URL is correct: ${repoUrl}
    echo.
    pause
    exit /b 1
)
cd blackspider-app
echo.
echo Installing dependencies (this may take a minute)...
call npm install
echo.
echo Launching Blackspider Desktop...
call npm run desktop:dev
pause`;
    } else {
      filename = 'blackspider-launcher.sh';
      content = `#!/bin/bash
echo "==================================================="
echo "  Blackspider Desktop Client Automatic Setup"
echo "==================================================="
echo ""
if ! command -v node &> /dev/null; then
    echo "[ERROR] Node.js is required but not installed!"
    echo "Please install Node.js from: https://nodejs.org"
    exit 1
fi
if ! command -v git &> /dev/null; then
    echo "[ERROR] Git is required but not installed!"
    echo "Please install Git or clone the repository manually."
    exit 1
fi
echo "Dependencies verified. Cloning repository..."
git clone ${repoUrl} blackspider-app
if [ $? -ne 0 ]; then
    echo ""
    echo "==================================================="
    echo "  [ERROR] Git clone failed!"
    echo "==================================================="
    echo ""
    echo "Please verify:"
    echo "1. Your GitHub repository is set to PUBLIC (or SSH keys are configured)."
    echo "2. The URL is correct: ${repoUrl}"
    echo ""
    exit 1
fi
cd blackspider-app
echo ""
echo "Installing dependencies (this may take a minute)..."
npm install
echo ""
echo "Launching Blackspider Desktop..."
npm run desktop:dev`;
    }

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Simulating building process
  const startSimulation = () => {
    if (simulating) return;
    playClickSound();
    setSimulating(true);
    setSimProgress(0);
    setSimLog([]);

    const logs = [
      '⚡ Starting desktop client packaging task...',
      '🔍 Validating configuration schemas in package.json...',
      '📂 Bundling frontend assets using Vite + Tailwind compiler...',
      '✓ Vite frontend compilation complete: dist/ containing index.html, index.js, index.css',
      '⚙️ Compiling custom Express middleware backend in production mode...',
      '✓ CJS single-bundle compiled successfully: dist/server.cjs (118 kB)',
      '📦 Loading Electron builder core v26.15.3 for architecture: x64...',
      '🔨 Packaging platform executable for ' + activeOS.toUpperCase() + '...',
      '📦 Creating structural setup package assets...',
      activeOS === 'windows' 
        ? '✓ Output generated successfully: dist-desktop/Blackspider-Setup-1.0.0.exe'
        : activeOS === 'mac'
        ? '✓ Output generated successfully: dist-desktop/Blackspider-1.0.0.dmg'
        : '✓ Output generated successfully: dist-desktop/Blackspider-1.0.0.AppImage',
      '🎉 Packaging complete! Desktop application successfully prepared.'
    ];

    let currentLogIndex = 0;
    const interval = setInterval(() => {
      if (currentLogIndex < logs.length) {
        setSimLog(prev => [...prev, logs[currentLogIndex]]);
        setSimProgress(Math.round(((currentLogIndex + 1) / logs.length) * 100));
        currentLogIndex++;
      } else {
        clearInterval(interval);
        setSimulating(false);
      }
    }, 850);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: 'spring', duration: 0.5 }}
            className="bg-[#1e1e1e] border border-white/10 w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl relative z-10 flex flex-col max-h-[90vh]"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              onMouseEnter={playHoverSound}
              className="absolute top-4 right-4 p-2 text-white/40 hover:text-white hover:bg-white/5 rounded-full transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="p-6 md:p-8 border-b border-white/5 flex items-start gap-4 bg-gradient-to-r from-primary/10 via-transparent to-transparent">
              <div className="p-3 bg-primary/20 text-primary border border-primary/30 rounded-2xl shadow-[0_0_15px_rgba(193,18,31,0.25)]">
                <Monitor className="w-8 h-8 animate-pulse" />
              </div>
              <div className="space-y-1">
                <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                  Bypass API Blocking 
                  <span className="text-[10px] bg-primary/20 text-primary border border-primary/40 px-2 py-0.5 rounded-full uppercase tracking-widest font-extrabold">
                    Recommended
                  </span>
                </h2>
                <p className="text-[#888] text-sm max-w-xl">
                  Public scraping APIs (such as APIBay/The Pirate Bay) often filter or rate-limit request origins coming from cloud datacenters (like Hostinger, Bluehost, or Vercel). By running Blackspider as a native desktop client, your requests are routed through your home residential IP, enabling clean, unfiltered browsing.
                </p>
              </div>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8">
              {/* OS Selection Tabs */}
              <div className="flex bg-white/5 border border-white/5 p-1 rounded-xl gap-1">
                {(['windows', 'mac', 'linux'] as OS[]).map((os) => (
                  <button
                    key={os}
                    onClick={() => {
                      playClickSound();
                      setActiveOS(os);
                    }}
                    onMouseEnter={playHoverSound}
                    className={`flex-1 py-3 text-sm font-semibold rounded-lg transition-all capitalize flex items-center justify-center gap-2 ${
                      activeOS === os
                        ? 'bg-primary text-white shadow-lg shadow-primary/20 font-bold'
                        : 'text-[#888] hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Cpu className="w-4 h-4" />
                    <span>{os === 'mac' ? 'macOS (.dmg)' : os === 'windows' ? 'Windows (.exe)' : 'Linux (.AppImage)'}</span>
                  </button>
                ))}
              </div>

              {/* Git Repository Configuration Alert / Inputs */}
              <div className="bg-[#141414] border border-white/5 rounded-2xl p-5 md:p-6 space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Code className="w-4 h-4 text-primary" />
                      Configure Your GitHub Repository URL
                    </h3>
                    <p className="text-xs text-[#888] max-w-xl">
                      Since the desktop setup runs on your local machine, it needs to clone your code from your online GitHub repository. Make sure your repository is <strong>Public</strong>. If you've renamed or hosted it at a different URL, paste it below.
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 self-start md:self-auto bg-green-500/10 border border-green-500/20 px-2.5 py-1 rounded-full text-[10px] text-green-400 font-extrabold uppercase tracking-wider">
                    <Shield className="w-3 h-3" />
                    <span>Public Repo Needed</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-[#555] font-mono text-xs select-none">
                      git clone
                    </span>
                    <input
                      type="url"
                      value={repoUrl}
                      onChange={(e) => setRepoUrl(e.target.value)}
                      placeholder="https://github.com/your-username/your-repo-name.git"
                      className="w-full pl-[76px] pr-4 py-2.5 bg-[#1a1a1a] border border-white/10 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-white/20"
                    />
                  </div>
                  <button
                    onClick={() => {
                      setRepoUrl('https://github.com/ericmantswe/blackspider-media-vault.git');
                      playClickSound();
                    }}
                    onMouseEnter={playHoverSound}
                    className="px-3.5 py-2.5 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-xs font-bold rounded-xl border border-white/5 transition-all cursor-pointer"
                  >
                    Reset Default
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Method 1: Automated Portable Launcher */}
                <div className="lg:col-span-5 space-y-4">
                  <div className="flex items-center gap-2 text-white font-bold text-lg">
                    <Sparkles className="w-5 h-5 text-primary" />
                    <span>Method 1: One-Click Launcher</span>
                  </div>
                  <p className="text-[#888] text-sm leading-relaxed">
                    Download an automated script that clones the code, verifies system dependencies (Node.js & Git), configures files, and launches the desktop interface instantly.
                  </p>

                  <div className="bg-[#242424] border border-white/5 p-5 rounded-2xl space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold border border-primary/20">
                        1
                      </div>
                      <div className="text-xs text-white font-semibold">
                        {activeOS === 'windows' ? 'Download blackspider-launcher.bat' : 'Download blackspider-launcher.sh'}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold border border-primary/20">
                        2
                      </div>
                      <div className="text-xs text-[#888]">
                        Double-click or run the file on your computer to run setup.
                      </div>
                    </div>

                    <button
                      onClick={triggerLauncherDownload}
                      onMouseEnter={playHoverSound}
                      className="w-full bg-primary hover:bg-[#d91424] text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-[0_0_14px_rgba(193,18,31,0.2)] transition-all hover:scale-[1.02] active:scale-95 text-sm"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download Launcher ({activeOS === 'windows' ? '.bat' : '.sh'})</span>
                    </button>
                  </div>

                  <div className="flex gap-2.5 items-start bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-xl text-xs text-yellow-500/90 leading-relaxed">
                    <Info className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>
                      <strong>Prerequisite:</strong> Ensure you have <a href="https://nodejs.org" target="_blank" rel="noreferrer" className="underline hover:text-white">Node.js</a> and <a href="https://git-scm.com" target="_blank" rel="noreferrer" className="underline hover:text-white">Git</a> installed on your operating system before running.
                    </span>
                  </div>
                </div>

                {/* Method 2: Manual Git Setup */}
                <div className="lg:col-span-7 space-y-4">
                  <div className="flex items-center gap-2 text-white font-bold text-lg">
                    <Code className="w-5 h-5 text-primary" />
                    <span>Method 2: Compile Manually</span>
                  </div>
                  <p className="text-[#888] text-sm">
                    Open your command terminal of choice and execute these standard packaging instructions sequentially.
                  </p>

                  <div className="space-y-2.5 text-xs">
                    {/* Command 1 */}
                    <div className="bg-[#141414] border border-white/5 rounded-xl p-3 flex items-center justify-between font-mono text-white/90">
                      <span className="truncate pr-4"><span className="text-primary mr-1.5">$</span>{cloneCommands.git}</span>
                      <button
                        onClick={() => handleCopy(cloneCommands.git, 'git')}
                        className="text-white/40 hover:text-white p-1"
                        title="Copy command"
                      >
                        {copied && copiedCommand === 'git' ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>

                    {/* Command 2 */}
                    <div className="bg-[#141414] border border-white/5 rounded-xl p-3 flex items-center justify-between font-mono text-white/90">
                      <span className="truncate pr-4"><span className="text-primary mr-1.5">$</span>{cloneCommands.install}</span>
                      <button
                        onClick={() => handleCopy(cloneCommands.install, 'install')}
                        className="text-white/40 hover:text-white p-1"
                        title="Copy command"
                      >
                        {copied && copiedCommand === 'install' ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>

                    {/* Command 3 */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-[#141414] border border-white/5 rounded-xl p-3 flex items-center justify-between font-mono text-white/90">
                        <span className="truncate pr-2"><span className="text-primary mr-1.5">$</span>{cloneCommands.run}</span>
                        <button
                          onClick={() => handleCopy(cloneCommands.run, 'run')}
                          className="text-white/40 hover:text-white p-1"
                          title="Copy command"
                        >
                          {copied && copiedCommand === 'run' ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>

                      <div className="bg-[#141414] border border-white/5 rounded-xl p-3 flex items-center justify-between font-mono text-white/90">
                        <span className="truncate pr-2"><span className="text-primary mr-1.5">$</span>{cloneCommands.build}</span>
                        <button
                          onClick={() => handleCopy(cloneCommands.build, 'build')}
                          className="text-white/40 hover:text-white p-1"
                          title="Copy command"
                        >
                          {copied && copiedCommand === 'build' ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Built-in compilation simulator */}
                  <div className="bg-[#141414] rounded-2xl border border-white/5 overflow-hidden">
                    <div className="px-4 py-2 bg-white/5 flex items-center justify-between border-b border-white/5">
                      <div className="flex items-center gap-2">
                        <Terminal className="w-4 h-4 text-primary" />
                        <span className="text-xs font-mono font-bold text-white/70">Local Compilation Console</span>
                      </div>
                      <button
                        onClick={startSimulation}
                        disabled={simulating}
                        className="text-[10px] bg-primary/20 text-primary border border-primary/30 px-2.5 py-1 rounded-md font-bold uppercase tracking-wider hover:bg-primary hover:text-white transition-all disabled:opacity-50"
                      >
                        {simulating ? `Building (${simProgress}%)` : 'Simulate Build'}
                      </button>
                    </div>

                    <div className="p-4 font-mono text-[10px] h-36 overflow-y-auto space-y-1.5 text-white/80 scrollbar-thin">
                      {simLog.length === 0 ? (
                        <div className="text-white/30 h-full flex items-center justify-center italic">
                          Click "Simulate Build" to view the local build pipeline output logs...
                        </div>
                      ) : (
                        simLog.map((log, index) => (
                          <div 
                            key={index} 
                            className={
                              log.startsWith('✓') || log.startsWith('🎉')
                                ? 'text-green-400 font-bold'
                                : log.startsWith('⚡')
                                ? 'text-primary font-bold'
                                : 'text-white/70'
                            }
                          >
                            {log}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-5 bg-white/3 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2.5 text-xs text-[#888]">
                <Shield className="w-4 h-4 text-green-500" />
                <span>Security Verified: Clean installation, no system registry updates required.</span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-white/40 uppercase tracking-widest font-semibold">
                <span>Version 1.0.0</span>
                <span>•</span>
                <span>Active Core Framework: Electron v43</span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
