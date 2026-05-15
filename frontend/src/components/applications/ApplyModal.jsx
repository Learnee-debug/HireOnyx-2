import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

export default function ApplyModal({ job, onClose, onSuccess }) {
  const { user } = useAuth();
  const [coverLetter, setCoverLetter] = useState('');
  const [resumeText, setResumeText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [focused, setFocused] = useState('');

  const textareaStyle = (field) => ({
    width: '100%',
    background: 'var(--bg-subtle)',
    border: `1px solid ${focused === field ? 'var(--accent)' : 'var(--border)'}`,
    borderRadius: '6px',
    color: 'var(--text-primary)',
    padding: '10px 14px',
    fontSize: '14px',
    fontFamily: field === 'resume' ? '"JetBrains Mono", monospace' : '"DM Sans", sans-serif',
    outline: 'none',
    boxSizing: 'border-box',
    resize: 'vertical',
    lineHeight: 1.7,
    boxShadow: focused === field ? '0 0 0 3px var(--accent-glow)' : 'none',
    transition: 'all 0.15s ease',
  });

  async function handleSubmit(e) {
    e.preventDefault();
    if (!resumeText.trim()) { setError('Resume text is required.'); return; }
    setError('');
    setLoading(true);

    const { data, error: err } = await supabase.from('applications').insert({
      job_id: job.id,
      seeker_id: user.id,
      cover_letter: coverLetter,
      resume_text: resumeText,
      status: 'applied',
    }).select().single();

    setLoading(false);

    if (err) {
      if (err.code === '23505') {
        setError("You've already applied to this job.");
      } else {
        setError('Failed to submit. Please try again.');
      }
      return;
    }

    onSuccess(data);
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: 'rgba(0,0,0,0.7)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px',
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        padding: '32px',
        width: '100%',
        maxWidth: '560px',
        maxHeight: '90vh',
        overflowY: 'auto',
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div>
            <h2 style={{ fontFamily: '"DM Sans"', fontWeight: 600, fontSize: '20px', color: 'var(--text-primary)', margin: 0 }}>
              Apply for {job.title}
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: '4px 0 0' }}>{job.company}</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '20px', cursor: 'pointer', padding: '0', lineHeight: 1 }}>×</button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '13px', fontWeight: 500, marginBottom: '6px' }}>
              Cover Letter <span style={{ color: 'var(--text-muted)' }}>(optional)</span>
            </label>
            <textarea rows={4} value={coverLetter} onChange={e => setCoverLetter(e.target.value)}
              placeholder="Tell us why you're a great fit..."
              style={textareaStyle('cover')}
              onFocus={() => setFocused('cover')} onBlur={() => setFocused('')}
            />
          </div>

          <div>
            <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '13px', fontWeight: 500, marginBottom: '6px' }}>
              Your Resume <span style={{ color: 'var(--accent)' }}>*</span>
            </label>
            <textarea rows={8} value={resumeText} onChange={e => setResumeText(e.target.value)}
              placeholder="Paste the full text of your resume here..."
              style={textareaStyle('resume')}
              onFocus={() => setFocused('resume')} onBlur={() => setFocused('')}
            />
          </div>

          {error && <p style={{ color: 'var(--status-rejected-text)', fontSize: '13px', margin: 0 }}>{error}</p>}

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button type="button" onClick={onClose} style={{
              background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-primary)',
              padding: '10px 20px', borderRadius: '6px', fontSize: '14px', fontWeight: 500, cursor: 'pointer',
            }}>
              Cancel
            </button>
            <button type="submit" disabled={loading} style={{
              background: loading ? 'var(--accent-dim)' : 'var(--accent)',
              color: 'var(--text-inverse)', border: 'none', borderRadius: '6px',
              padding: '10px 24px', fontSize: '14px', fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}>
              {loading ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
