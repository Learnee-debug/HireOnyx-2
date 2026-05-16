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
      <div className="bg-surface-card border border-border-default rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-5 h-5 border-2 border-border-default border-t-primary rounded-full animate-spin" />
          <span className="text-body-sm text-text-secondary">Analyzing your match…</span>
        </div>
        <div className="space-y-2 animate-pulse">
          {[80, 60, 70].map((w, i) => (
            <div key={i} className="h-3 bg-surface-container-high rounded" style={{ width: `${w}%` }} />
          ))}
        </div>
      </div>
    );
  }

  if (!match) return null;

  return (
    <div className="bg-surface-card border border-border-default rounded-xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <div className="font-mono text-[11px] font-semibold text-text-muted uppercase tracking-[0.08em] mb-2">AI Match Analysis</div>
          <div className="font-mono font-bold leading-none" style={{ fontSize: '40px', color: matchColor(match.matchScore) }}>
            {match.matchScore}<span className="text-[20px] text-text-muted font-normal">%</span>
          </div>
        </div>
        <MatchBadge score={match.matchScore} showRing size="lg" />
      </div>

      {/* Recommendation */}
      {match.recommendation && (
        <p className="text-body-sm text-text-secondary italic leading-relaxed mb-5 pl-3 border-l-2 border-primary-container">
          {match.recommendation}
        </p>
      )}

      {/* Two-column strengths / gaps */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-4">
        {/* Strengths */}
        {match.strengths?.length > 0 && (
          <div>
            <div className="font-mono text-[11px] font-semibold text-score-high-text uppercase tracking-[0.08em] mb-3">Strengths</div>
            <div className="flex flex-col gap-2">
              {match.strengths.map((s, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-score-high-text text-[16px] flex-shrink-0 mt-0.5">check_circle</span>
                  <span className="text-body-sm text-text-secondary leading-relaxed">{s}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Missing skills */}
        {match.missingSkills?.length > 0 && (
          <div>
            <div className="font-mono text-[11px] font-semibold text-score-low-text uppercase tracking-[0.08em] mb-3">Gaps</div>
            <div className="flex flex-col gap-2">
              {match.missingSkills.map((s, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-score-low-text text-[16px] flex-shrink-0 mt-0.5">info</span>
                  <span className="text-body-sm text-text-secondary leading-relaxed">{s}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* AI reasoning */}
      {match.reason && (
        <div className="border-t border-border-default pt-4">
          <div className="font-mono text-[11px] font-semibold text-text-muted uppercase tracking-[0.08em] mb-2">Why this match</div>
          <p className="text-body-sm text-text-secondary leading-relaxed">{match.reason}</p>
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
