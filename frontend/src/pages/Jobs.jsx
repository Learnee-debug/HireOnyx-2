import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { daysAgo, formatSalary, stableMatch } from '../lib/utils';
import {
  getSavedProfile, matchJobs, buildMatchMap,
} from '../lib/aiMatchingApi';
import ResumeUpload from '../components/ai/ResumeUpload';

const TYPE_MAP = {
  'Full-time': 'full-time', 'Part-time': 'part-time',
  'Remote': 'remote', 'Contract': 'contract', 'Internship': 'internship',
};

const TYPE_LABELS = {
  'full-time': 'Full-time', 'part-time': 'Part-time',
  'remote': 'Remote', 'contract': 'Contract', 'internship': 'Internship',
};

/* ── Score Badge ── */
function ScoreBadge({ score }) {
  const cls = score >= 90 ? 'score-high' : score >= 75 ? 'score-mid' : score >= 60 ? 'score-low' : 'score-none';
  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${cls}`}>
      <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'currentColor' }} />
      <span className="font-mono text-[11px] font-semibold">{score}%</span>
    </div>
  );
}

/* ── Type Badge ── */
function TypeBadge({ type }) {
  return (
    <span className="px-2 py-0.5 text-[11px] font-mono font-semibold uppercase tracking-wider border border-border-default text-text-secondary rounded">
      {TYPE_LABELS[type] || type}
    </span>
  );
}

/* ── Filter section label ── */
function FilterLabel({ children }) {
  return <div className="text-data-label text-text-muted uppercase tracking-widest mb-2">{children}</div>;
}

/* ── Filter radio ── */
function FilterRadio({ options, value, onChange, name }) {
  return (
    <div className="flex flex-col gap-1">
      {options.map(opt => (
        <label key={opt.value} className="flex items-center gap-2 cursor-pointer group">
          <input type="radio" name={name} value={opt.value} checked={value === opt.value}
            onChange={() => onChange(opt.value)}
            className="w-3.5 h-3.5 accent-primary" />
          <span className={`text-body-sm transition-colors ${value === opt.value ? 'text-primary font-medium' : 'text-text-secondary dark:text-text-muted group-hover:text-text-primary dark:group-hover:text-inverse-on-surface'}`}>
            {opt.label}
          </span>
        </label>
      ))}
    </div>
  );
}

/* ── Filter chip ── */
function FilterChip({ label, active, onClick }) {
  return (
    <button onClick={onClick}
      className={`px-3 py-1 rounded-full text-[12px] font-medium border transition-colors ${active
        ? 'bg-accent-light text-primary border-primary/30'
        : 'bg-transparent text-text-secondary dark:text-text-muted border-border-default dark:border-outline-variant hover:border-primary hover:text-primary'}`}>
      {label}
    </button>
  );
}

const ROLE_OPTIONS = [
  { value: '', label: 'All Roles' },
  { value: 'engineer', label: 'Engineering' },
  { value: 'design', label: 'Design' },
  { value: 'product', label: 'Product' },
  { value: 'data', label: 'Data & ML' },
];

const LOC_OPTIONS = [
  { value: '', label: 'All Locations' },
  { value: 'remote', label: 'Remote' },
  { value: 'bangalore', label: 'Bangalore' },
  { value: 'mumbai', label: 'Mumbai' },
  { value: 'delhi', label: 'Delhi' },
];

const EXP_OPTIONS = ['Junior', 'Mid-level', 'Senior'];
const TYPE_OPTIONS = ['Full-time', 'Contract', 'Part-time', 'Internship'];

const ITEMS_PER_PAGE = 10;

export default function Jobs() {
  const { profile: userProfile } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [locFilter, setLocFilter] = useState('');
  const [expFilter, setExpFilter] = useState([]);
  const [typeFilter, setTypeFilter] = useState([]);
  const [page, setPage] = useState(1);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // AI matching state
  const [resumeProfile, setResumeProfile] = useState(() => getSavedProfile());
  const [matchMap, setMatchMap] = useState(new Map());
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');
  const [showUpload, setShowUpload] = useState(false);

  const runMatching = useCallback(async (profile, jobList) => {
    if (!profile || !jobList?.length) return;
    setAiLoading(true); setAiError('');
    try {
      const matches = await matchJobs(profile, jobList);
      setMatchMap(buildMatchMap(matches));
    } catch (err) {
      setAiError('AI matching unavailable. Showing estimated scores.');
      const fallback = new Map(jobList.map(j => [j.id, { jobId: j.id, matchScore: stableMatch(j.id) }]));
      setMatchMap(fallback);
    } finally {
      setAiLoading(false);
    }
  }, []);

  useEffect(() => {
    supabase.from('jobs').select('*').eq('is_active', true)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        const jobList = data || [];
        setJobs(jobList);
        setLoading(false);
        if (resumeProfile) runMatching(resumeProfile, jobList);
      });
  }, []); // eslint-disable-line

  const toggleArr = (arr, setArr, val) =>
    setArr(prev => prev.includes(val) ? prev.filter(x => x !== val) : [...prev, val]);

  const filtered = jobs.filter(j => {
    const q = search.toLowerCase();
    const matchQ = !q || j.title.toLowerCase().includes(q) || j.company.toLowerCase().includes(q) || j.skills_required?.some(s => s.toLowerCase().includes(q));
    const matchT = typeFilter.length === 0 || typeFilter.some(t => j.type === TYPE_MAP[t]);
    const matchL = !locFilter || j.location.toLowerCase().includes(locFilter.toLowerCase());
    const matchR = !roleFilter || j.title.toLowerCase().includes(roleFilter) || j.description?.toLowerCase().includes(roleFilter);
    return matchQ && matchT && matchL && matchR;
  }).sort((a, b) => {
    if (matchMap.size > 0) {
      return (matchMap.get(b.id)?.matchScore || stableMatch(b.id)) - (matchMap.get(a.id)?.matchScore || stableMatch(a.id));
    }
    return 0;
  });

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const resetFilters = () => {
    setSearch(''); setRoleFilter(''); setLocFilter('');
    setExpFilter([]); setTypeFilter([]); setPage(1);
  };

  const Sidebar = () => (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <span className="font-semibold text-body-base text-text-primary dark:text-inverse-on-surface">Filters</span>
        <button onClick={resetFilters} className="text-[12px] text-primary hover:underline">Reset all</button>
      </div>

      <div>
        <FilterLabel>Role</FilterLabel>
        <FilterRadio options={ROLE_OPTIONS} value={roleFilter} onChange={v => { setRoleFilter(v); setPage(1); }} name="role" />
      </div>

      <div>
        <FilterLabel>Location</FilterLabel>
        <FilterRadio options={LOC_OPTIONS} value={locFilter} onChange={v => { setLocFilter(v); setPage(1); }} name="loc" />
      </div>

      <div>
        <FilterLabel>Experience</FilterLabel>
        <div className="flex flex-wrap gap-2">
          {EXP_OPTIONS.map(e => (
            <FilterChip key={e} label={e} active={expFilter.includes(e)} onClick={() => toggleArr(expFilter, setExpFilter, e)} />
          ))}
        </div>
      </div>

      <div>
        <FilterLabel>Type</FilterLabel>
        <div className="flex flex-wrap gap-2">
          {TYPE_OPTIONS.map(t => (
            <FilterChip key={t} label={t} active={typeFilter.includes(t)} onClick={() => { toggleArr(typeFilter, setTypeFilter, t); setPage(1); }} />
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex max-w-[1440px] mx-auto min-h-[calc(100vh-52px)]">
      {/* Sidebar — desktop */}
      <aside className="hidden md:block w-[240px] flex-shrink-0 sticky top-nav-height h-[calc(100vh-52px)] overflow-y-auto border-r border-border-default dark:border-outline-variant bg-surface-container-lowest dark:bg-inverse-surface p-margin-page">
        <Sidebar />
      </aside>

      {/* Main */}
      <section className="flex-1 bg-page-bg dark:bg-[#1b1c1a] p-margin-page flex flex-col gap-6 min-w-0">

        {/* Header bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-bold text-[22px] text-text-primary dark:text-inverse-on-surface">Available Jobs</h1>
            <p className="text-body-sm text-text-secondary dark:text-text-muted mt-0.5">
              {loading ? 'Loading...' : `${filtered.length} role${filtered.length !== 1 ? 's' : ''} found`}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Mobile filter button */}
            <button onClick={() => setMobileFiltersOpen(true)}
              className="md:hidden flex items-center gap-2 px-3 py-2 border border-border-default rounded-lg text-body-sm text-text-primary dark:text-inverse-on-surface">
              <span className="material-symbols-outlined text-[16px]">tune</span>
              Filters
            </button>
            {/* Search */}
            <div className="relative w-full sm:w-[240px]">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-[16px]">search</span>
              <input
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search roles, skills..."
                className="w-full h-input-height pl-9 pr-3 bg-surface-card dark:bg-surface-container border border-border-default dark:border-outline-variant rounded-lg text-body-sm text-text-primary dark:text-inverse-on-surface placeholder:text-text-muted focus:outline-none focus:border-primary transition-colors"
              />
            </div>
          </div>
        </div>

        {/* AI Resume Banner */}
        {userProfile?.role === 'seeker' && (
          <div>
            {!resumeProfile ? (
              showUpload ? (
                <ResumeUpload onParsed={(p) => {
                  setResumeProfile(p);
                  setShowUpload(false);
                  if (p) runMatching(p, jobs);
                }} />
              ) : (
                <button onClick={() => setShowUpload(true)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg border-2 border-dashed border-primary/30 bg-accent-light/50 text-primary text-body-sm font-medium hover:bg-accent-light transition-colors">
                  <span className="material-symbols-outlined text-[18px]">description</span>
                  Upload resume to see AI match scores for every role
                  <span className="ml-auto text-[12px] opacity-70">PDF only →</span>
                </button>
              )
            ) : (
              <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-score-high-bg border border-green-100">
                <span className="material-symbols-outlined text-score-high-text text-[18px]">description</span>
                <span className="text-score-high-text text-body-sm font-medium">
                  Resume active — {resumeProfile.skills.length} skills detected
                </span>
                {aiLoading && <span className="text-text-secondary text-body-sm">Analyzing…</span>}
                {aiError && <span className="text-error text-body-sm">{aiError}</span>}
                <button onClick={() => navigate('/jobs')} className="ml-auto text-body-sm font-medium text-primary hover:underline">
                  Browse matched jobs →
                </button>
                <button onClick={() => {
                  setResumeProfile(null); setMatchMap(new Map());
                  localStorage.removeItem('hireonyx_resume_profile');
                }} className="text-text-muted hover:text-text-primary text-[18px] leading-none">&times;</button>
              </div>
            )}
          </div>
        )}

        {/* Table */}
        {loading ? (
          <div className="bg-surface-card dark:bg-surface-container border border-border-default dark:border-outline-variant rounded-lg overflow-hidden">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-margin-page py-4 border-b border-border-default dark:border-outline-variant last:border-0 animate-pulse">
                <div className="w-9 h-9 rounded-lg bg-surface-container-high dark:bg-surface-container flex-shrink-0"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-surface-container-high dark:bg-surface-container rounded w-48"></div>
                  <div className="h-3 bg-surface-container-high dark:bg-surface-container rounded w-32"></div>
                </div>
                <div className="h-6 w-16 bg-surface-container-high dark:bg-surface-container rounded-full"></div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-surface-card dark:bg-surface-container border border-border-default dark:border-outline-variant rounded-lg flex flex-col items-center justify-center py-20 gap-3">
            <span className="material-symbols-outlined text-[40px] text-border-strong">search_off</span>
            <p className="text-body-base text-text-secondary dark:text-text-muted">No roles match your search.</p>
            <button onClick={resetFilters} className="text-body-sm text-primary hover:underline">Clear all filters</button>
          </div>
        ) : (
          <>
            {/* Column headers */}
            <div className="hidden md:grid grid-cols-[minmax(0,2.5fr)_1fr_1fr_1fr_1fr] px-margin-page py-2 gap-4">
              {['JOB TITLE & COMPANY', 'LOCATION', 'TYPE', 'SALARY', 'MATCH SCORE'].map(h => (
                <span key={h} className="text-data-label text-text-muted uppercase tracking-widest">{h}</span>
              ))}
            </div>

            <div className="bg-surface-card dark:bg-surface-container border border-border-default dark:border-outline-variant rounded-lg divide-y divide-border-default dark:divide-outline-variant overflow-hidden">
              {paginated.map(job => {
                const initial = job.company?.[0]?.toUpperCase() || '?';
                const score = matchMap.get(job.id)?.matchScore ?? stableMatch(job.id);
                const bgColors = ['bg-accent-light text-primary', 'bg-surface-container-high text-on-secondary-container'];
                const avatarBg = bgColors[initial.charCodeAt(0) % bgColors.length];
                const salary = formatSalary(job.salary_min, job.salary_max);

                return (
                  <div key={job.id} onClick={() => navigate(`/jobs/${job.id}`)}
                    className="grid grid-cols-1 md:grid-cols-[minmax(0,2.5fr)_1fr_1fr_1fr_1fr] items-center px-margin-page py-4 gap-4 hover:bg-surface-container-low dark:hover:bg-surface-container-high transition-colors cursor-pointer group">
                    {/* Title + Company */}
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 flex items-center justify-center font-bold text-sm rounded-lg border border-border-default flex-shrink-0 ${avatarBg}`}>
                        {initial}
                      </div>
                      <div>
                        <div className="font-medium text-[14px] text-text-primary dark:text-inverse-on-surface group-hover:text-primary transition-colors">{job.title}</div>
                        <div className="text-body-sm text-text-secondary dark:text-text-muted">{job.company}</div>
                      </div>
                    </div>
                    {/* Location */}
                    <div className="hidden md:flex items-center gap-1 text-body-sm text-text-secondary dark:text-text-muted">
                      <span className="material-symbols-outlined text-[14px] text-text-muted">location_on</span>
                      {job.location}
                    </div>
                    {/* Type */}
                    <div className="hidden md:block">
                      <TypeBadge type={job.type} />
                    </div>
                    {/* Salary */}
                    <div className="hidden md:block font-mono text-[13px] text-text-primary dark:text-inverse-on-surface">
                      {salary || <span className="text-text-muted">—</span>}
                    </div>
                    {/* Score */}
                    <div className="flex items-center gap-4">
                      <ScoreBadge score={score} />
                      <span className="material-symbols-outlined text-text-muted group-hover:text-text-primary transition-colors hidden md:block">chevron_right</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-2">
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button key={i} onClick={() => setPage(i + 1)}
                    className={`w-8 h-8 rounded-full text-[13px] font-medium transition-colors ${page === i + 1
                      ? 'bg-text-primary dark:bg-inverse-on-surface text-white dark:text-inverse-surface'
                      : 'text-text-secondary dark:text-text-muted hover:bg-surface-container-high'}`}>
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </section>

      {/* Mobile filter overlay */}
      {mobileFiltersOpen && (
        <>
          <div className="fixed inset-0 bg-black/40 z-40 md:hidden" onClick={() => setMobileFiltersOpen(false)} />
          <div className="fixed inset-y-0 left-0 w-[280px] bg-surface-card dark:bg-surface-container z-50 md:hidden p-margin-page overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <span className="font-semibold text-text-primary dark:text-inverse-on-surface">Filters</span>
              <button onClick={() => setMobileFiltersOpen(false)} className="material-symbols-outlined text-text-muted">close</button>
            </div>
            <Sidebar />
            <button onClick={() => setMobileFiltersOpen(false)} className="mt-6 w-full h-10 bg-primary-container text-white rounded-lg text-button-text font-medium">
              Apply Filters
            </button>
          </div>
        </>
      )}
    </div>
  );
}
