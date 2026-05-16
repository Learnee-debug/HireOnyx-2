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
  return (
    <div className="font-mono text-[11px] font-semibold text-text-muted uppercase tracking-[0.08em] mb-2">
      {children}
    </div>
  );
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
          <span className={`text-body-sm transition-colors ${value === opt.value ? 'text-primary font-medium' : 'text-text-secondary group-hover:text-text-primary'}`}>
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
        : 'bg-transparent text-text-secondary border-border-default hover:border-primary hover:text-primary'}`}>
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

/* ── Skeleton rows for loading state ── */
function SkeletonJobRow() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-[minmax(0,2.5fr)_1fr_1fr_1fr_1fr] items-center px-6 gap-4 h-row-height border-b border-border-default last:border-0 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-surface-container-high flex-shrink-0" />
        <div className="space-y-1.5">
          <div className="h-3.5 bg-surface-container-high rounded w-36" />
          <div className="h-2.5 bg-surface-container-high rounded w-24" />
        </div>
      </div>
      <div className="hidden md:block h-3 bg-surface-container-high rounded w-20" />
      <div className="hidden md:block h-5 bg-surface-container-high rounded-full w-16" />
      <div className="hidden md:block h-3 bg-surface-container-high rounded w-20" />
      <div className="hidden md:flex items-center gap-3">
        <div className="h-6 bg-surface-container-high rounded-full w-14" />
      </div>
    </div>
  );
}

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

  const SidebarContent = () => (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <span className="font-semibold text-body-base text-text-primary">Filters</span>
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
    <div className="flex max-w-[1440px] mx-auto min-h-[calc(100vh-60px)]">
      {/* Sidebar — desktop only */}
      <aside className="hidden md:block w-[240px] flex-shrink-0 sticky top-nav-height h-[calc(100vh-60px)] overflow-y-auto border-r border-border-default bg-surface-container-lowest p-margin-page">
        <SidebarContent />
      </aside>

      {/* Main content */}
      <section className="flex-1 bg-page-bg p-margin-page flex flex-col gap-6 min-w-0">

        {/* Header bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-bold text-[22px] text-text-primary">Available Jobs</h1>
            <p className="text-body-sm text-text-secondary mt-0.5">
              {loading ? 'Loading…' : `${filtered.length} role${filtered.length !== 1 ? 's' : ''} found`}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative w-full sm:w-[240px]">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-[16px]">search</span>
              <input
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search roles, skills…"
                className="w-full h-input-height pl-9 pr-3 bg-surface-card border border-border-default rounded-lg text-body-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/10 transition-all"
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
              <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-score-high-bg border border-score-high-text/20">
                <span className="relative flex h-2 w-2 flex-shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-score-high-text opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-score-high-text" />
                </span>
                <span className="material-symbols-outlined text-score-high-text text-[18px]">description</span>
                <span className="text-score-high-text text-body-sm font-medium">
                  Resume active — {resumeProfile.skills?.length ?? 0} skills detected
                </span>
                {aiLoading && <span className="text-text-secondary text-body-sm">Analyzing…</span>}
                {aiError && <span className="text-error text-body-sm">{aiError}</span>}
                <button onClick={() => {
                  setResumeProfile(null); setMatchMap(new Map());
                  localStorage.removeItem('hireonyx_resume_profile');
                }} className="ml-auto text-text-muted hover:text-text-primary text-[20px] leading-none transition-colors">&times;</button>
              </div>
            )}
          </div>
        )}

        {/* Table / Loading / Empty */}
        {loading ? (
          <div className="bg-surface-card border border-border-default rounded-xl overflow-hidden">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonJobRow key={i} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-surface-card border border-border-default rounded-xl flex flex-col items-center justify-center py-20 gap-3">
            <span className="material-symbols-outlined text-[40px] text-border-strong">search_off</span>
            <p className="text-body-base text-text-secondary">No roles match your search.</p>
            <button onClick={resetFilters} className="text-body-sm text-primary hover:underline">Clear all filters</button>
          </div>
        ) : (
          <>
            {/* Table container */}
            <div className="bg-surface-card border border-border-default rounded-xl overflow-hidden">
              {/* Column headers */}
              <div className="hidden md:grid grid-cols-[minmax(0,2.5fr)_1fr_1fr_1fr_1fr] h-8 bg-surface-container-low border-b border-border-default px-6 gap-4 items-center">
                {['JOB TITLE & COMPANY', 'LOCATION', 'TYPE', 'SALARY', 'MATCH SCORE'].map(h => (
                  <span key={h} className="font-mono text-[11px] font-semibold text-text-muted uppercase tracking-[0.06em]">{h}</span>
                ))}
              </div>

              {/* Rows */}
              <div className="divide-y divide-border-default">
                {paginated.map(job => {
                  const initial = job.company?.[0]?.toUpperCase() || '?';
                  const score = matchMap.get(job.id)?.matchScore ?? stableMatch(job.id);
                  const salary = formatSalary(job.salary_min, job.salary_max);
                  const avatarColors = ['bg-accent-light text-primary', 'bg-surface-container-high text-text-secondary'];
                  const avatarCls = avatarColors[initial.charCodeAt(0) % avatarColors.length];

                  return (
                    <div key={job.id} onClick={() => navigate(`/jobs/${job.id}`)}
                      className="grid grid-cols-1 md:grid-cols-[minmax(0,2.5fr)_1fr_1fr_1fr_1fr] items-center px-6 gap-4 h-row-height hover:bg-surface-container-low transition-colors cursor-pointer group">
                      {/* Title + Company */}
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 flex items-center justify-center font-bold text-sm rounded-lg border border-border-default flex-shrink-0 ${avatarCls}`}>
                          {initial}
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium text-[14px] text-text-primary group-hover:text-primary transition-colors truncate">{job.title}</div>
                          <div className="text-body-sm text-text-secondary truncate">{job.company}</div>
                        </div>
                      </div>
                      {/* Location */}
                      <div className="hidden md:flex items-center gap-1 text-body-sm text-text-secondary">
                        <span className="material-symbols-outlined text-[14px] text-text-muted">location_on</span>
                        <span className="truncate">{job.location}</span>
                      </div>
                      {/* Type */}
                      <div className="hidden md:block">
                        <TypeBadge type={job.type} />
                      </div>
                      {/* Salary */}
                      <div className="hidden md:block font-mono text-[13px] text-text-primary">
                        {salary || <span className="text-text-muted">—</span>}
                      </div>
                      {/* Score + arrow */}
                      <div className="flex items-center gap-3">
                        <ScoreBadge score={score} />
                        <span className="material-symbols-outlined text-text-muted group-hover:text-primary transition-colors hidden md:block text-[18px]">chevron_right</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-1.5 pt-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-text-secondary hover:bg-surface-container-low transition-colors disabled:opacity-30">
                  <span className="material-symbols-outlined text-[16px]">chevron_left</span>
                </button>
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button key={i} onClick={() => setPage(i + 1)}
                    className={`w-8 h-8 rounded-full text-[13px] font-medium transition-colors ${page === i + 1
                      ? 'bg-text-primary text-white'
                      : 'text-text-secondary hover:bg-surface-container-low'}`}>
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-text-secondary hover:bg-surface-container-low transition-colors disabled:opacity-30">
                  <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                </button>
              </div>
            )}
          </>
        )}
      </section>

      {/* Mobile filter FAB */}
      <button
        onClick={() => setMobileFiltersOpen(true)}
        className="md:hidden fixed bottom-6 right-6 z-30 flex items-center gap-2 px-4 py-3 bg-text-primary text-white rounded-full shadow-lg text-body-sm font-semibold">
        <span className="material-symbols-outlined text-[18px]">tune</span>
        Filters
      </button>

      {/* Mobile filter drawer */}
      {mobileFiltersOpen && (
        <>
          <div className="fixed inset-0 bg-black/40 z-40 md:hidden" onClick={() => setMobileFiltersOpen(false)} />
          <div className="fixed inset-y-0 left-0 w-[280px] bg-surface-card z-50 md:hidden p-margin-page overflow-y-auto shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <span className="font-semibold text-text-primary">Filters</span>
              <button onClick={() => setMobileFiltersOpen(false)} className="text-text-muted hover:text-text-primary transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <SidebarContent />
            <button onClick={() => setMobileFiltersOpen(false)}
              className="mt-6 w-full h-10 px-5 bg-primary-container text-white font-semibold text-[14px] rounded-lg hover:opacity-90 active:scale-[0.98] transition-all">
              Apply Filters
            </button>
          </div>
        </>
      )}
    </div>
  );
}
