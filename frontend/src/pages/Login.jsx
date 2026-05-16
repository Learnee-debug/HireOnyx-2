import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(''); setLoading(true);
    const res = await login(email, password);
    setLoading(false);
    if (res.error) { setError(res.error.message || 'Invalid credentials.'); return; }
    navigate(res.profile?.role === 'recruiter' ? '/recruiter/dashboard' : '/dashboard');
  }

  const inputCls = "w-full h-input-height px-3 bg-surface-container-low border border-border-default rounded-lg text-body-base text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/10 transition-all";

  return (
    <div className="min-h-screen bg-page-bg flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-[400px]">
        {/* Card */}
        <div className="bg-surface-card border border-border-default rounded-2xl p-8 shadow-sm">
          {/* Logo */}
          <Link to="/" className="font-bold text-[18px] tracking-tight text-text-primary block mb-8">
            HireOnyx
          </Link>

          <h1 className="font-bold text-[22px] text-text-primary mb-1 tracking-tight">Welcome back</h1>
          <p className="text-body-sm text-text-secondary mb-7">Sign in to continue to HireOnyx.</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block font-mono text-[11px] font-semibold text-text-muted uppercase tracking-[0.08em] mb-1.5">
                Email address
              </label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com" required className={inputCls} />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block font-mono text-[11px] font-semibold text-text-muted uppercase tracking-[0.08em]">
                  Password
                </label>
              </div>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••" required className={inputCls} />
            </div>

            {error && (
              <div className="px-3 py-2 bg-error/5 border border-error/20 rounded-lg">
                <p className="text-body-sm text-error">{error}</p>
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full h-10 bg-primary-container text-white font-semibold text-[14px] rounded-lg hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-60 mt-1">
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-border-default" />
            <span className="font-mono text-[10px] text-text-muted uppercase tracking-widest">or</span>
            <div className="flex-1 h-px bg-border-default" />
          </div>

          <p className="text-center text-body-sm text-text-secondary">
            New here?{' '}
            <Link to="/signup" className="text-primary font-semibold hover:underline">Create an account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
