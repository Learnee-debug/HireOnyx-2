import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { daysAgo, stableMatch, formatDate } from '../../lib/utils';
import RecruiterLayout from '../../components/layout/RecruiterLayout';
import toast from 'react-hot-toast';

const STATUS_CFG = {
  applied:   { label: 'Applied',   dot: 'bg-text-muted',      text: 'text-text-secondary' },
  reviewing: { label: 'Reviewing', dot: 'bg-score-mid-text',  text: 'text-score-mid-text' },
  selected:  { label: 'Selected',  dot: 'bg-score-high-text', text: 'text-score-high-text' },
  rejected:  { label: 'Rejected',  dot: 'bg-error',           text: 'text-error' },
};

const AVATAR_COLORS = [
  'bg-blue-50 text-blue-700',
  'bg-violet-50 text-violet-700',
  'bg-emerald-50 text-emerald-700',
  'bg-amber-50 text-amber-700',
  'bg-rose-50 text-rose-700',
];

function StatusDot({ status }) {
  const cfg = STATUS_CFG[status] || STATUS_CFG.applied;
  return (
    <div className="flex items-center gap-2">
      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${cfg.dot}`} />
      <span className={`text-[13px] font-medium ${cfg.text}`}>{cfg.label}</span>
    </div>
  );
}

function Drawer({ app, onClose, onStatusChange }) {
  const [updating, setUpdating] = useState(false);

  async function updateStatus(status) {
    setUpdating(true);
    const { error } = await supabase.from('applications').update({ status }).eq('id', app.id);
    setUpdating(false);
    if (error) { toast.error('Failed to update status.'); return; }
    onStatusChange(app.id, status);
    toast.success(`Status → ${STATUS_CFG[status]?.label || status}`);
  }

  const initials = app.profiles?.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?';
  const colorIdx = initials.charCodeAt(0) % AVATAR_COLORS.length;

  return (
    <>
      <div className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-40" onClick={onClose} />
      <div className="fixed right-0 top-0 h-full w-[480px] max-w-[100vw] bg-surface-card border-l border-border-strong z-50 flex flex-col shadow-2xl"
        style={{ animation: 'slideIn 0.15s cubic-bezier(0.16,1,0.3,1)' }}>
        <style>{`@keyframes slideIn{from{transform:translateX(100%)}to{transform:translateX(0)}}`}</style>

        {/* Header */}
        <div className="p-6 border-b border-border-default flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-[13px] flex-shrink-0 ${AVATAR_COLORS[colorIdx]}`}>
              {initials}
            </div>
            <div>
              <h3 className="font-semibold text-[17px] text-text-primary leading-tight">{app.profiles?.full_name || 'Unknown'}</h3>
              <p className="text-[13px] text-text-secondary mt-0.5">{app.profiles?.email}</p>
              <p className="font-mono text-[11px] text-text-muted mt-0.5">Applied {formatDate(app.applied_at)}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-container-low text-text-muted hover:text-text-primary transition-colors">
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Applied for */}
          <div>
            <p className="font-mono text-[11px] font-semibold text-text-muted uppercase tracking-[0.08em] mb-2">Applied for</p>
            <div className="flex items-center gap-2 px-3 py-2 bg-surface-container-low border border-border-default rounded-lg">
              <span className="material-symbols-outlined text-[16px] text-text-muted">work</span>
              <span className="text-[13px] font-medium text-text-primary">{app.job_title}</span>
            </div>
          </div>

          {/* Current status */}
          <div>
            <p className="font-mono text-[11px] font-semibold text-text-muted uppercase tracking-[0.08em] mb-2">Current status</p>
            <StatusDot status={app.status} />
          </div>

          {/* Cover letter */}
          <div>
            <p className="font-mono text-[11px] font-semibold text-text-muted uppercase tracking-[0.08em] mb-2">Cover letter</p>
            {app.cover_letter ? (
              <p className="text-[14px] text-text-secondary leading-relaxed italic border-l-2 border-border-default pl-3">
                "{app.cover_letter}"
              </p>
            ) : (
              <p className="text-[13px] text-text-muted">No cover letter provided.</p>
            )}
          </div>

          {/* Resume */}
          {app.resume_text && (
            <div>
              <p className="font-mono text-[11px] font-semibold text-text-muted uppercase tracking-[0.08em] mb-2">Resume</p>
              <div className="bg-surface-container-low border border-border-default rounded-lg p-4 font-mono text-[12px] text-text-secondary leading-relaxed max-h-52 overflow-y-auto whitespace-pre-wrap">
                {app.resume_text}
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="p-5 border-t border-border-default bg-surface-container-low flex items-center gap-2">
          <button onClick={() => updateStatus('reviewing')} disabled={updating || app.status === 'reviewing'}
            className="flex-1 h-9 border border-border-default bg-surface-card text-text-primary text-[13px] font-medium rounded-lg hover:bg-surface-container-high transition-colors disabled:opacity-40">
            Mark Reviewing
          </button>
          <button onClick={() => updateStatus('selected')} disabled={updating || app.status === 'selected'}
            className="flex-1 h-9 bg-primary-container text-white text-[13px] font-semibold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-40">
            Select
          </button>
          <button onClick={() => updateStatus('rejected')} disabled={updating || app.status === 'rejected'}
            className="h-9 px-3 border border-error/30 text-error text-[13px] font-medium rounded-lg hover:bg-error/5 transition-colors disabled:opacity-40">
            Reject
          </button>
        </div>
      </div>
    </>
  );
}

function SkeletonRow() {
  return (
    <tr className="border-b border-border-default animate-pulse">
      <td className="px-6 h-row-height"><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-surface-container-high flex-shrink-0" /><div className="space-y-1.5"><div className="h-3.5 bg-surface-container-high rounded w-28" /><div className="h-2.5 bg-surface-container-high rounded w-36" /></div></div></td>
      <td className="px-6"><div className="h-3 bg-surface-container-high rounded w-32" /></td>
      <td className="px-6"><div className="flex items-center gap-2"><div className="w-2 h-2 bg-surface-container-high rounded-full" /><div className="h-3 bg-surface-container-high rounded w-16" /></div></td>
      <td className="px-6"><div className="h-6 bg-surface-container-high rounded-full w-14" /></td>
      <td className="px-6"><div className="h-3 bg-surface-container-high rounded w-14" /></td>
      <td className="px-6"><div className="h-7 bg-surface-container-high rounded-lg w-12" /></td>
    </tr>
  );
}

export default function Candidates() {
  const { user } = useAuth();
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function load() {
      // Get all recruiter's jobs first
      const { data: jobs } = await supabase.from('jobs').select('id, title').eq('recruiter_id', user.id);
      if (!jobs?.length) { setLoading(false); return; }

      const jobMap = Object.fromEntries(jobs.map(j => [j.id, j.title]));

      // Get all applications for those jobs
      const { data: applications } = await supabase
        .from('applications')
        .select('*, profiles(full_name, email)')
        .in('job_id', jobs.map(j => j.id))
        .order('applied_at', { ascending: false });

      setApps((applications || []).map(a => ({ ...a, job_title: jobMap[a.job_id] || 'Unknown role' })));
      setLoading(false);
    }
    load();
  }, [user.id]);

  function handleStatusChange(appId, status) {
    setApps(prev => prev.map(a => a.id === appId ? { ...a, status } : a));
    if (selected?.id === appId) setSelected(prev => ({ ...prev, status }));
  }

  const filtered = apps.filter(a => {
    const matchStatus = statusFilter === 'all' || a.status === statusFilter;
    const q = search.toLowerCase();
    const matchSearch = !q
      || a.profiles?.full_name?.toLowerCase().includes(q)
      || a.profiles?.email?.toLowerCase().includes(q)
      || a.job_title?.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  const counts = { all: apps.length, applied: 0, reviewing: 0, selected: 0, rejected: 0 };
  apps.forEach(a => { if (counts[a.status] !== undefined) counts[a.status]++; });

  return (
    <RecruiterLayout>
      <div className="px-margin-page pt-8 pb-16 max-w-[1280px] mx-auto w-full">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-bold text-[26px] text-text-primary tracking-tight">Candidates</h1>
            <p className="text-body-sm text-text-secondary mt-1">
              {apps.length} total · {counts.reviewing} in review · {counts.selected} selected
            </p>
          </div>
        </div>

        {/* Filter tabs + search */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-1 p-1 bg-surface-container-low border border-border-default rounded-lg flex-wrap">
            {[
              ['all', 'All'],
              ['applied', 'Applied'],
              ['reviewing', 'Reviewing'],
              ['selected', 'Selected'],
              ['rejected', 'Rejected'],
            ].map(([val, label]) => (
              <button key={val} onClick={() => setStatusFilter(val)}
                className={`px-3 py-1.5 rounded-md text-[12px] font-medium transition-colors flex items-center gap-1.5 ${
                  statusFilter === val
                    ? 'bg-surface-card text-text-primary shadow-sm border border-border-default'
                    : 'text-text-secondary hover:text-text-primary'
                }`}>
                {label}
                <span className={`font-mono text-[10px] ${statusFilter === val ? 'text-primary' : 'text-text-muted'}`}>
                  {counts[val]}
                </span>
              </button>
            ))}
          </div>
          <div className="relative w-full sm:w-64">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-[18px]">search</span>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search candidates…"
              className="w-full h-[36px] pl-9 pr-4 bg-surface-card border border-border-default rounded-lg text-[13px] text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/10 transition-all" />
          </div>
        </div>

        {/* Table */}
        <div className="bg-surface-card border border-border-default rounded-xl overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="h-8 bg-surface-container-low border-b border-border-default">
                {['Candidate', 'Applied for', 'Status', 'Match Score', 'Applied', 'Action'].map(h => (
                  <th key={h} className="px-6 font-mono text-[11px] font-semibold text-text-muted uppercase tracking-[0.06em]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6}>
                  <div className="flex flex-col items-center justify-center py-20">
                    <span className="material-symbols-outlined text-[48px] text-border-default mb-4">people</span>
                    <p className="text-[15px] font-medium text-text-primary mb-1">
                      {apps.length === 0 ? 'No candidates yet' : 'No candidates match filters'}
                    </p>
                    <p className="text-body-sm text-text-muted">
                      {apps.length === 0 ? 'Candidates will appear here once they apply to your jobs.' : 'Try changing the status filter.'}
                    </p>
                  </div>
                </td></tr>
              ) : filtered.map(app => {
                const initials = app.profiles?.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?';
                const colorIdx = initials.charCodeAt(0) % AVATAR_COLORS.length;
                const score = stableMatch(app.job_id);
                const scoreCls = score >= 90 ? 'score-high' : score >= 75 ? 'score-mid' : score >= 60 ? 'score-low' : 'score-none';

                return (
                  <tr key={app.id} onClick={() => setSelected(app)}
                    className="border-b border-border-default last:border-0 hover:bg-surface-container-low transition-colors cursor-pointer group">
                    <td className="px-6 h-row-height">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-[11px] flex-shrink-0 ${AVATAR_COLORS[colorIdx]}`}>
                          {initials}
                        </div>
                        <div>
                          <p className="text-[14px] font-medium text-text-primary group-hover:text-primary transition-colors">
                            {app.profiles?.full_name || 'Unknown'}
                          </p>
                          <p className="text-[12px] text-text-muted">{app.profiles?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 text-[13px] text-text-secondary">{app.job_title}</td>
                    <td className="px-6"><StatusDot status={app.status} /></td>
                    <td className="px-6">
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${scoreCls}`}>
                        <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'currentColor' }} />
                        <span className="font-mono text-[11px] font-semibold">{score}%</span>
                      </div>
                    </td>
                    <td className="px-6 font-mono text-[12px] text-text-muted">{daysAgo(app.applied_at)}</td>
                    <td className="px-6">
                      <button className="h-8 px-3 text-[12px] font-medium text-primary border border-primary/20 bg-accent-light rounded-lg hover:opacity-80 transition-opacity opacity-0 group-hover:opacity-100">
                        View
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {!loading && filtered.length > 0 && (
            <div className="px-6 py-3 border-t border-border-default bg-surface-container-low">
              <span className="font-mono text-[11px] text-text-muted">
                {filtered.length} candidate{filtered.length !== 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>
      </div>

      {selected && (
        <Drawer app={selected} onClose={() => setSelected(null)} onStatusChange={handleStatusChange} />
      )}
    </RecruiterLayout>
  );
}
