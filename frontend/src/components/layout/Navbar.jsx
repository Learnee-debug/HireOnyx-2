import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Zap } from 'lucide-react';

/* Clean gradient icon — matches reference exactly */
function LogoIcon() {
  return (
    <div style={{
      width: 30, height: 30, borderRadius: 7,
      background: 'linear-gradient(135deg, #4F8EF7 0%, #00C2A8 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: '0 0 12px rgba(79,142,247,0.30)', flexShrink: 0,
    }}>
      <Zap size={15} color="#080C14" strokeWidth={2.5} />
    </div>
  );
}

export default function Navbar() {
  const { user, profile, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => { setMobileOpen(false); }, [location.pathname]);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const isActive = (p) => location.pathname === p || location.pathname.startsWith(p + '/');

  const linkStyle = (p) => ({
    color: isActive(p) ? '#F0F4FF' : '#94A3B8',
    fontSize: 14, fontWeight: 500, padding: '4px 0',
    borderBottom: isActive(p) ? '2px solid #4F8EF7' : '2px solid transparent',
    transition: 'all 0.15s ease', textDecoration: 'none',
  });

  const dashPath = profile?.role === 'recruiter' ? '/recruiter/dashboard' : '/dashboard';

  return (
    <>
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        height: 60,
        background: scrolled ? 'rgba(8,12,20,0.96)' : 'rgba(8,12,20,0.90)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        display: 'flex', alignItems: 'center', padding: '0 32px',
      }}>
        <div style={{ maxWidth: 1280, width: '100%', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

          {/* Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 9, textDecoration: 'none' }}>
            <LogoIcon />
            <span style={{ fontWeight: 700, fontSize: 17, letterSpacing: '-0.02em', lineHeight: 1 }}>
              <span style={{ color: '#F0F4FF' }}>Hire</span><span style={{
                background: 'linear-gradient(135deg, #4F8EF7 0%, #00C2A8 100%)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}>Onyx</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hn-desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
            <Link to="/jobs" style={linkStyle('/jobs')}>Jobs</Link>
            {user && (
              <Link to={dashPath} style={linkStyle(dashPath)}>
                {profile?.role === 'recruiter' ? 'Dashboard' : 'Applications'}
              </Link>
            )}
            {profile?.role === 'recruiter' && (
              <Link to="/post-job" style={linkStyle('/post-job')}>Post Job</Link>
            )}
          </div>

          {/* Right */}
          <div className="hn-desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {user ? (
              <>
                <div style={{
                  padding: '4px 12px', borderRadius: 999,
                  background: profile?.role === 'recruiter' ? 'rgba(0,194,168,0.10)' : 'rgba(79,142,247,0.10)',
                  border: profile?.role === 'recruiter' ? '1px solid rgba(0,194,168,0.35)' : '1px solid rgba(79,142,247,0.35)',
                  color: profile?.role === 'recruiter' ? '#00C2A8' : '#4F8EF7',
                  fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase',
                  fontFamily: '"JetBrains Mono", monospace',
                }}>
                  {profile?.role === 'recruiter' ? 'Recruiter' : 'Job Seeker'}
                </div>
                <span style={{ color: '#94A3B8', fontSize: 13 }}>
                  {profile?.full_name?.split(' ')[0] || user.email}
                </span>
                <button onClick={async () => { await logout(); navigate('/'); }} style={{
                  padding: '6px 14px', borderRadius: 8,
                  background: 'transparent', border: '1px solid rgba(255,255,255,0.12)',
                  color: '#94A3B8', fontSize: 13, fontWeight: 500, cursor: 'pointer',
                }}>Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" style={{ color: '#94A3B8', fontSize: 14, fontWeight: 500, padding: '6px 14px', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8 }}>Sign In</Link>
                <Link to="/signup" style={{
                  padding: '7px 18px', borderRadius: 8,
                  background: 'linear-gradient(135deg, #4F8EF7 0%, #00C2A8 100%)',
                  color: '#080C14', fontSize: 14, fontWeight: 600,
                  boxShadow: '0 0 16px rgba(79,142,247,0.25)',
                }}>Get Started</Link>
              </>
            )}
          </div>

          <button onClick={() => setMobileOpen(o => !o)} className="hn-hamburger" style={{
            display: 'none', background: 'none', border: 'none',
            color: '#F0F4FF', fontSize: 22, cursor: 'pointer', padding: 4,
          }}>
            {mobileOpen ? '✕' : '☰'}
          </button>
        </div>

        {mobileOpen && (
          <div style={{
            position: 'absolute', top: 60, left: 0, right: 0,
            background: '#0F1520', borderBottom: '1px solid rgba(255,255,255,0.10)',
            padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16,
          }}>
            <Link to="/jobs" style={{ color: '#F0F4FF', fontSize: 15, fontWeight: 500 }}>Jobs</Link>
            {user && <Link to={dashPath} style={{ color: '#F0F4FF', fontSize: 15 }}>{profile?.role === 'recruiter' ? 'Dashboard' : 'Applications'}</Link>}
            {profile?.role === 'recruiter' && <Link to="/post-job" style={{ color: '#F0F4FF', fontSize: 15 }}>Post Job</Link>}
            {user
              ? <button onClick={async () => { await logout(); navigate('/'); }} style={{ background: 'none', border: '1px solid rgba(255,255,255,0.12)', color: '#94A3B8', padding: 10, borderRadius: 8, textAlign: 'center', cursor: 'pointer' }}>Logout</button>
              : <Link to="/signup" style={{ background: 'linear-gradient(135deg, #4F8EF7 0%, #00C2A8 100%)', color: '#080C14', padding: 10, borderRadius: 8, fontWeight: 600, textAlign: 'center' }}>Get Started</Link>
            }
          </div>
        )}
      </nav>

      <style>{`
        @media (max-width: 768px) {
          .hn-desktop-nav { display: none !important; }
          .hn-hamburger { display: block !important; }
        }
      `}</style>
    </>
  );
}
