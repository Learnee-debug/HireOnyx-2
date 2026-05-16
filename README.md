<div align="center">

<br />

```
██╗  ██╗██╗██████╗ ███████╗ ██████╗ ███╗   ██╗██╗   ██╗██╗  ██╗
██║  ██║██║██╔══██╗██╔════╝██╔═══██╗████╗  ██║╚██╗ ██╔╝╚██╗██╔╝
███████║██║██████╔╝█████╗  ██║   ██║██╔██╗ ██║ ╚████╔╝  ╚███╔╝ 
██╔══██║██║██╔══██╗██╔══╝  ██║   ██║██║╚██╗██║  ╚██╔╝   ██╔██╗ 
██║  ██║██║██║  ██║███████╗╚██████╔╝██║ ╚████║   ██║   ██╔╝ ██╗
╚═╝  ╚═╝╚═╝╚═╝  ╚═╝╚══════╝ ╚═════╝ ╚═╝  ╚═══╝   ╚═╝   ╚═╝  ╚═╝
```

### *Find your match. Not just a job.*

<br />

[![Live Demo](https://img.shields.io/badge/🚀%20LIVE%20DEMO-hireonyx--frontend.vercel.app-1a56db?style=for-the-badge&logoColor=white)](https://hireonyx-frontend.vercel.app)
&nbsp;
[![Backend API](https://img.shields.io/badge/⚡%20API%20STATUS-online-22c55e?style=for-the-badge)](https://hireonyx-backend-production.up.railway.app/api/health)

<br />

![React](https://img.shields.io/badge/React_18-20232A?style=flat-square&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=nodedotjs&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat-square&logo=supabase&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white)
![Railway](https://img.shields.io/badge/Railway-0B0D0E?style=flat-square&logo=railway&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=flat-square&logo=vercel&logoColor=white)

<br />

</div>

---

## ✦ What is HireOnyx?

**HireOnyx** is a full-stack AI-powered job portal built for technical precision. It connects engineers with companies using a proprietary **AI Match Engine** that scores candidates against roles in real time — not keyword matching, but deep semantic alignment powered by DeepSeek v3.

Built with a **warm technical aesthetic** inspired by Linear, Stripe, and Vercel. Designed for professionals who care about the tools they use.

<br />

## ⚡ Live

> **🌐 Frontend** → **[https://hireonyx-frontend.vercel.app](https://hireonyx-frontend.vercel.app)**
>
> **🔌 Backend API** → [https://hireonyx-backend-production.up.railway.app/api/health](https://hireonyx-backend-production.up.railway.app/api/health)

**Demo accounts:**

| Role | Email | Password |
|------|-------|----------|
| Job Seeker | `dhairya@gmail.com` | `123456` |
| Recruiter | `shubhampadkonde12@gmail.com` | `Shubham@12` |

<br />

---

## 🧠 Core Features

### For Job Seekers

| Feature | Description |
|---------|-------------|
| 🔍 **Browse & Filter** | Search by role, location, type, experience level with real-time filtering |
| 📄 **AI Resume Upload** | Upload your PDF — AI extracts 20+ skills and builds your candidate profile |
| ✦ **AI Match Score** | Every job shows a precise 0–100% match score with semantic color coding |
| 📋 **Application Tracking** | Live ATS pipeline — see status changes the moment a recruiter acts |
| 🌙 **Dark / Light Mode** | Full theme toggle with a warm technical dark palette |

### For Recruiters

| Feature | Description |
|---------|-------------|
| 📝 **Post Jobs** | Rich job creation — skills tagging, salary range, type, location |
| 👥 **Active Jobs Dashboard** | All postings — applicant count, match scores, pause/activate controls |
| 🧑‍💼 **Candidates Pipeline** | Every applicant across all jobs — status filter, slide-in detail drawer |
| 📊 **Reports & Analytics** | Application funnel, 7-day volume chart, top jobs ranked by applications |
| ✅ **ATS Status Management** | Applied → Reviewing → Selected → Rejected with one click |

<br />

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         HireOnyx                                │
├──────────────────────┬──────────────────────────────────────────┤
│     FRONTEND         │              BACKEND                     │
│   React 18 + Vite    │           Node.js + Express v5           │
│   TailwindCSS v3     │                                          │
│   react-router v7    │  /api/health          → system status   │
│   react-hot-toast    │  /api/auth/signup     → create user     │
│                      │  /api/ai/parse-resume → PDF → profile   │
│  ─── Vercel ───────  │  /api/ai/match-jobs   → AI scoring      │
│                      │  /api/ai/match-single → deep analysis   │
│                      │                                          │
│                      │  ─── Railway ─────────────────────────  │
├──────────────────────┴──────────────────────────────────────────┤
│                        DATABASE                                 │
│         Supabase (PostgreSQL + Row Level Security)              │
│   profiles · jobs · applications                                │
├─────────────────────────────────────────────────────────────────┤
│                       AI ENGINE                                 │
│         OpenRouter API → DeepSeek Chat v3-0324                  │
│   40% keyword scoring + 60% semantic AI = final match score     │
│   In-memory cache · PDF parsing via pdf-parse v1.1.1            │
└─────────────────────────────────────────────────────────────────┘
```

<br />

## 🛠️ Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Frontend** | React + Vite | 18 / 8 |
| **Styling** | Tailwind CSS + CSS custom properties | 3.4 |
| **Routing** | React Router | 7 |
| **Backend** | Node.js + Express | 20 / 5 |
| **Database** | Supabase (PostgreSQL) | Latest |
| **Auth** | Supabase Admin API | — |
| **AI** | OpenRouter → DeepSeek Chat v3 | — |
| **PDF** | pdf-parse | 1.1.1 |
| **File Upload** | Multer (memory storage) | 2 |
| **Security** | Helmet.js + CORS | — |
| **Frontend Host** | Vercel | — |
| **Backend Host** | Railway | — |

<br />

---

## 📁 Project Structure

```
HireOnyx/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ai/              # ResumeUpload, WhyMatched
│   │   │   ├── applications/    # ApplyModal, StatusBadge
│   │   │   ├── layout/          # Navbar, Footer, RecruiterLayout
│   │   │   └── ui/              # Skeleton loaders
│   │   ├── context/
│   │   │   ├── AuthContext.jsx  # Supabase auth state
│   │   │   └── ThemeContext.jsx # Dark/light mode
│   │   ├── lib/
│   │   │   ├── aiMatchingApi.js # OpenRouter API calls + cache
│   │   │   ├── supabase.js      # Supabase client
│   │   │   └── utils.js         # formatSalary · daysAgo · stableMatch
│   │   └── pages/
│   │       ├── Home.jsx
│   │       ├── Jobs.jsx          # Filter sidebar + AI match table
│   │       ├── JobDetail.jsx     # Single job + apply + AI analysis
│   │       ├── Login.jsx / Signup.jsx
│   │       ├── PostJob.jsx
│   │       ├── seeker/
│   │       │   └── SeekerDashboard.jsx
│   │       └── recruiter/
│   │           ├── RecruiterDashboard.jsx  # Pipeline overview
│   │           ├── ActiveJobs.jsx          # All job listings
│   │           ├── Candidates.jsx          # All applicants
│   │           ├── Reports.jsx             # Analytics
│   │           └── ApplicantsList.jsx      # Per-job applicants
│   ├── tailwind.config.js        # CSS variable color tokens
│   ├── src/index.css             # :root + html.dark variables
│   └── vercel.json               # SPA rewrite rules
│
└── backend/
    ├── server.js
    └── src/
        ├── routes/
        │   ├── health.routes.js
        │   ├── auth.routes.js
        │   └── matching.routes.js
        ├── controllers/
        │   ├── auth.controller.js
        │   └── matchingController.js
        └── services/
            ├── aiMatchingService.js    # DeepSeek scoring logic
            └── resumeParserService.js  # PDF → skills extraction
```

<br />

---

## 🚀 Local Development

### Prerequisites
- Node.js 18+
- A [Supabase](https://supabase.com) project
- An [OpenRouter](https://openrouter.ai) API key (free tier available)

### 1. Clone the repo

```bash
git clone https://github.com/Learnee-debug/HireOnyx-2.git
cd HireOnyx-2
```

### 2. Backend

```bash
cd backend
cp .env.example .env
# Edit .env with your credentials
npm install
npm run dev
# API running at http://localhost:5000
```

**`.env` variables:**
```env
PORT=5000
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
OPENROUTER_API_KEY=sk-or-v1-...
OPENROUTER_MODEL=deepseek/deepseek-chat-v3-0324
FRONTEND_URL=http://localhost:5173
```

### 3. Frontend

```bash
cd frontend
cp .env.example .env
# Edit .env with your credentials
npm install
npm run dev
# App running at http://localhost:5173
```

**`.env` variables:**
```env
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_BACKEND_URL=http://localhost:5000
```

### 4. Database Schema

Run this in your Supabase SQL editor:

```sql
-- Profiles
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text, email text,
  role text check (role in ('seeker', 'recruiter')),
  created_at timestamptz default now()
);

-- Jobs
create table public.jobs (
  id uuid default gen_random_uuid() primary key,
  recruiter_id uuid references public.profiles(id) on delete cascade,
  title text not null, company text not null,
  location text not null, type text not null,
  description text, requirements text,
  skills_required text[], salary_min int, salary_max int,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- Applications
create table public.applications (
  id uuid default gen_random_uuid() primary key,
  job_id uuid references public.jobs(id) on delete cascade,
  seeker_id uuid references public.profiles(id) on delete cascade,
  status text default 'applied'
    check (status in ('applied','reviewing','selected','rejected')),
  cover_letter text, resume_text text,
  applied_at timestamptz default now(),
  unique(job_id, seeker_id)
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    new.email,
    coalesce(new.raw_user_meta_data->>'role', 'seeker')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- RLS Policies
alter table public.profiles enable row level security;
alter table public.jobs enable row level security;
alter table public.applications enable row level security;

create policy "Public read profiles"    on public.profiles    for select using (true);
create policy "Own profile update"      on public.profiles    for update using (auth.uid() = id);
create policy "Public read jobs"        on public.jobs        for select using (true);
create policy "Recruiter post job"      on public.jobs        for insert with check (auth.uid() = recruiter_id);
create policy "Recruiter edit job"      on public.jobs        for update using (auth.uid() = recruiter_id);
create policy "Seeker apply"            on public.applications for insert with check (auth.uid() = seeker_id);
create policy "Seeker own apps"         on public.applications for select using (auth.uid() = seeker_id);
create policy "Recruiter view apps"     on public.applications for select using (
  exists (select 1 from public.jobs where id = job_id and recruiter_id = auth.uid())
);
create policy "Recruiter update status" on public.applications for update using (
  exists (select 1 from public.jobs where id = job_id and recruiter_id = auth.uid())
);
```

<br />

---

## 🌐 Deployment

### Frontend → Vercel

```bash
cd frontend && npx vercel --prod
```

`vercel.json` handles SPA routing automatically — no 404 on direct URL access.

### Backend → Railway

1. Go to [Railway](https://railway.app) → New Project → Deploy from GitHub
2. Set **root directory** to `backend/`
3. Add all environment variables in the Railway dashboard
4. Railway auto-deploys on every push to `master`

<br />

---

## 🔌 API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | System health check |
| `POST` | `/api/auth/signup` | Register user (no email limits) |
| `GET` | `/api/ai/health` | AI service status + model info |
| `POST` | `/api/ai/parse-resume` | `multipart/form-data` PDF → profile |
| `POST` | `/api/ai/match-jobs` | Profile + jobs[] → scored matches |
| `POST` | `/api/ai/match-single` | Profile + job → deep analysis |

**Parse Resume:**
```bash
curl -X POST https://hireonyx-backend-production.up.railway.app/api/ai/parse-resume \
  -F "resume=@my_resume.pdf"
```

**Match Jobs:**
```bash
curl -X POST https://hireonyx-backend-production.up.railway.app/api/ai/match-jobs \
  -H "Content-Type: application/json" \
  -d '{
    "profile": { "skills": ["React", "TypeScript", "Node.js"] },
    "jobs": [{ "id": "1", "title": "Frontend Engineer", "description": "..." }]
  }'
```

<br />

---

## 🎨 Design System

HireOnyx uses a **CSS custom property** theming system — automatic light/dark switching without `dark:` class proliferation.

```css
/* Light — warm parchment */
:root {
  --c-bg:      #F4F3EF;
  --c-surface: #FFFFFF;
  --c-text:    #0D0D0C;
  --c-primary: #003fb1;
}

/* Dark — deep onyx */
html.dark {
  --c-bg:      #0d0f0d;
  --c-surface: #1f201e;
  --c-text:    #e3e2df;
  --c-primary: #b5c4ff;
}
```

**Match score color system:**

| Range | Light | Dark | Meaning |
|-------|-------|------|---------|
| 90–100% | Green `#166534` | `#22C55E` | Strong fit |
| 75–89% | Blue `#1547C0` | `#60A5FA` | Good match |
| 60–74% | Amber `#92400E` | `#FBBF24` | Partial fit |
| < 60% | Gray | Gray | Muted (not alarming) |

<br />

---

## 🔐 Security

- **Row Level Security** — all Supabase tables; users only access their own data
- **Helmet.js** — secure HTTP headers on every response
- **CORS** — restricted to exact allowed origins (Vercel + localhost only)
- **Supabase Admin API** — bypasses SMTP rate limits; email confirmation not required
- **Multer** — PDF only, 5MB max, in-memory storage (no disk writes on Railway)
- **No secrets in frontend** — all sensitive keys are backend-only env vars

<br />

---

## 📈 Roadmap

- [ ] Real-time notifications on application status change
- [ ] Interview scheduling with calendar integration
- [ ] Company verification badge system
- [ ] Resume builder with AI suggestions
- [ ] Bulk applicant CSV export
- [ ] Weekly email digest for recruiters

<br />

---

<div align="center">

**Built by [Shubham Padkonde](https://github.com/Learnee-debug)**

[![GitHub](https://img.shields.io/badge/GitHub-Learnee--debug-181717?style=flat-square&logo=github)](https://github.com/Learnee-debug)

<br />

*HireOnyx — Surgical precision in technical recruiting.*

</div>
