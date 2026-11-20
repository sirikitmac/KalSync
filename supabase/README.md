# KaDaan database (Supabase)

## Set up
1. Supabase dashboard → project **Kadaan** → **SQL Editor** → **New query**.
2. Paste all of `migrations/20261120000000_init_kadaan.sql` and click **Run**. Run it once only, on an empty project.
3. **Project Settings → API**: copy the Project URL and the `anon` public key into `.env.local` (see `.env.example`).

## Tables
| Table | What it holds | Who can read / write |
|---|---|---|
| `barangays` | The 44 barangays of Iligan | Everyone reads |
| `offices` | Barangay, ICTPMO, ICDRRMO and partner agencies (CEO, DPWH, PNP, LTO) | Everyone reads; a partner agency edits its own hotline, hours and description |
| `categories` | Incident categories with severity | Everyone reads |
| `profiles` | Personnel and partner agency accounts (name, contact number, role, office) | Each user reads their own; created by an admin |
| `reports` | Road reports, status, closures, schedule, segment, detour | Everyone reads; road users submit through `submit_report()`; personnel update |
| `report_offices` | Offices each report was sent to | Everyone reads |
| `report_confirmations` | "I've encountered this too", one per device | Through `confirm_report()` only |
| `report_status_history` | Every status change | Logged-in users read |
| `alert_subscriptions` | Followed barangays and optional SMS number | Through `save_alert_subscription()` only, never readable |
| `barangay_alerts` | Alerts sent by personnel | Everyone reads; personnel send through `send_barangay_alert()` |
| `sms_outbox` | SMS waiting for an SMS provider | Not readable through the API |

Photos go to the public storage bucket `report-photos` under `reports/`.
Realtime is on for `reports` and `barangay_alerts`.

## Add a personnel or partner account
1. **Authentication → Users → Add user** (email + password). Copy the user's UID.
2. SQL Editor:
```sql
insert into public.profiles (id, full_name, contact_number, role, office_id, barangay)
values ('<UID>', 'Juan Dela Cruz', '09171234567', 'personnel', 'ictpmo', null);
-- role: 'personnel' (office barangay / ictpmo / icdrrmo) or 'partner' (ceo / dpwh / pnp / lto)
-- barangay: set it for barangay personnel, e.g. 'Tubod'
```
