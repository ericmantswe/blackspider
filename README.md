# Blackspider

> **Premium index and media vault** — movies, games, applications, and anime.

---

## Overview

Blackspider is a dark-themed torrent index and media discovery application. Built for speed, clarity, and an unapologetically sharp visual identity.

---

## Design System

### Color Palette

| Token | Hex | Usage |
|---|---|---|
| `background` | `#1a1a1a` | Page background |
| `card` | `#222222` | Card / panel surfaces |
| `secondary` | `#2a2a2a` | Nested panels, input backgrounds |
| `border` | `#333333` | Dividers, outlines |
| `primary` | `#C1121F` | Brand red, CTAs, active states |
| `foreground` | `#ffffff` | Primary text |
| `muted-foreground` | `#a3a3a3` | Secondary text, metadata |

### Typography

- **Font Family**: `Roboto` (Google Fonts)
- **Weights**: 300 · 400 · 500 · 700 · 900
- **Anti-aliasing**: `antialiased` across the board

### Shape Language

- **Border radius: `0px`** — Hard edges everywhere. No pill buttons, no soft cards. Sharp and intentional.
- Borders use `1px` with low-opacity white (`border-white/10`) for depth without noise.

### Spacing

Follows a `4px` base grid. Common multiples: `4, 8, 12, 16, 24, 32, 48`.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + TypeScript |
| Bundler | Vite |
| Styling | Tailwind CSS v4 |
| Animation | Framer Motion |
| Routing | React Router v6 |
| Icons | Lucide React |
| Poster fallback | OMDb API |
| Sound FX | Web Audio API (custom) |

---

## Component Architecture

```
src/
├── api/
│   └── mockProvider.ts      # Torrent API + OMDb poster fallback
├── components/
│   ├── shared/
│   │   ├── Layout.tsx        # Root shell (sidebar + main area)
│   │   ├── Sidebar.tsx       # Fixed left navigation
│   │   ├── Topbar.tsx        # Sticky top bar, search, login CTA
│   │   └── Preloader.tsx     # Boot screen — logo + progress bar
│   ├── ui/
│   │   ├── TorrentCard.tsx   # Poster card with OMDb fallback
│   │   ├── HorizontalRow.tsx # Category scroll row
│   │   └── CoverflowCarousel.tsx  # Billboard hero (Originkit)
│   └── VideoStreamPlayer.tsx # Embedded YouTube player
├── pages/
│   ├── Home.tsx              # Billboard + trending rows
│   ├── Category.tsx          # Filtered category browse
│   ├── Search.tsx            # Search results
│   ├── TorrentDetails.tsx    # Full torrent details + stream
│   ├── Downloads.tsx         # Magnet/download manager
│   └── Settings.tsx          # App preferences
├── lib/
│   ├── sound.ts              # UI sound effects
│   └── utils.ts              # formatBytes, cn helpers
└── types/
    └── index.ts              # Shared TypeScript types
```

---

## Key Features

- **Coverflow Billboard** — Animated hero carousel (Framer Motion) synced with metadata info panel
- **OMDb Poster Fallback** — When no poster is available from the API, TorrentCard and detail views query OMDb by title
- **Category Rows** — Horizontally scrollable rows per genre/category with lazy-loaded posters
- **Video Stream Player** — Embedded YouTube search + preview directly in the torrent details page
- **Custom Preloader** — Logo + animated progress bar at startup
- **Sound FX** — Subtle audio feedback on hover and open interactions

---

## Running Locally

**Prerequisites:** Node.js 18+

```bash
npm install
npm run dev
```

**Environment variables** (optional — set in `.env.local`):

```
VITE_API_BASE_URL=http://localhost:3001/api
VITE_OMDB_API_KEY=your_omdb_key
```

---

## Running as a Native Desktop App (.exe, .dmg, .AppImage)

To solve API blocking issues (such as APIBay's Cloudflare block targeting hosting/cloud providers like Bluehost, Hostinger, or Vercel), you can run and build Blackspider as a **native desktop application**. 

By running on your local desktop machine, the network requests are sent from your **home residential IP** instead of a server datacenter. This completely avoids Cloudflare/APIBay anti-scraping filters and lets you browse and search without limits!

### 1. Run in Desktop Development Mode
This command starts both the Vite/Express dev server and boots up the Electron window mapped to it.
```bash
npm run desktop:dev
```

### 2. Package into a Standalone Desktop Executable (.exe, .dmg, or .AppImage)
This command compiles the React assets, bundles the Express server, and builds a standalone desktop executable inside the `/dist-desktop` folder.
```bash
npm run desktop:build
```

---

## Git

```bash
git remote: https://github.com/ericmantswe/blackspider.git
branch: main
```
