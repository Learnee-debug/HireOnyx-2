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

  return (
    <div className="min-h-screen bg-page-bg dark:bg-[#1b1c1a] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-[400px] bg-surface-card dark:bg-surface-container border border-border-default dark:border-outline-variant rounded-xl p-8">
        {/* Logo */}
        <div className="mb-8">
          <Link to="/" className="font-bold text-headline-md text-text-primary dark:text-inverse-on-surface no-underline">
            HireOnyx
          </Link>
        </div>

        <h1 className="font-bold text-[24px] text-text-primary dark:text-inverse-on-surface mb-1">Welcome back</h1>
        <p className="text-body-sm text-text-secondary dark:text-text-muted mb-7">Sign in to continue to HireOnyx.</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-data-label text-text-muted uppercase tracking-widest mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full h-input-height px-3 bg-surface-container-low dark:bg-surface-container border border-border-default dark:border-outline-variant rounded-lg text-body-base text-text-primary dark:text-inverse-on-surface placeholder:text-text-muted focus:outline-none focus:border-primary transition-colors"
            />
          </div>
          <div>
            <label className="block text-data-label text-text-muted uppercase tracking-widest mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full h-input-height px-3 bg-surface-container-low dark:bg-surface-container border border-border-default dark:border-outline-variant rounded-lg text-body-base text-text-primary dark:text-inverse-on-surface placeholder:text-text-muted focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          {error && (
            <p className="text-body-sm text-error">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-10 bg-primary-container text-white text-button-text font-medium rounded-lg hover:opacity-90 transition-opacity disabled:opacity-60 mt-1">
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="text-center text-body-sm text-text-secondary dark:text-text-muted mt-6">
          New here?{' '}
          <Link to="/signup" className="text-primary font-medium hover:underline">Create an account</Link>
        </p>
      </div>
    </div>
  );
}
