import { useState } from 'react';

export default function ResumeAnalyzer({ job }) {
  const [resumeText, setResumeText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [focused, setFocused] = useState(false);

  async function handleAnalyze() {
    if (!resumeText.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/ai/analyze-resume`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resume_text: resumeText,
          job_title: job.title,
          job_description: job.description,
          requirements: job.requirements,
          skills_required: job.skills_required,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      setResult(data.data);
    } catch (err) {
      setError(err.message || 'Failed to analyze resume. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const scoreColor = (score) => {
    if (score >= 70) return 'var(--status-selected)';
    if (score >= 40) return 'var(--accent)';
    return 'var(--status-rejected-text)';
  };

  return (
    <div style={{
      borderTop: '1px solid var(--border)',
      paddingTop: '48px',
      marginTop: '48px',
    }}>
      <h2 style={{
        fontFamily: '"DM Sans", sans-serif',
        fontWeight: 600,
        fontSize: '22px',
        color: 'var(--text-primary)',
        margin: '0 0 8px',
      }}>Check Your Fit</h2>
      <p style={{ color: 'var(--text-secondary)', fontSize: '15px', margin: '0 0 24px' }}>
        Paste your resume below to get an AI-powered match score for this role.
      </p>

      <textarea
        value={resumeText}
        onChange={e => setResumeText(e.target.value)}
        rows={8}
        placeholder="Paste your resume text here..."
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: '100%',
          background: 'var(--bg-subtle)',
          border: `1px solid ${focused ? 'var(--accent)' : 'var(--border)'}`,
          borderRadius: '6px',
          color: 'var(--text-primary)',
          padding: '12px 14px',
          fontSize: '13px',
          fontFamily: '"JetBrains Mono", monospace',
          outline: 'none',
          boxSizing: 'border-box',
          resize: 'vertical',
          lineHeight: 1.7,
          boxShadow: focused ? '0 0 0 3px var(--accent-glow)' : 'none',
          transition: 'all 0.15s ease',
          marginBottom: '16px',
        }}
      />

      <button
        onClick={handleAnalyze}
        disabled={loading || !resumeText.trim()}
        style={{
          background: (loading || !resumeText.trim()) ? 'var(--bg-subtle)' : 'var(--accent)',
          color: (loading || !resumeText.trim()) ? 'var(--text-muted)' : 'var(--text-inverse)',
          border: 'none',
          borderRadius: '6px',
          padding: '11px 32px',
          fontSize: '15px',
          fontWeight: 600,
          cursor: (loading || !resumeText.trim()) ? 'not-allowed' : 'pointer',
          width: '160px',
          transition: 'all 0.15s ease',
        }}
      >
        {loading ? 'Analyzing...' : 'Analyze'}
      </button>

      {loading && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '24px', color: 'var(--text-secondary)' }}>
          <div style={{
            width: '18px', height: '18px', border: '2px solid var(--border)', borderTopColor: 'var(--accent)',
            borderRadius: '50%', animation: 'spin 0.7s linear infinite',
          }} />
          <span style={{ fontSize: '14px' }}>Analyzing your resume...</span>
        </div>
      )}

      {error && (
        <p style={{ color: 'var(--status-rejected-text)', fontSize: '14px', marginTop: '16px' }}>{error}</p>
      )}

      {result && (
        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: '10px',
          padding: '28px',
          marginTop: '28px',
        }}>
          {/* Score */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: '11px',
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginBottom: '8px',
            }}>Match Score</div>
            <div style={{
              fontFamily: '"DM Sans", sans-serif',
              fontWeight: 600,
              fontSize: '52px',
              color: scoreColor(result.match_score),
              lineHeight: 1,
            }}>
              {result.match_score}<span style={{ fontSize: '22px', color: 'var(--text-muted)', fontWeight: 400 }}> / 100</span>
            </div>
          </div>

          {/* Strengths & Gaps */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
            <div>
              <div style={{ fontFamily: '"DM Sans"', fontWeight: 600, fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '12px' }}>Strengths</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {result.strengths?.map((s, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                    <span style={{ color: 'var(--status-selected)', fontWeight: 700, flexShrink: 0 }}>✓</span>
                    <span style={{ color: 'var(--status-selected)', fontSize: '13px', lineHeight: 1.5 }}>{s}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div style={{ fontFamily: '"DM Sans"', fontWeight: 600, fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '12px' }}>Gaps</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {result.gaps?.map((g, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                    <span style={{ color: 'var(--status-rejected-text)', fontWeight: 700, flexShrink: 0 }}>✗</span>
                    <span style={{ color: 'var(--status-rejected-text)', fontSize: '13px', lineHeight: 1.5 }}>{g}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recommendation */}
          {result.recommendation && (
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '20px' }}>
              <span style={{ fontFamily: '"DM Sans"', fontWeight: 600, fontSize: '13px', color: 'var(--text-secondary)' }}>Recommendation: </span>
              <span style={{ color: 'var(--text-secondary)', fontSize: '14px', fontStyle: 'italic' }}>{result.recommendation}</span>
            </div>
          )}
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
