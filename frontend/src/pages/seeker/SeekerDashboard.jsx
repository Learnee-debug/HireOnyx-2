import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { SURFACE, LABEL, matchColor } from '../../lib/design';
import { daysAgo } from '../../lib/utils';
import { getSavedProfile } from '../../lib/aiMatchingApi';
import ResumeUpload from '../../components/ai/ResumeUpload';

/* Stage config — exact from reference Pages.tsx */
const stageColor = {
  applied:   '#6B7280',
  reviewing: '#4F8EF7',
  selected:  '#10B981',
  rejected:  '#E05252',
};
const stageLabel = { applied: 'Applied', reviewing: 'Review', selected: 'Offer', rejected: 'Rejected' };

function StagePill({ status }) {
  const color = stageColor[status] || '#6B7280';
  const label = stageLabel[status] || status;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '4px 10px', borderRadius: 999,
      background: `${color}18`, border: `1px solid ${color}55`,
      color, fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', whiteSpace: 'nowrap',
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: color, boxShadow: `0 0 6px ${color}` }} />
      {label}
    </span>
  );
}

const SKELETONS = Array.from({ length: 5 });

export default function SeekerDashboard() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resumeProfile, setResumeProfile] = useState(() => getSavedProfile());

  useEffect(() => {
    supabase.from('applications')
      .select('*, jobs(title, company, type, location)')
      .eq('seeker_id', user.id)
      .order('applied_at', { ascending: false })
      .then(({ data }) => { setApps(data || []); setLoading(false); });
  }, [user.id]);

  const stats = [
    { label: 'Active', value: apps.filter(a => a.status === 'applied').length, color: '#4F8EF7', icon: '↑' },
    { label: 'In review', value: apps.filter(a => a.status === 'reviewing').length, color: '#4F8EF7', icon: '◆' },
    { label: 'Interviewing', value: apps.filter(a => a.status === 'selected').length, color: '#00C2A8', icon: '↔' },
    { label: 'Avg match', value: '—', color: '#8B5CF6', icon: '✦' },
  ];

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '40px 32px' }}>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ ...LABEL, color: '#4F8EF7', marginBottom: 8 }}>Job Seeker</div>
        <h1 style={{ fontSize: 36, fontWeight: 700, letterSpacing: '-0.02em', color: '#F0F4FF', margin: '0 0 6px' }}>My applications</h1>
        <p style={{ color: '#94A3B8', fontSize: 15, lineHeight: 1.6, margin: 0 }}>Track every role you've applied to, with live status from each employer.</p>
      </div>

      {/* ── AI Resume Upload ── */}
      <div style={{ marginBottom: 28 }}>
        {resumeProfile ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 20px', borderRadius: 12, background: 'rgba(0,194,168,0.06)', border: '1px solid rgba(0,194,168,0.20)' }}>
            <span style={{ fontSize: 22 }}>📄</span>
            <div>
              <div style={{ color: '#00C2A8', fontWeight: 600, fontSize: 14 }}>
                Resume active — {resumeProfile.skills.length} skills detected
              </div>
              <div style={{ color: '#94A3B8', fontSize: 12, marginTop: 2 }}>
                AI match scores are shown on job listings. Reupload anytime.
              </div>
            </div>
            <button onClick={() => navigate('/jobs')} style={{
              marginLeft: 'auto', padding: '7px 16px', borderRadius: 8,
              background: 'linear-gradient(135deg, #4F8EF7 0%, #00C2A8 100%)',
              color: '#080C14', fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer',
            }}>Browse matched jobs →</button>
          </div>
        ) : (
          <div>
            <div style={{ ...LABEL, marginBottom: 10 }}>AI Match — Upload Your Resume</div>
            <ResumeUpload compact onParsed={(p) => { setResumeProfile(p); }} />
            {!resumeProfile && (
              <p style={{ color: '#4B5563', fontSize: 12, margin: '8px 0 0' }}>
                Upload once to see AI match scores on every job listing. Stored locally, never shared.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Stat cards — exact reference layout */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 32 }}>
        {stats.map(s => (
          <div key={s.label} style={{ ...SURFACE, padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={LABEL}>{s.label}</div>
              <span style={{ color: s.color, fontSize: 16 }}>{s.icon}</span>
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, color: '#F0F4FF', letterSpacing: '-0.01em' }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div style={SURFACE}>
          {SKELETONS.map((_, i) => (
            <div key={i} style={{ padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,0.04)', display: 'flex', gap: 16, alignItems: 'center' }}>
              <div style={{ height: 14, width: 200, background: '#161D2E', borderRadius: 6, animation: 'pulse 1.5s infinite' }} />
              <div style={{ height: 24, width: 80, background: '#161D2E', borderRadius: 999, animation: 'pulse 1.5s infinite' }} />
              <div style={{ height: 14, width: 40, background: '#161D2E', borderRadius: 6, animation: 'pulse 1.5s infinite', marginLeft: 'auto' }} />
            </div>
          ))}
        </div>
      ) : apps.length === 0 ? (
        <div style={{ ...SURFACE, textAlign: 'center', padding: '64px 0' }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>📋</div>
          <p style={{ color: '#94A3B8', fontSize: 16, marginBottom: 20 }}>You haven't applied to anything yet.</p>
          <button onClick={() => navigate('/jobs')} style={{ padding: '11px 24px', borderRadius: 10, background: 'linear-gradient(135deg, #4F8EF7 0%, #00C2A8 100%)', color: '#080C14', fontSize: 14, fontWeight: 600, border: 'none', cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 0 20px rgba(79,142,247,0.25)' }}>
            Browse roles →
          </button>
        </div>
      ) : (
        <div style={SURFACE}>
          {/* Table header */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr auto', padding: '12px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)', ...LABEL }}>
            {['Role', 'Stage', 'Match', 'Updated', ''].map(h => <div key={h}>{h}</div>)}
          </div>

          {apps.map(a => (
            <div key={a.id} onClick={() => navigate(`/jobs/${a.job_id}`)} style={{
              display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr auto',
              padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,0.04)',
              alignItems: 'center', cursor: 'pointer', transition: 'background 0.15s ease',
            }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <div>
                <div style={{ color: '#F0F4FF', fontSize: 15, fontWeight: 500 }}>{a.jobs?.title}</div>
                <div style={{ color: '#94A3B8', fontSize: 13 }}>{a.jobs?.company}</div>
              </div>
              <div><StagePill status={a.status} /></div>
              <div style={{ color: '#94A3B8', fontFamily: '"JetBrains Mono"', fontSize: 13 }}>—</div>
              <div style={{ color: '#4B5563', fontSize: 13 }}>{daysAgo(a.applied_at)}</div>
              <button style={{ color: '#4F8EF7', fontSize: 13, fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>View</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
