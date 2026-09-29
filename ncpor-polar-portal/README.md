# NCPOR Polar Science Portal (SIH 2026, PS 26063)

Integrated Polar Science Outreach, Knowledge Repository and Media Dissemination Portal for MoES / NCPOR.
Next.js 14 (App Router, TypeScript), Tailwind CSS 3, Framer Motion, React Three Fiber, Lenis smooth scroll.

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm start
```

Node 18.18 or newer is required.

## What is in it

| Area | Where | Notes |
| --- | --- | --- |
| 3D polar globe with pulsing station pins | `components/PolarGlobe.tsx`, `Hero.tsx` | Bharati, Maitri, Himadri, Himansh. Hover or tap a pin for temperature and wind. Focus chips fly the camera to Antarctica, the Arctic or the Himalaya. |
| Live station weather | `components/WeatherContext.tsx` | Open-Meteo (free, no key). Falls back to seasonal estimates and labels them "Seasonal estimate". |
| Aurora background | `components/Aurora.tsx` | Canvas at half resolution, pauses under reduced motion. |
| Command palette (Cmd/Ctrl + K) | `components/CommandPalette.tsx` | Searches records, expeditions, sections and actions. |
| Knowledge repository | `components/Repository.tsx` | Filters (type, region, category, year), search, grid or table, preview modal, real sample-CSV download, citation copy. |
| Expedition timeline | `components/Expeditions.tsx` | Horizontal or vertical, region filter, "Show on globe" flies the hero globe to that region. |
| Media hub and lightbox | `components/MediaHub.tsx` | Photos, videos, infographics, press releases; keyboard navigation. |
| Outreach generator | `components/Outreach.tsx` | Builds a caption and a card per channel and size, exports PNG or SVG. Publishing queue and events list. |
| Analytics | `components/Analytics.tsx` | Hand-built SVG charts. |
| Themes and accessibility | `ThemeSwitcher.tsx`, `A11yControls.tsx`, `globals.css` | Deep ocean and glacial themes, text size, high contrast, reduce motion (all persisted). |

All content lives in `lib/data.ts`. Replace it with NCPOR records or an API layer.

## Before you present

- `TEAM_NAME` in `lib/data.ts` is a stand-in. Put your team name there.
- Dataset titles, DOIs (10.5072 is the DataCite test prefix), counts, media and press copy are illustrative.
  Station coordinates and milestone years follow public records; verify them against NCPOR sources.
- The globe loads an Earth texture from `/public/textures/earth.jpg` if present, otherwise from a CDN (unpkg, three-globe examples).
  For offline demos, save an equirectangular Earth image to `public/textures/earth.jpg`.
- Media tiles are generated artwork and the video player is a demo. Swap in real assets in `MEDIA`.
- On phones, dragging the globe captures the touch, so scroll from the text area.
- Outreach PNG export uses system fonts (browsers do not load web fonts inside exported SVGs).
