/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/shared/Layout';
import { Preloader } from './components/shared/Preloader';
import { Home } from './pages/Home';
import { Search } from './pages/Search';
import { Category } from './pages/Category';
import { TorrentDetails } from './pages/TorrentDetails';
import { Favorites } from './pages/Favorites';
import { Downloads } from './pages/Downloads';
import { Settings } from './pages/Settings';
import { Crawler } from './pages/Crawler';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  const [loadingComplete, setLoadingComplete] = useState(false);

  return (
    <QueryClientProvider client={queryClient}>
      {!loadingComplete && <Preloader onComplete={() => setLoadingComplete(true)} minDurationMs={2000} />}
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="trending" element={<Category />} />
            <Route path="top100" element={<Category />} />
            <Route path="category/:categoryName" element={<Category />} />
            <Route path="search" element={<Search />} />
            <Route path="torrent/:id" element={<TorrentDetails />} />
            <Route path="favorites" element={<Favorites />} />
            <Route path="downloads" element={<Downloads />} />
            <Route path="crawler" element={<Crawler />} />
            <Route path="settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
