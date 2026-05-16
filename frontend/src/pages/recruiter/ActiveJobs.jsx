import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { daysAgo, formatType, formatSalary, stableMatch } from '../../lib/utils';
import RecruiterLayout from '../../components/layout/RecruiterLayout';
import toast from 'react-hot-toast';

const TYPE_COLORS = {
  'full-time':  'bg-blue-50 text-blue-700 border-blue-200',
  'part-time':  'bg-amber-50 text-amber-700 border-amber-200',
  'remote':     'bg-violet-50 text-violet-700 border-violet-200',
  'internship': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'contract':   'bg-rose-50 text-rose-700 border-rose-200',
};

function SkeletonRow() {
  return (
    <tr className="border-b border-border-default animate-pulse">
      <td className="px-6 h-row-height">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-surface-container-high flex-shrink-0" />
          <div className="space-y-1.5">
            <div className="h-3.5 bg-surface-container-high rounded w-36" />
            <div className="h-2.5 bg-surface-container-high rounded w-20" />
          </div>
        </div>
      </td>
      <td className="px-6"><div className="h-5 bg-surface-container-high rounded-full w-20" /></td>
      <td className="px-6"><div className="h-3 bg-surface-container-high rounded w-16" /></td>
      <td className="px-6"><div className="h-5 bg-surface-container-high rounded-full w-12" /></td>
      <td className="px-6"><div className="h-3 bg-surface-container-high rounded w-14" /></td>
      <td className="px-6"><div className="h-5 bg-surface-container-high rounded-full w-16" /></td>
      <td className="px-6"><div className="flex gap-2"><div className="h-8 w-20 bg-surface-container-high rounded-lg" /><div className="h-8 w-16 bg-surface-container-high rounded-lg" /></div></td>
    </tr>
  );
}

export default function ActiveJobs() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [appCounts, setAppCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all | active | paused
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function load() {
      const { data: jobsData } = await supabase
        .from('jobs').select('*')
        .eq('recruiter_id', user.id)
        .order('created_at', { ascending: false });

      const jobs = jobsData || [];
      setJobs(jobs);

      if (jobs.length) {
        const { data: apps } = await supabase
          .from('applications').select('job_id')
          .in('job_id', jobs.map(j => j.id));
        const counts = {};
        apps?.forEach(a => { counts[a.job_id] = (counts[a.job_id] || 0) + 1; });
        setAppCounts(counts);
      }
      setLoading(false);
    }
    load();
  }, [user.id]);

  async function toggleActive(job, e) {
    e.stopPropagation();
    const next = !job.is_active;
    await supabase.from('jobs').update({ is_active: next }).eq('id', job.id);
    setJobs(prev => prev.map(j => j.id === job.id ? { ...j, is_active: next } : j));
    toast.success(next ? 'Job activated' : 'Job paused');
  }

  const filtered = jobs.filter(j => {
    const matchFilter = filter === 'all' || (filter === 'active' ? j.is_active : !j.is_active);
    const matchSearch = !search || j.title.toLowerCase().includes(search.toLowerCase()) || j.company?.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const activeCount = jobs.filter(j => j.is_active).length;
  const pausedCount = jobs.filter(j => !j.is_active).length;
  const totalApps = Object.values(appCounts).reduce((s, n) => s + n, 0);

  return (
    <RecruiterLayout>
      <div className="px-4 md:px-margin-page pt-6 md:pt-8 pb-16 max-w-[1280px] mx-auto w-full">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-bold text-[26px] text-text-primary tracking-tight">Active Jobs</h1>
            <p className="text-body-sm text-text-secondary mt-1">
              {activeCount} active · {pausedCount} paused · {totalApps} total applications
            </p>
          </div>
          <Link to="/post-job"
            className="inline-flex items-center gap-2 h-10 px-5 bg-primary-container text-white font-semibold text-[14px] rounded-lg hover:opacity-90 active:scale-[0.98] transition-all flex-shrink-0">
            <span className="material-symbols-outlined text-[16px]">add</span>
            Post New Job
          </Link>
        </div>

        {/* Filter + Search bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-1 p-1 bg-surface-container-low border border-border-default rounded-lg">
            {[['all', 'All'], ['active', 'Active'], ['paused', 'Paused']].map(([val, label]) => (
              <button key={val} onClick={() => setFilter(val)}
                className={`px-4 py-1.5 rounded-md text-[13px] font-medium transition-colors ${
                  filter === val
                    ? 'bg-surface-card text-text-primary shadow-sm border border-border-default'
                    : 'text-text-secondary hover:text-text-primary'
                }`}>
                {label}
                {val !== 'all' && (
                  <span className={`ml-1.5 font-mono text-[11px] ${filter === val ? 'text-primary' : 'text-text-muted'}`}>
                    {val === 'active' ? activeCount : pausedCount}
                  </span>
                )}
              </button>
            ))}
          </div>
          <div className="relative w-full sm:w-64">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-[18px]">search</span>
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search jobs…"
              className="w-full h-[36px] pl-9 pr-4 bg-surface-card border border-border-default rounded-lg text-[13px] text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/10 transition-all" />
          </div>
        </div>

        {/* Table */}
        <div className="bg-surface-card border border-border-default rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left border-collapse">
            <thead>
              <tr className="h-8 bg-surface-container-low border-b border-border-default">
                {['Job Title', 'Type', 'Location', 'Applicants', 'Match Avg', 'Posted', 'Actions'].map(h => (
                  <th key={h} className="px-6 font-mono text-[11px] font-semibold text-text-muted uppercase tracking-[0.06em]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <div className="flex flex-col items-center justify-center py-20">
                      <span className="material-symbols-outlined text-[48px] text-border-default mb-4">work_outline</span>
                      <p className="text-[15px] font-medium text-text-primary mb-1">No jobs found</p>
                      <p className="text-body-sm text-text-muted mb-5">
                        {search ? 'Try a different search term.' : 'Post your first role to start hiring.'}
                      </p>
                      {!search && (
                        <Link to="/post-job" className="inline-flex items-center gap-2 h-9 px-4 bg-primary-container text-white text-[13px] font-semibold rounded-lg hover:opacity-90 transition-all">
                          <span className="material-symbols-outlined text-[15px]">add</span>Post a Job
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              ) : filtered.map(job => {
                const appCount = appCounts[job.id] || 0;
                const matchAvg = stableMatch(job.id);
                const matchCls = matchAvg >= 90 ? 'score-high' : matchAvg >= 75 ? 'score-mid' : matchAvg >= 60 ? 'score-low' : 'score-none';
                const typeColor = TYPE_COLORS[job.type] || 'bg-surface-container-low text-text-secondary border-border-default';
                const initial = job.company?.[0]?.toUpperCase() || '?';

                return (
                  <tr key={job.id}
                    onClick={() => navigate(`/recruiter/jobs/${job.id}/applicants`)}
                    className={`border-b border-border-default hover:bg-surface-container-low transition-colors group cursor-pointer ${!job.is_active ? 'opacity-60' : ''}`}>
                    {/* Title */}
                    <td className="px-6 h-row-height">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-accent-light flex items-center justify-center font-bold text-[13px] text-primary flex-shrink-0 border border-primary/10">
                          {initial}
                        </div>
                        <div>
                          <p className="text-[14px] font-semibold text-text-primary group-hover:text-primary transition-colors">{job.title}</p>
                          <p className="text-[12px] text-text-muted">{job.company}</p>
                        </div>
                      </div>
                    </td>
                    {/* Type */}
                    <td className="px-6">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded border font-mono text-[10px] font-semibold uppercase tracking-wider ${typeColor}`}>
                        {formatType(job.type)}
                      </span>
                    </td>
                    {/* Location */}
                    <td className="px-6 text-[13px] text-text-secondary">{job.location}</td>
                    {/* Applicants */}
                    <td className="px-6">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[15px] font-bold text-text-primary">{appCount}</span>
                        {appCount > 0 && <span className="text-[12px] text-text-muted">applicant{appCount !== 1 ? 's' : ''}</span>}
                      </div>
                    </td>
                    {/* Match avg */}
                    <td className="px-6">
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${matchCls}`}>
                        <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'currentColor' }} />
                        <span className="font-mono text-[11px] font-semibold">{matchAvg}%</span>
                      </div>
                    </td>
                    {/* Posted */}
                    <td className="px-6 font-mono text-[12px] text-text-muted">{daysAgo(job.created_at)}</td>
                    {/* Actions */}
                    <td className="px-6" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => navigate(`/recruiter/jobs/${job.id}/applicants`)}
                          className="inline-flex items-center gap-1.5 h-8 px-3 bg-surface-container-low border border-border-default rounded-lg text-[12px] font-medium text-text-primary hover:border-primary hover:text-primary transition-colors">
                          <span className="material-symbols-outlined text-[14px]">visibility</span>
                          View
                        </button>
                        <button
                          onClick={(e) => toggleActive(job, e)}
                          className={`inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-[12px] font-medium border transition-colors ${
                            job.is_active
                              ? 'border-border-default text-text-secondary hover:border-error hover:text-error'
                              : 'border-score-high-text/30 text-score-high-text bg-score-high-bg hover:opacity-80'
                          }`}>
                          <span className="material-symbols-outlined text-[14px]">{job.is_active ? 'pause' : 'play_arrow'}</span>
                          {job.is_active ? 'Pause' : 'Activate'}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          </div>
          {/* Footer count */}
          {!loading && filtered.length > 0 && (
            <div className="px-6 py-3 border-t border-border-default bg-surface-container-low flex items-center justify-between">
              <span className="font-mono text-[11px] text-text-muted">
                Showing {filtered.length} of {jobs.length} job{jobs.length !== 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>
      </div>
    </RecruiterLayout>
  );
}
