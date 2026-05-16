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

import { SURFACE, LABEL } from '../../lib/design';
import { matchColor } from '../../lib/aiMatchingApi';
import MatchBadge from './MatchBadge';

export default function WhyMatched({ match, loading }) {
  if (loading) {
    return (
      <div style={{ ...SURFACE, padding: 24 }}>
        <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <div style={{ width: 20, height: 20, border: '2px solid rgba(255,255,255,0.1)', borderTopColor: '#4F8EF7', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
          <span style={{ color: '#94A3B8', fontSize: 14 }}>Analyzing your match…</span>
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
        {[80, 60, 70].map((w, i) => (
          <div key={i} style={{ height: 13, width: `${w}%`, background: '#161D2E', borderRadius: 5, marginBottom: 8, animation: 'pulse 1.5s infinite' }} />
        ))}
      </div>
    );
  }

  if (!match) return null;

  const color = matchColor(match.matchScore);

  return (
    <div style={{ ...SURFACE, padding: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <div style={{ ...LABEL, marginBottom: 6 }}>AI Match Analysis</div>
          <div style={{ fontSize: 44, fontWeight: 700, color, fontFamily: '"JetBrains Mono"', lineHeight: 1 }}>
            {match.matchScore}<span style={{ fontSize: 20, color: '#4B5563', fontWeight: 400 }}>%</span>
          </div>
        </div>
        <MatchBadge score={match.matchScore} showRing size="lg" />
      </div>

      {/* Recommendation */}
      {match.recommendation && (
        <p style={{ color: '#94A3B8', fontSize: 13, lineHeight: 1.7, fontStyle: 'italic', margin: '0 0 20px', borderLeft: `2px solid ${color}`, paddingLeft: 12 }}>
          {match.recommendation}
        </p>
      )}

      {/* Strengths */}
      {match.strengths?.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ ...LABEL, color: '#00C2A8', marginBottom: 10 }}>Strengths</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {match.strengths.map((s, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                <span style={{ color: '#00C2A8', fontWeight: 700, flexShrink: 0 }}>+</span>
                <span style={{ color: '#00C2A8', fontSize: 13, lineHeight: 1.5 }}>{s}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Missing skills */}
      {match.missingSkills?.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ ...LABEL, color: '#E05252', marginBottom: 10 }}>Missing skills</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {match.missingSkills.map((s, i) => (
              <span key={i} style={{
                padding: '4px 10px', borderRadius: 999,
                background: 'rgba(224,82,82,0.10)', border: '1px solid rgba(224,82,82,0.30)',
                color: '#E05252', fontFamily: '"JetBrains Mono"', fontSize: 11,
              }}>{s}</span>
            ))}
          </div>
        </div>
      )}

      {/* AI reasoning */}
      {match.reason && (
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 16 }}>
          <div style={{ ...LABEL, marginBottom: 8 }}>Why this match</div>
          <p style={{ color: '#94A3B8', fontSize: 13, lineHeight: 1.7, margin: 0 }}>{match.reason}</p>
        </div>
      )}

      {!match.aiAvailable && (
        <div style={{ marginTop: 12, fontSize: 11, color: '#4B5563', fontFamily: '"JetBrains Mono"' }}>
          * Based on keyword overlap only (AI analysis unavailable)
        </div>
      )}
    </div>
  );
}
