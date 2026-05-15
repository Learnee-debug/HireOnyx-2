import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { SURFACE, BTN_PRIMARY } from '../lib/design';
import { usePageTitle } from '../lib/usePageTitle';

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const INPUT = { padding: '11px 14px', borderRadius: 10, background: '#161D2E', border: '1px solid rgba(255,255,255,0.10)', color: '#F0F4FF', fontSize: 14, outline: 'none', width: '100%', boxSizing: 'border-box', fontFamily: 'inherit', transition: 'border-color 0.15s ease' };
  const focus = e => e.target.style.borderColor = '#4F8EF7';
  const blur = e => e.target.style.borderColor = 'rgba(255,255,255,0.10)';

  async function handleSubmit(e) {
    e.preventDefault();
    if (!role) { setError('Please select your role.'); return; }
    setError(''); setLoading(true);
    const res = await signup(email, password, fullName, role);
    if (res.error) { setLoading(false); setError(res.error.message || 'Signup failed.'); return; }
    await new Promise(r => setTimeout(r, 600));
    setLoading(false);
    navigate(role === 'recruiter' ? '/recruiter/dashboard' : '/dashboard');
  }

  return (
    <div style={{ minHeight: '100vh', background: '#080C14', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: -100, right: '20%', width: 600, height: 600, background: 'radial-gradient(circle, rgba(0,194,168,0.07) 0%, transparent 60%)', pointerEvents: 'none' }} />

      <div style={{ ...SURFACE, width: '100%', maxWidth: 460, padding: 40 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 32 }}>
          <div style={{ width: 28, height: 28, borderRadius: 7, background: 'linear-gradient(135deg, #4F8EF7 0%, #00C2A8 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="13" height="13" viewBox="0 0 15 15" fill="none"><path d="M2 11L5.5 5L7.5 8.5L10 6L13 11" stroke="#080C14" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          <span style={{ color: '#F0F4FF', fontWeight: 700, fontSize: 16 }}>HireOnyx</span>
        </div>

        <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.02em', color: '#F0F4FF', margin: '0 0 8px' }}>Create your account</h1>
        <p style={{ color: '#94A3B8', fontSize: 14, margin: '0 0 28px' }}>Join thousands hiring and being hired on HireOnyx.</p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Full name" required style={INPUT} onFocus={focus} onBlur={blur} />
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" required style={INPUT} onFocus={focus} onBlur={blur} />
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password (min. 6 chars)" required style={INPUT} onFocus={focus} onBlur={blur} />

          {/* Role selector */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#94A3B8', marginBottom: 12 }}>I am a</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[
                { value: 'seeker', label: 'Job Seeker', desc: "I'm looking for a job", accent: '#4F8EF7' },
                { value: 'recruiter', label: 'Recruiter', desc: 'I want to hire talent', accent: '#4F8EF7' },
              ].map(opt => (
                <button key={opt.value} type="button" onClick={() => setRole(opt.value)} style={{
                  padding: '16px 14px', borderRadius: 12, textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit',
                  background: role === opt.value ? '#161D2E' : '#161D2E',
                  border: role === opt.value ? `1px solid ${opt.accent}` : '1px solid rgba(255,255,255,0.08)',
                  borderTop: role === opt.value ? `3px solid ${opt.accent}` : '3px solid transparent',
                  transition: 'all 0.15s ease',
                }}>
                  <div style={{ color: '#94A3B8', fontSize: 12, marginBottom: 4 }}>{opt.desc}</div>
                  <div style={{ color: role === opt.value ? opt.accent : '#F0F4FF', fontSize: 14, fontWeight: 600 }}>{opt.label}</div>
                </button>
              ))}
            </div>
          </div>

          {error && <p style={{ color: '#E05252', fontSize: 13, margin: 0 }}>{error}</p>}

          <button type="submit" disabled={loading || !role} style={{
            ...BTN_PRIMARY, padding: 13, marginTop: 4,
            opacity: (!role || loading) ? 0.5 : 1,
            cursor: (!role || loading) ? 'not-allowed' : 'pointer',
          }}>
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', color: '#94A3B8', fontSize: 13, marginTop: 24 }}>
          Already have an account? <Link to="/login" style={{ color: '#4F8EF7', fontWeight: 500 }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
