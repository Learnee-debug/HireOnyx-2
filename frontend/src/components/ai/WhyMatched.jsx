/**
 * WhyMatched.jsx
 * --------------
 * Expandable "Why matched" card displayed on Job Detail.
 * Shows strengths, missing skills, recommendation, and AI reasoning.
 *
 * Props:
 *   match   {object}  result from matchSingleJob()
 *   loading {boolean}
 */

import { matchColor } from '../../lib/aiMatchingApi';
import MatchBadge from './MatchBadge';

export default function WhyMatched({ match, loading }) {
  if (loading) {
    return (
      <div className="bg-surface-card dark:bg-surface-container border border-border-default dark:border-outline-variant rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-5 h-5 border-2 border-border-default border-t-primary rounded-full animate-spin"></div>
          <span className="text-body-sm text-text-secondary dark:text-text-muted">Analyzing your match…</span>
        </div>
        <div className="space-y-2 animate-pulse">
          {[80, 60, 70].map((w, i) => (
            <div key={i} className="h-3 bg-surface-container-high dark:bg-surface-container rounded" style={{ width: `${w}%` }}></div>
          ))}
        </div>
      </div>
    );
  }

  if (!match) return null;

  return (
    <div className="bg-surface-card dark:bg-surface-container border border-border-default dark:border-outline-variant rounded-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <div className="text-data-label text-text-muted uppercase tracking-widest mb-2">AI Match Analysis</div>
          <div className="font-mono font-bold text-[40px] leading-none" style={{ color: matchColor(match.matchScore) }}>
            {match.matchScore}<span className="text-[20px] text-text-muted font-normal">%</span>
          </div>
        </div>
        <MatchBadge score={match.matchScore} showRing size="lg" />
      </div>

      {/* Recommendation */}
      {match.recommendation && (
        <p className="text-body-sm text-text-secondary dark:text-text-muted italic leading-relaxed mb-5 pl-3 border-l-2 border-primary">
          {match.recommendation}
        </p>
      )}

      {/* Strengths */}
      {match.strengths?.length > 0 && (
        <div className="mb-4">
          <div className="text-data-label text-score-high-text uppercase tracking-widest mb-2">Strengths</div>
          <div className="flex flex-col gap-2">
            {match.strengths.map((s, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-score-high-text font-bold flex-shrink-0">+</span>
                <span className="text-body-sm text-text-secondary dark:text-text-muted leading-relaxed">{s}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Missing skills */}
      {match.missingSkills?.length > 0 && (
        <div className="mb-4">
          <div className="text-data-label text-error uppercase tracking-widest mb-2">Missing skills</div>
          <div className="flex flex-wrap gap-2">
            {match.missingSkills.map((s, i) => (
              <span key={i} className="px-2.5 py-1 bg-error-container/20 border border-error/20 text-error font-mono text-[11px] rounded-full">
                {s}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* AI reasoning */}
      {match.reason && (
        <div className="border-t border-border-default dark:border-outline-variant pt-4">
          <div className="text-data-label text-text-muted uppercase tracking-widest mb-2">Why this match</div>
          <p className="text-body-sm text-text-secondary dark:text-text-muted leading-relaxed">{match.reason}</p>
        </div>
      )}

      {!match.aiAvailable && (
        <div className="mt-3 font-mono text-[11px] text-text-muted">
          * Based on keyword overlap only (AI analysis unavailable)
        </div>
      )}
    </div>
  );
}
