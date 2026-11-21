-- Admin role and self sign-up.
--
-- * The FIRST account that signs up becomes admin automatically (office ICTPMO),
--   so the project owner can start managing reports without running SQL.
-- * Later sign-ups get a profile with no role ("pending"): they can log in but
--   cannot change anything until an admin gives them a role.
-- * Admins can do everything personnel can, and can assign roles to others.

alter type public.user_role add value if not exists 'admin';
alter type public.user_role add value if not exists 'pending';

-- Role comparisons below use ::text so this file also runs in one transaction
-- (a new enum value cannot be used as a literal before it is committed).

create or replace function private.is_admin()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.profiles where id = (select auth.uid()) and role::text = 'admin')
$$;

create or replace function private.is_personnel()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.profiles p join public.offices o on o.id = p.office_id
    where p.id = (select auth.uid())
      and (p.role::text = 'admin' or (p.role::text = 'personnel' and o.can_verify))
  )
$$;

grant execute on function private.is_admin() to authenticated;

-- New auth user -> profile. Name and contact number come from the sign-up form.
create or replace function private.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  meta jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  phone text := coalesce(nullif(meta->>'contact_number', ''), '09000000000');
  first_admin boolean := not exists (select 1 from public.profiles where role::text = 'admin');
begin
  if phone !~ '^09[0-9]{9}$' then
    phone := '09000000000';
  end if;
  insert into public.profiles (id, full_name, contact_number, role, office_id, consented_at)
  values (
    new.id,
    coalesce(nullif(trim(meta->>'full_name'), ''), split_part(new.email, '@', 1)),
    phone,
    (case when first_admin then 'admin' else 'pending' end)::public.user_role,
    'ictpmo',
    now()
  )
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function private.handle_new_user();

-- Admins see every profile and can assign roles and offices.
drop policy if exists "admins read profiles" on public.profiles;
create policy "admins read profiles" on public.profiles for select to authenticated
  using ((select private.is_admin()));
drop policy if exists "admins update profiles" on public.profiles;
create policy "admins update profiles" on public.profiles for update to authenticated
  using ((select private.is_admin()))
  with check ((select private.is_admin()));

-- Staff can read which offices each report went to and the full status history (already allowed);
-- they also need to see who changed a status.
drop policy if exists "staff read names" on public.profiles;
create policy "staff read names" on public.profiles for select to authenticated
  using ((select private.is_personnel()));
