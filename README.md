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
- Demo photos are hotlinked from Wikimedia Commons, so they need an internet connection. If one
  can't load, the card falls back to a drawn illustration.

## Logo

`public/logo.png` (512px), `logo-192.webp` (used in the UI), `favicon.png`, `favicon-32.png` and
`apple-touch-icon.png` are generated from the KalSync "K + road" mark.

## Photo credits

Demo reports use freely licensed photos from Wikimedia Commons. They show the *type* of incident
and were **not** taken at the report's location. Each is credited in its report details.

| Report | Photo | Author | License |
|---|---|---|---|
| DEMO-ILG-001 | [A pothole in Dilova Street in Kyiv.jpg](https://commons.wikimedia.org/wiki/File:A_pothole_in_Dilova_Street_in_Kyiv.jpg) | Роман Рябенко | CC0 |
| DEMO-ILG-002 | [Flooded road in Anahao Bag-o.jpg](https://commons.wikimedia.org/wiki/File:Flooded_road_in_Anahao_Bag-o.jpg) | Rektz | CC BY 4.0 |
| DEMO-ILG-003 | [Broken down truck on Sherborne Road - geograph.org.uk - 2304675.jpg](https://commons.wikimedia.org/wiki/File:Broken_down_truck_on_Sherborne_Road_-_geograph.org.uk_-_2304675.jpg) | Sandy B | CC BY-SA 2.0 |
| DEMO-ILG-004 | [Night-time road resurfacing operation, Globe Lane, Chatham, Kent](https://commons.wikimedia.org/wiki/File:Night-time_road_resurfacing_operation_during_Chatham_Waterfront_Bus_Station_improvement_works_showing_Tarmac_vehicles,_workers,_and_road_closure_on_Globe_Lane,_Chatham,_Kent,_England.jpg) | OathOn | CC BY-SA 4.0 |
| DEMO-ILG-005 | [Fallen tree Butts Road Dunedin Oct 2025.jpg](https://commons.wikimedia.org/wiki/File:Fallen_tree_Butts_Road_Dunedin_Oct_2025.jpg) | DrThneed | CC BY 4.0 |
| DEMO-ILG-006 | [Earthslide partially blocking Puray-Mascap Road, Rizal Province, Philippines.jpg](https://commons.wikimedia.org/wiki/File:Earthslide_partially_blocking_Puray-Mascap_Road,_Rizal_Province,_Philippines.jpg) | Paul Christian B. Yang-ed | CC BY-SA 4.0 |
| DEMO-ILG-007 | [Public transport - jeepneys and buses (Commonwealth Avenue, Quezon City)](https://commons.wikimedia.org/wiki/File:Public_transport_-_jeepneys_and_buses_%28Commonwealth_Avenue,_Quezon_City%29%282017-12-04%29_2.jpg) | Patrick Roque | CC BY-SA 4.0 |
| DEMO-ILG-008 | [Crashed motorcycle in Gdańsk.JPG](https://commons.wikimedia.org/wiki/File:Crashed_motorcycle_in_Gda%C5%84sk.JPG) | Artur Andrzej | CC0 |
| DEMO-ILG-009 | [Pothole in an asphalt pavement.jpg](https://commons.wikimedia.org/wiki/File:Pothole_in_an_asphalt_pavement.jpg) | Frankie Fouganthin | CC BY-SA 4.0 |
| DEMO-ILG-010 | [M40 (6483667227).jpg](https://commons.wikimedia.org/wiki/File:M40_%286483667227%29.jpg) | Timo Newton-Syms | CC BY-SA 2.0 |
| DEMO-ILG-011 | [FEMA - Cars drive through flooded street in an Oklahoma neighborhood](https://commons.wikimedia.org/wiki/File:FEMA_-_32096_-_Cars_drives_though_flooded_street_in_an_Oklahoma_neighborhood.jpg) | Marvin Nauman / FEMA | Public domain |
| DEMO-CDO-001 | [Two cars stuck on the flooded Berry Street.jpg](https://commons.wikimedia.org/wiki/File:Two_cars_stuck_on_the_flooded_Berry_Street.jpg) | Bidgee | CC BY-SA 2.5 AU |
| DEMO-CDO-002 | [Widening works in Plaridel Bypass Road Caingin 06.jpg](https://commons.wikimedia.org/wiki/File:Widening_works_in_Plaridel_Bypass_Road_Caingin_06.jpg) | FBenjr123 | CC BY-SA 4.0 |
| DEMO-DVO-001 | [Roxas Boulevard traffic (Manila)](https://commons.wikimedia.org/wiki/File:Roxas_Boulevard_traffic_%28Manila%29%282019-02-21%29.JPG) | patrickroque01 | CC BY-SA 4.0 |
| DEMO-DVO-002 | [Landslide on Kentucky Route 8.jpg](https://commons.wikimedia.org/wiki/File:Landslide_on_Kentucky_Route_8.jpg) | CaseGrillot | CC0 |
| DEMO-CEB-001 | [Fallen tree (23732226750).jpg](https://commons.wikimedia.org/wiki/File:Fallen_tree_%2823732226750%29.jpg) | Oregon Department of Transportation | CC BY 2.0 |
| DEMO-CEB-002 | [Pothole in Villeray, Montréal.jpg](https://commons.wikimedia.org/wiki/File:Pothole_in_Villeray,_Montr%C3%A9al.jpg) | Miguel Tremblay | Public domain |
| DEMO-MNL-001 | [Car vs motorcycle accident.jpg](https://commons.wikimedia.org/wiki/File:Car_vs_motorcycle_accident.jpg) | Chmee2 | CC BY-SA 3.0 |
| DEMO-MNL-002 | [A car splashes up water on a flooded street in Calgary](https://commons.wikimedia.org/wiki/File:A_car_splashes_up_water_as_it_drives_down_a_flooded_street_in_Calgary,_Alberta,_Canada.jpg) | Dwayne Reilander | CC BY-SA 4.0 |
