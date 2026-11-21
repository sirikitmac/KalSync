-- Description is optional: an urgent report with a clear title and photo can skip it.
-- Safe to run more than once.
do $$
declare c text;
begin
  for c in
    select conname from pg_constraint
    where conrelid = 'public.reports'::regclass and contype = 'c'
      and pg_get_constraintdef(oid) ilike '%description%' and pg_get_constraintdef(oid) not ilike '%detour%'
  loop
    execute format('alter table public.reports drop constraint %I', c);
  end loop;
end $$;

alter table public.reports alter column description set default '';
alter table public.reports add constraint reports_description_length check (char_length(description) <= 2000);
