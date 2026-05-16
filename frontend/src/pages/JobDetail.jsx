import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { stableMatch } from '../lib/utils';
import ApplyModal from '../components/applications/ApplyModal';
import { formatDate, formatSalary } from '../lib/utils';
import { getSavedProfile, matchSingleJob } from '../lib/aiMatchingApi';
import toast from 'react-hot-toast';

const TYPE_LABELS = {
  'full-time': 'Full-time', 'part-time': 'Part-time',
  'remote': 'Remote', 'internship': 'Internship', 'contract': 'Contract',
};

function ScoreBadge({ score, large }) {
  const cfg = score >= 90
    ? { bg: 'bg-score-high-bg', text: 'text-score-high-text', dot: 'bg-score-high-text', border: 'border-green-100' }
    : score >= 75
    ? { bg: 'bg-score-mid-bg', text: 'text-score-mid-text', dot: 'bg-score-mid-text', border: 'border-blue-100' }
    : score >= 60
    ? { bg: 'bg-score-low-bg', text: 'text-score-low-text', dot: 'bg-score-low-text', border: 'border-amber-100' }
    : { bg: 'bg-score-none-bg', text: 'text-score-none-text', dot: 'bg-score-none-text', border: 'border-border-default' };

  if (large) {
    return (
      <div className={`inline-flex items-center gap-3 px-4 py-2 rounded-xl ${cfg.bg} border ${cfg.border}`}>
        <div className={`w-2 h-2 rounded-full ${cfg.dot}`}></div>
        <span className={`font-mono font-bold text-[28px] leading-none ${cfg.text}`}>{score}<span className="text-[16px] font-normal opacity-60">%</span></span>
        <span className={`text-body-sm ${cfg.text} opacity-80`}>match</span>
      </div>
    );
  }
  return (
    <div className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full ${cfg.bg} border ${cfg.border}`}>
      <div className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`}></div>
      <span className={`font-mono text-data-label ${cfg.text}`}>{score}%</span>
    </div>
  );
}

function TypeBadge({ type }) {
  return (
    <span className="px-2.5 py-1 text-[11px] font-mono font-semibold uppercase tracking-wider border border-border-default dark:border-outline-variant text-text-secondary dark:text-text-muted rounded-full">
      {TYPE_LABELS[type] || type}
    </span>
  );
}

function SectionCard({ title, children }) {
  return (
    <div className="bg-surface-card dark:bg-surface-container border border-border-default dark:border-outline-variant rounded-lg p-6">
      <h3 className="text-data-label text-text-muted uppercase tracking-widest mb-4">{title}</h3>
      {children}
    </div>
  );
}

function SkeletonDetail() {
  return (
    <div className="max-w-3xl mx-auto px-margin-page py-10 animate-pulse">
      <div className="h-4 bg-surface-container-high dark:bg-surface-container rounded w-40 mb-8"></div>
      <div className="flex items-center gap-4 mb-6">
        <div className="w-11 h-11 rounded-lg bg-surface-container-high dark:bg-surface-container"></div>
        <div className="space-y-2">
          <div className="h-3 bg-surface-container-high dark:bg-surface-container rounded w-28"></div>
          <div className="h-6 bg-surface-container-high dark:bg-surface-container rounded w-64"></div>
        </div>
      </div>
      {[100, 85, 90, 70, 95].map((w, i) => (
        <div key={i} className="h-4 bg-surface-container-high dark:bg-surface-container rounded mb-3" style={{ width: `${w}%` }}></div>
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
    <div className="max-w-3xl mx-auto px-margin-page py-20 text-center">
      <span className="material-symbols-outlined text-[64px] text-border-strong block mb-4">search_off</span>
      <h2 className="font-bold text-[22px] text-text-primary dark:text-inverse-on-surface mb-2">Job not found</h2>
      <p className="text-text-secondary dark:text-text-muted mb-8">This role may have been removed or the link is incorrect.</p>
      <Link to="/jobs" className="inline-flex items-center gap-2 px-6 py-3 bg-primary-container text-white rounded-lg font-medium">
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
        <div className="px-4 py-3 bg-surface-container-low dark:bg-surface-container rounded-lg text-center text-body-sm text-text-secondary">
          You posted this role
        </div>
      );
    }
    if (profile?.role === 'recruiter') return null;
    if (!user) {
      return (
        <Link to="/login"
          className="block text-center px-4 py-2.5 border border-border-default dark:border-outline-variant rounded-lg text-body-base font-medium text-text-primary dark:text-inverse-on-surface hover:bg-surface-container-low transition-colors">
          Sign in to Apply
        </Link>
      );
    }
    if (application) {
      return (
        <div className="px-4 py-3 bg-score-high-bg border border-green-100 rounded-lg text-center">
          <div className="text-score-high-text font-semibold text-body-base mb-1">Application Submitted</div>
          <div className="text-text-secondary text-body-sm">{formatDate(application.applied_at)}</div>
        </div>
      );
    }
    return (
      <button onClick={() => setModalOpen(true)}
        className="w-full py-2.5 bg-primary-container text-white font-medium text-button-text rounded-lg hover:opacity-90 transition-opacity">
        Apply Now
      </button>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-margin-page py-10">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-8 text-body-sm">
        <Link to="/jobs" className="text-text-secondary dark:text-text-muted hover:text-primary transition-colors">Jobs</Link>
        <span className="material-symbols-outlined text-[14px] text-text-muted">chevron_right</span>
        <span className="text-text-primary dark:text-inverse-on-surface font-medium">{job.title}</span>
      </div>

      {/* Header */}
      <div className="flex items-start gap-4 mb-6">
        <div className="w-11 h-11 flex items-center justify-center font-bold text-lg rounded-lg bg-accent-light text-primary border border-border-default flex-shrink-0">
          {initial}
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-body-sm text-text-secondary dark:text-text-muted">{job.company}</span>
            <span className="flex items-center gap-1 text-score-high-text text-[12px] font-medium">
              <span className="material-symbols-outlined text-[14px]">verified</span>
              Verified
            </span>
          </div>
          <h1 className="font-bold text-[28px] tracking-tight text-text-primary dark:text-inverse-on-surface leading-tight">{job.title}</h1>
        </div>
      </div>

      {/* Meta row */}
      <div className="flex items-center gap-4 flex-wrap mb-8 text-body-sm text-text-secondary dark:text-text-muted">
        <div className="flex items-center gap-1">
          <span className="material-symbols-outlined text-[14px]">location_on</span>
          {job.location}
        </div>
        <TypeBadge type={job.type} />
        {salary && (
          <div className="flex items-center gap-1 font-medium text-text-primary dark:text-inverse-on-surface">
            <span className="material-symbols-outlined text-[14px]">payments</span>
            {salary}
          </div>
        )}
        <span className="text-text-muted">Posted {formatDate(job.created_at)}</span>
      </div>

      {/* Action bar card */}
      <div className="bg-surface-card dark:bg-surface-container border border-border-default dark:border-outline-variant rounded-lg p-5 mb-8 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex items-center gap-4 flex-1">
          <ScoreBadge score={match} large />
          {aiLoading && <span className="text-body-sm text-text-secondary">Calculating AI match…</span>}
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex-1 sm:flex-none sm:w-36">
            <ApplySection />
          </div>
          <button className="flex items-center gap-1 px-3 py-2.5 border border-border-default dark:border-outline-variant rounded-lg text-text-secondary dark:text-text-muted hover:text-primary transition-colors">
            <span className="material-symbols-outlined text-[18px]">bookmark</span>
          </button>
        </div>
      </div>

      {/* About the role */}
      <div className="space-y-4">
        <SectionCard title="About the role">
          <p className="text-body-base text-text-primary dark:text-inverse-on-surface leading-relaxed whitespace-pre-wrap">{job.description}</p>
        </SectionCard>

        {job.requirements && (
          <SectionCard title="Requirements">
            <div className="text-body-base text-text-secondary dark:text-text-muted leading-relaxed whitespace-pre-wrap">{job.requirements}</div>
          </SectionCard>
        )}

        {job.skills_required?.length > 0 && (
          <SectionCard title="Required Skills">
            <div className="flex flex-wrap gap-2">
              {job.skills_required.map(skill => (
                <span key={skill} className="px-3 py-1.5 bg-surface-container-low dark:bg-surface-container border border-border-default dark:border-outline-variant rounded-full font-mono text-[12px] text-text-primary dark:text-inverse-on-surface">
                  {skill}
                </span>
              ))}
            </div>
          </SectionCard>
        )}

        {/* AI Match Analysis */}
        {profile?.role === 'seeker' && aiMatch && (
          <SectionCard title="AI Match Analysis">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {aiMatch.strengths?.length > 0 && (
                <div>
                  <div className="text-data-label text-score-high-text uppercase tracking-widest mb-2">Strengths</div>
                  <ul className="space-y-1">
                    {aiMatch.strengths.map((s, i) => (
                      <li key={i} className="flex items-start gap-2 text-body-sm text-text-secondary dark:text-text-muted">
                        <span className="material-symbols-outlined text-score-high-text text-[14px] mt-0.5 flex-shrink-0">check_circle</span>
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {aiMatch.missingSkills?.length > 0 && (
                <div>
                  <div className="text-data-label text-score-low-text uppercase tracking-widest mb-2">Gaps</div>
                  <ul className="space-y-1">
                    {aiMatch.missingSkills.map((s, i) => (
                      <li key={i} className="flex items-start gap-2 text-body-sm text-text-secondary dark:text-text-muted">
                        <span className="material-symbols-outlined text-score-low-text text-[14px] mt-0.5 flex-shrink-0">cancel</span>
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </SectionCard>
        )}

        {/* Job Details */}
        <SectionCard title="Job Details">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {[
              { label: 'Type', value: TYPE_LABELS[job.type] || job.type },
              { label: 'Location', value: job.location },
              { label: 'Posted', value: formatDate(job.created_at) },
              ...(salary ? [{ label: 'Salary', value: salary }] : []),
            ].map(({ label, value }) => (
              <div key={label}>
                <div className="text-data-label text-text-muted uppercase tracking-widest mb-1">{label}</div>
                <div className="text-body-base text-text-primary dark:text-inverse-on-surface">{value}</div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

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
    </div>
  );
}
