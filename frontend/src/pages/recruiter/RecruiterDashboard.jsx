import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { daysAgo, formatType, stableMatch } from '../../lib/utils';
import Footer from '../../components/layout/Footer';

const SKELETONS = Array.from({ length: 3 });

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
        : 'text-text-secondary dark:text-text-muted hover:bg-surface-container-high dark:hover:bg-surface-container hover:text-text-primary dark:hover:text-inverse-on-surface'}`}>
      <span className="material-symbols-outlined text-[18px]">{icon}</span>
      {label}
    </Link>
  );
}

export default function RecruiterDashboard() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [jobs, setJobs] = useState([]);
  const [appCounts, setAppCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function load() {
      const { data: jobsData } = await supabase.from('jobs').select('*').eq('recruiter_id', user.id).order('created_at', { ascending: false });
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

  const active = jobs.filter(j => j.is_active).length;
  const totalApps = Object.values(appCounts).reduce((s, n) => s + n, 0);
  const filled = jobs.filter(j => !j.is_active).length;

  async function toggleActive(job) {
    await supabase.from('jobs').update({ is_active: !job.is_active }).eq('id', job.id);
    setJobs(prev => prev.map(j => j.id === job.id ? { ...j, is_active: !j.is_active } : j));
  }

  const filteredJobs = jobs.filter(j =>
    !search || j.title.toLowerCase().includes(search.toLowerCase()) || j.company?.toLowerCase().includes(search.toLowerCase())
  );

  const metrics = [
    { label: 'CANDIDATE RESPONSE RATE', value: totalApps > 0 ? '78%' : '—', icon: 'percent' },
    { label: 'AVG. MATCH SCORE', value: jobs.length > 0 ? `${Math.round(jobs.reduce((s, j) => s + stableMatch(j.id), 0) / jobs.length)}%` : '—', icon: 'analytics' },
    { label: 'INTERVIEWS SCHEDULED', value: '2', icon: 'calendar_month' },
    { label: 'TIME TO HIRE', value: '12 days', icon: 'schedule' },
  ];

  return (
    <div className="flex min-h-[calc(100vh-52px)]">
      {/* Left Sidebar */}
      <aside className="hidden md:flex flex-col w-[220px] flex-shrink-0 bg-surface-container-lowest dark:bg-inverse-surface border-r border-border-default dark:border-outline-variant sticky top-nav-height h-[calc(100vh-52px)] overflow-y-auto">
        <div className="p-4 flex flex-col gap-1 flex-1">
          <div className="text-data-label text-text-muted uppercase tracking-widest px-3 mb-2 mt-2">Menu</div>
          <SidebarItem icon="dashboard" label="Dashboard" to="/recruiter/dashboard" active={location.pathname === '/recruiter/dashboard'} />
          <SidebarItem icon="work" label="Active Jobs" to="/recruiter/dashboard" active={false} />
          <SidebarItem icon="people" label="Candidates" to="/recruiter/dashboard" active={false} />
          <SidebarItem icon="event" label="Interviews" to="/recruiter/dashboard" active={false} />
          <SidebarItem icon="bar_chart" label="Reports" to="/recruiter/dashboard" active={false} />
          <SidebarItem icon="settings" label="Settings" to="/recruiter/dashboard" active={false} />

          <div className="flex-1" />

          <div className="text-data-label text-text-muted uppercase tracking-widest px-3 mb-2">Account</div>
          <SidebarItem icon="help" label="Help" to="/recruiter/dashboard" active={false} />
          <SidebarItem icon="account_circle" label="Account" to="/recruiter/dashboard" active={false} />

          <div className="mt-4">
            <Link to="/post-job"
              className="flex items-center justify-center gap-2 w-full py-2.5 bg-primary-container text-white text-button-text font-medium rounded-lg hover:opacity-90 transition-opacity">
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
              <h1 className="font-bold text-[26px] text-text-primary dark:text-inverse-on-surface">Overview</h1>
              <div className="flex items-center gap-3 mt-2 text-body-sm text-text-secondary dark:text-text-muted flex-wrap">
                <span>{active} active</span>
                <span>·</span>
                <span>{totalApps} applications</span>
                <span>·</span>
                <span>{filled} filled</span>
              </div>
            </div>
            <Link to="/post-job"
              className="flex items-center gap-2 px-5 py-2.5 bg-text-primary dark:bg-inverse-on-surface text-white dark:text-inverse-surface text-button-text font-medium rounded-lg hover:opacity-90 transition-opacity flex-shrink-0">
              <span className="material-symbols-outlined text-[16px]">add</span>
              Post Job
            </Link>
          </div>

          {/* Metric cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {metrics.map(m => (
              <div key={m.label} className="bg-surface-card dark:bg-surface-container border border-border-default dark:border-outline-variant rounded-lg p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="text-data-label text-text-muted uppercase tracking-widest leading-tight">{m.label}</div>
                  <span className="material-symbols-outlined text-[18px] text-text-muted flex-shrink-0 ml-2">{m.icon}</span>
                </div>
                <div className="font-bold text-[28px] text-text-primary dark:text-inverse-on-surface font-mono leading-none">{m.value}</div>
              </div>
            ))}
          </div>

          {/* Active Candidate Pipeline */}
          <div className="bg-surface-card dark:bg-surface-container border border-border-default dark:border-outline-variant rounded-lg overflow-hidden">
            <div className="flex items-center justify-between px-margin-page py-4 border-b border-border-default dark:border-outline-variant">
              <h2 className="font-semibold text-body-base text-text-primary dark:text-inverse-on-surface">Active Candidate Pipeline</h2>
              <div className="relative w-[200px]">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-[14px]">search</span>
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search jobs..."
                  className="w-full h-8 pl-8 pr-3 bg-surface-container-low dark:bg-surface-container border border-border-default dark:border-outline-variant rounded-lg text-[12px] text-text-primary dark:text-inverse-on-surface placeholder:text-text-muted focus:outline-none focus:border-primary transition-colors"
                />
              </div>
            </div>

            {/* Table header */}
            <div className="hidden md:grid grid-cols-[minmax(0,2fr)_1fr_1fr_1fr_1fr_auto] px-margin-page py-2 bg-surface-container-low dark:bg-surface-container border-b border-border-default dark:border-outline-variant gap-4">
              {['CANDIDATE NAME', 'JOB APPLIED FOR', 'STATUS', 'MATCH SCORE', 'APPLIED DATE', 'ACTIONS'].map(h => (
                <span key={h} className="text-data-label text-text-muted uppercase tracking-widest">{h}</span>
              ))}
            </div>

            {loading ? (
              <div>
                {SKELETONS.map((_, i) => (
                  <div key={i} className="flex items-center gap-4 px-margin-page py-4 border-b border-border-default dark:border-outline-variant last:border-0 animate-pulse">
                    <div className="w-8 h-8 rounded-full bg-surface-container-high dark:bg-surface-container flex-shrink-0"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-surface-container-high dark:bg-surface-container rounded w-40"></div>
                      <div className="h-3 bg-surface-container-high dark:bg-surface-container rounded w-24"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredJobs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <span className="material-symbols-outlined text-[48px] text-border-strong">work_outline</span>
                <p className="text-body-base text-text-secondary dark:text-text-muted">No jobs posted yet.</p>
                <Link to="/post-job" className="px-6 py-2.5 bg-primary-container text-white rounded-lg text-button-text font-medium hover:opacity-90 transition-opacity">
                  Post Your First Job →
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-border-default dark:divide-outline-variant">
                {filteredJobs.map(job => {
                  const score = stableMatch(job.id);
                  const initial = job.company?.[0]?.toUpperCase() || '?';
                  return (
                    <div key={job.id}
                      className="grid grid-cols-1 md:grid-cols-[minmax(0,2fr)_1fr_1fr_1fr_1fr_auto] items-center px-margin-page py-4 gap-4 hover:bg-surface-container-low dark:hover:bg-surface-container-high transition-colors group">
                      {/* Candidate / Job Name */}
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-secondary-container dark:bg-surface-container-high flex items-center justify-center font-bold text-[11px] text-on-secondary-container flex-shrink-0">
                          {initial}
                        </div>
                        <div>
                          <div className="font-medium text-[14px] text-text-primary dark:text-inverse-on-surface">{job.title}</div>
                          {!job.is_active && <div className="font-mono text-[10px] text-text-muted uppercase">INACTIVE</div>}
                        </div>
                      </div>
                      {/* Job */}
                      <div className="hidden md:block text-body-sm text-text-secondary dark:text-text-muted">{job.company || '—'}</div>
                      {/* Status */}
                      <div className="hidden md:block">
                        <span className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-data-label ${job.is_active ? 'bg-score-high-bg text-score-high-text border border-green-100' : 'bg-surface-container text-text-muted border border-border-default'}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${job.is_active ? 'bg-score-high-text' : 'bg-text-muted'}`}></span>
                          {job.is_active ? 'Active' : 'Paused'}
                        </span>
                      </div>
                      {/* Score */}
                      <div className="hidden md:block"><ScoreBadge score={score} /></div>
                      {/* Date */}
                      <div className="hidden md:block font-mono text-[12px] text-text-muted">{daysAgo(job.created_at)}</div>
                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <button onClick={() => navigate(`/recruiter/jobs/${job.id}/applicants`)}
                          title="View applicants"
                          className="flex items-center gap-1 px-3 py-1.5 border border-border-default dark:border-outline-variant text-text-primary dark:text-inverse-on-surface text-[12px] font-medium rounded-lg hover:border-primary hover:text-primary transition-colors">
                          <span className="material-symbols-outlined text-[14px]">visibility</span>
                          <span className="hidden md:inline">View</span>
                        </button>
                        <button onClick={() => toggleActive(job)}
                          title={job.is_active ? 'Pause' : 'Activate'}
                          className="p-1.5 border border-border-default dark:border-outline-variant text-text-muted rounded-lg hover:text-text-primary transition-colors">
                          <span className="material-symbols-outlined text-[14px]">{job.is_active ? 'pause' : 'play_arrow'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
}
