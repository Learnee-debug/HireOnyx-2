import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { SURFACE, BTN_PRIMARY } from '../lib/design';
import { usePageTitle } from '../lib/usePageTitle';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const INPUT = { padding: '11px 14px', borderRadius: 10, background: '#161D2E', border: '1px solid rgba(255,255,255,0.10)', color: '#F0F4FF', fontSize: 14, outline: 'none', width: '100%', boxSizing: 'border-box', fontFamily: 'inherit', transition: 'border-color 0.15s ease' };

  async function handleSubmit(e) {
    e.preventDefault();
    setError(''); setLoading(true);
    const res = await login(email, password);
    setLoading(false);
    if (res.error) { setError(res.error.message || 'Invalid credentials.'); return; }
    navigate(res.profile?.role === 'recruiter' ? '/recruiter/dashboard' : '/dashboard');
  }

  return (
    <div style={{ minHeight: '100vh', background: '#080C14', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: -100, left: '30%', width: 600, height: 600, background: 'radial-gradient(circle, rgba(79,142,247,0.07) 0%, transparent 60%)', pointerEvents: 'none' }} />

      <div style={{ ...SURFACE, width: '100%', maxWidth: 420, padding: 40 }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 32 }}>
          <div style={{ width: 28, height: 28, borderRadius: 7, background: 'linear-gradient(135deg, #4F8EF7 0%, #00C2A8 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="13" height="13" viewBox="0 0 15 15" fill="none"><path d="M2 11L5.5 5L7.5 8.5L10 6L13 11" stroke="#080C14" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          <span style={{ color: '#F0F4FF', fontWeight: 700, fontSize: 16, letterSpacing: '-0.01em' }}>HireOnyx</span>
        </div>

        <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.02em', color: '#F0F4FF', margin: '0 0 8px' }}>Welcome back</h1>
        <p style={{ color: '#94A3B8', fontSize: 14, margin: '0 0 28px' }}>Sign in to continue to HireOnyx.</p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" required style={INPUT}
            onFocus={e => e.target.style.borderColor = '#4F8EF7'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.10)'} />
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" required style={INPUT}
            onFocus={e => e.target.style.borderColor = '#4F8EF7'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.10)'} />

          {error && <p style={{ color: '#E05252', fontSize: 13, margin: 0 }}>{error}</p>}

          <button type="submit" disabled={loading} style={{ ...BTN_PRIMARY, padding: '13px', marginTop: 4, opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p style={{ textAlign: 'center', color: '#94A3B8', fontSize: 13, marginTop: 24 }}>
          New here? <Link to="/signup" style={{ color: '#4F8EF7', fontWeight: 500 }}>Create an account</Link>
        </p>
      </div>
    </div>
  );
}
