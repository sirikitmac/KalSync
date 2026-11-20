-- KaDaan database (Supabase / Postgres)
-- Run once in Supabase: SQL Editor -> New query -> paste this file -> Run.
--
-- Who can do what:
--   * Road users (anon): read the public map, submit reports, confirm reports,
--     save alert settings. They have no account and no personal data is stored
--     about them except an optional SMS number they give with consent.
--   * Personnel (barangay, ICTPMO, ICDRRMO): log in, verify / reject / resolve
--     reports, post official closures, send barangay alerts.
--   * Partner agencies (CEO, DPWH, PNP, LTO): log in, read the shared incident
--     feed, edit their own office profile.
-- Writes by road users go through security-definer functions (RPCs) so the
-- tables themselves stay closed to anon inserts and updates.

create extension if not exists pgcrypto;
create schema if not exists private;

-- ---------------------------------------------------------------- types
create type public.report_status as enum ('pending', 'verified', 'rejected', 'resolved');
create type public.road_status_kind as enum ('advisory', 'closed');
create type public.incident_category as enum (
  'pothole', 'flooding', 'accident', 'obstruction', 'debris', 'construction',
  'landslide', 'traffic', 'parking', 'event', 'other'
);
create type public.severity as enum ('high', 'medium', 'low');
create type public.office_kind as enum ('barangay', 'city_office', 'partner_agency');
create type public.user_role as enum ('personnel', 'partner');

-- ---------------------------------------------------------------- reference data
create table public.barangays (
  name text primary key
);

create table public.offices (
  id text primary key,                         -- 'barangay', 'ictpmo', ...
  short_name text not null,
  name text not null,
  kind public.office_kind not null,
  handles text not null default '',
  hotline text check (hotline is null or hotline ~ '^[0-9+() -]{7,20}$'),
  office_hours text,
  can_verify boolean not null default false,   -- personnel offices
  updated_at timestamptz not null default now()
);

create table public.categories (
  id public.incident_category primary key,
  label text not null,
  severity public.severity not null
);

-- ---------------------------------------------------------------- accounts
-- One row per logged-in user (personnel or partner agency). Created by an
-- admin in the Supabase dashboard; road users never get a row here.
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null,
  contact_number text not null check (contact_number ~ '^09[0-9]{9}$'),
  role public.user_role not null,
  office_id text not null references public.offices (id),
  barangay text references public.barangays (name),  -- for barangay personnel
  consented_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
create index profiles_office_id_idx on public.profiles (office_id);

-- ---------------------------------------------------------------- reports
create table public.reports (
  id text primary key,                          -- KD-YYMMDD-XXXXX
  title text not null check (char_length(title) between 3 and 120),
  category public.incident_category not null,
  description text not null check (char_length(description) between 10 and 2000),
  location text not null,
  barangay text not null references public.barangays (name),
  city text not null default 'Iligan City',
  province text not null default 'Lanao del Norte',
  lat double precision check (lat between -90 and 90),
  lng double precision check (lng between -180 and 180),
  photo_path text,                              -- storage object in 'report-photos'
  status public.report_status not null default 'pending',
  status_updated_at timestamptz,
  road_status public.road_status_kind not null default 'advisory',
  closure_reference text,                       -- SP resolution / permit no.
  issued_by text references public.offices (id),
  schedule_starts_at timestamptz,
  schedule_ends_at timestamptz,
  segment jsonb,                                -- [{lat,lng}, ...]
  detour_description text,
  detour_path jsonb,
  verified_by text references public.offices (id),
  posted_by text references public.offices (id),
  confirmations integer not null default 0,
  consented_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint closed_needs_reference
    check (road_status <> 'closed' or closure_reference is not null),
  constraint schedule_order
    check (schedule_starts_at is null or schedule_ends_at > schedule_starts_at)
);
create index reports_barangay_idx on public.reports (barangay);
create index reports_status_created_idx on public.reports (status, created_at desc);
create index reports_issued_by_idx on public.reports (issued_by);
create index reports_verified_by_idx on public.reports (verified_by);
create index reports_posted_by_idx on public.reports (posted_by);

-- Offices the reporter chose to notify (routing)
create table public.report_offices (
  report_id text not null references public.reports (id) on delete cascade,
  office_id text not null references public.offices (id),
  primary key (report_id, office_id)
);
create index report_offices_office_idx on public.report_offices (office_id);

-- "I've encountered this too". device_id is a random id kept in the browser.
create table public.report_confirmations (
  report_id text not null references public.reports (id) on delete cascade,
  device_id uuid not null,
  created_at timestamptz not null default now(),
  primary key (report_id, device_id)
);

-- Status history (shown to partner agencies in the shared feed)
create table public.report_status_history (
  id bigint generated always as identity primary key,
  report_id text not null references public.reports (id) on delete cascade,
  status public.report_status not null,
  road_status public.road_status_kind not null,
  changed_by uuid references public.profiles (id),
  created_at timestamptz not null default now()
);
create index report_status_history_report_idx on public.report_status_history (report_id, created_at);
create index report_status_history_changed_by_idx on public.report_status_history (changed_by);

-- ---------------------------------------------------------------- alerts
-- Road users' alert settings. Not readable through the API (contains numbers).
create table public.alert_subscriptions (
  device_id uuid primary key,
  barangays text[] not null check (cardinality(barangays) > 0),
  sms_number text check (sms_number is null or sms_number ~ '^09[0-9]{9}$'),
  consented_at timestamptz not null,
  updated_at timestamptz not null default now()
);
create index alert_subscriptions_barangays_idx on public.alert_subscriptions using gin (barangays);

-- Alerts sent by personnel (UC-10) — public, shown in the in-app alert feed.
create table public.barangay_alerts (
  id bigint generated always as identity primary key,
  barangays text[] not null check (cardinality(barangays) > 0),
  severity public.severity not null default 'medium',
  message text not null check (char_length(message) between 5 and 300),
  report_id text references public.reports (id) on delete set null,
  sent_by uuid not null references public.profiles (id),
  office_id text not null references public.offices (id),
  created_at timestamptz not null default now()
);
create index barangay_alerts_barangays_idx on public.barangay_alerts using gin (barangays);
create index barangay_alerts_created_idx on public.barangay_alerts (created_at desc);
create index barangay_alerts_report_idx on public.barangay_alerts (report_id);
create index barangay_alerts_sent_by_idx on public.barangay_alerts (sent_by);
create index barangay_alerts_office_idx on public.barangay_alerts (office_id);

-- SMS queue: filled when an alert is sent; an SMS provider worker sends them later.
create table public.sms_outbox (
  id bigint generated always as identity primary key,
  alert_id bigint not null references public.barangay_alerts (id) on delete cascade,
  sms_number text not null,
  body text not null,
  sent_at timestamptz,
  error text,
  created_at timestamptz not null default now()
);
create index sms_outbox_unsent_idx on public.sms_outbox (created_at) where sent_at is null;
create index sms_outbox_alert_idx on public.sms_outbox (alert_id);

-- ---------------------------------------------------------------- helpers
create or replace function private.current_role()
returns public.user_role language sql stable security definer set search_path = '' as $$
  select role from public.profiles where id = (select auth.uid())
$$;

create or replace function private.current_office()
returns text language sql stable security definer set search_path = '' as $$
  select office_id from public.profiles where id = (select auth.uid())
$$;

create or replace function private.is_personnel()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.profiles p join public.offices o on o.id = p.office_id
    where p.id = (select auth.uid()) and p.role = 'personnel' and o.can_verify
  )
$$;

grant usage on schema private to authenticated;
revoke execute on all functions in schema private from public, anon;
grant execute on all functions in schema private to authenticated;

create or replace function private.new_report_id()
returns text language plpgsql volatile set search_path = '' as $$
declare
  alphabet constant text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  suffix text := '';
begin
  for i in 1..5 loop
    suffix := suffix || substr(alphabet, 1 + floor(random() * 32)::int, 1);
  end loop;
  return 'KD-' || to_char(now() at time zone 'Asia/Manila', 'YYMMDD') || '-' || suffix;
end $$;

-- keep updated_at / status_updated_at / history in sync
create or replace function private.reports_before_update()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at := now();
  if new.status is distinct from old.status or new.road_status is distinct from old.road_status then
    new.status_updated_at := now();
  end if;
  return new;
end $$;
create trigger reports_before_update before update on public.reports
  for each row execute function private.reports_before_update();

create or replace function private.reports_log_status()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if tg_op = 'INSERT'
     or new.status is distinct from old.status
     or new.road_status is distinct from old.road_status then
    insert into public.report_status_history (report_id, status, road_status, changed_by)
    values (new.id, new.status, new.road_status, (select auth.uid()));
  end if;
  return null;
end $$;
create trigger reports_log_status after insert or update on public.reports
  for each row execute function private.reports_log_status();

-- ---------------------------------------------------------------- RPCs for road users
-- UC-01 Submit Road Report
create or replace function public.submit_report(
  p_title text,
  p_category public.incident_category,
  p_description text,
  p_location text,
  p_barangay text,
  p_offices text[],
  p_consent boolean,
  p_lat double precision default null,
  p_lng double precision default null,
  p_photo_path text default null,
  p_starts_at timestamptz default null,
  p_ends_at timestamptz default null
) returns public.reports
language plpgsql security definer set search_path = '' as $$
declare
  r public.reports;
begin
  if not coalesce(p_consent, false) then
    raise exception 'Data Privacy consent is required' using errcode = '22023';
  end if;
  if coalesce(cardinality(p_offices), 0) = 0 then
    raise exception 'Choose at least one office to notify' using errcode = '22023';
  end if;
  if p_photo_path is not null and p_photo_path !~ '^reports/[A-Za-z0-9._-]+$' then
    raise exception 'Invalid photo path' using errcode = '22023';
  end if;

  insert into public.reports (
    id, title, category, description, location, barangay, lat, lng, photo_path,
    schedule_starts_at, schedule_ends_at, consented_at
  ) values (
    private.new_report_id(), trim(p_title), p_category, trim(p_description), trim(p_location),
    p_barangay, p_lat, p_lng, p_photo_path, p_starts_at, p_ends_at, now()
  ) returning * into r;

  insert into public.report_offices (report_id, office_id)
  select r.id, o from unnest(p_offices) as o
  on conflict do nothing;

  return r;
end $$;

-- UC-06 Confirm Report. Returns the new count.
create or replace function public.confirm_report(p_report_id text, p_device_id uuid)
returns integer language plpgsql security definer set search_path = '' as $$
declare
  n integer;
begin
  insert into public.report_confirmations (report_id, device_id)
  values (p_report_id, p_device_id)
  on conflict do nothing;
  if found then
    update public.reports set confirmations = confirmations + 1
    where id = p_report_id returning confirmations into n;
  else
    select confirmations into n from public.reports where id = p_report_id;
  end if;
  return n;
end $$;

-- UC-02 Follow Barangays for Alerts
create or replace function public.save_alert_subscription(
  p_device_id uuid, p_barangays text[], p_sms_number text, p_consent boolean
) returns void language plpgsql security definer set search_path = '' as $$
begin
  if not coalesce(p_consent, false) then
    raise exception 'Data Privacy consent is required' using errcode = '22023';
  end if;
  if exists (select 1 from unnest(p_barangays) b where b not in (select name from public.barangays)) then
    raise exception 'Unknown barangay' using errcode = '22023';
  end if;
  insert into public.alert_subscriptions (device_id, barangays, sms_number, consented_at, updated_at)
  values (p_device_id, p_barangays, nullif(trim(p_sms_number), ''), now(), now())
  on conflict (device_id) do update
    set barangays = excluded.barangays, sms_number = excluded.sms_number,
        consented_at = excluded.consented_at, updated_at = now();
end $$;

create or replace function public.delete_alert_subscription(p_device_id uuid)
returns void language sql security definer set search_path = '' as $$
  delete from public.alert_subscriptions where device_id = p_device_id
$$;

-- UC-10 Send Barangay Alert (personnel). Queues SMS for followers with a number.
create or replace function public.send_barangay_alert(
  p_barangays text[], p_message text, p_severity public.severity default 'medium',
  p_report_id text default null
) returns public.barangay_alerts
language plpgsql security definer set search_path = '' as $$
declare
  a public.barangay_alerts;
begin
  if not private.is_personnel() then
    raise exception 'Only authorized personnel can send alerts' using errcode = '42501';
  end if;
  if char_length(p_message) > 160 then
    raise exception 'The message must fit in one SMS (160 characters)' using errcode = '22023';
  end if;
  insert into public.barangay_alerts (barangays, severity, message, report_id, sent_by, office_id)
  values (p_barangays, p_severity, trim(p_message), p_report_id, (select auth.uid()), private.current_office())
  returning * into a;

  insert into public.sms_outbox (alert_id, sms_number, body)
  select a.id, s.sms_number, 'KaDaan: ' || a.message
  from public.alert_subscriptions s
  where s.sms_number is not null and s.barangays && p_barangays;

  return a;
end $$;

revoke execute on function public.submit_report, public.confirm_report,
  public.save_alert_subscription, public.delete_alert_subscription,
  public.send_barangay_alert from public;
grant execute on function public.submit_report, public.confirm_report,
  public.save_alert_subscription, public.delete_alert_subscription to anon, authenticated;
grant execute on function public.send_barangay_alert to authenticated;

-- ---------------------------------------------------------------- RLS
alter table public.barangays enable row level security;
alter table public.offices enable row level security;
alter table public.categories enable row level security;
alter table public.profiles enable row level security;
alter table public.reports enable row level security;
alter table public.report_offices enable row level security;
alter table public.report_confirmations enable row level security;
alter table public.report_status_history enable row level security;
alter table public.alert_subscriptions enable row level security;
alter table public.barangay_alerts enable row level security;
alter table public.sms_outbox enable row level security;

-- public reference data
create policy "read barangays" on public.barangays for select to anon, authenticated using (true);
create policy "read offices" on public.offices for select to anon, authenticated using (true);
create policy "read categories" on public.categories for select to anon, authenticated using (true);

-- UC-12 Manage Agency Profile: partner agencies edit their own office only
create policy "partners edit own office" on public.offices for update to authenticated
  using (id = (select private.current_office()) and (select private.current_role()) = 'partner')
  with check (id = (select private.current_office()));
-- ...and only the profile fields, never kind / can_verify
revoke update on public.offices from anon, authenticated;
grant update (handles, hotline, office_hours) on public.offices to authenticated;

-- profiles: each user reads their own
create policy "read own profile" on public.profiles for select to authenticated
  using (id = (select auth.uid()));

-- reports: public map (RTM-09); personnel update (verify / close / resolve)
create policy "read reports" on public.reports for select to anon, authenticated using (true);
create policy "personnel update reports" on public.reports for update to authenticated
  using ((select private.is_personnel()))
  with check ((select private.is_personnel()));
-- Personnel post official advisories / closures directly (RTM-05)
create policy "personnel insert reports" on public.reports for insert to authenticated
  with check ((select private.is_personnel()) and posted_by = (select private.current_office()));

create policy "read report offices" on public.report_offices for select to anon, authenticated using (true);

-- status history: logged-in users only (shared incident feed)
create policy "read history" on public.report_status_history for select to authenticated using (true);

-- barangay alerts: public in-app feed
create policy "read alerts" on public.barangay_alerts for select to anon, authenticated using (true);

-- report_confirmations, alert_subscriptions, sms_outbox: no policies = closed to the API.

-- ---------------------------------------------------------------- storage (photos)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('report-photos', 'report-photos', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

create policy "anyone uploads report photos" on storage.objects for insert to anon, authenticated
  with check (bucket_id = 'report-photos' and (storage.foldername(name))[1] = 'reports');

-- ---------------------------------------------------------------- realtime (RTM-21)
alter publication supabase_realtime add table public.reports, public.barangay_alerts;

-- ---------------------------------------------------------------- seed data
insert into public.barangays (name) values
  ('Abuno'),
  ('Acmac'),
  ('Bagong Silang'),
  ('Bonbonon'),
  ('Bunawan'),
  ('Buru-un'),
  ('Dalipuga'),
  ('Del Carmen'),
  ('Digkilaan'),
  ('Ditucalan'),
  ('Dulag'),
  ('Hinaplanon'),
  ('Hindang'),
  ('Kabacsanan'),
  ('Kalilangan'),
  ('Kiwalan'),
  ('Lanipao'),
  ('Luinab'),
  ('Mahayahay'),
  ('Mainit'),
  ('Mandulog'),
  ('Maria Cristina'),
  ('Pala-o'),
  ('Panoroganan'),
  ('Poblacion'),
  ('Puga-an'),
  ('Rogongon'),
  ('San Miguel'),
  ('San Roque'),
  ('Santa Elena'),
  ('Santa Filomena'),
  ('Santiago'),
  ('Santo Rosario'),
  ('Saray'),
  ('Suarez'),
  ('Tambacan'),
  ('Tibanga'),
  ('Tipanoy'),
  ('Tomas L. Cabili'),
  ('Tubod'),
  ('Ubaldo Laya'),
  ('Upper Hinaplanon'),
  ('Upper Tominobo'),
  ('Villa Verde');

insert into public.offices (id, short_name, name, kind, handles, can_verify) values
  ('barangay', 'Barangay', 'Barangay Hall (Tanod / BPSO)', 'barangay',
   'First responder in your area: obstructions, illegal parking and vendors, fiestas and local events, minor flooding.', true),
  ('ictpmo', 'ICTPMO', 'Iligan City Traffic & Parking Management Office', 'city_office',
   'Traffic flow, parking enforcement, road closures, rerouting and detours.', true),
  ('icdrrmo', 'ICDRRMO', 'Iligan City Disaster Risk Reduction & Management Office', 'city_office',
   'Flooding, landslides, storm debris and other disaster-related road hazards.', true),
  ('ceo', 'City Engineering', 'City Engineer''s Office', 'partner_agency',
   'Repairs on city roads: potholes, damaged pavement, drainage and debris clearing.', false),
  ('dpwh', 'DPWH', 'DPWH – Lanao del Norte District Engineering Office', 'partner_agency',
   'National highway repairs and construction.', false),
  ('pnp', 'PNP', 'Iligan City Police Office (Traffic)', 'partner_agency',
   'Road accidents and incidents that need police presence.', false),
  ('lto', 'LTO', 'Land Transportation Office – Iligan District Office', 'partner_agency',
   'Driver and vehicle concerns; coordination on road incidents.', false);

insert into public.categories (id, label, severity) values
  ('pothole', 'Pothole / Damaged Road', 'medium'),
  ('flooding', 'Flooding', 'high'),
  ('accident', 'Road Accident', 'high'),
  ('obstruction', 'Road Obstruction', 'high'),
  ('debris', 'Fallen Tree / Debris', 'medium'),
  ('construction', 'Road Construction', 'medium'),
  ('landslide', 'Landslide', 'high'),
  ('traffic', 'Heavy Traffic', 'low'),
  ('parking', 'Illegal Parking / Vendors', 'medium'),
  ('event', 'Planned Closure / Event', 'medium'),
  ('other', 'Other', 'low');
