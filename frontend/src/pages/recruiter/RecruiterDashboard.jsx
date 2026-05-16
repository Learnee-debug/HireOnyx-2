import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { daysAgo, stableMatch } from '../../lib/utils';
import Footer from '../../components/layout/Footer';

const SKELETONS = Array.from({ length: 4 });

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

function SidebarItem({ icon, label, to, active }) {
  return (
    <Link to={to}
      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-body-sm font-medium transition-colors ${active
        ? 'bg-accent-light text-primary'
        : 'text-text-secondary hover:bg-surface-container-high hover:text-text-primary'}`}>
      <span className="material-symbols-outlined text-[18px]">{icon}</span>
      {label}
    </Link>
  );
}

function SkeletonPipelineRow() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-[minmax(0,2fr)_1fr_1fr_1fr_1fr_auto] items-center px-6 gap-4 h-row-height border-b border-border-default last:border-0 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-surface-container-high flex-shrink-0" />
        <div className="space-y-1.5">
          <div className="h-3.5 bg-surface-container-high rounded w-32" />
          <div className="h-2.5 bg-surface-container-high rounded w-20" />
        </div>
      </div>
      <div className="hidden md:block h-3 bg-surface-container-high rounded w-24" />
      <div className="hidden md:block h-5 bg-surface-container-high rounded-full w-20" />
      <div className="hidden md:block h-5 bg-surface-container-high rounded-full w-14" />
      <div className="hidden md:block h-3 bg-surface-container-high rounded w-16" />
      <div className="hidden md:flex gap-2">
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
  const location = useLocation();
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
  }

  const filteredJobs = jobs.filter(j =>
    !search || j.title.toLowerCase().includes(search.toLowerCase()) || j.company?.toLowerCase().includes(search.toLowerCase())
  );

  const metrics = [
    { label: 'Response Rate',       value: totalApps > 0 ? '78%' : '—', icon: 'percent' },
    { label: 'Avg. Match Score',    value: jobs.length > 0 ? `${Math.round(jobs.reduce((s, j) => s + stableMatch(j.id), 0) / jobs.length)}%` : '—', icon: 'analytics' },
    { label: 'Interviews Scheduled', value: '2', icon: 'calendar_month' },
    { label: 'Time to Hire',        value: '12 days', icon: 'schedule' },
  ];

  return (
    <div className="flex min-h-[calc(100vh-60px)] bg-page-bg">
      {/* Left Sidebar */}
      <aside className="hidden md:flex flex-col w-[220px] flex-shrink-0 bg-surface-container-lowest border-r border-border-default sticky top-nav-height h-[calc(100vh-60px)] overflow-y-auto">
        <div className="p-4 flex flex-col gap-1 flex-1">
          <div className="font-mono text-[11px] font-semibold text-text-muted uppercase tracking-[0.08em] px-3 mb-2 mt-2">Menu</div>
          <SidebarItem icon="dashboard" label="Dashboard" to="/recruiter/dashboard" active={location.pathname === '/recruiter/dashboard'} />
          <SidebarItem icon="work" label="Active Jobs" to="/recruiter/dashboard" active={false} />
          <SidebarItem icon="people" label="Candidates" to="/recruiter/dashboard" active={false} />
          <SidebarItem icon="event" label="Interviews" to="/recruiter/dashboard" active={false} />
          <SidebarItem icon="bar_chart" label="Reports" to="/recruiter/dashboard" active={false} />
          <SidebarItem icon="settings" label="Settings" to="/recruiter/dashboard" active={false} />

          <div className="flex-1" />

          <div className="font-mono text-[11px] font-semibold text-text-muted uppercase tracking-[0.08em] px-3 mb-2">Account</div>
          <SidebarItem icon="help" label="Help" to="/recruiter/dashboard" active={false} />
          <SidebarItem icon="account_circle" label="Account" to="/recruiter/dashboard" active={false} />

          <div className="mt-4">
            <Link to="/post-job"
              className="flex items-center justify-center gap-2 w-full h-10 px-5 bg-primary-container text-white font-semibold text-[14px] rounded-lg hover:opacity-90 active:scale-[0.98] transition-all">
              <span className="material-symbols-outlined text-[16px]">add</span>
              Post Job
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 min-w-0 flex flex-col">
        <div className="flex-1 px-margin-page pt-8 pb-10 max-w-[1280px] mx-auto w-full">

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
            <div>
              <h1 className="font-bold text-[26px] text-text-primary">Overview</h1>
              <div className="flex items-center gap-2 mt-2 text-body-sm text-text-secondary flex-wrap">
                <span className="font-medium text-text-primary">{activeCount}</span>
                <span className="text-text-muted">active</span>
                <span className="text-border-strong">·</span>
                <span className="font-medium text-text-primary">{totalApps}</span>
                <span className="text-text-muted">applications</span>
                <span className="text-border-strong">·</span>
                <span className="font-medium text-text-primary">{filledCount}</span>
                <span className="text-text-muted">filled</span>
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
                  <div className="font-mono text-[11px] font-semibold text-text-muted uppercase tracking-[0.06em] leading-tight">{m.label}</div>
                  <span className="material-symbols-outlined text-[18px] text-text-muted flex-shrink-0 ml-2">{m.icon}</span>
                </div>
                <div className="font-bold text-[28px] text-text-primary font-mono leading-none">{m.value}</div>
              </div>
            ))}
          </div>

          {/* Active Candidate Pipeline table */}
          <div className="bg-surface-card border border-border-default rounded-xl overflow-hidden">
            {/* Table toolbar */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border-default">
              <h2 className="font-semibold text-body-base text-text-primary">Active Candidate Pipeline</h2>
              <div className="relative w-[200px]">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-[14px]">search</span>
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search jobs…"
                  className="w-full h-8 pl-8 pr-3 bg-surface-container-low border border-border-default rounded-lg text-[12px] text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/10 transition-all"
                />
              </div>
            </div>

            {/* Table header */}
            <div className="hidden md:grid grid-cols-[minmax(0,2fr)_1fr_1fr_1fr_1fr_auto] h-8 bg-surface-container-low border-b border-border-default px-6 gap-4 items-center">
              {['CANDIDATE NAME', 'JOB APPLIED FOR', 'STATUS', 'MATCH SCORE', 'APPLIED DATE', 'ACTIONS'].map(h => (
                <span key={h} className="font-mono text-[11px] font-semibold text-text-muted uppercase tracking-[0.06em]">{h}</span>
              ))}
            </div>

            {loading ? (
              <div>{SKELETONS.map((_, i) => <SkeletonPipelineRow key={i} />)}</div>
            ) : filteredJobs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <span className="material-symbols-outlined text-[48px] text-border-strong">work_outline</span>
                <p className="text-body-base text-text-secondary">No jobs posted yet.</p>
                <Link to="/post-job"
                  className="h-10 px-5 bg-primary-container text-white font-semibold text-[14px] rounded-lg hover:opacity-90 active:scale-[0.98] transition-all inline-flex items-center">
                  Post Your First Job →
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-border-default">
                {filteredJobs.map(job => {
                  const score = stableMatch(job.id);
                  const initial = job.company?.[0]?.toUpperCase() || job.title?.[0]?.toUpperCase() || '?';
                  const colorCls = AVATAR_COLORS[initial.charCodeAt(0) % AVATAR_COLORS.length];
                  const jobStatus = job.is_active ? 'reviewing' : 'applied';
                  const statusCfg = statusConfig[jobStatus];
                  return (
                    <div key={job.id}
                      className="grid grid-cols-1 md:grid-cols-[minmax(0,2fr)_1fr_1fr_1fr_1fr_auto] items-center px-6 gap-4 h-row-height hover:bg-surface-container-low transition-colors group">
                      {/* Candidate avatar + name */}
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-[11px] flex-shrink-0 ${colorCls}`}>
                          {initial}
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium text-[14px] text-text-primary truncate">{job.title}</div>
                          {!job.is_active && (
                            <div className="font-mono text-[10px] text-text-muted uppercase">INACTIVE</div>
                          )}
                        </div>
                      </div>
                      {/* Job/company */}
                      <div className="hidden md:block text-body-sm text-text-secondary truncate">{job.company || '—'}</div>
                      {/* Status */}
                      <div className="hidden md:block">
                        <span className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-data-label font-semibold ${statusCfg.bg} ${statusCfg.text} border ${statusCfg.border}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
                          {job.is_active ? 'Active' : 'Paused'}
                        </span>
                      </div>
                      {/* Score */}
                      <div className="hidden md:block"><ScoreBadge score={score} /></div>
                      {/* Date */}
                      <div className="hidden md:block font-mono text-[12px] text-text-muted">{daysAgo(job.created_at)}</div>
                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => navigate(`/recruiter/jobs/${job.id}/applicants`)}
                          title="View applicants"
                          className="h-8 px-3 flex items-center gap-1 border border-border-default text-text-primary text-[12px] font-medium rounded-lg hover:border-primary hover:text-primary transition-colors">
                          <span className="material-symbols-outlined text-[14px]">visibility</span>
                          <span className="hidden md:inline">View</span>
                        </button>
                        <button
                          onClick={() => toggleActive(job)}
                          title={job.is_active ? 'Pause' : 'Activate'}
                          className="h-8 w-8 flex items-center justify-center border border-border-default text-text-muted rounded-lg hover:text-text-primary transition-colors">
                          <span className="material-symbols-outlined text-[14px]">{job.is_active ? 'pause' : 'play_arrow'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Pagination placeholder */}
            {filteredJobs.length > 0 && (
              <div className="px-6 py-3 border-t border-border-default flex items-center justify-between">
                <span className="text-body-sm text-text-muted">{filteredJobs.length} job{filteredJobs.length !== 1 ? 's' : ''}</span>
                <div className="flex items-center gap-1.5">
                  <button className="w-8 h-8 rounded-full flex items-center justify-center text-text-secondary hover:bg-surface-container-low transition-colors disabled:opacity-30" disabled>
                    <span className="material-symbols-outlined text-[16px]">chevron_left</span>
                  </button>
                  <button className="w-8 h-8 rounded-full bg-text-primary text-white text-[13px] font-medium">1</button>
                  <button className="w-8 h-8 rounded-full flex items-center justify-center text-text-secondary hover:bg-surface-container-low transition-colors disabled:opacity-30" disabled>
                    <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
}
