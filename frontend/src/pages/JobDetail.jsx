import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { stableMatch, formatDate, formatSalary } from '../lib/utils';
import ApplyModal from '../components/applications/ApplyModal';
import { getSavedProfile, matchSingleJob } from '../lib/aiMatchingApi';
import toast from 'react-hot-toast';

const TYPE_LABELS = {
  'full-time': 'Full-time', 'part-time': 'Part-time',
  'remote': 'Remote', 'internship': 'Internship', 'contract': 'Contract',
};

function ScoreBadge({ score, large }) {
  const cls = score >= 90 ? 'score-high' : score >= 75 ? 'score-mid' : score >= 60 ? 'score-low' : 'score-none';

  if (large) {
    return (
      <div className={`inline-flex items-center gap-3 px-5 py-3 rounded-xl border ${cls}`}>
        <div className="w-2 h-2 rounded-full" style={{ background: 'currentColor' }} />
        <span className="font-mono font-bold leading-none" style={{ fontSize: '48px' }}>
          {score}<span className="text-[20px] font-normal opacity-60">%</span>
        </span>
        <span className="text-body-sm opacity-80 font-medium">match</span>
      </div>
    );
  }
  return (
    <div className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full border ${cls}`}>
      <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'currentColor' }} />
      <span className="font-mono text-data-label">{score}%</span>
    </div>
  );
}

function TypeBadge({ type }) {
  return (
    <span className="px-2.5 py-1 text-[11px] font-mono font-semibold uppercase tracking-wider border border-border-default text-text-secondary rounded-full">
      {TYPE_LABELS[type] || type}
    </span>
  );
}

function SectionCard({ title, children }) {
  return (
    <div className="bg-surface-card border border-border-default rounded-xl p-6">
      <h3 className="font-mono text-[11px] font-semibold text-text-muted uppercase tracking-[0.08em] mb-4">{title}</h3>
      {children}
    </div>
  );
}

function SkeletonDetail() {
  return (
    <div className="max-w-3xl mx-auto px-4 md:px-margin-page py-10 animate-pulse">
      <div className="h-4 bg-surface-container-high rounded w-40 mb-8" />
      <div className="flex items-center gap-4 mb-6">
        <div className="w-11 h-11 rounded-lg bg-surface-container-high flex-shrink-0" />
        <div className="space-y-2 flex-1">
          <div className="h-3 bg-surface-container-high rounded w-28" />
          <div className="h-7 bg-surface-container-high rounded w-72" />
        </div>
      </div>
      <div className="flex gap-3 mb-8">
        {[80, 60, 50].map((w, i) => (
          <div key={i} className="h-6 bg-surface-container-high rounded-full" style={{ width: `${w}px` }} />
        ))}
      </div>
      <div className="h-28 bg-surface-container-high rounded-xl mb-4" />
      {[100, 85, 90, 70].map((w, i) => (
        <div key={i} className="h-4 bg-surface-container-high rounded mb-3" style={{ width: `${w}%` }} />
      ))}
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

        const savedProfile = getSavedProfile();
        if (savedProfile && !cancelled) {
          setAiLoading(true);
          matchSingleJob(savedProfile, jobData)
            .then((m) => { if (!cancelled) setAiMatch(m); })
            .catch(() => {})
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
    <div className="max-w-3xl mx-auto px-4 md:px-margin-page py-20 text-center">
      <span className="material-symbols-outlined text-[64px] text-border-strong block mb-4">search_off</span>
      <h2 className="font-bold text-[22px] text-text-primary mb-2">Job not found</h2>
      <p className="text-text-secondary mb-8">This role may have been removed or the link is incorrect.</p>
      <Link to="/jobs"
        className="inline-flex items-center gap-2 h-10 px-5 bg-primary-container text-white font-semibold text-[14px] rounded-lg hover:opacity-90 active:scale-[0.98] transition-all">
        Browse all roles
      </Link>
    </div>
  );

  const salary = formatSalary(job.salary_min, job.salary_max);
  const match = aiMatch?.matchScore ?? stableMatch(job.id);
  const initial = job.company?.[0]?.toUpperCase() || '?';

  function ApplySection() {
    if (profile?.role === 'recruiter' && profile?.id === job.recruiter_id) {
      return (
        <div className="px-4 py-3 bg-surface-container-low rounded-lg text-center text-body-sm text-text-secondary">
          You posted this role
        </div>
      );
    }
    if (profile?.role === 'recruiter') return null;
    if (!user) {
      return (
        <Link to="/login"
          className="block text-center h-10 px-5 border border-border-default rounded-lg text-[14px] font-semibold text-text-primary hover:bg-surface-container-low transition-colors leading-[40px]">
          Sign in to Apply
        </Link>
      );
    }
    if (application) {
      return (
        <div className="px-4 py-3 bg-score-high-bg border border-score-high-text/20 rounded-lg text-center">
          <div className="text-score-high-text font-semibold text-body-base mb-1">Application Submitted</div>
          <div className="text-text-secondary text-body-sm">{formatDate(application.applied_at)}</div>
        </div>
      );
    }
    return (
      <button onClick={() => setModalOpen(true)}
        className="w-full h-10 px-5 bg-primary-container text-white font-semibold text-[14px] rounded-lg hover:opacity-90 active:scale-[0.98] transition-all">
        Apply Now
      </button>
    );
  }

  return (
    <>
      <div className="max-w-3xl mx-auto px-4 md:px-margin-page py-8 md:py-10 pb-28 md:pb-10">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-8 text-body-sm">
          <Link to="/jobs" className="text-text-secondary hover:text-primary transition-colors">Jobs</Link>
          <span className="material-symbols-outlined text-[14px] text-text-muted">chevron_right</span>
          <span className="text-text-primary font-medium truncate">{job.title}</span>
        </div>

        {/* Header */}
        <div className="flex items-start gap-4 mb-6">
          <div className="w-11 h-11 flex items-center justify-center font-bold text-lg rounded-xl bg-accent-light text-primary border border-border-default flex-shrink-0">
            {initial}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-body-sm text-text-secondary">{job.company}</span>
              <span className="flex items-center gap-1 text-score-high-text text-[12px] font-medium">
                <span className="material-symbols-outlined text-[14px]">verified</span>
                Verified
              </span>
            </div>
            <h1 className="font-bold text-[28px] tracking-tight text-text-primary leading-tight">{job.title}</h1>
          </div>
        </div>

        {/* Meta row */}
        <div className="flex items-center gap-4 flex-wrap mb-8 text-body-sm text-text-secondary">
          <div className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">location_on</span>
            {job.location}
          </div>
          <TypeBadge type={job.type} />
          {salary && (
            <div className="flex items-center gap-1 font-medium text-text-primary">
              <span className="material-symbols-outlined text-[14px]">payments</span>
              {salary}
            </div>
          )}
          <span className="text-text-muted">Posted {formatDate(job.created_at)}</span>
        </div>

        {/* Action bar card */}
        <div className="bg-surface-card border border-border-default rounded-xl p-4 md:p-5 mb-8 flex flex-col gap-4">
          <div className="flex items-center gap-4 flex-wrap">
            <ScoreBadge score={match} large />
            {aiLoading && (
              <div className="flex items-center gap-2 text-body-sm text-text-secondary">
                <div className="w-4 h-4 border-2 border-border-default border-t-primary rounded-full animate-spin" />
                Calculating AI match…
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <ApplySection />
            </div>
            <button
              className="h-10 px-3 border border-border-default rounded-lg text-text-secondary hover:text-primary hover:border-primary transition-colors flex-shrink-0"
              title="Save for later">
              <span className="material-symbols-outlined text-[18px]">bookmark</span>
            </button>
          </div>
        </div>

        {/* Content sections */}
        <div className="space-y-4">
          <SectionCard title="About the role">
            <p className="text-body-base text-text-primary leading-relaxed whitespace-pre-wrap">{job.description}</p>
          </SectionCard>

          {job.requirements && (
            <SectionCard title="Requirements">
              <div className="text-body-base text-text-secondary leading-relaxed whitespace-pre-wrap">{job.requirements}</div>
            </SectionCard>
          )}

          {job.skills_required?.length > 0 && (
            <SectionCard title="Required Skills">
              <div className="flex flex-wrap gap-2">
                {job.skills_required.map(skill => (
                  <span key={skill} className="px-3 py-1.5 bg-surface-container-low border border-border-default rounded-full font-mono text-[12px] text-text-primary">
                    {skill}
                  </span>
                ))}
              </div>
            </SectionCard>
          )}

          {/* AI Match Analysis */}
          {profile?.role === 'seeker' && aiMatch && (
            <SectionCard title="AI Match Analysis">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {aiMatch.strengths?.length > 0 && (
                  <div>
                    <div className="font-mono text-[11px] font-semibold text-score-high-text uppercase tracking-[0.08em] mb-3">Strengths</div>
                    <ul className="space-y-2">
                      {aiMatch.strengths.map((s, i) => (
                        <li key={i} className="flex items-start gap-2 text-body-sm text-text-secondary">
                          <span className="material-symbols-outlined text-score-high-text text-[16px] mt-0.5 flex-shrink-0">check_circle</span>
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {aiMatch.missingSkills?.length > 0 && (
                  <div>
                    <div className="font-mono text-[11px] font-semibold text-score-low-text uppercase tracking-[0.08em] mb-3">Gaps</div>
                    <ul className="space-y-2">
                      {aiMatch.missingSkills.map((s, i) => (
                        <li key={i} className="flex items-start gap-2 text-body-sm text-text-secondary">
                          <span className="material-symbols-outlined text-score-low-text text-[16px] mt-0.5 flex-shrink-0">info</span>
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              {aiMatch.recommendation && (
                <p className="mt-4 text-body-sm text-text-secondary italic leading-relaxed pl-3 border-l-2 border-primary-container">
                  {aiMatch.recommendation}
                </p>
              )}
            </SectionCard>
          )}

          {/* Job Details grid */}
          <SectionCard title="Job Details">
            <div className="grid grid-cols-2 gap-4 sm:gap-6">
              {[
                { label: 'Type', value: TYPE_LABELS[job.type] || job.type },
                { label: 'Location', value: job.location },
                { label: 'Posted', value: formatDate(job.created_at) },
                ...(salary ? [{ label: 'Salary', value: salary }] : []),
              ].map(({ label, value }) => (
                <div key={label}>
                  <div className="font-mono text-[11px] font-semibold text-text-muted uppercase tracking-[0.08em] mb-1">{label}</div>
                  <div className="text-body-base text-text-primary font-medium">{value}</div>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      </div>

      {/* Mobile sticky apply bar */}
      {!application && profile?.role !== 'recruiter' && user && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-surface-card border-t border-border-default px-6 py-4 z-30">
          <button onClick={() => setModalOpen(true)}
            className="w-full h-10 px-5 bg-primary-container text-white font-semibold text-[14px] rounded-lg hover:opacity-90 active:scale-[0.98] transition-all">
            Apply Now
          </button>
        </div>
      )}

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
    </>
  );
}
