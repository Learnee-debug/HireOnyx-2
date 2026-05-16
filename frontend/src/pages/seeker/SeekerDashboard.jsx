import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { daysAgo } from '../../lib/utils';
import { getSavedProfile } from '../../lib/aiMatchingApi';
import ResumeUpload from '../../components/ai/ResumeUpload';
import Footer from '../../components/layout/Footer';

const stageConfig = {
  applied:   { label: 'Applied',      dot: 'bg-text-muted',       text: 'text-text-secondary', bg: 'bg-surface-container-low',  border: 'border-border-default' },
  reviewing: { label: 'In Review',    dot: 'bg-score-mid-text',   text: 'text-score-mid-text', bg: 'bg-score-mid-bg',           border: 'border-score-mid-text/30' },
  selected:  { label: 'Interviewing', dot: 'bg-score-high-text',  text: 'text-score-high-text', bg: 'bg-score-high-bg',         border: 'border-score-high-text/30' },
  rejected:  { label: 'Rejected',     dot: 'bg-error',            text: 'text-error',           bg: 'bg-error-container/30',    border: 'border-error/20' },
};

function StagePill({ status }) {
  const cfg = stageConfig[status] || stageConfig.applied;
  return (
    <span className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-data-label font-semibold ${cfg.bg} ${cfg.text} border ${cfg.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

function SkeletonRow() {
  return (
    <div className="flex items-center px-4 gap-3 min-h-[64px] py-3 border-b border-border-default last:border-0 animate-pulse md:grid md:grid-cols-[minmax(0,2fr)_1.5fr_1fr_1fr_auto] md:px-6 md:gap-4 md:min-h-0 md:h-row-height md:py-0">
      <div className="flex-1 space-y-1.5 min-w-0">
        <div className="h-3.5 bg-surface-container-high rounded w-40" />
        <div className="h-2.5 bg-surface-container-high rounded w-24 md:hidden" />
      </div>
      <div className="hidden md:flex items-center gap-3">
        <div className="w-7 h-7 rounded bg-surface-container-high flex-shrink-0" />
        <div className="h-3 bg-surface-container-high rounded w-24" />
      </div>
      <div className="hidden md:block h-5 bg-surface-container-high rounded-full w-20" />
      <div className="hidden md:block h-3 bg-surface-container-high rounded w-16 font-mono" />
      <div className="h-5 bg-surface-container-high rounded-full w-20 flex-shrink-0" />
    </div>
  );
}

const AVATAR_COLORS = [
  'bg-accent-light text-primary',
  'bg-surface-container-high text-text-secondary',
  'bg-score-mid-bg text-score-mid-text',
  'bg-score-high-bg text-score-high-text',
];

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
    <div className="min-h-screen bg-page-bg">
      <div className="max-w-[1280px] mx-auto px-4 md:px-margin-page pt-8 md:pt-10 pb-24 md:pb-20">

        {/* Page header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="font-bold text-[26px] text-text-primary">My Applications</h1>
            <div className="flex items-center gap-3 mt-2 text-body-sm text-text-secondary flex-wrap">
              <span className="font-medium text-text-primary">{apps.length}</span>
              <span className="text-text-muted">applied</span>
              <span className="text-border-strong">·</span>
              <span className="font-medium text-text-primary">{reviewCount}</span>
              <span className="text-text-muted">in review</span>
              <span className="text-border-strong">·</span>
              <span className="font-medium text-text-primary">{interviewCount}</span>
              <span className="text-text-muted">interviewing</span>
            </div>
          </div>
          <Link to="/jobs"
            className="flex items-center gap-1 text-body-sm font-medium text-primary hover:underline flex-shrink-0">
            Browse Jobs
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </Link>
        </div>

        {/* AI Resume Section */}
        <div className="mb-8">
          {resumeProfile ? (
            <div className="flex items-center gap-4 px-5 py-4 bg-score-high-bg border border-score-high-text/20 rounded-xl">
              <div className="relative flex h-2.5 w-2.5 flex-shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-score-high-text opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-score-high-text" />
              </div>
              <span className="material-symbols-outlined text-score-high-text text-[22px] flex-shrink-0">description</span>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-body-base text-score-high-text">
                  Resume active — {resumeProfile.skills?.length ?? 0} skills detected
                </div>
                <div className="text-body-sm text-text-secondary mt-0.5">
                  AI match scores shown on all job listings. Re-upload anytime.
                </div>
              </div>
              <Link to="/jobs"
                className="flex items-center gap-1 text-body-sm font-medium text-primary hover:underline flex-shrink-0">
                Browse matched jobs
                <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              </Link>
            </div>
          ) : (
            <div className="bg-surface-card border border-border-default rounded-xl p-5">
              <div className="font-mono text-[11px] font-semibold text-text-muted uppercase tracking-[0.08em] mb-3">
                AI Match — Upload Your Resume
              </div>
              <ResumeUpload compact onParsed={(p) => { setResumeProfile(p); }} />
              <p className="text-body-sm text-text-muted mt-3">
                Upload once to see AI match scores on every job listing. Stored locally, never shared.
              </p>
            </div>
          )}
        </div>

        {/* Applications Table */}
        {loading ? (
          <div className="bg-surface-card border border-border-default rounded-xl overflow-hidden">
            {/* Table header skeleton */}
            <div className="hidden md:grid grid-cols-[minmax(0,2fr)_1.5fr_1fr_1fr_auto] h-8 bg-surface-container-low border-b border-border-default px-6 gap-4 items-center">
              {['ROLE', 'COMPANY', 'STAGE', 'APPLIED', ''].map((h, i) => (
                <span key={i} className="font-mono text-[11px] font-semibold text-text-muted uppercase tracking-[0.06em]">{h}</span>
              ))}
            </div>
            {Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)}
          </div>
        ) : apps.length === 0 ? (
          <div className="bg-surface-card border border-border-default rounded-xl flex flex-col items-center justify-center py-20 gap-4">
            <p className="text-body-base text-text-secondary">You haven't applied to anything yet.</p>
            <p className="text-body-sm text-text-muted">Start exploring open roles and submit your first application.</p>
            <Link to="/jobs"
              className="h-10 px-5 bg-primary-container text-white font-semibold text-[14px] rounded-lg hover:opacity-90 active:scale-[0.98] transition-all inline-flex items-center gap-2">
              Browse roles →
            </Link>
          </div>
        ) : (
          <div className="bg-surface-card border border-border-default rounded-xl overflow-hidden">
            {/* Column headers */}
            <div className="hidden md:grid grid-cols-[minmax(0,2fr)_1.5fr_1fr_1fr_auto] h-8 bg-surface-container-low border-b border-border-default px-6 gap-4 items-center">
              {['ROLE', 'COMPANY', 'STAGE', 'APPLIED', ''].map((h, i) => (
                <span key={i} className="font-mono text-[11px] font-semibold text-text-muted uppercase tracking-[0.06em]">{h}</span>
              ))}
            </div>

            <div className="divide-y divide-border-default">
              {apps.map(a => {
                const initial = a.jobs?.company?.[0]?.toUpperCase() || '?';
                const colorCls = AVATAR_COLORS[initial.charCodeAt(0) % AVATAR_COLORS.length];
                return (
                  <div key={a.id} onClick={() => navigate(`/jobs/${a.job_id}`)}
                    className="flex items-center px-4 gap-3 min-h-[64px] py-3 hover:bg-surface-container-low transition-colors cursor-pointer group md:grid md:grid-cols-[minmax(0,2fr)_1.5fr_1fr_1fr_auto] md:px-6 md:gap-4 md:min-h-0 md:h-row-height md:py-0">
                    {/* Role — flex-1 on mobile */}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-[14px] text-text-primary group-hover:text-primary transition-colors truncate">
                        {a.jobs?.title}
                      </div>
                      <div className="text-[12px] text-text-secondary truncate">
                        {a.jobs?.company}{a.jobs?.location ? ` · ${a.jobs?.location}` : ''}
                      </div>
                    </div>
                    {/* Company — desktop only */}
                    <div className="hidden md:flex items-center gap-3">
                      <div className={`w-7 h-7 flex items-center justify-center font-bold text-[11px] rounded border border-border-default flex-shrink-0 ${colorCls}`}>
                        {initial}
                      </div>
                      <span className="text-body-sm text-text-secondary truncate">{a.jobs?.company}</span>
                    </div>
                    {/* Stage — always visible, flex-shrink-0 on mobile */}
                    <div className="flex-shrink-0"><StagePill status={a.status} /></div>
                    {/* Applied — desktop only */}
                    <div className="hidden md:block font-mono text-[12px] text-text-muted">{daysAgo(a.applied_at)}</div>
                    {/* Action — desktop only */}
                    <div className="hidden md:block">
                      <span className="text-body-sm font-medium text-primary flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        View <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <Footer />

      {/* Mobile bottom tab bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-surface-container-lowest border-t border-border-default flex z-50">
        {[
          { icon: 'work', label: 'Jobs', to: '/jobs' },
          { icon: 'mail', label: 'Messages', to: '/dashboard' },
          { icon: 'analytics', label: 'Analytics', to: '/dashboard' },
          { icon: 'account_circle', label: 'Profile', to: '/dashboard' },
        ].map(tab => (
          <Link key={tab.label} to={tab.to}
            className="flex-1 flex flex-col items-center justify-center py-3 gap-0.5 text-text-secondary hover:text-primary transition-colors">
            <span className="material-symbols-outlined text-[22px]">{tab.icon}</span>
            <span className="text-[10px] font-medium">{tab.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
