import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { SURFACE, LABEL, matchColor } from '../lib/design';
import { daysAgo, formatSalary } from '../lib/utils';

/* ── Match circle SVG — exact from reference ── */
function MatchCircle({ value }) {
  const r = 22, c = 2 * Math.PI * r;
  const off = c - (value / 100) * c;
  const color = matchColor(value);
  return (
    <div style={{ position: 'relative', width: 56, height: 56 }}>
      <svg width="56" height="56" viewBox="0 0 56 56"
        style={{ filter: `drop-shadow(0 0 6px ${color}66)` }}>
        <defs>
          <linearGradient id={`mg-${value}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#4F8EF7" />
            <stop offset="100%" stopColor={color} />
          </linearGradient>
        </defs>
        <circle cx="28" cy="28" r={r} stroke="rgba(255,255,255,0.08)" strokeWidth="4" fill="none" />
        <circle cx="28" cy="28" r={r} stroke={`url(#mg-${value})`} strokeWidth="4" fill="none"
          strokeDasharray={c} strokeDashoffset={off} strokeLinecap="round" transform="rotate(-90 28 28)" />
      </svg>
      <div style={{
        position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
        color, fontSize: 12, fontWeight: 700, fontFamily: '"JetBrains Mono", monospace',
      }}>{value}</div>
    </div>
  );
}

/* ── Small JobCard for hero visual — matches reference JobCard.tsx ── */
function HeroJobCard({ company, role, salary, match, posted, style }) {
  const color = matchColor(match);
  return (
    <div style={{
      ...SURFACE, padding: '14px 16px',
      borderLeft: `3px solid ${color}`,
      ...style,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <div>
          <div style={{ color: '#94A3B8', fontSize: 11, marginBottom: 2 }}>{company}</div>
          <div style={{ color: '#F0F4FF', fontSize: 13, fontWeight: 600, lineHeight: 1.3 }}>{role}</div>
        </div>
        <MatchCircle value={match} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ color: '#F0F4FF', fontSize: 12, fontWeight: 600 }}>{salary}</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 5,
          borderRadius: 999, padding: '2px 8px',
          background: 'rgba(16,185,129,0.10)', border: '1px solid rgba(16,185,129,0.25)', color: '#10B981', fontSize: 10, fontWeight: 600,
        }}>
          <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#10B981', boxShadow: '0 0 6px #10B981' }} />
          Active · {posted}
        </span>
      </div>
    </div>
  );
}

/* ── Role card — exact from reference RoleCard ── */
function RoleCard({ role, title, desc, icon, accent, cta, to }) {
  return (
    <Link to={to} style={{
      ...SURFACE, padding: 28, display: 'block',
      position: 'relative', overflow: 'hidden', textDecoration: 'none',
      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 0 0 1px ${accent}40, 0 8px 32px rgba(0,0,0,0.5)`; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = SURFACE.boxShadow; }}
    >
      {/* top accent bar */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: accent }} />
      <div style={{
        width: 48, height: 48, borderRadius: 12, marginBottom: 20,
        background: '#161D2E', border: '1px solid rgba(255,255,255,0.10)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 22,
      }}>{icon}</div>
      <div style={{ ...LABEL, marginBottom: 8 }}>{role}</div>
      <div style={{ fontSize: 20, fontWeight: 600, color: '#F0F4FF', lineHeight: 1.3, marginBottom: 10 }}>{title}</div>
      <p style={{ fontSize: 14, color: '#94A3B8', lineHeight: 1.6, marginBottom: 20 }}>{desc}</p>
      <div style={{ color: accent, fontSize: 14, fontWeight: 500 }}>{cta} →</div>
    </Link>
  );
}

/* ── Stat item — matches reference StatItem ── */
function StatItem({ value, label }) {
  return (
    <div style={{ flex: 1, padding: '16px 32px', textAlign: 'center' }}>
      <div style={{
        fontSize: 44, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.1,
        background: 'linear-gradient(135deg, #4F8EF7 0%, #00C2A8 100%)',
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
      }}>{value}</div>
      <div style={{ ...LABEL, marginTop: 12 }}>{label}</div>
    </div>
  );
}

/* ── Compact job row for latest jobs ── */
function JobRow({ job }) {
  const navigate = useNavigate();
  return (
    <div onClick={() => navigate(`/jobs/${job.id}`)} style={{
      display: 'flex', alignItems: 'center', gap: 16, padding: '14px 20px',
      ...SURFACE, borderRadius: 12,
      cursor: 'pointer', transition: 'transform 0.15s ease, box-shadow 0.15s ease',
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateX(4px)'; e.currentTarget.style.boxShadow = '0 0 0 1px rgba(79,142,247,0.25), 0 4px 24px rgba(0,0,0,0.5)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = SURFACE.boxShadow; }}
    >
      {/* Company avatar */}
      <div style={{
        width: 40, height: 40, borderRadius: 999, flexShrink: 0,
        background: 'linear-gradient(135deg, #161D2E 0%, #1C2438 100%)',
        border: '1px solid rgba(255,255,255,0.10)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#94A3B8', fontSize: 14, fontWeight: 600,
      }}>{job.company?.[0]}</div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2, flexWrap: 'wrap' }}>
          <span style={{ color: '#F0F4FF', fontSize: 14, fontWeight: 600 }}>{job.title}</span>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 4, padding: '1px 8px', borderRadius: 999,
            background: 'rgba(16,185,129,0.10)', border: '1px solid rgba(16,185,129,0.25)',
            color: '#10B981', fontSize: 10, fontWeight: 500,
          }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#10B981', boxShadow: '0 0 5px #10B981' }} />
            Active · {daysAgo(job.created_at)}
          </span>
        </div>
        <div style={{ color: '#94A3B8', fontSize: 12 }}>{job.company} · {job.location}</div>
      </div>

      {/* Skills */}
      <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
        {job.skills_required?.slice(0, 3).map(s => (
          <span key={s} style={{
            padding: '3px 10px', borderRadius: 999,
            background: '#161D2E', border: '1px solid rgba(255,255,255,0.08)',
            color: '#94A3B8', fontFamily: '"JetBrains Mono", monospace', fontSize: 11,
          }}>{s}</span>
        ))}
      </div>

      {/* Salary + CTA */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
        {job.salary_min && <span style={{ color: '#F0F4FF', fontSize: 14, fontWeight: 600 }}>{formatSalary(job.salary_min, job.salary_max)}</span>}
        <button style={{
          padding: '6px 14px', borderRadius: 8,
          background: 'transparent', border: '1px solid rgba(255,255,255,0.18)',
          color: '#F0F4FF', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit',
        }}>View Role</button>
      </div>
    </div>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    supabase.from('jobs').select('*').eq('is_active', true)
      .order('created_at', { ascending: false }).limit(6)
      .then(({ data }) => setJobs(data || []));
  }, []);

  return (
    <div style={{ position: 'relative', overflow: 'hidden' }}>
      {/* Background glows — exact from reference */}
      <div style={{ position: 'absolute', top: -200, left: '20%', width: 800, height: 800, background: 'radial-gradient(circle, rgba(79,142,247,0.10) 0%, transparent 60%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: 100, right: -150, width: 700, height: 700, background: 'radial-gradient(circle, rgba(0,194,168,0.08) 0%, transparent 60%)', pointerEvents: 'none' }} />

      {/* ── HERO ── */}
      <section className="hn-hero-section" style={{ position: 'relative', maxWidth: 1280, margin: '0 auto', padding: '48px 32px 56px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'center' }}>
        <div>
          {/* Badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '5px 14px', borderRadius: 999, marginBottom: 28,
            background: 'rgba(79,142,247,0.10)', border: '1px solid rgba(79,142,247,0.30)',
            color: '#4F8EF7', fontSize: 12, fontWeight: 600,
          }}>
            ✦ AI-powered match scoring
          </div>

          {/* Headline */}
          <h1 style={{ fontSize: 'clamp(44px, 5vw, 64px)', fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.05, color: '#F0F4FF', margin: '0 0 24px' }}>
            Find your match.<br />
            <span style={{
              background: 'linear-gradient(135deg, #4F8EF7 0%, #00C2A8 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>Not just a job.</span>
          </h1>

          <p style={{ fontSize: 17, color: '#94A3B8', lineHeight: 1.6, maxWidth: 520, margin: '0 0 36px' }}>
            The only platform where skill matching, ATS pipeline, and application tracking live in one workspace.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 0, flexWrap: 'wrap' }}>
            <button onClick={() => navigate('/jobs')} style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '12px 24px', borderRadius: 10,
              background: 'linear-gradient(135deg, #4F8EF7 0%, #00C2A8 100%)',
              color: '#080C14', fontSize: 15, fontWeight: 600, border: 'none', cursor: 'pointer',
              boxShadow: '0 0 20px rgba(79,142,247,0.30)',
            }}>
              🔍 Browse Jobs
            </button>
            <button onClick={() => navigate('/post-job')} style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '12px 24px', borderRadius: 10,
              background: 'transparent', border: '1px solid rgba(255,255,255,0.18)',
              color: '#F0F4FF', fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
            }}>
              + Post a Job
            </button>
          </div>
        </div>

        {/* Right — floating cards */}
        <div className="hn-hero-visual" style={{ position: 'relative', height: 480 }}>
          <HeroJobCard company="Anthropic" role="Staff Frontend Engineer" salary="₹85k – ₹1.2L" match={92} posted="5h ago"
            style={{ position: 'absolute', top: 30, right: 60, width: 300, transform: 'rotate(-4deg)', opacity: 0.65 }} />
          <HeroJobCard company="Linear" role="Senior Product Designer" salary="₹70k – ₹90k" match={86} posted="3h ago"
            style={{ position: 'absolute', top: 140, right: 20, width: 320, transform: 'rotate(2deg)' }} />
          <HeroJobCard company="Razorpay" role="Platform Engineering Lead" salary="₹1L – ₹1.4L" match={94} posted="2h ago"
            style={{ position: 'absolute', top: 260, right: 80, width: 300, transform: 'rotate(-1.5deg)' }} />
          {/* Glowing dots */}
          <div style={{ position: 'absolute', top: 10, left: 50, width: 8, height: 8, borderRadius: '50%', background: '#00C2A8', boxShadow: '0 0 12px #00C2A8' }} />
          <div style={{ position: 'absolute', bottom: 40, left: 20, width: 6, height: 6, borderRadius: '50%', background: '#4F8EF7', boxShadow: '0 0 10px #4F8EF7' }} />
        </div>
      </section>

      {/* ── TRUST STRIP ── */}
      <section style={{ maxWidth: 1280, margin: '0 auto', padding: '0 32px 40px' }}>
        <div style={{ ...SURFACE, display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: '16px 40px', padding: '20px 24px' }}>
          {[
            { icon: '✓', label: 'Verified Active Jobs' },
            { icon: '⚡', label: 'Real-time ATS' },
            { icon: '🔒', label: 'GDPR Compliant' },
            { icon: '✦', label: 'Match Scoring' },
          ].map((t, i) => (
            <div key={t.label} style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#94A3B8' }}>
              {i > 0 && <span style={{ width: 1, height: 16, background: 'rgba(255,255,255,0.10)', marginRight: 10 }} />}
              <span style={{ color: '#00C2A8', fontSize: 15 }}>{t.icon}</span>
              <span style={{ fontSize: 13, fontWeight: 500 }}>{t.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── ROLE CARDS ── */}
      <section style={{ maxWidth: 1280, margin: '0 auto', padding: '0 32px 48px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
          <RoleCard role="Job Seeker" title="Track every application" icon="👤" accent="#4F8EF7" to="/jobs"
            desc="Match scoring shows where you stand. See your pipeline status across every employer in real time." cta="Find your role" />
          <RoleCard role="Recruiter" title="Hire faster, smarter" icon="🏢" accent="#4F8EF7" to="/post-job"
            desc="Post once, manage your entire ATS pipeline. AI scores candidates against your job requirements automatically." cta="Post a job" />
          <RoleCard role="Analytics" title="Govern with confidence" icon="⚙" accent="#8B5CF6" to="/signup"
            desc="Verify employers, enforce compliance, and audit hiring activity from a single elevated workspace." cta="Get started" />
        </div>
      </section>

      {/* ── LATEST JOBS ── */}
      <section style={{ maxWidth: 1280, margin: '0 auto', padding: '0 32px 48px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ ...LABEL, color: '#00C2A8', marginBottom: 8 }}>Featured · Updated live</div>
            <h2 style={{ fontSize: 32, fontWeight: 600, letterSpacing: '-0.01em', color: '#F0F4FF', margin: 0 }}>Roles matched to top talent</h2>
          </div>
          <Link to="/jobs" style={{ color: '#4F8EF7', fontSize: 14, fontWeight: 500 }}>View all jobs →</Link>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {jobs.length === 0
            ? <div style={{ textAlign: 'center', padding: '48px 0', color: '#4B5563' }}>No jobs yet. Be the first to post.</div>
            : jobs.map(j => <JobRow key={j.id} job={j} />)
          }
        </div>
      </section>

      {/* ── STATS ── */}
      <section style={{ maxWidth: 1280, margin: '0 auto', padding: '0 32px 56px' }}>
        <div style={{ ...SURFACE, display: 'flex', flexWrap: 'wrap', alignItems: 'stretch', padding: '40px 0' }}>
          <StatItem value="12,400+" label="Verified roles" />
          <span style={{ width: 1, background: 'rgba(255,255,255,0.10)' }} />
          <StatItem value="3,200" label="Companies hiring" />
          <span style={{ width: 1, background: 'rgba(255,255,255,0.10)' }} />
          <StatItem value="94%" label="Response rate" />
        </div>
      </section>

      <style>{`
        @media (max-width: 1024px) {
          .hn-hero-section { grid-template-columns: 1fr !important; }
          .hn-hero-visual { display: none !important; }
        }
        @media (max-width: 640px) {
          .hn-hero-section { padding: 40px 20px 60px !important; }
        }
      `}</style>
    </div>
  );
}
