<div align="center">

<img src="public/logo.png" alt="KalSync logo" width="96" />

# KalSync

### See what's ahead.

Community-powered road reporting for Filipino road users — launching in **Iligan City**, built to scale nationwide.

[**Live demo →**](https://kalsync-seven.vercel.app)

![React](https://img.shields.io/badge/React_19-20232A?style=flat-square&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![Leaflet](https://img.shields.io/badge/Leaflet-199900?style=flat-square&logo=leaflet&logoColor=white)
![Status](https://img.shields.io/badge/status-frontend_prototype-22c55e?style=flat-square)

</div>

---

## Why

Road conditions in Philippine cities change by the hour — a flooded underpass, a stalled truck, a new pothole, a road closure nobody announced. That information usually lives in scattered Facebook posts and group chats. **KalSync** puts it on one shared map so the next driver, rider, or commuter knows before they get there.

## What it does

| | |
|---|---|
| 📍 **Report in seconds** | Snap or upload a photo, pick one of 9 categories, drop a pin (GPS, place search, or tap the map), add a note. |
| 🗺️ **Live road map** | Leaflet + OpenStreetMap with category-coloured markers. High-severity hazards pulse. "Near me" shows a 5 km radius. |
| ✅ **Community confirmation** | "I've encountered this too" — one confirmation per report per browser, so real hazards rise to the top. |
| 🏷️ **Clear statuses** | Pending Verification → Verified → Resolved (or Rejected), with a labelled demo moderation control. |
| 🔔 **Alerts** | In-app notification centre and toasts with severity labels and nearby highlighting. |
| 🔎 **Reports page** | `/reports` with search, category/status filters, sorting, pagination and shareable `?category=` links. |
| 🌏 **Iligan ↔ Philippines scope** | One switch filters the feed, map, stats and alerts. Place search jumps to 30+ cities and Iligan barangays. |

> [!NOTE]
> This is a **frontend prototype**. Reports, photos, confirmations and statuses are stored in your browser (IndexedDB + localStorage). Seeded reports are labelled **DEMO DATA** and don't describe real incidents.

## Run it locally

```bash
git clone https://github.com/sirikitmac/KalSync.git
cd KalSync
npm install
npm run dev        # http://localhost:5173
```

| Script | What it does |
|---|---|
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Type-check and build to `dist/` |
| `npm run preview` | Serve the production build |
| `npm run lint` | Lint with oxlint |

Requires **Node 20.19+** (or 22.12+).

## How it's built

```
src/
├── components/
│   ├── alerts/     NotificationCenter, Toaster
│   ├── common/     Button, Modal, Badge, Logo, PlaceSearch, ScopeToggle
│   ├── landing/    Hero, MapSection, ReportsSection, HowItWorks, CommunityStats, …
│   ├── layout/     Navbar, Footer, JoinModal
│   ├── map/        RoadMap, MapFilters, PinPickerMap, markerIcon
│   └── reports/    ReportForm, ReportCard, ReportDetails, ReportList, …
├── context/        AppContext (scope, modals, toasts) · ReportsContext (data)
├── services/       reportService (interface) · storageService (IndexedDB) · imageService
├── hooks/          useReports, useGeolocation, useGeographicScope, …
├── data/           categories, locations, mockReports
└── pages/          HomePage, ReportsPage
```

**Backend-ready by design.** UI components only talk to `ReportsContext`, which only talks to the `ReportService` interface. Photos are downscaled to JPEG and stored as Blobs (never base64 in localStorage).

## Roadmap

- [x] Report flow with photo capture, pin picking and validation
- [x] Map, filters, confirmations, statuses and alerts
- [x] Iligan / Philippines scope with place search
- [ ] **Supabase** — Postgres for reports, Storage for photos, Realtime for live updates
- [ ] Accounts and moderator roles
- [ ] Push notifications for hazards on your route
- [ ] Duplicate-report detection
- [ ] Real geocoding instead of the built-in place list

## Known limitations

- No backend or accounts yet — everything is per-browser.
- Stats and contributor counts are illustrative.
- Map tiles and demo photos (Wikimedia Commons) need an internet connection; cards fall back to a drawn illustration if a photo can't load.

---

<div align="center">
<sub>Built in Iligan City by <a href="https://github.com/sirikitmac">@sirikitmac</a></sub>
</div>
