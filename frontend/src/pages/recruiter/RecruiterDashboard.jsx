import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { SURFACE, LABEL } from '../../lib/design';
import { daysAgo, formatType } from '../../lib/utils';

const SKELETONS = Array.from({ length: 3 });

export default function RecruiterDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [appCounts, setAppCounts] = useState({});
  const [loading, setLoading] = useState(true);

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

  const stats = [
    { label: 'Active postings', value: active, color: '#4F8EF7', icon: '↑' },
    { label: 'Total applications', value: totalApps, color: '#4F8EF7', icon: '◆' },
    { label: 'Positions filled', value: filled, color: '#00C2A8', icon: '✓' },
  ];

  async function toggleActive(job) {
    await supabase.from('jobs').update({ is_active: !job.is_active }).eq('id', job.id);
    setJobs(prev => prev.map(j => j.id === job.id ? { ...j, is_active: !j.is_active } : j));
  }

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '40px 32px' }}>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ ...LABEL, color: '#4F8EF7', marginBottom: 8 }}>Recruiter</div>
          <h1 style={{ fontSize: 36, fontWeight: 700, letterSpacing: '-0.02em', color: '#F0F4FF', margin: '0 0 6px' }}>Your Hiring Dashboard</h1>
          <p style={{ color: '#94A3B8', fontSize: 15, margin: 0 }}>Manage your job postings and review applicants.</p>
        </div>
        <Link to="/post-job" style={{
          display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 20px', borderRadius: 10,
          background: 'linear-gradient(135deg, #4F8EF7 0%, #00C2A8 100%)',
          color: '#080C14', fontSize: 14, fontWeight: 600, boxShadow: '0 0 20px rgba(79,142,247,0.25)',
        }}>+ Post a New Job</Link>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 32 }}>
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

      {/* Jobs table */}
      {loading ? (
        <div style={SURFACE}>
          {SKELETONS.map((_, i) => (
            <div key={i} style={{ padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,0.04)', display: 'flex', gap: 20, alignItems: 'center' }}>
              <div style={{ height: 14, width: 180, background: '#161D2E', borderRadius: 6, animation: 'pulse 1.5s infinite' }} />
              <div style={{ height: 14, width: 80, background: '#161D2E', borderRadius: 6, animation: 'pulse 1.5s infinite', marginLeft: 'auto' }} />
            </div>
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <div style={{ ...SURFACE, textAlign: 'center', padding: '64px 0' }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>📋</div>
          <p style={{ color: '#94A3B8', fontSize: 16, marginBottom: 20 }}>You haven't posted any jobs yet.</p>
          <Link to="/post-job" style={{ display: 'inline-flex', padding: '11px 24px', borderRadius: 10, background: 'linear-gradient(135deg, #4F8EF7 0%, #00C2A8 100%)', color: '#080C14', fontSize: 14, fontWeight: 600, boxShadow: '0 0 20px rgba(79,142,247,0.25)' }}>Post Your First Job →</Link>
        </div>
      ) : (
        <div style={SURFACE}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 0.7fr 1fr 1.3fr', padding: '12px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)', ...LABEL }}>
            {['Title', 'Type', 'Location', 'Apps', 'Posted', 'Actions'].map(h => <div key={h}>{h}</div>)}
          </div>
          {jobs.map(job => (
            <div key={job.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 0.7fr 1fr 1.3fr', padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,0.04)', alignItems: 'center', transition: 'background 0.15s ease' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <div>
                <div style={{ color: '#F0F4FF', fontSize: 15, fontWeight: 500 }}>{job.title}</div>
                {!job.is_active && <div style={{ color: '#4B5563', fontSize: 11, fontFamily: '"JetBrains Mono"' }}>INACTIVE</div>}
              </div>
              <div style={{ color: '#94A3B8', fontSize: 13 }}>{formatType(job.type)}</div>
              <div style={{ color: '#94A3B8', fontSize: 13 }}>{job.location}</div>
              <div style={{ color: '#94A3B8', fontSize: 13, fontFamily: '"JetBrains Mono"' }}>{appCounts[job.id] || 0}</div>
              <div style={{ color: '#4B5563', fontSize: 13 }}>{daysAgo(job.created_at)}</div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => navigate(`/recruiter/jobs/${job.id}/applicants`)} style={{ padding: '5px 12px', borderRadius: 7, background: 'transparent', border: '1px solid rgba(255,255,255,0.14)', color: '#F0F4FF', fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}>View</button>
                <button onClick={() => toggleActive(job)} style={{ padding: '5px 10px', borderRadius: 7, background: 'transparent', border: '1px solid rgba(255,255,255,0.08)', color: '#4B5563', fontSize: 11, cursor: 'pointer', fontFamily: 'inherit' }}>
                  {job.is_active ? 'Pause' : 'Activate'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
