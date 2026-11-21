-- Link each report to its category row (used for labels and severity).
alter table public.reports
  add constraint reports_category_fkey foreign key (category) references public.categories (id);
create index reports_category_idx on public.reports (category);
