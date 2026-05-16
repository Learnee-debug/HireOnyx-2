import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { SURFACE, LABEL, BTN_PRIMARY, BTN_SECONDARY, matchColor, matchGlow } from '../lib/design';
import { stableMatch } from '../lib/utils';
import ApplyModal from '../components/applications/ApplyModal';
import WhyMatched from '../components/ai/WhyMatched';
import { formatDate, formatSalary } from '../lib/utils';
import { usePageTitle } from '../lib/usePageTitle';
import { getSavedProfile, matchSingleJob, matchColor as aiMatchColor, matchGlow as aiMatchGlow } from '../lib/aiMatchingApi';
import toast from 'react-hot-toast';

const TYPE_LABELS = {
  'full-time': 'Full-time', 'part-time': 'Part-time',
  'remote': 'Remote', 'internship': 'Internship', 'contract': 'Contract',
};

const TYPE_COLORS = {
  'full-time':  { bg: '#1A3A2A', color: '#4ADE80' },
  'part-time':  { bg: '#2A2A1A', color: '#FACC15' },
  'remote':     { bg: '#2A1A3A', color: '#A78BFA' },
  'internship': { bg: '#1A2A3A', color: '#60A5FA' },
  'contract':   { bg: '#2A1A1A', color: '#F87171' },
};

function TypeBadge({ type }) {
  const cfg = TYPE_COLORS[type] || { bg: '#1C2438', color: '#94A3B8' };
  return (
    <span style={{
      padding: '4px 12px', borderRadius: 999,
      background: cfg.bg, color: cfg.color,
      fontFamily: '"JetBrains Mono", monospace',
      fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em',
    }}>{TYPE_LABELS[type] || type}</span>
  );
}

function SkeletonDetail() {
  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '40px 32px' }}>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
      <div style={{ height: 13, width: 200, background: '#161D2E', borderRadius: 6, marginBottom: 32, animation: 'pulse 1.5s infinite' }} />
      <div style={{ display: 'flex', gap: 32 }}>
        <div style={{ flex: 1 }}>
          <div style={{ height: 36, width: '60%', background: '#161D2E', borderRadius: 8, marginBottom: 16, animation: 'pulse 1.5s infinite' }} />
          <div style={{ height: 14, width: '40%', background: '#161D2E', borderRadius: 6, marginBottom: 32, animation: 'pulse 1.5s infinite' }} />
          {[100, 85, 90, 70, 95].map((w, i) => (
            <div key={i} style={{ height: 13, width: `${w}%`, background: '#161D2E', borderRadius: 5, marginBottom: 10, animation: 'pulse 1.5s infinite' }} />
          ))}
        </div>
        <div style={{ width: 280, background: '#0F1520', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 16, padding: 24 }}>
          <div style={{ height: 44, background: '#161D2E', borderRadius: 10, marginBottom: 20, animation: 'pulse 1.5s infinite' }} />
          <div style={{ height: 13, width: '80%', background: '#161D2E', borderRadius: 5, animation: 'pulse 1.5s infinite' }} />
        </div>
      </div>
    </div>
  );
}

export default function JobDetail() {
  const { id } = useParams();
  const { user, profile } = useAuth();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [application, setApplication] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [aiMatch, setAiMatch] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  usePageTitle(job ? `${job.title} at ${job.company}` : 'Job Detail');

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setNotFound(false);

      const { data: jobData, error } = await supabase
        .from('jobs').select('*').eq('id', id).single();

      if (cancelled) return;

      if (error || !jobData) { setNotFound(true); setLoading(false); return; }
      setJob(jobData);

      if (user && profile?.role === 'seeker') {
        const { data: appData } = await supabase
          .from('applications').select('*')
          .eq('job_id', id).eq('seeker_id', user.id).maybeSingle();
        if (!cancelled) setApplication(appData);

        // AI match — only if seeker has uploaded resume
        const savedProfile = getSavedProfile();
        if (savedProfile && !cancelled) {
          setAiLoading(true);
          matchSingleJob(savedProfile, jobData)
            .then((m) => { if (!cancelled) setAiMatch(m); })
            .catch(() => {/* silent fail */})
            .finally(() => { if (!cancelled) setAiLoading(false); });
        }
      }
      setLoading(false);
    }
    load();
    return () => { cancelled = true; };
  }, [id, user?.id, profile?.role]);

  if (loading) return <SkeletonDetail />;

  if (notFound) return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '80px 32px', textAlign: 'center' }}>
      <div style={{ fontSize: 56, marginBottom: 16 }}>🔍</div>
      <h2 style={{ color: '#F0F4FF', fontSize: 24, fontWeight: 600, margin: '0 0 10px' }}>Job not found</h2>
      <p style={{ color: '#94A3B8', marginBottom: 28 }}>This role may have been removed or the link is incorrect.</p>
      <Link to="/jobs" style={{ ...BTN_PRIMARY, padding: '11px 24px', display: 'inline-flex', gap: 8 }}>Browse all roles</Link>
    </div>
  );

  const salary = formatSalary(job.salary_min, job.salary_max);
  // Use real AI match score if available, fallback to deterministic hash
  const match = aiMatch?.matchScore ?? stableMatch(job.id);
  const isAiMatch = !!aiMatch?.matchScore;
  const accent = isAiMatch ? aiMatchColor(match) : matchColor(match);

  function ApplySection() {
    // Recruiter who posted this job
    if (profile?.role === 'recruiter' && profile?.id === job.recruiter_id) {
      return (
        <div style={{ padding: '16px 20px', background: '#161D2E', borderRadius: 12, textAlign: 'center' }}>
          <span style={{ color: '#94A3B8', fontSize: 13 }}>You posted this role</span>
        </div>
      );
    }
    // Any recruiter shouldn't see apply
    if (profile?.role === 'recruiter') return null;

    // Not logged in
    if (!user) {
      return (
        <Link to="/login" style={{
          display: 'block', textAlign: 'center',
          padding: '13px', borderRadius: 10,
          border: '1px solid rgba(255,255,255,0.18)', color: '#F0F4FF',
          fontSize: 14, fontWeight: 500,
        }}>Sign in to Apply</Link>
      );
    }

    // Already applied
    if (application) {
      return (
        <div style={{
          padding: '16px', borderRadius: 10, textAlign: 'center',
          background: 'rgba(0,194,168,0.08)', border: '1px solid rgba(0,194,168,0.25)',
        }}>
          <div style={{ color: '#00C2A8', fontWeight: 600, fontSize: 14, marginBottom: 4 }}>✓ Application Submitted</div>
          <div style={{ color: '#4B5563', fontSize: 12 }}>{formatDate(application.applied_at)}</div>
        </div>
      );
    }

    // Apply now
    return (
      <button onClick={() => setModalOpen(true)} style={{
        ...BTN_PRIMARY, width: '100%', padding: '13px', fontSize: 15,
      }}>
        Apply Now
      </button>
    );
  }

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '40px 32px' }}>
      {/* Breadcrumb */}
      <div style={{ marginBottom: 28, display: 'flex', alignItems: 'center', gap: 8 }}>
        <Link to="/jobs" style={{ color: '#4B5563', fontSize: 13 }}>Jobs</Link>
        <span style={{ color: '#4B5563' }}>›</span>
        <span style={{ color: '#94A3B8', fontSize: 13 }}>{job.title}</span>
      </div>

      <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start' }}>
        {/* ── LEFT: Main content ── */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Company row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div style={{
              width: 56, height: 56, borderRadius: 14, flexShrink: 0,
              background: 'linear-gradient(135deg, #161D2E 0%, #1C2438 100%)',
              border: '1px solid rgba(255,255,255,0.10)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#94A3B8', fontSize: 20, fontWeight: 700,
            }}>{job.company?.[0]}</div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ color: '#94A3B8', fontSize: 14 }}>{job.company}</span>
                <span style={{ color: '#10B981', fontSize: 12, display: 'flex', alignItems: 'center', gap: 3 }}>
                  ✓ Verified
                </span>
              </div>
              <h1 style={{ color: '#F0F4FF', fontSize: 32, fontWeight: 700, letterSpacing: '-0.02em', margin: '2px 0 0', lineHeight: 1.2 }}>
                {job.title}
              </h1>
            </div>
          </div>

          {/* Meta row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap', marginBottom: 32, color: '#94A3B8', fontSize: 13 }}>
            <span>📍 {job.location}</span>
            <TypeBadge type={job.type} />
            {salary && <span style={{ color: '#F0F4FF', fontWeight: 600, fontSize: 14 }}>{salary}</span>}
          </div>

          {/* About the role */}
          <div style={{ ...SURFACE, padding: '24px', marginBottom: 16 }}>
            <div style={{ ...LABEL, marginBottom: 14 }}>About the role</div>
            <p style={{ color: '#F0F4FF', fontSize: 15, lineHeight: 1.8, margin: 0, whiteSpace: 'pre-wrap' }}>
              {job.description}
            </p>
          </div>

          {/* Requirements */}
          {job.requirements && (
            <div style={{ ...SURFACE, padding: '24px', marginBottom: 16 }}>
              <div style={{ ...LABEL, marginBottom: 14 }}>Requirements</div>
              <p style={{ color: '#94A3B8', fontSize: 14, lineHeight: 1.8, margin: 0, whiteSpace: 'pre-wrap' }}>
                {job.requirements}
              </p>
            </div>
          )}

          {/* Skills */}
          {job.skills_required?.length > 0 && (
            <div style={{ ...SURFACE, padding: '24px' }}>
              <div style={{ ...LABEL, marginBottom: 14 }}>Required skills</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {job.skills_required.map(skill => (
                  <span key={skill} style={{
                    padding: '6px 14px', borderRadius: 999,
                    background: '#161D2E', border: '1px solid rgba(255,255,255,0.10)',
                    color: '#F0F4FF', fontFamily: '"JetBrains Mono", monospace', fontSize: 12, fontWeight: 500,
                  }}>{skill}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── RIGHT: Sticky sidebar ── */}
        <div style={{ width: 320, flexShrink: 0, position: 'sticky', top: 76, display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Match score card */}
          <div style={{ ...SURFACE, padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={LABEL}>Your match</div>
              <span style={{
                padding: '3px 10px', borderRadius: 999,
                background: `${accent}18`, border: `1px solid ${accent}55`,
                color: accent, fontFamily: '"JetBrains Mono", monospace',
                fontSize: 11, fontWeight: 600, boxShadow: matchGlow(match),
              }}>{match}% match</span>
            </div>
            <div style={{
              fontSize: 56, fontWeight: 700, letterSpacing: '-0.02em',
              color: accent, fontFamily: '"JetBrains Mono", monospace', lineHeight: 1, marginBottom: 8,
            }}>
              {match}<span style={{ fontSize: 24, color: '#4B5563', fontWeight: 400 }}>%</span>
            </div>
            <p style={{ color: '#94A3B8', fontSize: 13, lineHeight: 1.6, margin: 0 }}>
              Based on role requirements and skill alignment.
            </p>
            <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '20px 0' }} />
            <ApplySection />
            <button style={{ ...BTN_SECONDARY, width: '100%', padding: '11px', marginTop: 10, fontSize: 14 }}>
              Save for later
            </button>
          </div>

          {/* AI Match Analysis — shows when seeker has uploaded resume */}
          {profile?.role === 'seeker' && (aiLoading || aiMatch) && (
            <WhyMatched match={aiMatch} loading={aiLoading} />
          )}

          {/* Job details */}
          <div style={{ ...SURFACE, padding: '24px' }}>
            <div style={{ ...LABEL, marginBottom: 14 }}>Job details</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { label: 'Type', value: TYPE_LABELS[job.type] || job.type },
                { label: 'Location', value: job.location },
                { label: 'Posted', value: formatDate(job.created_at) },
                ...(salary ? [{ label: 'Salary', value: salary }] : []),
              ].map(({ label, value }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                  <span style={{ color: '#4B5563', fontSize: 12, fontFamily: '"JetBrains Mono", monospace', textTransform: 'uppercase', letterSpacing: '0.06em', flexShrink: 0 }}>{label}</span>
                  <span style={{ color: '#94A3B8', fontSize: 13, textAlign: 'right' }}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* AI Resume Analyzer — coming soon */}

      {/* Apply Modal */}
      {modalOpen && (
        <ApplyModal
          job={job}
          onClose={() => setModalOpen(false)}
          onSuccess={(app) => {
            setApplication(app);
            setModalOpen(false);
            toast.success('Application submitted!');
          }}
        />
      )}

      <style>{`
        @media (max-width: 1024px) {
          .jd-layout { flex-direction: column !important; }
          .jd-sidebar { width: 100% !important; position: static !important; }
        }
      `}</style>
    </div>
  );
}
