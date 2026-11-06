<div align="center">

<img src="public/logo.png" alt="KaDaan logo" width="96" />

# KaDaan

### See what's ahead.

Road reporting for **Iligan City** — every report goes to the barangay or city office that can act on it.

*Ka* (kasama, fellow) + *Daan* (road).

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

Road conditions in Philippine cities change by the hour — a flooded underpass, a stalled truck, a new pothole, a road closure nobody announced. That information usually lives in scattered Facebook posts and group chats, and the offices that can fix it hear about it late. **KaDaan** puts it on one shared map, routes each report to the right office, and lets riders follow the barangays they pass through.

## What it does

| | |
|---|---|
| 📍 **Report in seconds** | Photo, one of 11 categories, barangay, map pin, and a note. No account needed. Data Privacy Act (RA 10173) consent before sending. |
| 🏛️ **Routed to the right office** | Barangay, ICTPMO, ICDRRMO, City Engineer's Office, DPWH or PNP — suggested from the category, editable by the reporter. |
| 🚧 **Advisory vs Officially Closed** | Official closures carry a resolution/permit reference and the issuing office. Planned closures and events have start/end times. |
| 🛣️ **Segments & detours** | Closed segments drawn in red and suggested detours in green dashed lines on the map. |
| 🗺️ **Live road map** | Leaflet + OpenStreetMap with category-coloured markers. High-severity hazards pulse. "Near me" shows a 5 km radius. |
| ✅ **Community confirmation** | "I've encountered this too" — one confirmation per report per browser, so real hazards rise to the top. |
| 🏷️ **Clear statuses** | Pending Verification → Verified → Resolved (or Rejected). Verifying and resolving are personnel actions — the **Resolve** button is shown locked in this public app. |
| 🔔 **Barangay alerts** | Follow any of the 44 barangays and optionally add an SMS number (09XXXXXXXXX). The bell feed shows only what you follow. |
| 🔎 **Reports page** | `/reports` with search, category/status filters, sorting, pagination and shareable `?category=` links. |

> [!NOTE]
> This is a **frontend prototype** with no database yet. The service layer simulates a server (with network delay) and keeps data in the browser (IndexedDB + localStorage). Seeded reports are labelled **DEMO DATA**; resolution and permit numbers on them are invented.

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
│   ├── common/     Button, Modal, Badge, Logo, PlaceSearch
│   ├── landing/    Hero, MapSection, ReportsSection, HowItWorks, OrganizationsSection, …
│   ├── layout/     Navbar, Footer, AlertsModal
│   ├── map/        RoadMap, MapFilters, PinPickerMap, markerIcon
│   └── reports/    ReportForm, ReportCard, ReportDetails, ReportList, …
├── context/        AppContext (modals, alert prefs, toasts) · ReportsContext (data)
├── services/       reportService (interface) · alertService · storageService (IndexedDB) · imageService
├── hooks/          useReports, useGeolocation, useGeographicScope, …
├── data/           categories, organizations, barangays, locations, mockReports
└── pages/          HomePage, ReportsPage
```

**Backend-ready by design.** UI components only talk to `ReportsContext`, which only talks to the `ReportService` interface. Photos are downscaled to JPEG and stored as Blobs (never base64 in localStorage).

## Roadmap

- [x] Report flow with photo capture, pin picking and validation
- [x] Map, filters, confirmations, statuses and alerts
- [x] Office routing, official closures, schedules, segments and detours
- [x] Barangay alert subscriptions (simulated SMS)
- [ ] **Supabase** — Postgres for reports, Storage for photos, Realtime for live updates
- [ ] Personnel app for barangay / ICTPMO / ICDRRMO (verify, resolve, post closures)
- [ ] Real SMS and push delivery
- [ ] Duplicate-report detection
- [ ] Real geocoding instead of the built-in place list

## Known limitations

- No backend yet — data is per-browser, and "sent to" offices is simulated.
- Stats and contributor counts are illustrative.
- Map tiles and demo photos (Wikimedia Commons) need an internet connection; cards fall back to a drawn illustration if a photo can't load.

---

<div align="center">
<sub>Built in Iligan City by <a href="https://github.com/sirikitmac">@sirikitmac</a></sub>
</div>
