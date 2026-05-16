import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { daysAgo, stableMatch } from '../../lib/utils';
import RecruiterLayout from '../../components/layout/RecruiterLayout';
import toast from 'react-hot-toast';

const statusConfig = {
  applied:   { label: 'Applied',   dot: 'bg-text-muted',      text: 'text-text-secondary', bg: 'bg-surface-container-low', border: 'border-border-default' },
  reviewing: { label: 'Reviewing', dot: 'bg-score-mid-text',  text: 'text-score-mid-text', bg: 'bg-score-mid-bg',          border: 'border-score-mid-text/30' },
  selected:  { label: 'Selected',  dot: 'bg-score-high-text', text: 'text-score-high-text', bg: 'bg-score-high-bg',        border: 'border-score-high-text/30' },
  rejected:  { label: 'Rejected',  dot: 'bg-error',           text: 'text-error',           bg: 'bg-error-container/30',   border: 'border-error/20' },
};

function ScoreBadge({ score }) {
  const cls = score >= 90 ? 'score-high' : score >= 75 ? 'score-mid' : score >= 60 ? 'score-low' : 'score-none';
  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${cls}`}>
      <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'currentColor' }} />
      <span className="font-mono text-[11px] font-semibold">{score}%</span>
    </div>
  );
}

function SkeletonPipelineRow() {
  return (
    <div className="flex items-center px-4 gap-3 min-h-[64px] py-3 border-b border-border-default last:border-0 animate-pulse md:grid md:grid-cols-[minmax(0,2fr)_1fr_1fr_1fr_1fr_auto] md:px-6 md:gap-4 md:min-h-0 md:h-row-height md:py-0">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="w-8 h-8 rounded-full bg-surface-container-high flex-shrink-0" />
        <div className="space-y-1.5 flex-1">
          <div className="h-3.5 bg-surface-container-high rounded w-32" />
          <div className="h-2.5 bg-surface-container-high rounded w-20" />
        </div>
      </div>
      <div className="hidden md:block h-3 bg-surface-container-high rounded w-24" />
      <div className="hidden md:block h-5 bg-surface-container-high rounded-full w-20" />
      <div className="hidden md:block h-5 bg-surface-container-high rounded-full w-14" />
      <div className="hidden md:block h-3 bg-surface-container-high rounded w-16" />
      <div className="flex gap-2 flex-shrink-0">
        <div className="w-8 h-8 bg-surface-container-high rounded-lg" />
        <div className="w-8 h-8 bg-surface-container-high rounded-lg" />
      </div>
    </div>
  );
}

const AVATAR_COLORS = [
  'bg-accent-light text-primary',
  'bg-score-mid-bg text-score-mid-text',
  'bg-score-high-bg text-score-high-text',
  'bg-surface-container-high text-text-secondary',
];

export default function RecruiterDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [appCounts, setAppCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function load() {
      const { data: jobsData } = await supabase
        .from('jobs').select('*').eq('recruiter_id', user.id).order('created_at', { ascending: false });
      setJobs(jobsData || []);
      if (jobsData?.length) {
        const { data: apps } = await supabase.from('applications').select('job_id').in('job_id', jobsData.map(j => j.id));
        const counts = {};
        apps?.forEach(a => { counts[a.job_id] = (counts[a.job_id] || 0) + 1; });
        setAppCounts(counts);
      }
      setLoading(false);
    }
    load();
  }, [user.id]);

  const activeCount = jobs.filter(j => j.is_active).length;
  const totalApps = Object.values(appCounts).reduce((s, n) => s + n, 0);
  const filledCount = jobs.filter(j => !j.is_active).length;

  async function toggleActive(job) {
    await supabase.from('jobs').update({ is_active: !job.is_active }).eq('id', job.id);
    setJobs(prev => prev.map(j => j.id === job.id ? { ...j, is_active: !j.is_active } : j));
    toast.success(job.is_active ? 'Job paused' : 'Job activated');
  }

  const filteredJobs = jobs.filter(j =>
    !search || j.title.toLowerCase().includes(search.toLowerCase()) || j.company?.toLowerCase().includes(search.toLowerCase())
  );

  const metrics = [
    { label: 'Response Rate',        value: totalApps > 0 ? '78%' : '—', icon: 'percent' },
    { label: 'Avg. Match Score',     value: jobs.length > 0 ? `${Math.round(jobs.reduce((s, j) => s + stableMatch(j.id), 0) / jobs.length)}%` : '—', icon: 'analytics' },
    { label: 'Interviews Scheduled', value: '2', icon: 'calendar_month' },
    { label: 'Time to Hire',         value: '12 days', icon: 'schedule' },
  ];

  return (
    <RecruiterLayout>
      <div className="px-4 md:px-margin-page pt-6 md:pt-8 pb-10 max-w-[1280px] mx-auto w-full">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="font-bold text-[26px] text-text-primary tracking-tight">Overview</h1>
            <div className="flex items-center gap-2 mt-2 text-body-sm text-text-secondary flex-wrap">
              <span className="font-medium text-text-primary">{activeCount}</span><span className="text-text-muted">active</span>
              <span className="text-border-strong">·</span>
              <span className="font-medium text-text-primary">{totalApps}</span><span className="text-text-muted">applications</span>
              <span className="text-border-strong">·</span>
              <span className="font-medium text-text-primary">{filledCount}</span><span className="text-text-muted">filled</span>
            </div>
          </div>
          <Link to="/post-job"
            className="flex items-center gap-2 h-10 px-5 bg-text-primary text-white font-semibold text-[14px] rounded-lg hover:opacity-90 active:scale-[0.98] transition-all flex-shrink-0">
            <span className="material-symbols-outlined text-[16px]">add</span>
            Post Job
          </Link>
        </div>

        {/* Metric cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {metrics.map(m => (
            <div key={m.label} className="bg-surface-card border border-border-default rounded-xl p-5">
              <div className="flex items-start justify-between mb-3">
                <p className="font-mono text-[10px] font-semibold text-text-muted uppercase tracking-[0.06em] leading-tight">{m.label}</p>
                <span className="material-symbols-outlined text-[18px] text-text-muted flex-shrink-0 ml-2">{m.icon}</span>
              </div>
              <p className="font-bold text-[28px] text-text-primary font-mono leading-none">{m.value}</p>
            </div>
          ))}
        </div>

        {/* Pipeline table */}
        <div className="bg-surface-card border border-border-default rounded-xl overflow-hidden">
          {/* Toolbar */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border-default">
            <div>
              <h2 className="font-semibold text-[16px] text-text-primary">Active Candidate Pipeline</h2>
              <p className="text-[12px] text-text-secondary mt-0.5">Your job listings and their activity</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted text-[16px]">search</span>
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search jobs…"
                  className="h-8 pl-8 pr-3 bg-surface-container-low border border-border-default rounded-lg text-[12px] text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/10 transition-all w-48" />
              </div>
              <Link to="/recruiter/jobs"
                className="h-8 px-3 flex items-center gap-1.5 border border-border-default text-text-secondary text-[12px] font-medium rounded-lg hover:text-text-primary hover:border-primary transition-colors">
                <span className="material-symbols-outlined text-[14px]">open_in_full</span>
                Full View
              </Link>
            </div>
          </div>

          {/* Table header */}
          <div className="hidden md:grid grid-cols-[minmax(0,2fr)_1fr_1fr_1fr_1fr_auto] h-8 bg-surface-container-low border-b border-border-default px-6 gap-4 items-center">
            {['JOB TITLE', 'COMPANY', 'STATUS', 'MATCH SCORE', 'POSTED', 'ACTIONS'].map(h => (
              <span key={h} className="font-mono text-[11px] font-semibold text-text-muted uppercase tracking-[0.06em]">{h}</span>
            ))}
          </div>

          {loading ? (
            <div>{Array.from({ length: 4 }).map((_, i) => <SkeletonPipelineRow key={i} />)}</div>
          ) : filteredJobs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <span className="material-symbols-outlined text-[48px] text-border-default">work_outline</span>
              <p className="text-[15px] font-medium text-text-primary">No jobs found</p>
              <Link to="/post-job"
                className="inline-flex items-center gap-2 h-9 px-4 bg-primary-container text-white text-[13px] font-semibold rounded-lg hover:opacity-90 transition-all">
                <span className="material-symbols-outlined text-[15px]">add</span>Post Your First Job
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-border-default">
              {filteredJobs.map(job => {
                const score = stableMatch(job.id);
                const initial = job.company?.[0]?.toUpperCase() || job.title?.[0]?.toUpperCase() || '?';
                const colorCls = AVATAR_COLORS[initial.charCodeAt(0) % AVATAR_COLORS.length];
                const appCount = appCounts[job.id] || 0;

                return (
                  <div key={job.id}
                    className="flex items-center px-4 gap-3 min-h-[64px] py-3 hover:bg-surface-container-low transition-colors group cursor-pointer md:grid md:grid-cols-[minmax(0,2fr)_1fr_1fr_1fr_1fr_auto] md:px-6 md:gap-4 md:min-h-0 md:h-row-height md:py-0"
                    onClick={() => navigate(`/recruiter/jobs/${job.id}/applicants`)}>

                    {/* Job title — flex-1 on mobile */}
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-[11px] flex-shrink-0 ${colorCls}`}>
                        {initial}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-[14px] text-text-primary group-hover:text-primary transition-colors truncate">{job.title}</p>
                        <p className="font-mono text-[10px] text-text-muted">
                          {appCount} applicant{appCount !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>

                    {/* Company */}
                    <div className="hidden md:block text-[13px] text-text-secondary truncate">{job.company || '—'}</div>

                    {/* Status */}
                    <div className="hidden md:flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${job.is_active ? 'bg-score-high-text' : 'bg-text-muted'}`} />
                      <span className={`text-[13px] font-medium ${job.is_active ? 'text-score-high-text' : 'text-text-muted'}`}>
                        {job.is_active ? 'Active' : 'Paused'}
                      </span>
                    </div>

                    {/* Score */}
                    <div className="hidden md:block"><ScoreBadge score={score} /></div>

                    {/* Date */}
                    <div className="hidden md:block font-mono text-[12px] text-text-muted">{daysAgo(job.created_at)}</div>

                    {/* Actions — always visible, flex-shrink-0 on mobile */}
                    <div className="flex items-center gap-2 flex-shrink-0" onClick={e => e.stopPropagation()}>
                      <button onClick={() => navigate(`/recruiter/jobs/${job.id}/applicants`)}
                        className="h-8 px-3 flex items-center gap-1 border border-border-default text-text-primary text-[12px] font-medium rounded-lg hover:border-primary hover:text-primary transition-colors">
                        <span className="material-symbols-outlined text-[14px]">visibility</span>
                        <span className="hidden lg:inline">View</span>
                      </button>
                      <button onClick={() => toggleActive(job)}
                        className="h-8 w-8 flex items-center justify-center border border-border-default text-text-muted rounded-lg hover:text-text-primary transition-colors">
                        <span className="material-symbols-outlined text-[14px]">{job.is_active ? 'pause' : 'play_arrow'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Footer */}
          {!loading && filteredJobs.length > 0 && (
            <div className="px-6 py-3 border-t border-border-default bg-surface-container-low flex items-center justify-between">
              <span className="font-mono text-[11px] text-text-muted">{filteredJobs.length} job{filteredJobs.length !== 1 ? 's' : ''}</span>
              <Link to="/recruiter/jobs" className="text-[12px] font-medium text-primary hover:underline flex items-center gap-1">
                View all jobs <span className="material-symbols-outlined text-[13px]">arrow_forward</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </RecruiterLayout>
  );
}
