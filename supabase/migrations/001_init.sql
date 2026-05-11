-- =============================================
-- LyricsApp - Schéma Supabase
-- À exécuter dans Supabase > SQL Editor
-- =============================================

-- Extension UUID
create extension if not exists "pgcrypto";

-- Table utilisateurs (étend auth.users de Supabase)
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  name text not null,
  role text not null default 'member' check (role in ('member', 'admin')),
  status text not null default 'pending' check (status in ('pending', 'active', 'suspended')),
  created_at timestamptz default now()
);

-- Table chansons
create table public.songs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  artist text not null,
  lyrics text not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  submitted_by uuid references public.profiles(id) on delete set null,
  reviewed_by uuid references public.profiles(id) on delete set null,
  review_note text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Table historique des modifications
create table public.song_edits (
  id uuid primary key default gen_random_uuid(),
  song_id uuid references public.songs(id) on delete cascade not null,
  edited_by uuid references public.profiles(id) on delete set null,
  old_title text,
  old_artist text,
  old_lyrics text,
  new_title text,
  new_artist text,
  new_lyrics text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  review_note text,
  created_at timestamptz default now()
);

-- Table notifications
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  type text not null,
  message text not null,
  ref_id uuid,
  read boolean default false,
  created_at timestamptz default now()
);

-- =============================================
-- Row Level Security (RLS)
-- =============================================

alter table public.profiles enable row level security;
alter table public.songs enable row level security;
alter table public.song_edits enable row level security;
alter table public.notifications enable row level security;

-- Profiles: chacun voit son propre profil; admin voit tout
create policy "profiles_select" on public.profiles for select
  using (auth.uid() = id or exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  ));

create policy "profiles_update_self" on public.profiles for update
  using (auth.uid() = id);

create policy "profiles_admin_all" on public.profiles for all
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- Songs: membres actifs voient les chansons approuvées; admin voit tout
create policy "songs_select_approved" on public.songs for select
  using (
    status = 'approved' and exists (
      select 1 from public.profiles where id = auth.uid() and status = 'active'
    )
    or exists (
      select 1 from public.profiles where id = auth.uid() and role = 'admin'
    )
  );

create policy "songs_insert_member" on public.songs for insert
  with check (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('member','admin') and status = 'active')
  );

create policy "songs_admin_all" on public.songs for all
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- Song edits
create policy "edits_select" on public.song_edits for select
  using (
    edited_by = auth.uid()
    or exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "edits_insert_member" on public.song_edits for insert
  with check (
    exists (select 1 from public.profiles where id = auth.uid() and status = 'active')
  );

create policy "edits_admin_all" on public.song_edits for all
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- Notifications: chacun voit les siennes
create policy "notif_select_own" on public.notifications for select
  using (user_id = auth.uid());

create policy "notif_update_own" on public.notifications for update
  using (user_id = auth.uid());

-- =============================================
-- Trigger: créer profil après inscription
-- =============================================
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, name, role, status)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'role', 'member'),
    case when new.raw_user_meta_data->>'role' = 'admin' then 'active' else 'pending' end
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Trigger: updated_at sur songs
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger songs_updated_at before update on public.songs
  for each row execute function public.set_updated_at();
