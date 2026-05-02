-- Run this in your Supabase SQL Editor

create table operators (
  id uuid default gen_random_uuid() primary key,
  email text unique not null,
  name text,
  role text,
  theme_color text default 'default',
  theme_ui text default 'classic',
  preferred_mode text default 'analysis',
  created_at timestamp default now()
);

create table chat_history (
  id uuid default gen_random_uuid() primary key,
  email text unique not null,
  messages jsonb default '[]',
  updated_at timestamp default now()
);

create table contacts (
  id uuid default gen_random_uuid() primary key,
  email text not null,
  name text not null,
  phone text,
  contact_email text,
  created_at timestamp default now()
);

alter table operators enable row level security;
alter table chat_history enable row level security;
alter table contacts enable row level security;

create policy "allow all" on operators for all using (true) with check (true);
create policy "allow all" on chat_history for all using (true) with check (true);
create policy "allow all" on contacts for all using (true) with check (true);
