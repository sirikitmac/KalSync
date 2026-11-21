-- Reporter-chosen severity (RTM-17). When null, the category's severity applies.
alter table public.reports add column severity public.severity;

-- submit_report gains p_severity; drop the old signature first so there is one version.
drop function if exists public.submit_report(
  text, public.incident_category, text, text, text, text[], boolean,
  double precision, double precision, text, timestamptz, timestamptz
);

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
  p_ends_at timestamptz default null,
  p_severity public.severity default null
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
    id, title, category, severity, description, location, barangay, lat, lng, photo_path,
    schedule_starts_at, schedule_ends_at, consented_at
  ) values (
    private.new_report_id(), trim(p_title), p_category, p_severity, trim(p_description), trim(p_location),
    p_barangay, p_lat, p_lng, p_photo_path, p_starts_at, p_ends_at, now()
  ) returning * into r;

  insert into public.report_offices (report_id, office_id)
  select r.id, o from unnest(p_offices) as o
  on conflict do nothing;

  return r;
end $$;

revoke execute on function public.submit_report from public;
grant execute on function public.submit_report to anon, authenticated;
