import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { formatDate } from '../../lib/utils';
import toast from 'react-hot-toast';

const STATUSES = ['applied', 'reviewing', 'selected', 'rejected'];
const STATUS_LABELS = { applied: 'Applied', reviewing: 'Reviewing', selected: 'Selected', rejected: 'Rejected' };

const statusConfig = {
  applied:   { label: 'Applied',    dot: 'bg-text-muted',      text: 'text-text-secondary', bg: 'bg-surface-container-low', border: 'border-border-default' },
  reviewing: { label: 'Reviewing',  dot: 'bg-score-low-text',  text: 'text-score-low-text', bg: 'bg-score-low-bg', border: 'border-amber-100' },
  selected:  { label: 'Selected',   dot: 'bg-score-high-text', text: 'text-score-high-text', bg: 'bg-score-high-bg', border: 'border-green-100' },
  rejected:  { label: 'Rejected',   dot: 'bg-error',           text: 'text-error', bg: 'bg-error-container/30', border: 'border-error/20' },
};

function StatusBadge({ status }) {
  const cfg = statusConfig[status] || statusConfig.applied;
  return (
    <span className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-data-label font-semibold ${cfg.bg} ${cfg.text} border ${cfg.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`}></span>
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

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />

      {/* Drawer */}
      <div className="fixed top-0 right-0 bottom-0 w-[480px] max-w-full bg-surface-card dark:bg-surface-container border-l border-border-default dark:border-outline-variant z-50 overflow-y-auto flex flex-col"
        style={{ animation: 'slideIn 0.2s ease' }}>
        <style>{`@keyframes slideIn{from{transform:translateX(100%)}to{transform:translateX(0)}}`}</style>

        {/* Drawer header */}
        <div className="p-6 border-b border-border-default dark:border-outline-variant flex items-start justify-between">
          <div>
            <h2 className="font-semibold text-[18px] text-text-primary dark:text-inverse-on-surface">{applicant.profiles?.full_name}</h2>
            <p className="text-body-sm text-text-secondary dark:text-text-muted mt-0.5">{applicant.profiles?.email}</p>
            <p className="text-body-sm text-text-muted mt-0.5">Applied {formatDate(applicant.applied_at)}</p>
          </div>
          <button onClick={onClose} className="text-text-muted hover:text-text-primary transition-colors ml-4 flex-shrink-0">
            <span className="material-symbols-outlined text-[22px]">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex-1 flex flex-col gap-6">
          {/* Current status */}
          <div>
            <div className="text-data-label text-text-muted uppercase tracking-widest mb-2">Current Status</div>
            <StatusBadge status={applicant.status} />
          </div>

          {/* Cover letter */}
          <div>
            <div className="text-data-label text-text-muted uppercase tracking-widest mb-2">Cover Letter</div>
            {applicant.cover_letter ? (
              <p className="text-body-base text-text-secondary dark:text-text-muted leading-relaxed italic">
                "{applicant.cover_letter}"
              </p>
            ) : (
              <p className="text-body-sm text-text-muted">No cover letter provided.</p>
            )}
          </div>

          {/* Resume */}
          <div>
            <div className="text-data-label text-text-muted uppercase tracking-widest mb-2">Resume</div>
            <div className="bg-surface-container-low dark:bg-surface-container border border-border-default dark:border-outline-variant rounded-lg p-4 font-mono text-[12px] text-text-secondary dark:text-text-muted leading-relaxed max-h-[300px] overflow-y-auto whitespace-pre-wrap break-words">
              {applicant.resume_text || 'No resume provided.'}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-5 border-t border-border-default dark:border-outline-variant flex gap-2 flex-wrap">
          <button onClick={() => updateStatus('reviewing')}
            disabled={updating || applicant.status === 'reviewing'}
            className="flex-1 py-2.5 border border-border-default dark:border-outline-variant text-text-primary dark:text-inverse-on-surface text-body-sm font-medium rounded-lg hover:bg-surface-container-low transition-colors disabled:opacity-50">
            Mark Reviewing
          </button>
          <button onClick={() => updateStatus('selected')}
            disabled={updating || applicant.status === 'selected'}
            className="flex-1 py-2.5 bg-primary-container text-white text-body-sm font-medium rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50">
            Select
          </button>
          <button onClick={() => updateStatus('rejected')}
            disabled={updating || applicant.status === 'rejected'}
            className="flex-1 py-2.5 border border-error/30 text-error text-body-sm font-medium rounded-lg hover:bg-error/5 transition-colors disabled:opacity-50">
            Reject
          </button>
        </div>
      </div>
    </>
  );
}

const SKELETON = Array.from({ length: 4 });

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
    <div className="max-w-[1200px] mx-auto px-margin-page py-10">

      {/* Breadcrumb + Header */}
      <div className="flex items-center gap-2 mb-6 text-body-sm">
        <Link to="/recruiter/dashboard" className="text-text-secondary dark:text-text-muted hover:text-primary transition-colors">Dashboard</Link>
        <span className="material-symbols-outlined text-[14px] text-text-muted">chevron_right</span>
        <span className="text-text-primary dark:text-inverse-on-surface font-medium">{job?.title || 'Job'}</span>
      </div>

      {job && (
        <div className="flex items-center gap-4 mb-8 flex-wrap">
          <h1 className="font-bold text-[24px] text-text-primary dark:text-inverse-on-surface">{job.title}</h1>
          <span className="font-mono text-[12px] text-text-secondary dark:text-text-muted px-3 py-1 bg-surface-container-low dark:bg-surface-container border border-border-default dark:border-outline-variant rounded-full uppercase tracking-wider">
            {applicants.length} {applicants.length === 1 ? 'applicant' : 'applicants'}
          </span>
          <div className="ml-auto flex items-center gap-3">
            <button className="flex items-center gap-2 px-3 py-2 border border-border-default dark:border-outline-variant text-text-secondary dark:text-text-muted text-body-sm rounded-lg hover:bg-surface-container-low transition-colors">
              <span className="material-symbols-outlined text-[14px]">tune</span>
              Filter
            </button>
            <button className="flex items-center gap-2 px-3 py-2 border border-border-default dark:border-outline-variant text-text-secondary dark:text-text-muted text-body-sm rounded-lg hover:bg-surface-container-low transition-colors">
              <span className="material-symbols-outlined text-[14px]">file_download</span>
              Export
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="bg-surface-card dark:bg-surface-container border border-border-default dark:border-outline-variant rounded-lg divide-y divide-border-default dark:divide-outline-variant">
          {SKELETON.map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-margin-page py-4 animate-pulse">
              <div className="w-8 h-8 rounded-full bg-surface-container-high dark:bg-surface-container flex-shrink-0"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-surface-container-high dark:bg-surface-container rounded w-40"></div>
                <div className="h-3 bg-surface-container-high dark:bg-surface-container rounded w-28"></div>
              </div>
              <div className="h-6 w-20 bg-surface-container-high dark:bg-surface-container rounded-full"></div>
            </div>
          ))}
        </div>
      ) : applicants.length === 0 ? (
        <div className="bg-surface-card dark:bg-surface-container border border-border-default dark:border-outline-variant rounded-lg flex flex-col items-center justify-center py-20 gap-3">
          <span className="material-symbols-outlined text-[48px] text-border-strong">person_search</span>
          <p className="text-body-base text-text-secondary dark:text-text-muted">No applicants yet.</p>
        </div>
      ) : (
        <div className="bg-surface-card dark:bg-surface-container border border-border-default dark:border-outline-variant rounded-lg overflow-hidden">
          {/* Table header */}
          <div className="hidden md:grid grid-cols-[1.5fr_2fr_1fr_1fr_auto] px-margin-page py-3 bg-surface-container-low dark:bg-surface-container border-b border-border-default dark:border-outline-variant gap-4">
            {['CANDIDATE', 'EMAIL', 'APPLIED', 'STATUS', 'ACTIONS'].map(h => (
              <span key={h} className="text-data-label text-text-muted uppercase tracking-widest">{h}</span>
            ))}
          </div>

          <div className="divide-y divide-border-default dark:divide-outline-variant">
            {applicants.map(app => (
              <div key={app.id}
                className="grid grid-cols-1 md:grid-cols-[1.5fr_2fr_1fr_1fr_auto] items-center px-margin-page py-4 gap-4 hover:bg-surface-container-low dark:hover:bg-surface-container-high transition-colors cursor-pointer group"
                onClick={() => setSelected(app)}>
                {/* Name */}
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-secondary-container dark:bg-surface-container-high flex items-center justify-center font-bold text-[11px] text-on-secondary-container flex-shrink-0">
                    {app.profiles?.full_name?.[0]?.toUpperCase() || '?'}
                  </div>
                  <span className="font-medium text-[14px] text-text-primary dark:text-inverse-on-surface">{app.profiles?.full_name}</span>
                </div>
                {/* Email */}
                <span className="hidden md:block text-body-sm text-text-secondary dark:text-text-muted">{app.profiles?.email}</span>
                {/* Applied */}
                <span className="hidden md:block font-mono text-[12px] text-text-muted">{formatDate(app.applied_at)}</span>
                {/* Status badge */}
                <div className="hidden md:block" onClick={e => e.stopPropagation()}>
                  <StatusBadge status={app.status} />
                </div>
                {/* Actions */}
                <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                  <select
                    value={app.status}
                    onChange={e => updateStatus(app.id, e.target.value)}
                    className="h-8 px-2 bg-surface-container-low dark:bg-surface-container border border-border-default dark:border-outline-variant rounded text-[12px] text-text-primary dark:text-inverse-on-surface focus:outline-none focus:border-primary cursor-pointer"
                  >
                    {STATUSES.map(s => (
                      <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                    ))}
                  </select>
                  <button onClick={() => setSelected(app)}
                    className="flex items-center gap-1 px-3 py-1.5 border border-border-default dark:border-outline-variant text-text-primary dark:text-inverse-on-surface text-[12px] font-medium rounded-lg hover:border-primary hover:text-primary transition-colors">
                    View
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {selected && (
        <Drawer
          applicant={selected}
          onClose={() => setSelected(null)}
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  );
}
