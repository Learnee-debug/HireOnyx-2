import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { daysAgo, stableMatch, formatSalary } from '../../lib/utils';
import RecruiterLayout from '../../components/layout/RecruiterLayout';

function StatCard({ label, value, sub, icon, trend }) {
  return (
    <div className="bg-surface-card border border-border-default rounded-xl p-5">
      <div className="flex items-start justify-between mb-3">
        <p className="font-mono text-[10px] font-semibold text-text-muted uppercase tracking-[0.1em] leading-tight">{label}</p>
        <span className="material-symbols-outlined text-[18px] text-text-muted">{icon}</span>
      </div>
      <p className="font-bold text-[28px] text-text-primary font-mono leading-none mb-1">{value}</p>
      {sub && <p className="text-[12px] text-text-secondary">{sub}</p>}
      {trend && (
        <div className={`flex items-center gap-1 mt-2 text-[12px] font-medium ${trend > 0 ? 'text-score-high-text' : trend < 0 ? 'text-error' : 'text-text-muted'}`}>
          <span className="material-symbols-outlined text-[14px]">{trend > 0 ? 'trending_up' : trend < 0 ? 'trending_down' : 'trending_flat'}</span>
          {trend > 0 ? `+${trend}` : trend} vs last month
        </div>
      )}
    </div>
  );
}

function FunnelBar({ label, count, total, color }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-4">
      <div className="w-24 flex-shrink-0 text-right">
        <p className="text-[12px] font-medium text-text-secondary">{label}</p>
      </div>
      <div className="flex-1 h-7 bg-surface-container-low border border-border-default rounded-lg overflow-hidden">
        <div className={`h-full rounded-lg transition-all duration-500 ${color}`} style={{ width: `${Math.max(pct, 2)}%` }} />
      </div>
      <div className="w-16 flex-shrink-0 flex items-center gap-1.5">
        <span className="font-mono text-[13px] font-bold text-text-primary">{count}</span>
        <span className="text-[11px] text-text-muted">({pct}%)</span>
      </div>
    </div>
  );
}

export default function Reports() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: jobs } = await supabase
        .from('jobs').select('*').eq('recruiter_id', user.id);

      if (!jobs?.length) { setData({ jobs: [], apps: [], jobMap: {} }); setLoading(false); return; }

      const { data: apps } = await supabase
        .from('applications').select('*')
        .in('job_id', jobs.map(j => j.id));

      const jobMap = Object.fromEntries(jobs.map(j => [j.id, j]));
      setData({ jobs, apps: apps || [], jobMap });
      setLoading(false);
    }
    load();
  }, [user.id]);

  if (loading) {
    return (
      <RecruiterLayout>
        <div className="px-4 md:px-margin-page pt-6 md:pt-8 pb-16 max-w-[1280px] mx-auto w-full">
          <div className="h-8 w-32 bg-surface-container-high rounded animate-pulse mb-2" />
          <div className="h-4 w-56 bg-surface-container-high rounded animate-pulse mb-8" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-surface-card border border-border-default rounded-xl p-5 animate-pulse">
                <div className="h-3 w-24 bg-surface-container-high rounded mb-3" />
                <div className="h-8 w-16 bg-surface-container-high rounded" />
              </div>
            ))}
          </div>
        </div>
      </RecruiterLayout>
    );
  }

  const { jobs, apps, jobMap } = data;

  // Compute metrics
  const activeJobs = jobs.filter(j => j.is_active).length;
  const totalApps = apps.length;

  const statusCounts = { applied: 0, reviewing: 0, selected: 0, rejected: 0 };
  apps.forEach(a => { if (statusCounts[a.status] !== undefined) statusCounts[a.status]++; });

  const avgScore = jobs.length
    ? Math.round(jobs.reduce((s, j) => s + stableMatch(j.id), 0) / jobs.length)
    : 0;

  const responseRate = totalApps > 0
    ? Math.round(((statusCounts.reviewing + statusCounts.selected) / totalApps) * 100)
    : 0;

  // Top jobs by application count
  const jobAppCounts = {};
  apps.forEach(a => { jobAppCounts[a.job_id] = (jobAppCounts[a.job_id] || 0) + 1; });

  const topJobs = jobs
    .map(j => ({ ...j, appCount: jobAppCounts[j.id] || 0, matchScore: stableMatch(j.id) }))
    .sort((a, b) => b.appCount - a.appCount)
    .slice(0, 5);

  // Daily apps over last 7 days
  const now = new Date();
  const dayBuckets = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - (6 - i));
    return {
      label: d.toLocaleDateString('en', { weekday: 'short' }),
      date: d.toISOString().slice(0, 10),
      count: 0,
    };
  });
  apps.forEach(a => {
    const date = a.applied_at?.slice(0, 10);
    const bucket = dayBuckets.find(b => b.date === date);
    if (bucket) bucket.count++;
  });
  const maxDay = Math.max(...dayBuckets.map(b => b.count), 1);

  return (
    <RecruiterLayout>
      <div className="px-margin-page pt-8 pb-16 max-w-[1280px] mx-auto w-full">

        {/* Header */}
        <div className="mb-8">
          <h1 className="font-bold text-[26px] text-text-primary tracking-tight">Reports</h1>
          <p className="text-body-sm text-text-secondary mt-1">Analytics for your hiring pipeline</p>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard label="Jobs Posted" value={jobs.length} sub={`${activeJobs} active`} icon="work" />
          <StatCard label="Total Applications" value={totalApps} sub={`${statusCounts.reviewing} in review`} icon="people" />
          <StatCard label="Avg. Match Score" value={avgScore ? `${avgScore}%` : '—'} sub="across all roles" icon="analytics" />
          <StatCard label="Response Rate" value={totalApps ? `${responseRate}%` : '—'} sub="reviewed or selected" icon="percent" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

          {/* Application funnel */}
          <div className="bg-surface-card border border-border-default rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-semibold text-[16px] text-text-primary">Application Funnel</h2>
                <p className="text-[12px] text-text-secondary mt-0.5">Conversion across pipeline stages</p>
              </div>
              <span className="material-symbols-outlined text-[20px] text-text-muted">funnel</span>
            </div>
            {totalApps === 0 ? (
              <div className="text-center py-8">
                <span className="material-symbols-outlined text-[40px] text-border-default block mb-2">bar_chart</span>
                <p className="text-body-sm text-text-muted">No applications yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                <FunnelBar label="Applied" count={totalApps} total={totalApps} color="bg-primary-container" />
                <FunnelBar label="Reviewing" count={statusCounts.reviewing} total={totalApps} color="bg-score-mid-text" />
                <FunnelBar label="Selected" count={statusCounts.selected} total={totalApps} color="bg-score-high-text" />
                <FunnelBar label="Rejected" count={statusCounts.rejected} total={totalApps} color="bg-error" />
              </div>
            )}
          </div>

          {/* Daily applications chart */}
          <div className="bg-surface-card border border-border-default rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-semibold text-[16px] text-text-primary">Applications (7 days)</h2>
                <p className="text-[12px] text-text-secondary mt-0.5">Daily application volume</p>
              </div>
              <span className="material-symbols-outlined text-[20px] text-text-muted">calendar_month</span>
            </div>
            <div className="flex items-end justify-between gap-1.5 h-32">
              {dayBuckets.map(b => (
                <div key={b.date} className="flex-1 flex flex-col items-center gap-1.5">
                  <div className="w-full flex items-end" style={{ height: '96px' }}>
                    <div
                      className="w-full bg-primary-container rounded-t-sm transition-all duration-500 min-h-[4px]"
                      style={{ height: `${Math.max((b.count / maxDay) * 96, 4)}px` }}
                    />
                  </div>
                  <span className="font-mono text-[10px] text-text-muted">{b.label}</span>
                  {b.count > 0 && (
                    <span className="font-mono text-[10px] font-semibold text-primary">{b.count}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top jobs table */}
        <div className="bg-surface-card border border-border-default rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-border-default bg-surface-container-low flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-[16px] text-text-primary">Top Performing Jobs</h2>
              <p className="text-[12px] text-text-secondary mt-0.5">Ranked by number of applications</p>
            </div>
            <Link to="/recruiter/jobs" className="text-[13px] font-medium text-primary hover:underline flex items-center gap-1">
              View all <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </Link>
          </div>

          {topJobs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <span className="material-symbols-outlined text-[40px] text-border-default block mb-3">work_outline</span>
              <p className="text-body-sm text-text-muted">Post jobs to see performance data</p>
              <Link to="/post-job" className="mt-4 inline-flex items-center gap-1.5 h-9 px-4 bg-primary-container text-white text-[13px] font-semibold rounded-lg hover:opacity-90">
                <span className="material-symbols-outlined text-[15px]">add</span>Post a Job
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
            <table className="w-full min-w-[500px] text-left border-collapse">
              <thead>
                <tr className="h-8 border-b border-border-default">
                  <th className="px-6 font-mono text-[11px] font-semibold text-text-muted uppercase tracking-[0.06em]">Job</th>
                  <th className="px-6 font-mono text-[11px] font-semibold text-text-muted uppercase tracking-[0.06em]">Applications</th>
                  <th className="px-6 font-mono text-[11px] font-semibold text-text-muted uppercase tracking-[0.06em]">Match Score</th>
                  <th className="px-6 font-mono text-[11px] font-semibold text-text-muted uppercase tracking-[0.06em]">Status</th>
                  <th className="px-6 font-mono text-[11px] font-semibold text-text-muted uppercase tracking-[0.06em]">Posted</th>
                </tr>
              </thead>
              <tbody>
                {topJobs.map((job, i) => {
                  const scoreCls = job.matchScore >= 90 ? 'score-high' : job.matchScore >= 75 ? 'score-mid' : job.matchScore >= 60 ? 'score-low' : 'score-none';
                  const maxApps = topJobs[0].appCount || 1;
                  return (
                    <tr key={job.id} className="border-b border-border-default last:border-0 hover:bg-surface-container-low transition-colors">
                      <td className="px-6 h-row-height">
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 rounded flex items-center justify-center font-bold text-[10px] text-text-muted bg-surface-container-high border border-border-default flex-shrink-0">
                            {i + 1}
                          </div>
                          <div>
                            <p className="text-[14px] font-medium text-text-primary">{job.title}</p>
                            <p className="text-[12px] text-text-muted">{job.company}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6">
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-[15px] font-bold text-text-primary">{job.appCount}</span>
                          <div className="flex-1 max-w-[80px] h-1.5 bg-surface-container-high rounded-full overflow-hidden">
                            <div className="h-full bg-primary-container rounded-full" style={{ width: `${(job.appCount / maxApps) * 100}%` }} />
                          </div>
                        </div>
                      </td>
                      <td className="px-6">
                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${scoreCls}`}>
                          <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'currentColor' }} />
                          <span className="font-mono text-[11px] font-semibold">{job.matchScore}%</span>
                        </div>
                      </td>
                      <td className="px-6">
                        <span className={`inline-flex items-center gap-1.5 text-[12px] font-medium ${job.is_active ? 'text-score-high-text' : 'text-text-muted'}`}>
                          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${job.is_active ? 'bg-score-high-text' : 'bg-text-muted'}`} />
                          {job.is_active ? 'Active' : 'Paused'}
                        </span>
                      </td>
                      <td className="px-6 font-mono text-[12px] text-text-muted">{daysAgo(job.created_at)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            </div>
          )}
        </div>
      </div>
    </RecruiterLayout>
  );
}
