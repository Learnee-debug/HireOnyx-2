-- HireOnyx Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── PROFILES ───────────────────────────────────────────
CREATE TABLE public.profiles (
  id            uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name     text NOT NULL DEFAULT 'User',
  email         text NOT NULL DEFAULT '',
  role          text NOT NULL DEFAULT 'seeker' CHECK (role IN ('seeker', 'recruiter')),
  avatar_url    text,
  bio           text,
  skills        text[] DEFAULT '{}',
  location      text,
  company_name  text,
  created_at    timestamptz DEFAULT now()
);

-- ─── JOBS ───────────────────────────────────────────────
CREATE TABLE public.jobs (
  id              uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  title           text NOT NULL,
  company         text NOT NULL,
  location        text NOT NULL,
  type            text NOT NULL CHECK (type IN ('full-time', 'part-time', 'remote', 'internship', 'contract')),
  description     text NOT NULL,
  requirements    text NOT NULL,
  skills_required text[] DEFAULT '{}',
  salary_min      integer,
  salary_max      integer,
  recruiter_id    uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  is_active       boolean DEFAULT true,
  created_at      timestamptz DEFAULT now()
);

-- ─── APPLICATIONS ───────────────────────────────────────
CREATE TABLE public.applications (
  id            uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  job_id        uuid REFERENCES public.jobs(id) ON DELETE CASCADE NOT NULL,
  seeker_id     uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  status        text DEFAULT 'applied' CHECK (status IN ('applied', 'reviewing', 'selected', 'rejected')),
  cover_letter  text,
  resume_text   text,
  applied_at    timestamptz DEFAULT now(),
  UNIQUE(job_id, seeker_id)
);

-- ─── ROW LEVEL SECURITY ─────────────────────────────────
ALTER TABLE public.profiles     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Anyone can view profiles"        ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert own profile"    ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile"    ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Service role can insert profiles" ON public.profiles FOR INSERT WITH CHECK (true);

-- Jobs policies
CREATE POLICY "Anyone can view active jobs"          ON public.jobs FOR SELECT USING (is_active = true);
CREATE POLICY "Recruiters can view own inactive jobs" ON public.jobs FOR SELECT USING (auth.uid() = recruiter_id);
CREATE POLICY "Recruiters can insert jobs"            ON public.jobs FOR INSERT WITH CHECK (auth.uid() = recruiter_id);
CREATE POLICY "Recruiters can update own jobs"        ON public.jobs FOR UPDATE USING (auth.uid() = recruiter_id);
CREATE POLICY "Recruiters can delete own jobs"        ON public.jobs FOR DELETE USING (auth.uid() = recruiter_id);

-- Applications policies
CREATE POLICY "Seekers can view own applications"           ON public.applications FOR SELECT USING (auth.uid() = seeker_id);
CREATE POLICY "Recruiters can view applications for their jobs" ON public.applications FOR SELECT USING (
  auth.uid() = (SELECT recruiter_id FROM public.jobs WHERE id = job_id)
);
CREATE POLICY "Seekers can insert applications"             ON public.applications FOR INSERT WITH CHECK (auth.uid() = seeker_id);
CREATE POLICY "Recruiters can update application status"    ON public.applications FOR UPDATE USING (
  auth.uid() = (SELECT recruiter_id FROM public.jobs WHERE id = job_id)
);

-- ─── AUTO-CREATE PROFILE ON SIGNUP ──────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', 'User'),
    COALESCE(new.email, ''),
    COALESCE(new.raw_user_meta_data->>'role', 'seeker')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
