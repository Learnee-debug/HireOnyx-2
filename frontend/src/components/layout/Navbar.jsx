import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

function NavLink({ to, children, isActive }) {
  return (
    <Link
      to={to}
      className={`relative flex items-center h-nav-height text-body-base font-medium transition-colors duration-100 ${
        isActive
          ? 'text-primary'
          : 'text-text-secondary hover:text-text-primary'
      }`}
    >
      {children}
      {isActive && (
        <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary rounded-t-full" />
      )}
    </Link>
  );
}

export default function Navbar() {
  const { user, profile, logout } = useAuth();
  const { dark, toggle } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 4);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const isActive = (p) => location.pathname === p || location.pathname.startsWith(p + '/');
  const dashPath = profile?.role === 'recruiter' ? '/recruiter/dashboard' : '/dashboard';

  const initials = profile?.full_name
    ? profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.[0]?.toUpperCase() || '?';

  /* Avatar colour — deterministic, looks good in both themes */
  const avatarBg = 'bg-primary-container';
  const avatarText = 'text-on-primary';

  return (
    <>
      <nav className={`h-nav-height sticky top-0 z-50 w-full transition-all duration-200 ${
        scrolled
          ? 'bg-surface-container-lowest border-b border-border-default shadow-sm'
          : 'bg-surface-container-lowest border-b border-border-default'
      }`}>
        <div className="flex items-center justify-between h-full px-margin-page max-w-[1440px] mx-auto gap-8">

          {/* ── Logo ── */}
          <Link to="/" className="flex-shrink-0 font-bold text-[17px] tracking-tight text-text-primary select-none">
            HireOnyx
          </Link>

          {/* ── Desktop nav links ── */}
          <div className="hidden md:flex items-center gap-6 h-nav-height flex-1">
            <NavLink to="/jobs" isActive={isActive('/jobs')}>Jobs</NavLink>
            {user && (
              <NavLink to={dashPath} isActive={isActive(dashPath)}>
                {profile?.role === 'recruiter' ? 'Dashboard' : 'Applications'}
              </NavLink>
            )}
            {profile?.role === 'recruiter' && (
              <NavLink to="/post-job" isActive={isActive('/post-job')}>Post Job</NavLink>
            )}
          </div>

          {/* ── Right actions ── */}
          <div className="hidden md:flex items-center gap-3">
            {/* Theme toggle */}
            <button
              onClick={toggle}
              title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-container-high transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">
                {dark ? 'light_mode' : 'dark_mode'}
              </span>
            </button>

            {user ? (
              <>
                {/* Avatar */}
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${avatarBg} ${avatarText}`}
                  title={profile?.full_name || user.email}
                >
                  {initials}
                </div>
                {/* Name */}
                <span className="text-body-sm text-text-secondary max-w-[120px] truncate">
                  {profile?.full_name?.split(' ')[0] || user.email}
                </span>
                {/* Sign out */}
                <button
                  onClick={async () => { await logout(); navigate('/'); }}
                  className="px-3 py-1.5 text-button-text text-text-secondary hover:text-text-primary hover:bg-surface-container-high rounded-lg transition-colors"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => navigate('/login')}
                  className="px-3 py-1.5 text-button-text text-text-secondary hover:text-text-primary hover:bg-surface-container-high rounded-lg transition-colors"
                >
                  Sign In
                </button>
                <button
                  onClick={() => navigate('/signup')}
                  className="px-4 py-1.5 text-button-text font-semibold bg-text-primary text-surface-container-lowest rounded-lg hover:opacity-90 active:scale-[0.98] transition-all"
                >
                  Post Job
                </button>
              </>
            )}
          </div>

          {/* ── Mobile: theme + hamburger ── */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={toggle}
              className="w-8 h-8 flex items-center justify-center text-text-secondary"
            >
              <span className="material-symbols-outlined text-[18px]">
                {dark ? 'light_mode' : 'dark_mode'}
              </span>
            </button>
            <button
              onClick={() => setMobileOpen(o => !o)}
              className="w-8 h-8 flex items-center justify-center text-text-primary"
            >
              <span className="material-symbols-outlined text-[20px]">
                {mobileOpen ? 'close' : 'menu'}
              </span>
            </button>
          </div>
        </div>

        {/* ── Mobile drawer ── */}
        {mobileOpen && (
          <div className="md:hidden absolute top-nav-height left-0 right-0 bg-surface-container-lowest border-b border-border-default z-50 py-2 px-margin-page flex flex-col divide-y divide-border-default">
            <div className="flex flex-col gap-0.5 py-2">
              <Link to="/jobs" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-body-base font-medium text-text-primary hover:bg-surface-container-low">
                <span className="material-symbols-outlined text-[18px]">work</span>Jobs
              </Link>
              {user && (
                <Link to={dashPath} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-body-base font-medium text-text-primary hover:bg-surface-container-low">
                  <span className="material-symbols-outlined text-[18px]">dashboard</span>
                  {profile?.role === 'recruiter' ? 'Dashboard' : 'Applications'}
                </Link>
              )}
              {profile?.role === 'recruiter' && (
                <Link to="/post-job" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-body-base font-medium text-text-primary hover:bg-surface-container-low">
                  <span className="material-symbols-outlined text-[18px]">add_circle</span>Post Job
                </Link>
              )}
            </div>
            <div className="py-3">
              {user ? (
                <div className="flex items-center justify-between px-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold ${avatarBg} ${avatarText}`}>{initials}</div>
                    <span className="text-body-sm text-text-secondary">{profile?.full_name || user.email}</span>
                  </div>
                  <button onClick={async () => { await logout(); navigate('/'); }} className="text-body-sm text-error font-medium">Sign out</button>
                </div>
              ) : (
                <div className="flex gap-2 px-3">
                  <Link to="/login" className="flex-1 text-center py-2 text-button-text text-text-primary border border-border-default rounded-lg">Sign In</Link>
                  <Link to="/signup" className="flex-1 text-center py-2 text-button-text font-semibold bg-text-primary text-surface-container-lowest rounded-lg">Get Started</Link>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
