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

  const inputCls = "w-full h-input-height px-3 bg-surface-container-low border border-border-default rounded-lg text-body-base text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/10 transition-all";
  const labelCls = "block font-mono text-[11px] font-semibold text-text-muted uppercase tracking-[0.08em] mb-1.5";

  return (
    <div className="min-h-screen bg-page-bg flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-[420px]">
        <div className="bg-surface-card border border-border-default rounded-2xl p-8 shadow-sm">
          {/* Logo */}
          <Link to="/" className="font-bold text-[18px] tracking-tight text-text-primary block mb-8">
            HireOnyx
          </Link>

          <h1 className="font-bold text-[22px] text-text-primary mb-1 tracking-tight">Create your account</h1>
          <p className="text-body-sm text-text-secondary mb-7">Join thousands hiring and being hired on HireOnyx.</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className={labelCls}>Full name</label>
              <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Jane Smith" required className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Email address</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Min. 6 characters" required className={inputCls} />
            </div>

            {/* Role selector */}
            <div>
              <label className={labelCls}>I am a</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'seeker', icon: 'person_search', label: 'Job Seeker', desc: "I'm looking for a job" },
                  { value: 'recruiter', icon: 'business_center', label: 'Recruiter', desc: 'I want to hire talent' },
                ].map(opt => (
                  <button key={opt.value} type="button" onClick={() => setRole(opt.value)}
                    className={`p-4 rounded-xl text-left border-2 transition-all ${role === opt.value
                      ? 'border-primary-container bg-accent-light'
                      : 'border-border-default hover:border-primary-container/40 hover:bg-surface-container-low'}`}>
                    <span className={`material-symbols-outlined text-[20px] mb-2 block ${role === opt.value ? 'text-primary-container' : 'text-text-muted'}`}>{opt.icon}</span>
                    <div className={`font-semibold text-[13px] ${role === opt.value ? 'text-primary-container' : 'text-text-primary'}`}>{opt.label}</div>
                    <div className="text-[12px] text-text-secondary mt-0.5">{opt.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="px-3 py-2 bg-error/5 border border-error/20 rounded-lg">
                <p className="text-body-sm text-error">{error}</p>
              </div>
            )}

            <button type="submit" disabled={loading || !role}
              className="w-full h-10 bg-primary-container text-white font-semibold text-[14px] rounded-lg hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 mt-1">
              {loading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-border-default" />
            <span className="font-mono text-[10px] text-text-muted uppercase tracking-widest">or</span>
            <div className="flex-1 h-px bg-border-default" />
          </div>

          <p className="text-center text-body-sm text-text-secondary">
            Already have an account?{' '}
            <Link to="/login" className="text-primary font-semibold hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
