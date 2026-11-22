# KaDaan database (Supabase)

## Set up
1. Supabase dashboard → your project → **SQL Editor** → **New query**.
2. Run each file in `migrations/` in order (by file name). Every file can be run again safely.

   | File | What it adds |
   |---|---|
   | `20261120000000_init_kadaan.sql` | Tables, RLS, RPCs, storage bucket, realtime, barangays, offices, categories |
   | `20261121000000_category_fk.sql` | Report category must exist in `categories` |
   | `20261121010000_report_severity.sql` | Severity chosen by the reporter |
   | `20261121020000_admin_and_signup.sql` | Sign-up: first account is admin, the rest are pending until approved |
   | `20261121030000_demo_mode.sql` | Demo switch: anyone can use staff actions (turn off for real use) |
   | `20261121040000_optional_description.sql` | Description is optional |
   | `20261121050000_seed_demo_reports.sql` | 15 sample reports (`KD-DEMO-*`) |
3. **Project Settings → API**: copy the Project URL and the publishable (`anon`) key into `.env.local` (see `.env.example`), and into the Vercel environment variables for the live site.
4. **Authentication → URL Configuration**: set the Site URL to the live site so sign-up emails link back to it.

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

## Personnel accounts
1. Open `/login` on the site and create an account. The **first** account becomes the admin (office ICTPMO).
2. Later accounts start as **pending**. The admin approves them in the SQL Editor (an approval screen is not built yet):
```sql
update public.profiles
set role = 'personnel', office_id = 'barangay', barangay = 'Tubod'   -- or office_id 'ictpmo' / 'icdrrmo', barangay null
where id = (select id from auth.users where email = 'staff@example.com');
```

## Demo mode
While `demo_mode` is on, anyone can verify, close and resolve reports and send alerts without signing in. Turn it off before real use:
```sql
update private.settings set value = false where key = 'demo_mode';
```
