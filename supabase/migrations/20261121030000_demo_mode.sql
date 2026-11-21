-- DEMO MODE: while on, anyone who opens KaDaan (no login) can do what personnel can:
-- verify, reject, close, resolve, reopen, and send barangay alerts.
-- Meant for class demos only. Turn it off with:
--   update private.settings set value = false where key = 'demo_mode';

create table if not exists private.settings (
  key text primary key,
  value boolean not null
);
insert into private.settings (key, value) values ('demo_mode', true)
on conflict (key) do update set value = excluded.value;

create or replace function private.demo_mode()
returns boolean language sql stable security definer set search_path = '' as $$
  select coalesce((select value from private.settings where key = 'demo_mode'), false)
$$;

-- The app asks this to decide whether to show staff tools without a login.
create or replace function public.demo_mode_enabled()
returns boolean language sql stable security definer set search_path = '' as $$
  select private.demo_mode()
$$;
grant execute on function public.demo_mode_enabled() to anon, authenticated;

create or replace function private.is_personnel()
returns boolean language sql stable security definer set search_path = '' as $$
  select private.demo_mode() or exists (
    select 1 from public.profiles p join public.offices o on o.id = p.office_id
    where p.id = (select auth.uid())
      and (p.role::text = 'admin' or (p.role::text = 'personnel' and o.can_verify))
  )
$$;

grant usage on schema private to anon;
grant execute on function private.demo_mode(), private.is_personnel(), private.current_office() to anon;

-- Visitors (anon) may update reports and read status history only while demo mode is on.
create policy "demo: anyone updates reports" on public.reports for update to anon
  using ((select private.demo_mode()))
  with check ((select private.demo_mode()));
create policy "demo: anyone reads history" on public.report_status_history for select to anon
  using ((select private.demo_mode()));

-- Alerts sent without an account have no sender.
alter table public.barangay_alerts alter column sent_by drop not null;

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
  values (p_barangays, p_severity, trim(p_message), p_report_id, (select auth.uid()),
          coalesce(private.current_office(), 'ictpmo'))
  returning * into a;

  insert into public.sms_outbox (alert_id, sms_number, body)
  select a.id, s.sms_number, 'KaDaan: ' || a.message
  from public.alert_subscriptions s
  where s.sms_number is not null and s.barangays && p_barangays;

  return a;
end $$;
grant execute on function public.send_barangay_alert to anon, authenticated;
