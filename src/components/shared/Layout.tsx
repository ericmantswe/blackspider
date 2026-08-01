import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { DownloadModal } from './DownloadModal';
import { useSettingsStore } from '../../store/useSettingsStore';

export function Layout() {
  const theme = useSettingsStore(state => state.theme);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [downloadOpen, setDownloadOpen] = useState(false);
  
  return (
    <div className={`min-h-screen bg-[#1a1a1a] text-white flex`}>
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
        onDownloadClick={() => setDownloadOpen(true)}
      />
      
      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden" 
          onClick={() => setSidebarOpen(false)} 
        />
      )}
      
      <div className="flex-1 md:pl-60 flex flex-col relative min-h-screen w-full min-w-0">
        <Topbar 
          onMenuClick={() => setSidebarOpen(true)} 
          onDownloadClick={() => setDownloadOpen(true)}
        />
        <main className="flex-1 p-4 md:p-6 overflow-x-hidden">
          <Outlet />
        </main>
      </div>

      <DownloadModal isOpen={downloadOpen} onClose={() => setDownloadOpen(false)} />
    </div>
  );
}
