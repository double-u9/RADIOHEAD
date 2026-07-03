<div align="center">
  <h1>Radiohead Interactive Discography</h1>
  
  <p>
    <b>> A cinematic, immersive web experience dedicated to the discography of Radiohead.</b>
  </p>

  <p>
  <a href="#"><img src="https://img.shields.io/badge/Radiohead-Immersive%20Experience-black?style=for-the-badge&logo=next.js" alt="Radiohead App Banner" /></a>
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" /></a>
  <a href="https://nextjs.org/"><img src="https://img.shields.io/badge/Next.js_16-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js" /></a>
  <a href="https://tailwindcss.com/"><img src="https://img.shields.io/badge/Tailwind_CSS_4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" /></a>
  <a href="https://www.framer.com/motion/"><img src="https://img.shields.io/badge/Framer_Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white" alt="Framer Motion" /></a>
</p>
</div>

## 1. Project Overview

The **Radiohead Interactive Discography** is a premium, fan-made web application designed to present the band's extensive catalog—ranging from their studio albums to massive archives like the 18-hour MiniDiscs—in a visually stunning, cinematic, and highly interactive interface. 

**Goal/Purpose:** To transcend traditional music player interfaces by blending high-end web design with deep musical archives, offering fans an engaging way to explore Radiohead's history, lore, and music.

**User Experience:**
Users are greeted with an atmospheric "Enter" overlay that sets the mood via ambient background audio. The app features smooth page transitions, custom cursors, film-grain overlays, and cinematic scroll animations. A persistent, floating audio player provides gapless playback, complete with a real-time Web Audio API visualizer and synchronized lyrics.

**Technical Vision:**
Built for extreme performance despite handling gigabytes of local audio data. The application leverages modern React Server Components, aggressive server-side caching, and lightweight client state management to ensure a buttery-smooth 60fps experience.

---

## 2. Features

- **Cinematic Landing Page:** Atmospheric hero section, interactive band timeline, and parallax band member showcases.
- **Studio Albums Showcase:** Deep dives into each studio album with rich metadata, historical context, and tracklists.
- **B-Sides & Rarities Archive:** A comprehensive collection of non-album singles and hidden gems, parsed dynamically from the file system.
- **MiniDiscs Archive:** An expansive UI to navigate the legendary 18-hour *OK Computer* MiniDisc leaks.
- **Advanced Floating Player:** 
  - Persistent global playback across page navigations.
  - Real-time **Audio Visualizer** tapping into the Web Audio API.
  - Interactive **Equalizer Panel** for custom sound sculpting.
  - Real-time **Lyrics Panel** (parsing `.txt` and LRC files).
- **Custom UI Physics:** Bespoke custom cursor interactions, film grain overlays, and fluid Framer Motion page transitions.
- **Ultra-Fast Metadata Extraction:** Custom APIs that extract ID3 tags concurrently from large media libraries, heavily optimized via persistent file-system caching.

---

## 3. Tech Stack

| Technology | Purpose |
|------------|---------|
| **Next.js 16** | Core React framework. Utilizes App Router for optimized server-rendered pages and fast API routes. |
| **React 19** | UI component architecture. Leverages the latest React concurrent features. |
| **TypeScript** | End-to-end type safety, eliminating runtime errors and improving developer experience. |
| **Tailwind CSS v4** | Utility-first styling for rapid, highly-responsive, and maintainable UI design. |
| **Framer Motion** | Orchestrates complex orchestrations, page transitions, and micro-interactions. |
| **Zustand** | Lightweight, fast global state management. Used extensively for the persistent global Audio Player state. |
| **music-metadata** | Server-side extraction of ID3 tags and audio metadata from raw `.mp3` files. |
| **Lucide React** | Clean, modern iconography system. |

---

## 4. Architecture

### Frontend Architecture
- **App Router Paradigm:** The app uses Next.js `app/` directory. Pages are kept as lightweight as possible.
- **Persistent Layouts:** `src/app/layout.tsx` wraps the application in the `FloatingPlayer` and `PageTransition` wrappers, ensuring audio never stops when the user navigates.

### State Flow (Zustand)
The core of the application's interactivity is `src/store/player-store.ts`.
1. **User interacts** with a track (e.g., clicks "Play" on the B-Sides page).
2. **Action dispatched** to Zustand (`playTrack(album, track)`).
3. **Store updates** global state (`currentTrack`, `isPlaying`, `audioContext`).
4. **FloatingPlayer** reacts to the state change, dynamically loading the audio source via Next.js API routes and triggering the Web Audio API visualizers.

### Data Flow & API Communication
- Client components fetch metadata via standard `fetch` to Next.js API routes (e.g., `/api/minidiscs`).
- **Metadata Parsing:** The API routes read directories (like `/MINI DISKS/`), parse MP3 ID3 tags on the server, and return JSON arrays of tracks.
- **Caching Strategy:** To prevent the server from choking on gigabytes of audio, the API routes utilize a custom persistent JSON cache layer, reducing 2-second load times down to `1ms`.

---

## 5. Folder Structure

```text
radiohead-app/
├── B-side/                     # Local storage for B-side audio files
│   └── lyrics/                 # Text and LRC files for B-sides
├── MINI DISKS/                 # Local storage for massive MiniDisc archives
├── public/                     # Static assets (fonts, images, shadows)
├── src/
│   ├── app/                    # Next.js App Router root
│   │   ├── albums/             # Album showcase routes
│   │   ├── api/                # Backend API Routes (metadata, audio streaming)
│   │   ├── b-sides/            # B-sides catalog route
│   │   ├── minidiscs/          # MiniDiscs catalog route
│   │   ├── layout.tsx          # Root layout (injects global UI/Player)
│   │   └── page.tsx            # Landing Page
│   ├── components/
│   │   ├── home/               # Hero, Timeline, Band Members components
│   │   ├── layout/             # Header, EnterOverlay, CustomCursor, Grain
│   │   └── player/             # FloatingPlayer, Visualizer, Equalizer, Lyrics
│   ├── data/                   # Hardcoded static data (Album descriptions, etc)
│   ├── store/                  # Zustand global stores (player-store.ts)
│   └── types/                  # Global TypeScript interfaces
└── package.json
```

---

## 6. Installation Guide

### Prerequisites
- Node.js (v18 or higher)
- npm, yarn, or pnpm
- Valid audio files placed in `/B-side` and `/MINI DISKS` directories.

### Setup Instructions

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/radiohead-app.git
   cd radiohead-app
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Populate Audio Directories:**
   Ensure you have your `.mp3` files inside the root `/B-side` and `/MINI DISKS` folders.

4. **Start the Development Server:**
   ```bash
   npm run dev
   ```
   *The app will be available at http://localhost:3000.*

5. **Build for Production:**
   ```bash
   npm run build
   npm run start
   ```

---

## 7. Environment Variables

Create a `.env.local` file in the root directory.

| Variable | Purpose | Required |
|----------|---------|----------|
| `NODE_ENV` | Dictates caching behavior inside API routes (development/production). | No |
| `NEXT_PUBLIC_API_URL` | Base URL for fetching internal APIs if deployed externally. | No |

*(Currently, the application is heavily reliant on local file-system APIs and requires minimal environment configuration).*

---

## 8. Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Starts the Next.js Turbopack development server with hot-reloading. |
| `npm run build` | Compiles the application into highly optimized static and server-rendered chunks. |
| `npm run start` | Boots the production server serving the compiled `.next` build. |
| `npm run lint` | Runs ESLint to strictly enforce code quality and styling rules. |

---

## 9. UI/UX System

- **Design Philosophy:** "Digital brutalism meets cinematic elegance." High contrast, stark typography, and atmospheric elements.
- **Typography:** Uses a combination of stark Sans-serif for UI elements and stylized, chaotic fonts (e.g., "Rock Salt") for artistic accents (like band member names).
- **Layout System:** CSS Grid and Flexbox powering responsive, snap-scrolling sections.
- **Animation System:** `Framer Motion` handles stagger animations, scroll-linked parallax (e.g., the `BandHistory` section), and fluid mounting/unmounting of track details.
- **Micro-Interactions:** A custom cursor tracks mouse movement, transforming to indicate interactive zones.
- **Theme:** Strict Dark Mode to emphasize the cinematic vibe.

---

## 10. Performance Analysis

- **API Caching Optimization:** Initial load times for massive directories (like the 1.5GB MiniDiscs folder) were optimized from 2.5s down to 1ms by implementing persistent `fs` JSON caching (`minidiscs-cache.json`).
- **Concurrent Processing:** ID3 tag extraction leverages `Promise.all` to parse multiple audio files simultaneously rather than sequentially.
- **Code Splitting:** Next.js automatically code-splits routes, ensuring the user only downloads Javascript necessary for the current view.
- **Image Optimization:** `next/image` is utilized to serve appropriately sized, WebP-compressed images.

---

## 11. Security Considerations

- **Path Traversal Protection:** API routes explicitly `join(process.cwd(), "specific_folder")` and filter for `.mp3` or `.txt` extensions, preventing malicious users from accessing sensitive server files via the audio streaming APIs.
- **XSS Protection:** React natively escapes all metadata strings parsed from the audio files before rendering them to the DOM.

---

## 12. API Documentation

### `GET /api/bsides`
- **Purpose:** Fetches metadata and lyrics for all B-sides.
- **Behavior:** Parses ID3 tags. If `bsides-cache.json` exists, it serves the payload in 1ms.

### `GET /api/minidiscs`
- **Purpose:** Fetches metadata for the MiniDisc archive.
- **Behavior:** Extracts duration and titles, utilizing `minidiscs-cache.json` to prevent server CPU thrashing.

### `GET /api/bsides/artwork` & `/api/minidiscs/artwork`
- **Purpose:** Serves embedded ID3 cover art or static images associated with a specific file ID.

---

## 13. Database Documentation

This application intentionally operates **without a traditional database**. 
- It acts as a localized File-System CMS. 
- **Storage Logic:** The file system serves as the database. `music-metadata` queries the files, and Node.js `fs` writes to `.json` cache files to mimic database indexing.

---

## 14. Deployment

Deploying this application requires a platform that allows local file-system access or mounting of volumes (due to the gigabytes of audio files).

**Recommended: Docker & Traditional VPS (DigitalOcean / AWS EC2)**
1. Dockerize the application.
2. Mount the `/B-side` and `/MINI DISKS` directories as external Docker volumes.
3. Serve via NGINX reverse proxy.

*Note: Standard Vercel/Netlify deployments are NOT recommended because serverless functions have a 50MB-250MB size limit, which cannot accommodate gigabytes of local `.mp3` files.*

---

## 15. Developer Experience

- **Maintainability:** The codebase strictly separates concerns: layout wrappers, atomic UI components, global state stores, and isolated API backend routes.
- **Scalability:** Adding new albums or archives requires zero code changes. Simply drop new `.mp3` files into the respective folders, delete the JSON cache, and the app automatically indexes them.
- **Engineering Quality:** Strict TypeScript typing across the entire application prevents runtime data-flow errors.

---

## 16. Future Improvements

1. **User Authentication:** Allow users to create accounts to save custom playlists or "favorite" specific tracks.
2. **Spotify/Apple Music Integration:** Fallback to streaming APIs if the user does not possess the local `.mp3` files.
3. **WebSockets:** Implement a "Listening Party" feature allowing multiple users to sync their players in real-time.

---

## 17. Troubleshooting

- **Issue:** Tracks are taking 5+ seconds to load in development.
  - **Fix:** Ensure you haven't deleted the `*-cache.json` files. If you added new files, the first load will take time to rebuild the cache.
- **Issue:** "Return statement is not allowed here" in Next.js Turbopack.
  - **Fix:** Turbopack may hold onto stale cache. Completely restart the dev server (`Ctrl+C` -> `npm run dev`).
- **Issue:** Audio visualizer isn't moving.
  - **Fix:** The Web Audio API requires a user interaction to unlock. Ensure you have clicked the "Enter" overlay or clicked a play button manually.

---

## 18. Conclusion

The Radiohead Interactive Discography represents the intersection of passionate fandom and elite web engineering. By combining high-performance metadata parsing, persistent file-system caching, and a highly polished framer-motion powered UI, it delivers a deeply immersive, desktop-class application experience directly in the browser.

---
### Elevating the Code
*“Everything in its right place.”*
