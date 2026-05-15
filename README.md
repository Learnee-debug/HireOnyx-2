# HireOnyx

A full-stack job portal with AI-powered resume matching, real-time ATS pipeline, and role-based access for job seekers and recruiters.

## Features

- **Job Seekers** — Browse roles, apply with resume, track application status in real time
- **Recruiters** — Post jobs, manage applicants, update hiring pipeline
- **AI Resume Analyzer** — Paste your resume and get an instant match score + feedback powered by Gemini
- **Role-based auth** — Secure signup/login with automatic role detection (seeker vs recruiter)
- **Premium dark UI** — Space Grotesk typography, blue/teal design system, match score circles

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite |
| Styling | TailwindCSS + custom design system |
| Backend | Node.js + Express |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth (admin API, no email limits) |
| AI | Google Gemini 1.5 Flash |
| Deploy | Vercel (frontend) + Railway (backend) |

## Getting Started

### Prerequisites
- Node.js 18+
- A [Supabase](https://supabase.com) project
- A [Google AI Studio](https://aistudio.google.com) API key

### 1. Clone

```bash
git clone https://github.com/Learnee-debug/HireOnyx-2.git
cd HireOnyx-2
```

### 2. Database setup

Run `database/schema.sql` in your Supabase SQL Editor.

### 3. Frontend

```bash
cd frontend
npm install
cp .env.example .env.local
# Edit .env.local with your values
npm run dev
```

### 4. Backend

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your values
node server.js
```

## Environment Variables

### `frontend/.env.local`
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_BACKEND_URL=http://localhost:5000
```

### `backend/.env`
```
PORT=5000
GEMINI_API_KEY=your_gemini_key
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
FRONTEND_URL=http://localhost:5173
```

## Deployment

- **Frontend** → [Vercel](https://vercel.com) — root dir: `frontend`
- **Backend** → [Railway](https://railway.app) — root dir: `backend`

## Project Structure

```
HireOnyx/
├── frontend/          # React + Vite app
│   ├── src/
│   │   ├── pages/     # All route pages
│   │   ├── components/# Reusable UI components
│   │   ├── context/   # Auth context
│   │   └── lib/       # Utilities, Supabase client
│   └── ...
├── backend/           # Express API
│   └── src/
│       ├── routes/    # API routes
│       ├── controllers/# Business logic
│       └── middleware/ # Error handling
└── database/
    └── schema.sql     # PostgreSQL schema + RLS
```

## License

MIT
