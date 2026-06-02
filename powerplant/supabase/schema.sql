-- ============================================================================
--  Powerplant — buddy-systeem database (Supabase / PostgreSQL)
-- ============================================================================
--  Plak dit hele script in het Supabase-dashboard onder:
--      SQL Editor  ->  New query  ->  plakken  ->  Run
--
--  Het script is "idempotent": je kunt het gerust meerdere keren draaien.
-- ============================================================================

-- ---------------------------------------------------------------------------
--  1. Tabellen
-- ---------------------------------------------------------------------------

-- Eén profiel per ingelogde gebruiker. De id verwijst naar het account dat
-- Supabase Auth zelf beheert (auth.users).
create table if not exists public.profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  username   text unique not null,
  created_at timestamptz not null default now()
);

create table if not exists public.buddies (
  id           uuid primary key default gen_random_uuid(),
  requester_id uuid not null references public.profiles (id) on delete cascade,
  receiver_id  uuid not null references public.profiles (id) on delete cascade,
  status       text not null default 'pending'
                 check (status in ('pending', 'accepted', 'blocked')),
  created_at   timestamptz not null default now(),
  unique (requester_id, receiver_id)
);

create table if not exists public.messages (
  id        uuid primary key default gen_random_uuid(),
  buddy_id  uuid not null references public.buddies (id) on delete cascade,
  sender_id uuid not null references public.profiles (id) on delete cascade,
  body      text not null,
  type      text not null default 'text',
  sent_at   timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
--  2. Trigger: maak automatisch een profiel bij registratie
-- ---------------------------------------------------------------------------
-- De gebruikersnaam wordt door de app meegestuurd in de "metadata" van het
-- nieuwe account. Deze trigger zet die in de profiles-tabel.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, username)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'username', 'gebruiker_' || left(new.id::text, 8))
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
--  3. Row Level Security (RLS)
-- ---------------------------------------------------------------------------
-- Zonder deze regels kan iedereen alle data lezen. Met RLS ziet elke gebruiker
-- alleen zijn eigen profiel-acties, zijn eigen buddy's en de berichten van die
-- buddy's.
alter table public.profiles enable row level security;
alter table public.buddies  enable row level security;
alter table public.messages enable row level security;

-- profiles -------------------------------------------------------------------
-- Iedereen die ingelogd is mag profielen lezen (nodig om buddy's te zoeken en
-- gebruikersnamen te tonen). Aanpassen/verwijderen mag alleen je eigen profiel.
drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles
  for select to authenticated using (true);

drop policy if exists profiles_update on public.profiles;
create policy profiles_update on public.profiles
  for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

drop policy if exists profiles_delete on public.profiles;
create policy profiles_delete on public.profiles
  for delete to authenticated using (id = auth.uid());

-- buddies --------------------------------------------------------------------
-- Je ziet/maakt/wijzigt alleen buddy-rijen waar je zelf bij betrokken bent.
drop policy if exists buddies_select on public.buddies;
create policy buddies_select on public.buddies
  for select to authenticated
  using (requester_id = auth.uid() or receiver_id = auth.uid());

drop policy if exists buddies_insert on public.buddies;
create policy buddies_insert on public.buddies
  for insert to authenticated
  with check (requester_id = auth.uid());

drop policy if exists buddies_update on public.buddies;
create policy buddies_update on public.buddies
  for update to authenticated
  using (requester_id = auth.uid() or receiver_id = auth.uid())
  with check (requester_id = auth.uid() or receiver_id = auth.uid());

drop policy if exists buddies_delete on public.buddies;
create policy buddies_delete on public.buddies
  for delete to authenticated
  using (requester_id = auth.uid() or receiver_id = auth.uid());

-- messages -------------------------------------------------------------------
-- Je ziet alleen berichten van buddy-koppelingen waar je zelf bij hoort, en je
-- mag alleen berichten sturen als jezelf de afzender bent.
drop policy if exists messages_select on public.messages;
create policy messages_select on public.messages
  for select to authenticated
  using (
    buddy_id in (
      select id from public.buddies
      where requester_id = auth.uid() or receiver_id = auth.uid()
    )
  );

drop policy if exists messages_insert on public.messages;
create policy messages_insert on public.messages
  for insert to authenticated
  with check (
    sender_id = auth.uid()
    and buddy_id in (
      select id from public.buddies
      where (requester_id = auth.uid() or receiver_id = auth.uid())
        and status = 'accepted'
    )
  );

-- ---------------------------------------------------------------------------
--  Klaar. De app kan nu registreren, inloggen, buddy's zoeken en chatten.
-- ---------------------------------------------------------------------------
