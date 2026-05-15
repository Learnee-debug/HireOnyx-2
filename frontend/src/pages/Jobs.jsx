import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { SURFACE, LABEL, matchColor, matchGlow } from '../lib/design';
import { daysAgo, formatSalary, stableMatch } from '../lib/utils';
import { usePageTitle } from '../lib/usePageTitle';

const TYPE_MAP = { 'Full-time': 'full-time', 'Part-time': 'part-time', 'Remote': 'remote', 'Contract': 'contract', 'Internship': 'internship' };

/* ── ToggleChip — exact from reference ── */
function ToggleChip({ label, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      padding: '5px 12px', borderRadius: 999,
      background: active ? 'rgba(79,142,247,0.15)' : '#161D2E',
      border: active ? '1px solid rgba(79,142,247,0.45)' : '1px solid rgba(255,255,255,0.08)',
      color: active ? '#4F8EF7' : '#94A3B8',
      fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit',
      transition: 'all 0.15s ease',
    }}>{label}</button>
  );
}

function ChipGroup({ options, selected, onToggle }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      {options.map(o => <ToggleChip key={o} label={o} active={selected.includes(o)} onClick={() => onToggle(o)} />)}
    </div>
  );
}

/* ── Match circle ── */
function MatchCircle({ value }) {
  const r = 22, c = 2 * Math.PI * r, off = c - (value / 100) * c;
  const color = matchColor(value);
  return (
    <div style={{ position: 'relative', width: 56, height: 56, flexShrink: 0 }}>
      <svg width="56" height="56" viewBox="0 0 56 56" style={{ filter: `drop-shadow(0 0 5px ${color}55)` }}>
        <defs>
          <linearGradient id={`mg${value}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#4F8EF7" /><stop offset="100%" stopColor={color} />
          </linearGradient>
        </defs>
        <circle cx="28" cy="28" r={r} stroke="rgba(255,255,255,0.08)" strokeWidth="4" fill="none" />
        <circle cx="28" cy="28" r={r} stroke={`url(#mg${value})`} strokeWidth="4" fill="none"
          strokeDasharray={c} strokeDashoffset={off} strokeLinecap="round" transform="rotate(-90 28 28)" />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color, fontSize: 11, fontWeight: 700, fontFamily: '"JetBrains Mono"' }}>{value}</div>
    </div>
  );
}

/* ── Job List Card — exact reference style ── */
function JobListCard({ job, featured }) {
  const navigate = useNavigate();
  const match = stableMatch(job.id);
  const accent = matchColor(match);

  return (
    <div onClick={() => navigate(`/jobs/${job.id}`)} style={{
      position: 'relative', padding: 20,
      background: '#0F1520',
      border: '1px solid rgba(255,255,255,0.10)',
      borderLeft: `3px solid ${accent}`,
      borderRadius: 16,
      boxShadow: featured
        ? '0 0 0 1px rgba(139,92,246,0.20), 0 4px 24px rgba(139,92,246,0.10)'
        : '0 0 0 1px rgba(255,255,255,0.06), 0 4px 24px rgba(0,0,0,0.4)',
      cursor: 'pointer',
      transition: 'transform 0.15s ease, box-shadow 0.15s ease',
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 0 0 1px rgba(79,142,247,0.25), 0 8px 32px rgba(0,0,0,0.5)`; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = featured ? '0 0 0 1px rgba(139,92,246,0.20), 0 4px 24px rgba(139,92,246,0.10)' : '0 0 0 1px rgba(255,255,255,0.06), 0 4px 24px rgba(0,0,0,0.4)'; }}
    >
      {featured && (
        <div style={{ position: 'absolute', top: 14, right: 14, padding: '4px 10px', borderRadius: 999, background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.40)', color: '#8B5CF6', fontSize: 10, fontWeight: 600, letterSpacing: '0.10em', textTransform: 'uppercase' }}>
          Featured
        </div>
      )}

      {/* Top row: company + active */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <div style={{ width: 40, height: 40, borderRadius: 999, flexShrink: 0, background: 'linear-gradient(135deg, #161D2E 0%, #1C2438 100%)', border: '1px solid rgba(255,255,255,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8', fontSize: 13, fontWeight: 600 }}>
          {job.company?.[0]}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ color: '#F0F4FF', fontSize: 14, fontWeight: 500 }}>{job.company}</span>
          <span style={{ color: '#10B981', fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 4 }}>✓ Verified</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '2px 8px', borderRadius: 999, background: 'rgba(16,185,129,0.10)', border: '1px solid rgba(16,185,129,0.25)', color: '#10B981', fontSize: 11, fontWeight: 500 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981', boxShadow: '0 0 6px #10B981' }} />
            Active · {daysAgo(job.created_at)}
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{ color: '#F0F4FF', fontSize: 20, fontWeight: 600, lineHeight: 1.3, margin: '0 0 8px' }}>{job.title}</h3>
          <p style={{ color: '#94A3B8', fontSize: 14, lineHeight: 1.6, margin: '0 0 14px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {job.description}
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {job.skills_required?.slice(0, 4).map(s => (
              <span key={s} style={{ padding: '4px 10px', borderRadius: 999, background: '#161D2E', border: '1px solid rgba(255,255,255,0.08)', color: '#94A3B8', fontFamily: '"JetBrains Mono"', fontSize: 11 }}>{s}</span>
            ))}
            {job.skills_required?.length > 4 && (
              <span style={{ padding: '4px 10px', borderRadius: 999, border: '1px solid rgba(255,255,255,0.10)', color: '#4F8EF7', fontFamily: '"JetBrains Mono"', fontSize: 11 }}>+{job.skills_required.length - 4} more</span>
            )}
          </div>
        </div>
        <MatchCircle value={match} />
      </div>

      {/* Bottom row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginTop: 16, paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.06)', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <span style={{ color: '#94A3B8', fontSize: 13, display: 'flex', alignItems: 'center', gap: 4 }}>📍 {job.location}</span>
          <span style={{ padding: '2px 8px', borderRadius: 999, background: '#1C2438', border: '1px solid rgba(255,255,255,0.08)', color: '#94A3B8', fontSize: 11, fontFamily: '"JetBrains Mono"', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{job.type}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {job.salary_min && <span style={{ color: '#F0F4FF', fontSize: 15, fontWeight: 600 }}>{formatSalary(job.salary_min, job.salary_max)}</span>}
          <span style={{ padding: '4px 10px', borderRadius: 999, background: `${accent}18`, border: `1px solid ${accent}55`, color: accent, fontFamily: '"JetBrains Mono"', fontSize: 11, fontWeight: 600, boxShadow: matchGlow(match) }}>
            {match}% match
          </span>
          <button style={{ padding: '6px 14px', borderRadius: 10, background: 'transparent', border: '1px solid rgba(255,255,255,0.18)', color: '#F0F4FF', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}>
            View Role
          </button>
        </div>
      </div>
    </div>
  );
}

const SKELETONS = Array.from({ length: 4 });

export default function Jobs() {
  usePageTitle('Browse Jobs');
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ query: '', location: '', workplace: [], type: [], seniority: [], salaryMin: 0, salaryMax: 999 });
  const [sortOpen, setSortOpen] = useState(false);
  const [sort, setSort] = useState('Relevance');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  useEffect(() => {
    supabase.from('jobs').select('*').eq('is_active', true).order('created_at', { ascending: false })
      .then(({ data }) => { setJobs(data || []); setLoading(false); });
  }, []);

  const toggle = (key, val) => setFilters(f => ({ ...f, [key]: f[key].includes(val) ? f[key].filter(x => x !== val) : [...f[key], val] }));

  const filtered = jobs.filter(j => {
    const q = filters.query.toLowerCase();
    const matchQ = !q || j.title.toLowerCase().includes(q) || j.company.toLowerCase().includes(q) || j.skills_required?.some(s => s.toLowerCase().includes(q));
    const matchT = filters.type.length === 0 || filters.type.some(t => j.type === TYPE_MAP[t]);
    const matchL = !filters.location || j.location.toLowerCase().includes(filters.location.toLowerCase());
    return matchQ && matchT && matchL;
  });

  const activeFilterChips = [
    ...filters.type.map(t => ({ label: t, remove: () => toggle('type', t) })),
    ...filters.workplace.map(w => ({ label: w, remove: () => toggle('workplace', w) })),
    ...(filters.query ? [{ label: `"${filters.query}"`, remove: () => setFilters(f => ({ ...f, query: '' })) }] : []),
  ];

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 32px', display: 'flex', gap: 28, alignItems: 'flex-start' }}>
      <style>{`
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
        @media(max-width:900px){.hn-jobs-sidebar{display:none!important}.hn-jobs-sidebar.open{display:block!important}}
        @media(max-width:640px){.hn-jobs-main{padding:0!important}}
      `}</style>

      {/* ── SIDEBAR ── */}
      <aside className={`hn-jobs-sidebar${mobileFiltersOpen ? ' open' : ''}`} style={{
        ...SURFACE, padding: 20, width: 280, minWidth: 280, flexShrink: 0,
        position: 'sticky', top: 76, alignSelf: 'flex-start',
      }}>
        <style>{`
          input[type=range]::-webkit-slider-thumb { -webkit-appearance:none; width:18px; height:18px; border-radius:50%; background:#F0F4FF; border:2px solid #4F8EF7; cursor:pointer; box-shadow:0 0 8px rgba(245,166,35,0.5); pointer-events:auto; }
          input[type=range]::-moz-range-thumb { width:18px; height:18px; border-radius:50%; background:#F0F4FF; border:2px solid #4F8EF7; cursor:pointer; }
          input[type=range]::-webkit-slider-runnable-track { background:transparent; }
        `}</style>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h3 style={{ color: '#F0F4FF', fontSize: 18, fontWeight: 600, margin: 0 }}>Filters</h3>
          <button onClick={() => setFilters({ query: '', location: '', workplace: [], type: [], seniority: [], salaryMin: 0, salaryMax: 999 })}
            style={{ color: '#4F8EF7', fontSize: 12, fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
            Reset all
          </button>
        </div>

        {/* Search */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ ...LABEL, marginBottom: 10 }}>Search</div>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', top: 12, left: 12, color: '#4B5563', fontSize: 13 }}>🔍</span>
            <input value={filters.query} onChange={e => setFilters(f => ({ ...f, query: e.target.value }))}
              placeholder="Role, skill, company"
              style={{ width: '100%', padding: '10px 12px 10px 36px', borderRadius: 10, background: '#161D2E', border: '1px solid rgba(255,255,255,0.10)', color: '#F0F4FF', fontSize: 13, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }}
            />
          </div>
        </div>

        {/* Location */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ ...LABEL, marginBottom: 10 }}>Location</div>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', top: 12, left: 12, color: '#4B5563', fontSize: 13 }}>📍</span>
            <input value={filters.location} onChange={e => setFilters(f => ({ ...f, location: e.target.value }))}
              placeholder="City, country, remote"
              style={{ width: '100%', padding: '10px 12px 10px 36px', borderRadius: 10, background: '#161D2E', border: '1px solid rgba(255,255,255,0.10)', color: '#F0F4FF', fontSize: 13, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }}
            />
          </div>
        </div>

        {/* Workplace */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ ...LABEL, marginBottom: 10 }}>Workplace</div>
          <ChipGroup options={['Remote', 'Hybrid', 'Onsite']} selected={filters.workplace} onToggle={v => toggle('workplace', v)} />
        </div>

        {/* Type */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ ...LABEL, marginBottom: 10 }}>Type</div>
          <ChipGroup options={['Full-time', 'Part-time', 'Contract', 'Internship']} selected={filters.type} onToggle={v => toggle('type', v)} />
        </div>

        {/* Seniority */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ ...LABEL, marginBottom: 10 }}>Seniority</div>
          <ChipGroup options={['Junior', 'Mid', 'Senior', 'Lead']} selected={filters.seniority} onToggle={v => toggle('seniority', v)} />
        </div>

        {/* Sort */}
        <div>
          <div style={{ ...LABEL, marginBottom: 10 }}>Sort by</div>
          <div style={{ position: 'relative' }}>
            <button onClick={() => setSortOpen(o => !o)} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderRadius: 10, background: '#161D2E', border: '1px solid rgba(255,255,255,0.10)', color: '#F0F4FF', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}>
              {sort} <span style={{ color: '#94A3B8' }}>▾</span>
            </button>
            {sortOpen && (
              <div style={{ position: 'absolute', left: 0, right: 0, top: '100%', marginTop: 4, zIndex: 10, padding: 4, background: '#161D2E', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.4)' }}>
                {['Relevance', 'Newest', 'Salary', 'Featured'].map(o => (
                  <button key={o} onClick={() => { setSort(o); setSortOpen(false); }} style={{ width: '100%', textAlign: 'left', padding: '8px 12px', borderRadius: 8, background: o === sort ? 'rgba(79,142,247,0.10)' : 'transparent', color: o === sort ? '#4F8EF7' : '#94A3B8', fontSize: 13, border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
                    {o}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.01em', color: '#F0F4FF', margin: '0 0 10px' }}>
            {loading ? '…' : `${filtered.length.toLocaleString()} roles found`}
          </h1>
          {activeFilterChips.length > 0 && (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {activeFilterChips.map((chip, i) => (
                <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 999, background: 'rgba(79,142,247,0.10)', border: '1px solid rgba(79,142,247,0.30)', color: '#4F8EF7', fontSize: 12, fontWeight: 500 }}>
                  {chip.label}
                  <button onClick={chip.remove} style={{ color: '#4F8EF7', background: 'none', border: 'none', cursor: 'pointer', display: 'inline-flex', lineHeight: 1 }}>×</button>
                </span>
              ))}
            </div>
          )}
        </div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {SKELETONS.map((_, i) => (
              <div key={i} style={{ ...SURFACE, padding: 20, display: 'flex', gap: 16, alignItems: 'center' }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#161D2E', animation: 'pulse 1.5s infinite', flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ height: 16, width: '55%', background: '#161D2E', borderRadius: 6, marginBottom: 8, animation: 'pulse 1.5s infinite' }} />
                  <div style={{ height: 12, width: '35%', background: '#161D2E', borderRadius: 6, animation: 'pulse 1.5s infinite' }} />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ ...SURFACE, textAlign: 'center', padding: '64px 0' }}>
            <p style={{ color: '#94A3B8', fontSize: 16, marginBottom: 12 }}>No roles match your search.</p>
            <button onClick={() => setFilters({ query: '', location: '', workplace: [], type: [], seniority: [], salaryMin: 0, salaryMax: 999 })}
              style={{ color: '#4F8EF7', background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, fontFamily: 'inherit' }}>
              Clear all filters
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filtered.map((job, i) => <JobListCard key={job.id} job={job} featured={i < 2} />)}
          </div>
        )}
      </div>
    </div>
  );
}
