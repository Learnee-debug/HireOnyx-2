import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { daysAgo } from '../../lib/utils';
import { getSavedProfile } from '../../lib/aiMatchingApi';
import ResumeUpload from '../../components/ai/ResumeUpload';
import Footer from '../../components/layout/Footer';

const stageConfig = {
  applied:   { label: 'Applied',     dot: 'bg-text-muted',            text: 'text-text-secondary', bg: 'bg-surface-container-low', border: 'border-border-default' },
  reviewing: { label: 'In Review',   dot: 'bg-score-mid-text',        text: 'text-score-mid-text', bg: 'bg-score-mid-bg', border: 'border-blue-100' },
  selected:  { label: 'Interviewing',dot: 'bg-score-high-text',       text: 'text-score-high-text', bg: 'bg-score-high-bg', border: 'border-green-100' },
  rejected:  { label: 'Rejected',    dot: 'bg-error',                 text: 'text-error', bg: 'bg-error-container/30', border: 'border-error/20' },
};

function StagePill({ status }) {
  const cfg = stageConfig[status] || stageConfig.applied;
  return (
    <span className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-data-label font-semibold ${cfg.bg} ${cfg.text} border ${cfg.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`}></span>
      {cfg.label}
    </span>
  );
}

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

  const appliedCount = apps.filter(a => a.status === 'applied').length;
  const reviewCount = apps.filter(a => a.status === 'reviewing').length;
  const interviewCount = apps.filter(a => a.status === 'selected').length;

  return (
    <div className="min-h-screen">
      <div className="max-w-[1280px] mx-auto px-margin-page pt-10 pb-20">

        {/* Page header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="font-bold text-[26px] text-text-primary dark:text-inverse-on-surface">My Applications</h1>
            <div className="flex items-center gap-3 mt-2 text-body-sm text-text-secondary dark:text-text-muted flex-wrap">
              <span>{apps.length} applied</span>
              <span>·</span>
              <span>{reviewCount} in review</span>
              <span>·</span>
              <span>{interviewCount} interviewing</span>
            </div>
          </div>
          <Link to="/jobs" className="flex items-center gap-1 text-body-sm font-medium text-primary hover:underline flex-shrink-0">
            Browse Jobs <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </Link>
        </div>

        {/* AI Resume Section */}
        <div className="mb-8">
          {resumeProfile ? (
            <div className="flex items-center gap-4 px-5 py-4 bg-score-high-bg border border-green-100 rounded-lg">
              <span className="material-symbols-outlined text-score-high-text text-[22px]">description</span>
              <div>
                <div className="font-semibold text-body-base text-score-high-text">
                  Resume active — {resumeProfile.skills.length} skills detected
                </div>
                <div className="text-body-sm text-text-secondary mt-0.5">
                  AI match scores shown on all job listings. Re-upload anytime.
                </div>
              </div>
              <Link to="/jobs" className="ml-auto flex items-center gap-1 text-body-sm font-medium text-primary hover:underline flex-shrink-0">
                Browse matched jobs <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              </Link>
            </div>
          ) : (
            <div className="bg-surface-card dark:bg-surface-container border border-border-default dark:border-outline-variant rounded-lg p-5">
              <div className="text-data-label text-text-muted uppercase tracking-widest mb-3">AI Match — Upload Your Resume</div>
              <ResumeUpload compact onParsed={(p) => { setResumeProfile(p); }} />
              <p className="text-body-sm text-text-muted mt-3">
                Upload once to see AI match scores on every job listing. Stored locally, never shared.
              </p>
            </div>
          )}
        </div>

        {/* Applications Table */}
        {loading ? (
          <div className="bg-surface-card dark:bg-surface-container border border-border-default dark:border-outline-variant rounded-lg divide-y divide-border-default dark:divide-outline-variant">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-margin-page py-4 animate-pulse">
                <div className="w-9 h-9 rounded-lg bg-surface-container-high dark:bg-surface-container flex-shrink-0"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-surface-container-high dark:bg-surface-container rounded w-48"></div>
                  <div className="h-3 bg-surface-container-high dark:bg-surface-container rounded w-28"></div>
                </div>
                <div className="h-6 w-20 bg-surface-container-high dark:bg-surface-container rounded-full"></div>
              </div>
            ))}
          </div>
        ) : apps.length === 0 ? (
          <div className="bg-surface-card dark:bg-surface-container border border-border-default dark:border-outline-variant rounded-lg flex flex-col items-center justify-center py-20 gap-4">
            <span className="material-symbols-outlined text-[48px] text-border-strong">work_outline</span>
            <p className="text-body-base text-text-secondary dark:text-text-muted">You haven't applied to anything yet.</p>
            <button onClick={() => navigate('/jobs')}
              className="px-6 py-2.5 bg-primary-container text-white rounded-lg text-button-text font-medium hover:opacity-90 transition-opacity">
              Browse roles
            </button>
          </div>
        ) : (
          <>
            {/* Column headers */}
            <div className="hidden md:grid grid-cols-[minmax(0,2fr)_1.5fr_1fr_1fr_auto] px-margin-page py-2 gap-4 mb-1">
              {['ROLE', 'COMPANY', 'STAGE', 'APPLIED', ''].map((h, i) => (
                <span key={i} className="text-data-label text-text-muted uppercase tracking-widest">{h}</span>
              ))}
            </div>
            <div className="bg-surface-card dark:bg-surface-container border border-border-default dark:border-outline-variant rounded-lg divide-y divide-border-default dark:divide-outline-variant overflow-hidden">
              {apps.map(a => {
                const initial = a.jobs?.company?.[0]?.toUpperCase() || '?';
                return (
                  <div key={a.id} onClick={() => navigate(`/jobs/${a.job_id}`)}
                    className="grid grid-cols-1 md:grid-cols-[minmax(0,2fr)_1.5fr_1fr_1fr_auto] items-center px-margin-page py-4 gap-4 hover:bg-surface-container-low dark:hover:bg-surface-container-high transition-colors cursor-pointer group">
                    {/* Role */}
                    <div>
                      <div className="font-medium text-[14px] text-text-primary dark:text-inverse-on-surface group-hover:text-primary transition-colors">{a.jobs?.title}</div>
                      <div className="text-body-sm text-text-secondary dark:text-text-muted md:hidden">{a.jobs?.company} · {a.jobs?.location}</div>
                    </div>
                    {/* Company */}
                    <div className="hidden md:flex items-center gap-3">
                      <div className="w-7 h-7 flex items-center justify-center font-bold text-[11px] rounded bg-accent-light text-primary border border-border-default flex-shrink-0">
                        {initial}
                      </div>
                      <span className="text-body-sm text-text-secondary dark:text-text-muted">{a.jobs?.company}</span>
                    </div>
                    {/* Stage */}
                    <div><StagePill status={a.status} /></div>
                    {/* Applied */}
                    <div className="hidden md:block font-mono text-[12px] text-text-muted">{daysAgo(a.applied_at)}</div>
                    {/* Action */}
                    <div className="hidden md:block">
                      <span className="text-body-sm font-medium text-primary flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        View <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
      <Footer />
    </div>
  );
}
