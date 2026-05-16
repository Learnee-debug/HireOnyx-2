import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { formatDate } from '../../lib/utils';
import toast from 'react-hot-toast';
import RecruiterLayout from '../../components/layout/RecruiterLayout';

const STATUSES = ['applied', 'reviewing', 'selected', 'rejected'];
const STATUS_LABELS = { applied: 'Applied', reviewing: 'Reviewing', selected: 'Selected', rejected: 'Rejected' };

const statusConfig = {
  applied:   { label: 'Applied',   dot: 'bg-text-muted',      text: 'text-text-secondary', bg: 'bg-surface-container-low', border: 'border-border-default' },
  reviewing: { label: 'Reviewing', dot: 'bg-score-mid-text',  text: 'text-score-mid-text', bg: 'bg-score-mid-bg',          border: 'border-score-mid-text/30' },
  selected:  { label: 'Selected',  dot: 'bg-score-high-text', text: 'text-score-high-text', bg: 'bg-score-high-bg',        border: 'border-score-high-text/30' },
  rejected:  { label: 'Rejected',  dot: 'bg-error',           text: 'text-error',           bg: 'bg-error-container/30',   border: 'border-error/20' },
};

function StatusBadge({ status }) {
  const cfg = statusConfig[status] || statusConfig.applied;
  return (
    <span className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-data-label font-semibold ${cfg.bg} ${cfg.text} border ${cfg.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}



function Drawer({ applicant, onClose, onStatusChange }) {
  const [updating, setUpdating] = useState(false);

  async function updateStatus(status) {
    setUpdating(true);
    const { error } = await supabase.from('applications').update({ status }).eq('id', applicant.id);
    setUpdating(false);
    if (error) { toast.error('Failed to update status.'); return; }
    onStatusChange(applicant.id, status);
    toast.success(`Status updated to ${STATUS_LABELS[status]}`);
  }

  const name = applicant.profiles?.full_name || 'Applicant';
  const initial = name[0]?.toUpperCase() || '?';

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-40" onClick={onClose} />

      {/* Drawer */}
      <div
        className="fixed top-0 right-0 bottom-0 w-[480px] max-w-full bg-surface-card border-l border-border-default z-50 overflow-y-auto flex flex-col shadow-2xl"
        style={{ animation: 'slideIn 0.22s cubic-bezier(0.16,1,0.3,1)' }}>
        <style>{`@keyframes slideIn { from { transform: translateX(100%) } to { transform: translateX(0) } }`}</style>

        {/* Drawer header */}
        <div className="p-6 border-b border-border-default flex items-start justify-between gap-4 flex-shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-accent-light text-primary flex items-center justify-center font-bold text-[16px] flex-shrink-0">
              {initial}
            </div>
            <div>
              <h2 className="font-semibold text-[18px] text-text-primary">{name}</h2>
              <p className="text-body-sm text-text-secondary mt-0.5">{applicant.profiles?.email}</p>
              <p className="text-body-sm text-text-muted mt-0.5">Applied {formatDate(applicant.applied_at)}</p>
            </div>
          </div>
          <button onClick={onClose}
            className="text-text-muted hover:text-text-primary transition-colors flex-shrink-0 h-8 w-8 flex items-center justify-center rounded-lg hover:bg-surface-container-low">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex-1 flex flex-col gap-6 overflow-y-auto">
          {/* Current status */}
          <div>
            <div className="font-mono text-[11px] font-semibold text-text-muted uppercase tracking-[0.08em] mb-2">Current Status</div>
            <StatusBadge status={applicant.status} />
          </div>

          {/* Cover letter */}
          <div>
            <div className="font-mono text-[11px] font-semibold text-text-muted uppercase tracking-[0.08em] mb-2">Cover Letter</div>
            {applicant.cover_letter ? (
              <div className="bg-surface-container-low border border-border-default rounded-lg p-4">
                <p className="text-body-base text-text-secondary leading-relaxed italic">
                  "{applicant.cover_letter}"
                </p>
              </div>
            ) : (
              <p className="text-body-sm text-text-muted italic">No cover letter provided.</p>
            )}
          </div>

          {/* Resume */}
          <div>
            <div className="font-mono text-[11px] font-semibold text-text-muted uppercase tracking-[0.08em] mb-2">Resume</div>
            <div className="bg-surface-container-low border border-border-default rounded-lg p-4 font-mono text-[12px] text-text-secondary leading-relaxed max-h-[300px] overflow-y-auto whitespace-pre-wrap break-words">
              {applicant.resume_text || 'No resume provided.'}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-5 border-t border-border-default flex gap-2 flex-wrap flex-shrink-0 bg-surface-container-lowest">
          <button onClick={() => updateStatus('reviewing')}
            disabled={updating || applicant.status === 'reviewing'}
            className="flex-1 h-10 px-5 border border-border-default text-text-primary text-[14px] font-medium rounded-lg hover:bg-surface-container-low transition-colors disabled:opacity-40">
            Mark Reviewing
          </button>
          <button onClick={() => updateStatus('selected')}
            disabled={updating || applicant.status === 'selected'}
            className="flex-1 h-10 px-5 bg-primary-container text-white text-[14px] font-semibold rounded-lg hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-40">
            Select
          </button>
          <button onClick={() => updateStatus('rejected')}
            disabled={updating || applicant.status === 'rejected'}
            className="flex-1 h-10 px-5 border border-error/30 text-error text-[14px] font-medium rounded-lg hover:bg-error/5 transition-colors disabled:opacity-40">
            Reject
          </button>
        </div>
      </div>
    </>
  );
}

const SKELETON = Array.from({ length: 4 });
const AVATAR_COLORS = [
  'bg-accent-light text-primary',
  'bg-score-mid-bg text-score-mid-text',
  'bg-score-high-bg text-score-high-text',
  'bg-surface-container-high text-text-secondary',
];

export default function ApplicantsList() {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const [{ data: jobData }, { data: apps }] = await Promise.all([
        supabase.from('jobs').select('*').eq('id', id).single(),
        supabase.from('applications')
          .select('*, profiles(full_name, email)')
          .eq('job_id', id)
          .order('applied_at', { ascending: false }),
      ]);
      setJob(jobData);
      setApplicants(apps || []);
      setLoading(false);
    }
    load();
  }, [id]);

  function handleStatusChange(appId, status) {
    setApplicants(prev => prev.map(a => a.id === appId ? { ...a, status } : a));
    if (selected?.id === appId) setSelected(prev => ({ ...prev, status }));
  }

  async function updateStatus(appId, status) {
    const { error } = await supabase.from('applications').update({ status }).eq('id', appId);
    if (error) { toast.error('Failed to update.'); return; }
    handleStatusChange(appId, status);
    toast.success(`Status updated to ${STATUS_LABELS[status]}`);
  }

  return (
    <RecruiterLayout>
      <div className="flex-1 min-w-0 px-4 md:px-margin-page py-8 md:py-10 max-w-[1280px] mx-auto w-full">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-6 text-body-sm">
          <Link to="/recruiter/dashboard" className="text-text-secondary hover:text-primary transition-colors">Dashboard</Link>
          <span className="material-symbols-outlined text-[14px] text-text-muted">chevron_right</span>
          <span className="text-text-primary font-medium">{job?.title || 'Job'}</span>
        </div>

        {/* Job title + badge + actions */}
        {job && (
          <div className="flex items-center gap-4 mb-8 flex-wrap">
            <h1 className="font-bold text-[24px] text-text-primary">{job.title}</h1>
            <span className="font-mono text-[12px] text-text-secondary px-3 py-1 bg-surface-container-low border border-border-default rounded-full uppercase tracking-wider">
              {applicants.length} {applicants.length === 1 ? 'APPLICANT' : 'APPLICANTS'}
            </span>
            <div className="ml-auto flex items-center gap-3">
              <button className="h-9 px-3 flex items-center gap-2 border border-border-default text-text-secondary text-body-sm rounded-lg hover:bg-surface-container-low transition-colors">
                <span className="material-symbols-outlined text-[14px]">tune</span>
                Filter
              </button>
              <button className="h-9 px-3 flex items-center gap-2 border border-border-default text-text-secondary text-body-sm rounded-lg hover:bg-surface-container-low transition-colors">
                <span className="material-symbols-outlined text-[14px]">file_download</span>
                Export
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="bg-surface-card border border-border-default rounded-xl overflow-hidden">
            <div className="hidden md:grid grid-cols-[1.5fr_2fr_1fr_1fr_auto] h-8 bg-surface-container-low border-b border-border-default px-6 gap-4 items-center">
              {['CANDIDATE', 'EMAIL', 'APPLIED', 'STATUS', 'ACTIONS'].map(h => (
                <span key={h} className="font-mono text-[11px] font-semibold text-text-muted uppercase tracking-[0.06em]">{h}</span>
              ))}
            </div>
            {SKELETON.map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-6 h-row-height border-b border-border-default last:border-0 animate-pulse">
                <div className="w-8 h-8 rounded-full bg-surface-container-high flex-shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3.5 bg-surface-container-high rounded w-36" />
                  <div className="h-2.5 bg-surface-container-high rounded w-24" />
                </div>
                <div className="h-5 w-20 bg-surface-container-high rounded-full" />
              </div>
            ))}
          </div>
        ) : applicants.length === 0 ? (
          <div className="bg-surface-card border border-border-default rounded-xl flex flex-col items-center justify-center py-20 gap-3">
            <span className="material-symbols-outlined text-[48px] text-border-strong">person_search</span>
            <p className="text-body-base text-text-secondary">No applicants yet.</p>
            <p className="text-body-sm text-text-muted">Applications will appear here when candidates apply.</p>
          </div>
        ) : (
          <div className="bg-surface-card border border-border-default rounded-xl overflow-hidden">
            {/* Table header */}
            <div className="hidden md:grid grid-cols-[1.5fr_2fr_1fr_1fr_auto] h-8 bg-surface-container-low border-b border-border-default px-6 gap-4 items-center">
              {['CANDIDATE', 'EMAIL', 'APPLIED', 'STATUS', 'ACTIONS'].map(h => (
                <span key={h} className="font-mono text-[11px] font-semibold text-text-muted uppercase tracking-[0.06em]">{h}</span>
              ))}
            </div>

            <div className="divide-y divide-border-default">
              {applicants.map(app => {
                const name = app.profiles?.full_name || 'Unknown';
                const initial = name[0]?.toUpperCase() || '?';
                const colorCls = AVATAR_COLORS[initial.charCodeAt(0) % AVATAR_COLORS.length];
                return (
                  <div key={app.id}
                    className="flex items-center px-4 gap-3 min-h-[64px] py-3 hover:bg-surface-container-low transition-colors cursor-pointer group md:grid md:grid-cols-[1.5fr_2fr_1fr_1fr_auto] md:px-6 md:gap-4 md:min-h-0 md:h-row-height md:py-0"
                    onClick={() => setSelected(app)}>
                    {/* Name — flex-1 on mobile */}
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-[11px] flex-shrink-0 ${colorCls}`}>
                        {initial}
                      </div>
                      <div className="min-w-0">
                        <span className="font-medium text-[14px] text-text-primary group-hover:text-primary transition-colors truncate block">{name}</span>
                        <span className="text-[12px] text-text-muted md:hidden truncate block">{app.profiles?.email}</span>
                      </div>
                    </div>
                    {/* Email — desktop only */}
                    <span className="hidden md:block text-body-sm text-text-secondary truncate">{app.profiles?.email}</span>
                    {/* Applied date — desktop only */}
                    <span className="hidden md:block font-mono text-[12px] text-text-muted">{formatDate(app.applied_at)}</span>
                    {/* Status — desktop only */}
                    <div className="hidden md:block" onClick={e => e.stopPropagation()}>
                      <StatusBadge status={app.status} />
                    </div>
                    {/* Actions — always visible */}
                    <div className="flex items-center gap-2 flex-shrink-0" onClick={e => e.stopPropagation()}>
                      <select
                        value={app.status}
                        onChange={e => updateStatus(app.id, e.target.value)}
                        className="h-8 px-2 bg-surface-container-low border border-border-default rounded-lg text-[12px] text-text-primary focus:outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/10 cursor-pointer transition-all"
                      >
                        {STATUSES.map(s => (
                          <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                        ))}
                      </select>
                      <button
                        onClick={() => setSelected(app)}
                        className="h-8 px-3 flex items-center gap-1 border border-border-default text-text-primary text-[12px] font-medium rounded-lg hover:border-primary hover:text-primary transition-colors">
                        <span className="material-symbols-outlined text-[14px]">visibility</span>
                        View
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {selected && (
        <Drawer
          applicant={selected}
          onClose={() => setSelected(null)}
          onStatusChange={handleStatusChange}
        />
      )}
    </RecruiterLayout>
  );
}
