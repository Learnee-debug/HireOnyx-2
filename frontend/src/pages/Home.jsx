import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { formatSalary } from '../lib/utils';
import Footer from '../components/layout/Footer';

function JobRow({ job }) {
  const navigate = useNavigate();
  const initial = job.company?.[0]?.toUpperCase() || '?';
  const bgColors = ['bg-accent-light text-primary', 'bg-surface-container-high text-on-secondary-container', 'bg-primary/5 text-primary'];
  const bg = bgColors[initial.charCodeAt(0) % bgColors.length];

  return (
    <div onClick={() => navigate(`/jobs/${job.id}`)}
      className="flex items-center justify-between px-margin-page py-4 hover:bg-surface-container-low dark:hover:bg-surface-container transition-colors cursor-pointer group">
      <div className="flex items-center gap-4">
        <div className={`w-9 h-9 flex items-center justify-center font-bold text-sm rounded-lg border border-border-default flex-shrink-0 ${bg}`}>
          {initial}
        </div>
        <div>
          <h4 className="font-medium text-[15px] text-text-primary dark:text-inverse-on-surface group-hover:text-primary transition-colors">{job.title}</h4>
          <div className="flex items-center gap-2 text-body-sm text-text-secondary dark:text-text-muted flex-wrap">
            <span>{job.company}</span>
            <span>•</span>
            <span>{job.location}</span>
            {job.salary_min && <><span>•</span><span className="text-text-primary dark:text-inverse-on-surface font-medium">{formatSalary(job.salary_min, job.salary_max)}</span></>}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-6">
        <span className="font-mono text-[11px] text-text-muted hidden md:block">ID: {job.id?.slice(-6)?.toUpperCase()}</span>
        <span className="material-symbols-outlined text-text-muted group-hover:text-text-primary transition-colors">chevron_right</span>
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
    <div className="min-h-screen">
      {/* Hero */}
      <section className="px-margin-page py-24 md:py-32 max-w-7xl mx-auto">
        <div className="max-w-[640px]">
          <p className="font-mono text-data-label text-primary dark:text-inverse-primary mb-4 tracking-widest uppercase">AI-Powered Hiring</p>
          <h1 className="font-bold text-6xl md:text-7xl tracking-tighter mb-6 leading-[0.95] text-text-primary dark:text-inverse-on-surface">Find your match.</h1>
          <p className="text-body-base text-text-secondary dark:text-text-muted mb-10 max-w-md leading-relaxed">
            The precision-first talent network for high-growth engineering teams. We eliminate noise using deep technical matching to connect you with elite developers in seconds.
          </p>
          <div className="flex flex-wrap gap-4">
            <button onClick={() => navigate('/jobs')}
              className="h-11 px-6 flex items-center gap-2 bg-text-primary dark:bg-inverse-on-surface text-white dark:text-inverse-surface font-medium text-button-text rounded-lg hover:opacity-90 transition-opacity">
              Browse Jobs <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
            <button onClick={() => navigate('/post-job')}
              className="h-11 px-6 bg-transparent border border-border-default dark:border-outline-variant text-text-primary dark:text-inverse-on-surface font-medium text-button-text rounded-lg hover:bg-surface-container-low dark:hover:bg-surface-container transition-colors">
              Post a Job
            </button>
          </div>
        </div>
      </section>

      {/* Stats Strip */}
      <section className="w-full bg-surface-container-lowest dark:bg-inverse-surface border-y border-border-default dark:border-outline-variant">
        <div className="max-w-7xl mx-auto px-margin-page py-4 flex flex-wrap justify-between gap-6">
          {[
            { label: '12,400 ROLES' },
            { label: '3,200 COMPANIES' },
            { label: '94% RESPONSE' },
          ].map((s, i) => (
            <div key={i} className="flex items-center gap-3">
              {i > 0 && <span className="text-border-strong hidden md:block">•</span>}
              <span className="font-mono text-data-label text-text-secondary dark:text-text-muted tracking-widest">{s.label}</span>
            </div>
          ))}
          <div className="flex items-center gap-2">
            <span className="text-border-strong hidden md:block">•</span>
            <div className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-score-high-text opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-score-high-text"></span>
            </div>
            <span className="font-mono text-data-label text-text-secondary dark:text-text-muted uppercase tracking-widest">Live updates every 5s</span>
          </div>
        </div>
      </section>

      {/* Feature Highlight */}
      <section className="max-w-7xl mx-auto px-margin-page py-24">
        <div className="flex flex-col md:flex-row gap-12 items-center">
          <div className="w-full md:w-[60%] flex flex-col gap-8">
            <div>
              <h2 className="font-bold text-display-lg text-text-primary dark:text-inverse-on-surface mb-4">Unrivaled Precision</h2>
              <p className="text-body-base text-text-secondary dark:text-text-muted max-w-xl leading-relaxed">
                Our proprietary Match Engine analyzes codebase contributions, system design patterns, and role-specific requirements to provide a deterministic relevance score for every applicant.
              </p>
            </div>
            {/* Terminal Widget */}
            <div className="bg-surface-card dark:bg-surface-container border border-border-default dark:border-outline-variant rounded-xl overflow-hidden">
              <div className="bg-surface-container-low dark:bg-surface-container px-4 py-2 border-b border-border-default dark:border-outline-variant flex items-center justify-between">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-border-strong"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-border-strong"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-border-strong"></div>
                </div>
                <span className="font-mono text-[10px] text-text-muted uppercase tracking-widest">engine_status: active</span>
              </div>
              <div className="p-6 font-mono text-data-value text-text-primary dark:text-inverse-on-surface space-y-4">
                <div className="flex items-center gap-2">
                  <span className="text-primary font-bold">MATCH_ENGINE_V2</span>
                  <span className="text-text-muted">initialized...</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-[11px] text-text-secondary">
                    <span>ANALYZING_CANDIDATE_PROFILE</span>
                    <span>88%</span>
                  </div>
                  <div className="w-full h-2 bg-surface-container-high dark:bg-surface-container rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: '88%' }}></div>
                  </div>
                </div>
                <div className="pt-4 border-t border-border-default dark:border-outline-variant flex items-center gap-3 flex-wrap">
                  <div className="bg-score-high-bg text-score-high-text px-3 py-1.5 rounded-lg border border-green-100 font-bold text-[13px]">
                    RELEVANCE_SCORE: 88.42
                  </div>
                  <span className="text-text-muted italic text-[12px]">Confidence interval: 99.2%</span>
                </div>
              </div>
            </div>
          </div>
          {/* Right placeholder */}
          <div className="w-full md:w-[40%] h-[400px] rounded-xl overflow-hidden bg-surface-container-high dark:bg-surface-container flex items-center justify-center border border-border-default">
            <div className="text-center">
              <span className="material-symbols-outlined text-[64px] text-border-strong">memory</span>
              <p className="font-mono text-data-label text-text-muted mt-2 uppercase tracking-widest">AI Engine</p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Row */}
      <section className="max-w-7xl mx-auto px-margin-page pb-24">
        <div className="grid grid-cols-1 md:grid-cols-3 border border-border-default dark:border-outline-variant bg-surface-card dark:bg-surface-container rounded-lg divide-y md:divide-y-0 md:divide-x divide-border-default dark:divide-outline-variant">
          {[
            { icon: 'bolt', title: 'Instant Screening', desc: 'Automated technical vetting that goes beyond keywords to understand core architectural competence.' },
            { icon: 'refresh', title: 'Direct Access', desc: 'No middlemen. Connect directly with hiring managers and lead engineers via our encrypted terminal.' },
            { icon: 'grid_view', title: 'Deep Analytics', desc: 'Real-time market data, salary benchmarks, and competitive liquidity analysis for every role.' },
          ].map((b) => (
            <div key={b.title} className="p-8 hover:bg-surface-container-lowest dark:hover:bg-surface-container-high transition-colors">
              <span className="material-symbols-outlined text-primary mb-4 block text-[24px]">{b.icon}</span>
              <h3 className="font-semibold text-headline-md text-text-primary dark:text-inverse-on-surface mb-2">{b.title}</h3>
              <p className="text-body-sm text-text-secondary dark:text-text-muted leading-relaxed">{b.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Latest Jobs */}
      <section className="max-w-7xl mx-auto px-margin-page pb-32">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="font-bold text-[28px] text-text-primary dark:text-inverse-on-surface">Latest Jobs</h2>
            <p className="text-text-secondary dark:text-text-muted text-body-sm mt-1">
              {jobs.length > 0 ? `${jobs.length} new openings` : 'Live opportunities updated daily.'}
            </p>
          </div>
          <Link to="/jobs" className="text-button-text font-medium text-primary flex items-center gap-1 hover:underline">
            View all openings <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </Link>
        </div>
        <div className="bg-surface-card dark:bg-surface-container border border-border-default dark:border-outline-variant rounded-lg divide-y divide-border-default dark:divide-outline-variant overflow-hidden">
          {jobs.length === 0 ? (
            <div className="text-center py-16 text-text-secondary">
              <span className="material-symbols-outlined text-[40px] text-border-strong block mb-3">work</span>
              <p className="text-body-sm">No jobs yet. Be the first to post.</p>
            </div>
          ) : (
            jobs.map(j => <JobRow key={j.id} job={j} />)
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
