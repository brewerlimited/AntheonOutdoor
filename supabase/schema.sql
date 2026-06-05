create table if not exists public.leads (
  id text primary key,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  status text not null default 'New',
  proposal_status text not null default 'Brief Received',
  full_name text,
  email text,
  phone text,
  address text,
  project_type text,
  preferred_style text,
  budget_band text,
  garden_size text,
  budget_pressure text,
  data jsonb not null
);

create table if not exists public.lead_photos (
  id text primary key,
  lead_id text not null references public.leads(id) on delete cascade,
  created_at timestamptz not null default now(),
  sort_order integer not null default 0,
  file_name text,
  label text,
  notes text,
  storage_bucket text,
  storage_path text,
  public_url text,
  metadata jsonb not null default '{}'::jsonb
);

create table if not exists public.design_memories (
  id text primary key,
  lead_id text not null references public.leads(id) on delete cascade,
  updated_at timestamptz not null default now(),
  version_key text not null,
  version_title text not null,
  memory jsonb not null,
  unique (lead_id, version_key)
);

create table if not exists public.proposal_packs (
  lead_id text primary key references public.leads(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  status text not null default 'Draft',
  review_notes text,
  sent_at timestamptz,
  data jsonb not null
);

create table if not exists public.proposal_images (
  id text primary key,
  lead_id text not null references public.leads(id) on delete cascade,
  created_at timestamptz not null default now(),
  version_key text not null,
  sort_order integer not null default 0,
  file_name text,
  storage_bucket text,
  storage_path text,
  public_url text,
  image_notes text,
  image_status text not null default 'Not Started',
  approved boolean not null default false,
  metadata jsonb not null default '{}'::jsonb
);

create table if not exists public.admin_users (
  email text primary key,
  created_at timestamptz not null default now()
);

alter table public.leads add column if not exists updated_at timestamptz not null default now();
alter table public.leads add column if not exists full_name text;
alter table public.leads add column if not exists email text;
alter table public.leads add column if not exists phone text;
alter table public.leads add column if not exists address text;
alter table public.leads add column if not exists project_type text;
alter table public.leads add column if not exists preferred_style text;
alter table public.leads add column if not exists budget_band text;
alter table public.leads add column if not exists garden_size text;
alter table public.leads add column if not exists budget_pressure text;

create index if not exists leads_created_at_idx on public.leads (created_at desc);
create index if not exists leads_status_idx on public.leads (status);
create index if not exists leads_proposal_status_idx on public.leads (proposal_status);
create index if not exists leads_email_idx on public.leads (email);
create index if not exists lead_photos_lead_id_idx on public.lead_photos (lead_id);
create index if not exists design_memories_lead_id_idx on public.design_memories (lead_id);
create index if not exists proposal_images_lead_id_idx on public.proposal_images (lead_id);
create index if not exists proposal_images_version_key_idx on public.proposal_images (version_key);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists leads_set_updated_at on public.leads;
create trigger leads_set_updated_at
before update on public.leads
for each row
execute function public.set_updated_at();

drop trigger if exists design_memories_set_updated_at on public.design_memories;
create trigger design_memories_set_updated_at
before update on public.design_memories
for each row
execute function public.set_updated_at();

drop trigger if exists proposal_packs_set_updated_at on public.proposal_packs;
create trigger proposal_packs_set_updated_at
before update on public.proposal_packs
for each row
execute function public.set_updated_at();

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  (
    'garden-brief-photos',
    'garden-brief-photos',
    true,
    52428800,
    array['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif', 'video/mp4', 'video/quicktime']
  ),
  (
    'proposal-concept-images',
    'proposal-concept-images',
    true,
    52428800,
    array['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']
  )
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

alter table public.leads enable row level security;
alter table public.lead_photos enable row level security;
alter table public.design_memories enable row level security;
alter table public.proposal_packs enable row level security;
alter table public.proposal_images enable row level security;
alter table public.admin_users enable row level security;

drop policy if exists "MVP public lead access" on public.leads;
drop policy if exists "Public brief insert" on public.leads;
drop policy if exists "Admin lead read" on public.leads;
drop policy if exists "Admin lead update" on public.leads;
drop policy if exists "MVP public lead photo access" on public.lead_photos;
drop policy if exists "Public photo metadata insert" on public.lead_photos;
drop policy if exists "Admin photo metadata access" on public.lead_photos;
drop policy if exists "MVP public design memory access" on public.design_memories;
drop policy if exists "Public design memory insert" on public.design_memories;
drop policy if exists "Admin design memory access" on public.design_memories;
drop policy if exists "MVP public proposal pack access" on public.proposal_packs;
drop policy if exists "Public proposal draft insert" on public.proposal_packs;
drop policy if exists "Admin proposal pack access" on public.proposal_packs;
drop policy if exists "MVP public proposal image access" on public.proposal_images;
drop policy if exists "Admin proposal image access" on public.proposal_images;
drop policy if exists "Admin users can read own allowlist row" on public.admin_users;

create policy "Public brief insert"
on public.leads
for insert
to anon
with check (true);

create policy "Admin lead read"
on public.leads
for select
to authenticated
using (
  exists (
    select 1 from public.admin_users
    where email = lower(auth.jwt() ->> 'email')
  )
);

create policy "Admin lead update"
on public.leads
for update
to authenticated
using (
  exists (
    select 1 from public.admin_users
    where email = lower(auth.jwt() ->> 'email')
  )
)
with check (
  exists (
    select 1 from public.admin_users
    where email = lower(auth.jwt() ->> 'email')
  )
);

create policy "Public photo metadata insert"
on public.lead_photos
for insert
to anon
with check (true);

create policy "Admin photo metadata access"
on public.lead_photos
for all
to authenticated
using (
  exists (
    select 1 from public.admin_users
    where email = lower(auth.jwt() ->> 'email')
  )
)
with check (
  exists (
    select 1 from public.admin_users
    where email = lower(auth.jwt() ->> 'email')
  )
);

create policy "Public design memory insert"
on public.design_memories
for insert
to anon
with check (true);

create policy "Admin design memory access"
on public.design_memories
for all
to authenticated
using (
  exists (
    select 1 from public.admin_users
    where email = lower(auth.jwt() ->> 'email')
  )
)
with check (
  exists (
    select 1 from public.admin_users
    where email = lower(auth.jwt() ->> 'email')
  )
);

create policy "Public proposal draft insert"
on public.proposal_packs
for insert
to anon
with check (true);

create policy "Admin proposal pack access"
on public.proposal_packs
for all
to authenticated
using (
  exists (
    select 1 from public.admin_users
    where email = lower(auth.jwt() ->> 'email')
  )
)
with check (
  exists (
    select 1 from public.admin_users
    where email = lower(auth.jwt() ->> 'email')
  )
);

create policy "Admin proposal image access"
on public.proposal_images
for all
to authenticated
using (
  exists (
    select 1 from public.admin_users
    where email = lower(auth.jwt() ->> 'email')
  )
)
with check (
  exists (
    select 1 from public.admin_users
    where email = lower(auth.jwt() ->> 'email')
  )
);

create policy "Admin users can read own allowlist row"
on public.admin_users
for select
to authenticated
using (email = lower(auth.jwt() ->> 'email'));

drop policy if exists "MVP public garden photo storage access" on storage.objects;
drop policy if exists "MVP public proposal image storage access" on storage.objects;
drop policy if exists "Public garden photo upload" on storage.objects;
drop policy if exists "Public garden photo read" on storage.objects;
drop policy if exists "Admin proposal image storage access" on storage.objects;

create policy "Public garden photo upload"
on storage.objects
for insert
to anon
with check (bucket_id = 'garden-brief-photos');

create policy "Public garden photo read"
on storage.objects
for select
to anon
using (bucket_id = 'garden-brief-photos');

create policy "Admin proposal image storage access"
on storage.objects
for all
to authenticated
using (
  bucket_id = 'proposal-concept-images'
  and exists (
    select 1 from public.admin_users
    where email = lower(auth.jwt() ->> 'email')
  )
)
with check (
  bucket_id = 'proposal-concept-images'
  and exists (
    select 1 from public.admin_users
    where email = lower(auth.jwt() ->> 'email')
  )
);
