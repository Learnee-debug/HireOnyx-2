import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import StatusBadge from '../../components/applications/StatusBadge';
import { formatDate } from '../../lib/utils';
import toast from 'react-hot-toast';

const STATUSES = ['applied', 'reviewing', 'selected', 'rejected'];
const STATUS_LABELS = { applied: 'Applied', reviewing: 'Reviewing', selected: 'Selected', rejected: 'Rejected' };

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
      <div style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 150,
      }} onClick={onClose} />

      {/* Drawer */}
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, width: '480px', maxWidth: '100vw',
        background: 'var(--bg-surface)', borderLeft: '1px solid var(--border)',
        zIndex: 200, overflowY: 'auto', display: 'flex', flexDirection: 'column',
        animation: 'slideIn 0.2s ease',
      }}>
        <style>{`@keyframes slideIn{from{transform:translateX(100%)}to{transform:translateX(0)}}`}</style>

        {/* Drawer header */}
        <div style={{ padding: '24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ fontFamily: '"DM Sans"', fontWeight: 600, fontSize: '20px', color: 'var(--text-primary)', margin: '0 0 4px' }}>
              {applicant.profiles?.full_name}
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: 0 }}>{applicant.profiles?.email}</p>
            <p style={{ color: 'var(--text-muted)', fontSize: '12px', margin: '4px 0 0' }}>Applied {formatDate(applicant.applied_at)}</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '22px', cursor: 'pointer', lineHeight: 1, padding: '0' }}>×</button>
        </div>

        {/* Content */}
        <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Current status */}
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: '"JetBrains Mono"', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>Current Status</div>
            <StatusBadge status={applicant.status} />
          </div>

          {/* Cover letter */}
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: '"JetBrains Mono"', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px' }}>Cover Letter</div>
            {applicant.cover_letter ? (
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.8, fontStyle: 'italic', margin: 0 }}>
                "{applicant.cover_letter}"
              </p>
            ) : (
              <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: 0 }}>No cover letter provided.</p>
            )}
          </div>

          {/* Resume */}
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: '"JetBrains Mono"', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px' }}>Resume</div>
            <div style={{
              background: 'var(--bg-subtle)',
              border: '1px solid var(--border)',
              borderRadius: '6px',
              padding: '16px',
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: '12px',
              color: 'var(--text-secondary)',
              lineHeight: 1.8,
              maxHeight: '300px',
              overflowY: 'auto',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}>
              {applicant.resume_text || 'No resume provided.'}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div style={{ padding: '20px 24px', borderTop: '1px solid var(--border)', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button onClick={() => updateStatus('reviewing')} disabled={updating || applicant.status === 'reviewing'} style={{
            flex: 1, background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-primary)',
            padding: '9px 12px', borderRadius: '6px', fontSize: '13px', fontWeight: 500, cursor: 'pointer',
            opacity: applicant.status === 'reviewing' ? 0.5 : 1,
          }}>Mark Reviewing</button>
          <button onClick={() => updateStatus('selected')} disabled={updating || applicant.status === 'selected'} style={{
            flex: 1, background: applicant.status === 'selected' ? '#0A2A15' : 'transparent',
            border: '1px solid var(--status-selected)', color: 'var(--status-selected)',
            padding: '9px 12px', borderRadius: '6px', fontSize: '13px', fontWeight: 500, cursor: 'pointer',
            opacity: applicant.status === 'selected' ? 0.7 : 1,
          }}>Select</button>
          <button onClick={() => updateStatus('rejected')} disabled={updating || applicant.status === 'rejected'} style={{
            flex: 1, background: 'transparent', border: '1px solid #3A2A2A', color: 'var(--status-rejected-text)',
            padding: '9px 12px', borderRadius: '6px', fontSize: '13px', fontWeight: 500, cursor: 'pointer',
            opacity: applicant.status === 'rejected' ? 0.5 : 1,
          }}>Reject</button>
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
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 24px' }}>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>

      {/* Header */}
      <Link to="/recruiter/dashboard" style={{ color: 'var(--text-muted)', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '4px', marginBottom: '24px' }}>
        ← Back to Dashboard
      </Link>

      {job && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '36px', flexWrap: 'wrap' }}>
          <h1 style={{ fontFamily: '"DM Sans"', fontWeight: 600, fontSize: '26px', color: 'var(--text-primary)', margin: 0 }}>
            {job.title}
          </h1>
          <span style={{
            background: 'var(--bg-elevated)', border: '1px solid var(--border)',
            borderRadius: '20px', padding: '4px 12px',
            fontFamily: '"JetBrains Mono"', fontSize: '12px', color: 'var(--text-secondary)',
          }}>
            {applicants.length} {applicants.length === 1 ? 'applicant' : 'applicants'}
          </span>
        </div>
      )}

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: 'var(--border)' }}>
          {SKELETON.map((_, i) => (
            <div key={i} style={{ background: 'var(--bg-surface)', padding: '16px 20px', display: 'flex', gap: '24px' }}>
              {[160, 200, 80, 80, 100].map((w, j) => (
                <div key={j} style={{ height: '14px', width: `${w}px`, background: 'var(--bg-elevated)', borderRadius: '4px', animation: 'pulse 1.5s infinite' }} />
              ))}
            </div>
          ))}
        </div>
      ) : applicants.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 0', background: 'var(--bg-surface)', borderRadius: '10px', border: '1px solid var(--border)' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '16px' }}>No applicants yet.</p>
        </div>
      ) : (
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '10px', overflow: 'hidden' }}>
          <div style={{
            display: 'grid', gridTemplateColumns: '1.5fr 2fr 1fr 1fr 1.2fr',
            padding: '12px 20px', borderBottom: '1px solid var(--border)', background: 'var(--bg-elevated)',
          }}>
            {['Name', 'Email', 'Applied', 'Status', 'Actions'].map(h => (
              <span key={h} style={{ fontFamily: '"JetBrains Mono"', fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</span>
            ))}
          </div>

          {applicants.map(app => (
            <div
              key={app.id}
              style={{
                display: 'grid', gridTemplateColumns: '1.5fr 2fr 1fr 1fr 1.2fr',
                padding: '14px 20px', borderBottom: '1px solid var(--border-subtle)',
                alignItems: 'center', cursor: 'pointer', transition: 'background 0.15s ease',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              onClick={() => setSelected(app)}
            >
              <span style={{ color: 'var(--text-primary)', fontSize: '14px', fontWeight: 500 }}>
                {app.profiles?.full_name}
              </span>
              <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>{app.profiles?.email}</span>
              <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{formatDate(app.applied_at)}</span>
              <span onClick={e => e.stopPropagation()}><StatusBadge status={app.status} /></span>
              <div onClick={e => e.stopPropagation()}>
                <select
                  value={app.status}
                  onChange={e => updateStatus(app.id, e.target.value)}
                  style={{
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border)',
                    borderRadius: '5px',
                    color: 'var(--text-primary)',
                    padding: '5px 8px',
                    fontSize: '12px',
                    fontFamily: '"DM Sans"',
                    cursor: 'pointer',
                    outline: 'none',
                  }}
                >
                  {STATUSES.map(s => (
                    <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                  ))}
                </select>
              </div>
            </div>
          ))}
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
