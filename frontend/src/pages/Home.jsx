import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { formatSalary } from '../lib/utils';
import Footer from '../components/layout/Footer';

function JobRow({ job }) {
  const navigate = useNavigate();
  const initials = job.company?.[0]?.toUpperCase() || '?';
  const palettes = [
    'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400',
    'bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-400',
    'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400',
    'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400',
    'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400',
  ];
  const palette = palettes[initials.charCodeAt(0) % palettes.length];

  return (
    <div
      onClick={() => navigate(`/jobs/${job.id}`)}
      className="group flex items-center gap-4 px-6 py-4 hover:bg-surface-container-low transition-colors cursor-pointer"
    >
      {/* Avatar */}
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0 border border-border-default ${palette}`}>
        {initials}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-[15px] font-semibold text-text-primary group-hover:text-primary transition-colors truncate">
          {job.title}
        </p>
        <p className="text-body-sm text-text-secondary flex items-center gap-1.5 flex-wrap">
          <span>{job.company}</span>
          <span className="text-border-default">·</span>
          <span>{job.location}</span>
          {job.salary_min && (
            <>
              <span className="text-border-default">·</span>
              <span className="font-medium text-text-primary">{formatSalary(job.salary_min, job.salary_max)}</span>
            </>
          )}
        </p>
      </div>

      {/* Meta */}
      <div className="flex items-center gap-4 flex-shrink-0">
        <span className="font-mono text-[11px] text-text-muted hidden lg:block uppercase tracking-widest">
          ID: {String(job.id).slice(-6).toUpperCase()}
        </span>
        <span className="material-symbols-outlined text-[18px] text-text-muted group-hover:text-primary transition-colors">
          chevron_right
        </span>
      </div>
    </div>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    supabase.from('jobs').select('*').eq('is_active', true)
      .order('created_at', { ascending: false }).limit(5)
      .then(({ data }) => setJobs(data || []));
  }, []);

  return (
    <div className="min-h-screen flex flex-col">

      {/* ── HERO ── */}
      <section className="max-w-[1440px] mx-auto w-full px-margin-page pt-16 pb-16 md:pt-20 md:pb-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 border-b border-border-default pb-14">

          {/* Left — copy */}
          <div className="max-w-2xl">
            <p className="font-mono text-[11px] font-semibold text-primary uppercase tracking-[0.12em] mb-5 flex items-center gap-2">
              <span className="inline-block w-4 h-[1.5px] bg-primary" />
              AI-Powered Hiring
            </p>
            <h1 className="font-bold text-[52px] md:text-[68px] leading-[0.95] tracking-tighter text-text-primary mb-6">
              Find your match.
            </h1>
            <p className="text-[16px] text-text-secondary leading-relaxed max-w-lg mb-8">
              Surgical precision in technical recruiting. Leverage our low-latency match engine to secure top-tier engineering talent before the competition.
            </p>
            <div className="flex items-center gap-3 flex-wrap">
              <button
                onClick={() => navigate('/jobs')}
                className="inline-flex items-center gap-2 h-11 px-6 bg-text-primary text-surface-container-lowest font-semibold text-[14px] rounded-lg hover:opacity-90 active:scale-[0.98] transition-all"
              >
                Browse Jobs
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
              <button
                onClick={() => navigate('/post-job')}
                className="inline-flex items-center gap-2 h-11 px-6 border border-border-default text-text-primary font-medium text-[14px] rounded-lg hover:bg-surface-container-low transition-colors"
              >
                Post a Job
              </button>
            </div>
          </div>

          {/* Right — terminal widget */}
          <div className="w-full md:w-96 flex-shrink-0 bg-surface-container border border-border-default rounded-xl overflow-hidden shadow-sm">
            {/* Terminal title bar */}
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-border-default bg-surface-container-high">
              <div className="flex items-center gap-2 font-mono text-[11px] text-primary font-semibold">
                <span className="material-symbols-outlined text-[14px]">terminal</span>
                MATCH_ENGINE_V2
              </div>
              <span className="font-mono text-[10px] text-text-muted uppercase tracking-widest">ACTIVE</span>
            </div>
            {/* Terminal body */}
            <div className="p-5 font-mono text-[12px] space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-text-secondary uppercase tracking-wider text-[10px]">STATUS:</span>
                <span className="text-score-high-text font-semibold">ACTIVE_SCANNING</span>
              </div>
              <div>
                <div className="flex justify-between mb-1.5">
                  <span className="text-text-secondary uppercase tracking-wider text-[10px]">PROGRESS:</span>
                  <span className="text-text-primary font-semibold">88%</span>
                </div>
                <div className="h-[3px] bg-surface-container-high rounded-full overflow-hidden">
                  <div className="h-full bg-primary-container rounded-full" style={{ width: '88%' }} />
                </div>
              </div>
              <div className="bg-surface-container-high border border-border-default rounded-lg p-3">
                <div className="flex justify-between items-center">
                  <span className="text-text-secondary text-[10px] uppercase tracking-wider">RELEVANCE_SCORE</span>
                  <span className="text-score-high-text font-bold text-[13px]">0.942 / 1.0</span>
                </div>
              </div>
              <div className="text-[10px] text-text-muted opacity-60 leading-relaxed">
                <div>&gt; SYNCING candidate_vector_db...</div>
                <div>&gt; APPLYING k-nearest_neighbor...</div>
                <div>&gt; OPTIMIZING response_payload...</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS STRIP ── */}
      <section className="max-w-[1440px] mx-auto w-full px-margin-page mb-16">
        <div className="grid grid-cols-2 md:grid-cols-4 border border-border-default divide-x divide-y md:divide-y-0 divide-border-default bg-surface-container-low rounded-xl overflow-hidden">
          {[
            { label: 'Roles', value: '2,482', sub: 'active postings' },
            { label: 'Companies', value: '412', sub: 'verified employers' },
            { label: 'Response', value: '99.8%', sub: 'avg response rate' },
            { label: 'Live Updates', value: 'REAL_TIME', sub: 'match engine' },
          ].map((s) => (
            <div key={s.label} className="p-6 flex flex-col gap-1">
              <span className="font-mono text-[10px] text-text-muted uppercase tracking-[0.1em]">{s.label}</span>
              <span className="font-bold text-[22px] text-primary tracking-tight">{s.value}</span>
              <span className="text-[12px] text-text-secondary">{s.sub}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── BENEFITS ROW ── */}
      <section className="max-w-[1440px] mx-auto w-full px-margin-page mb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 border border-border-default bg-surface-container-lowest rounded-xl divide-y md:divide-y-0 md:divide-x divide-border-default overflow-hidden">
          {[
            { icon: 'bolt', title: 'Instant Screening', desc: 'Automated technical vetting that goes beyond keywords to understand core architectural competence.' },
            { icon: 'hub', title: 'Direct Access', desc: 'No middlemen. Connect directly with hiring managers and lead engineers via our encrypted terminal.' },
            { icon: 'analytics', title: 'Deep Analytics', desc: 'Real-time market data, salary benchmarks, and competitive liquidity analysis for every role.' },
          ].map(b => (
            <div key={b.title} className="p-8 group hover:bg-surface-container-low transition-colors">
              <span className="material-symbols-outlined text-primary mb-4 block text-[22px]">{b.icon}</span>
              <h3 className="font-semibold text-[16px] text-text-primary mb-2">{b.title}</h3>
              <p className="text-body-sm text-text-secondary leading-relaxed">{b.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── LATEST JOBS ── */}
      <section className="max-w-[1440px] mx-auto w-full px-margin-page mb-20 flex-1">
        <div className="flex items-end justify-between mb-5 pb-4 border-b border-border-default">
          <div>
            <h2 className="font-bold text-[22px] text-text-primary tracking-tight">Latest Job Clusters</h2>
            <p className="text-body-sm text-text-secondary mt-1">
              {jobs.length > 0 ? `${jobs.length} new openings · updated live` : 'Live opportunities updated daily.'}
            </p>
          </div>
          <Link to="/jobs" className="flex items-center gap-1 font-mono text-[12px] font-semibold text-primary hover:underline">
            VIEW_ALL_VACANCIES
            <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
          </Link>
        </div>

        <div className="bg-surface-container-lowest border border-border-default rounded-xl divide-y divide-border-default overflow-hidden">
          {jobs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <span className="material-symbols-outlined text-[48px] text-border-default mb-4">work_outline</span>
              <p className="text-body-sm text-text-muted">No openings yet — check back soon.</p>
            </div>
          ) : jobs.map(j => <JobRow key={j.id} job={j} />)}
        </div>
      </section>

      <Footer />
    </div>
  );
}
