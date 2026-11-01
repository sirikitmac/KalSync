# KalSync — See What's Ahead.

Community-powered road awareness and reporting for the Philippines, launching in **Iligan City**.

This is a **frontend prototype**: reports, photos, confirmations and status changes are saved in the
browser (IndexedDB + localStorage). All seeded reports are clearly labeled **DEMO DATA** and do not
describe real or current incidents.

## Run it

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # type-check + production build into dist/
npm run preview   # serve the production build
```

Requires Node 20.19+ (or 22.12+).

## Features

- **Landing page** — hero, geographic scope selector, live report feed, interactive map, how it works,
  incident categories, community stats, about, CTA, footer.
- **Iligan City / Philippines scope** — one shared state that filters the report list, map view,
  stats, and alerts. Persisted between visits. Place search jumps the map to 30+ Philippine cities
  and Iligan barangays.
- **Working report flow** — photo upload or camera capture (with preview/replace/remove), 9
  categories, place search, optional browser geolocation, manual map pin, city/province, description
  with character limit, validation, safety reminder, success screen with report ID.
- **Local persistence** — photos are downscaled to JPEG and stored as Blobs in IndexedDB (never as
  base64 in localStorage). Reports appear instantly and survive reloads.
- **Map** — Leaflet + OpenStreetMap, category-colored markers (pulsing for high-severity hazards),
  category filter, "near me" with 5 km radius, mobile bottom-sheet preview. Reports without
  coordinates stay list-only — no fabricated positions.
- **Statuses** — Pending Verification / Verified / Resolved / Rejected, with a clearly labeled demo
  moderation control in report details.
- **Community confirmations** — "I've encountered this too", one per report per browser.
- **Alerts** — in-app notification center + toasts (simulated, no push), severity labels, nearby
  highlighting.
- **Reports page** — `/reports` with search, category/status filters, sorting, pagination,
  shareable `?category=` URLs.

## Project structure

```
src/
  components/
    alerts/      NotificationCenter, Toaster
    common/      Button, Modal, Badge, Logo, PlaceSearch, ScopeToggle
    landing/     Hero, HeroVisual, ScopeSection, ReportsSection, MapSection,
                 HowItWorks, IncidentCategories, CommunityStats, About, CommunityCTA
    layout/      Navbar, Footer, JoinModal
    map/         RoadMap, MapFilters, PinPickerMap, markerIcon
    reports/     ReportCard, ReportForm, ReportModal, ReportFilters, ReportList,
                 ReportDetails, ReportImage, ConfirmButton, SceneIllustration
  context/       AppContext (scope, modals, toasts), ReportsContext (data)
  data/          mockReports.ts, categories.ts, locations.ts
  hooks/         useReports, useGeographicScope, useGeolocation, useReportImage, ...
  lib/           reportUtils (filtering, stats, formatting), cn
  services/      reportService (ReportService interface), storageService (IndexedDB), imageService
  types/         report.ts
  pages/         HomePage, ReportsPage
```

## Backend readiness

Components only talk to `ReportsContext`, which only talks to the `ReportService` interface in
`src/services/reportService.ts`. To move to Supabase, implement that interface with Postgres
(reports table), Storage (photos) and Realtime (live updates), then swap the exported
`reportService`. Auth, moderation roles, push notifications and duplicate detection can be layered on
without changing the UI components.

## Known limitations

- No backend, accounts, or real moderation — everything is per-browser.
- Place search uses a small built-in list of Philippine places, not a geocoding API.
- Map tiles load from OpenStreetMap and need an internet connection.
- Stats and contributor counts are illustrative sample metrics.
- Demo images are illustrations, not photographs.
