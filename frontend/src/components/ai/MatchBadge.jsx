/**
 * MatchBadge.jsx
 * --------------
 * Reusable component to display a job match score.
 * Used on job cards, job detail sidebar, and dashboard.
 *
 * Props:
 *   score    {number}  0-100
 *   size     'sm' | 'md' | 'lg'   default 'md'
 *   showRing {boolean} show the SVG circular progress ring
 */

import { matchColor, matchGlow } from '../../lib/aiMatchingApi';

export default function MatchBadge({ score, size = 'md', showRing = false }) {
  if (score == null) return null;

  const color = matchColor(score);
  const glow = matchGlow(score);

  // ── Ring variant (used on job cards / detail) ─────────────
  if (showRing) {
    const r = 20, c = 2 * Math.PI * r;
    const off = c - (score / 100) * c;
    const dim = size === 'lg' ? 56 : size === 'sm' ? 36 : 48;
    const fontSize = size === 'lg' ? 13 : size === 'sm' ? 9 : 11;

    return (
      <div style={{ position: 'relative', width: dim, height: dim, flexShrink: 0 }}>
        <svg width={dim} height={dim} viewBox="0 0 56 56"
          style={{ filter: `drop-shadow(0 0 5px ${color}55)` }}>
          <defs>
            <linearGradient id={`mbg-${score}`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#4F8EF7" />
              <stop offset="100%" stopColor={color} />
            </linearGradient>
          </defs>
          <circle cx="28" cy="28" r={r} stroke="rgba(255,255,255,0.08)" strokeWidth="4" fill="none" />
          <circle cx="28" cy="28" r={r}
            stroke={`url(#mbg-${score})`} strokeWidth="4" fill="none"
            strokeDasharray={c} strokeDashoffset={off}
            strokeLinecap="round" transform="rotate(-90 28 28)"
          />
        </svg>
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color, fontSize, fontWeight: 700, fontFamily: '"JetBrains Mono", monospace',
        }}>{score}</div>
      </div>
    );
  }

  // ── Pill variant (compact) ────────────────────────────────
  const px = size === 'lg' ? '10px 16px' : size === 'sm' ? '3px 8px' : '4px 10px';
  const fs = size === 'lg' ? 13 : size === 'sm' ? 10 : 11;

  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: px, borderRadius: 999,
      background: `${color}18`, border: `1px solid ${color}55`,
      color, fontFamily: '"JetBrains Mono", monospace',
      fontSize: fs, fontWeight: 600, whiteSpace: 'nowrap',
      boxShadow: glow,
    }}>
      {size !== 'sm' && <span style={{ fontSize: fs - 1 }}>✦</span>}
      {score}% match
    </span>
  );
}
