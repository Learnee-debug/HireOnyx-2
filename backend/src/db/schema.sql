-- HireOnyx schema — plain Postgres (Neon-compatible), no Supabase.
-- Run with: psql "$DATABASE_URL" -f src/db/schema.sql

create extension if not exists "uuid-ossp";

-- ─────────────────────────────────────────
-- USERS (replaces Supabase auth.users)
-- ─────────────────────────────────────────
create table if not exists users (
  id            uuid default uuid_generate_v4() primary key,
  email         text not null unique,
  password_hash text not null,
  created_at    timestamptz default now()
);

-- ─────────────────────────────────────────
-- PROFILES
-- ─────────────────────────────────────────
create table if not exists profiles (
  id            uuid references users(id) on delete cascade primary key,
  full_name     text not null,
  email         text not null,
  role          text not null check (role in ('seeker', 'recruiter')),
  avatar_url    text,
  bio           text,
  skills        text[]  default '{}',
  location      text,
  company_name  text,
  created_at    timestamptz default now()
);

-- ─────────────────────────────────────────
-- JOBS
-- ─────────────────────────────────────────
create table if not exists jobs (
  id              uuid default uuid_generate_v4() primary key,
  title           text not null,
  company         text not null,
  location        text not null,
  type            text not null check (type in ('full-time', 'part-time', 'remote', 'internship', 'contract')),
  description     text not null,
  requirements    text not null,
  skills_required text[]  default '{}',
  salary_min      integer,
  salary_max      integer,
  recruiter_id    uuid references profiles(id) on delete cascade not null,
  is_active       boolean default true,
  created_at      timestamptz default now()
);

-- ─────────────────────────────────────────
-- APPLICATIONS
-- ─────────────────────────────────────────
create table if not exists applications (
  id            uuid default uuid_generate_v4() primary key,
  job_id        uuid references jobs(id) on delete cascade not null,
  seeker_id     uuid references profiles(id) on delete cascade not null,
  status        text default 'applied'
                  check (status in ('applied', 'reviewing', 'selected', 'rejected')),
  cover_letter  text,
  resume_text   text,
  applied_at    timestamptz default now(),
  unique(job_id, seeker_id)
);

create index if not exists idx_jobs_recruiter on jobs(recruiter_id);
create index if not exists idx_jobs_active on jobs(is_active);
create index if not exists idx_applications_job on applications(job_id);
create index if not exists idx_applications_seeker on applications(seeker_id);
