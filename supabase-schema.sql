-- Drop old profiles table if it exists
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user;
drop table if exists public.profiles;

-- Create our custom users table that bypasses Supabase Auth
create table public.custom_users (
  id uuid default gen_random_uuid() primary key,
  email text unique not null,
  password text not null, -- Note: Plain text for bypass testing
  full_name text,
  phone text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable basic RLS so anyone can insert/select (since we aren't using Supabase Auth anymore)
alter table public.custom_users enable row level security;

create policy "Allow public access for custom auth"
  on custom_users for all
  using (true)
  with check (true);
