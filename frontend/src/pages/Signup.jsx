import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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

  const inputCls = "w-full h-input-height px-3 bg-surface-container-low dark:bg-surface-container border border-border-default dark:border-outline-variant rounded-lg text-body-base text-text-primary dark:text-inverse-on-surface placeholder:text-text-muted focus:outline-none focus:border-primary transition-colors";

  return (
    <div className="min-h-screen bg-page-bg dark:bg-[#1b1c1a] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-[420px] bg-surface-card dark:bg-surface-container border border-border-default dark:border-outline-variant rounded-xl p-8">
        {/* Logo */}
        <div className="mb-8">
          <Link to="/" className="font-bold text-headline-md text-text-primary dark:text-inverse-on-surface no-underline">
            HireOnyx
          </Link>
        </div>

        <h1 className="font-bold text-[24px] text-text-primary dark:text-inverse-on-surface mb-1">Create your account</h1>
        <p className="text-body-sm text-text-secondary dark:text-text-muted mb-7">Join thousands hiring and being hired on HireOnyx.</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-data-label text-text-muted uppercase tracking-widest mb-1.5">Full name</label>
            <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Jane Smith" required className={inputCls} />
          </div>
          <div>
            <label className="block text-data-label text-text-muted uppercase tracking-widest mb-1.5">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required className={inputCls} />
          </div>
          <div>
            <label className="block text-data-label text-text-muted uppercase tracking-widest mb-1.5">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Min. 6 characters" required className={inputCls} />
          </div>

          {/* Role selector */}
          <div>
            <label className="block text-data-label text-text-muted uppercase tracking-widest mb-2">I am a</label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: 'seeker', label: 'Job Seeker', desc: "I'm looking for a job" },
                { value: 'recruiter', label: 'Recruiter', desc: 'I want to hire talent' },
              ].map(opt => (
                <button key={opt.value} type="button" onClick={() => setRole(opt.value)}
                  className={`p-4 rounded-lg text-left border-2 transition-all cursor-pointer ${role === opt.value
                    ? 'border-primary bg-accent-light dark:bg-accent-light/10'
                    : 'border-border-default dark:border-outline-variant hover:border-primary/40'}`}>
                  <div className="text-body-sm text-text-secondary dark:text-text-muted mb-1">{opt.desc}</div>
                  <div className={`font-semibold text-body-base ${role === opt.value ? 'text-primary' : 'text-text-primary dark:text-inverse-on-surface'}`}>{opt.label}</div>
                </button>
              ))}
            </div>
          </div>

          {error && <p className="text-body-sm text-error">{error}</p>}

          <button type="submit" disabled={loading || !role}
            className="w-full h-10 bg-primary-container text-white text-button-text font-medium rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 mt-1">
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-body-sm text-text-secondary dark:text-text-muted mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-primary font-medium hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
