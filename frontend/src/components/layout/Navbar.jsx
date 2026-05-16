import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

export default function Navbar() {
  const { user, profile, logout } = useAuth();
  const { dark, toggle } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  const isActive = (p) => location.pathname === p || location.pathname.startsWith(p + '/');
  const dashPath = profile?.role === 'recruiter' ? '/recruiter/dashboard' : '/dashboard';

  const initials = profile?.full_name
    ? profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.[0]?.toUpperCase() || '?';

  return (
    <>
      <nav className="bg-surface-container-lowest dark:bg-inverse-surface border-b border-border-default dark:border-outline-variant sticky top-0 z-50 h-nav-height">
        <div className="flex justify-between items-center h-full px-margin-page max-w-[1440px] mx-auto">
          {/* Logo */}
          <div className="flex items-center gap-8">
            <Link to="/" className="font-bold text-headline-md text-text-primary dark:text-inverse-on-surface no-underline">
              HireOnyx
            </Link>
            {/* Desktop nav links */}
            <div className="hidden md:flex items-center gap-6 h-nav-height">
              <Link to="/jobs" className={`font-medium text-body-base pb-1 h-nav-height flex items-center border-b-2 transition-colors ${isActive('/jobs') ? 'text-primary dark:text-primary-fixed border-primary' : 'text-text-secondary dark:text-text-muted border-transparent hover:text-primary'}`}>
                Jobs
              </Link>
              {user && (
                <Link to={dashPath} className={`font-medium text-body-base pb-1 h-nav-height flex items-center border-b-2 transition-colors ${isActive(dashPath) ? 'text-primary dark:text-primary-fixed border-primary' : 'text-text-secondary dark:text-text-muted border-transparent hover:text-primary'}`}>
                  {profile?.role === 'recruiter' ? 'Dashboard' : 'Applications'}
                </Link>
              )}
              {profile?.role === 'recruiter' && (
                <Link to="/post-job" className={`font-medium text-body-base pb-1 h-nav-height flex items-center border-b-2 transition-colors ${isActive('/post-job') ? 'text-primary border-primary' : 'text-text-secondary border-transparent hover:text-primary'}`}>
                  Post Job
                </Link>
              )}
            </div>
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-4">
            {/* Theme toggle */}
            <button onClick={toggle} className="material-symbols-outlined text-text-secondary hover:text-primary transition-colors cursor-pointer" title="Toggle theme">
              {dark ? 'light_mode' : 'dark_mode'}
            </button>

            {user ? (
              <>
                <div className="w-8 h-8 rounded-full bg-secondary-container dark:bg-surface-container-high flex items-center justify-center text-[11px] font-bold text-on-secondary-container cursor-pointer" title={profile?.full_name || user.email}>
                  {initials}
                </div>
                <span className="text-body-sm text-text-secondary dark:text-text-muted">
                  {profile?.full_name?.split(' ')[0] || user.email}
                </span>
                <button onClick={async () => { await logout(); navigate('/'); }}
                  className="px-4 py-1.5 text-button-text font-medium text-text-primary dark:text-inverse-on-surface hover:bg-surface-container-low dark:hover:bg-surface-container transition-colors rounded-lg">
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <button onClick={() => navigate('/login')}
                  className="px-4 py-1.5 text-button-text font-medium text-text-primary dark:text-inverse-on-surface hover:bg-surface-container-low dark:hover:bg-surface-container transition-colors rounded-lg">
                  Sign In
                </button>
                <button onClick={() => navigate('/signup')}
                  className="px-4 py-1.5 bg-text-primary dark:bg-inverse-on-surface text-white dark:text-inverse-surface text-button-text font-medium rounded-lg hover:opacity-90 transition-opacity">
                  Post Job
                </button>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button onClick={() => setMobileOpen(o => !o)} className="md:hidden text-text-primary dark:text-inverse-on-surface p-1">
            <span className="material-symbols-outlined">{mobileOpen ? 'close' : 'menu'}</span>
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden absolute top-nav-height left-0 right-0 bg-surface-container-lowest dark:bg-inverse-surface border-b border-border-default dark:border-outline-variant p-4 flex flex-col gap-3 z-50">
            <Link to="/jobs" className="text-body-base font-medium text-text-primary dark:text-inverse-on-surface py-2">Jobs</Link>
            {user && <Link to={dashPath} className="text-body-base font-medium text-text-primary dark:text-inverse-on-surface py-2">{profile?.role === 'recruiter' ? 'Dashboard' : 'Applications'}</Link>}
            {profile?.role === 'recruiter' && <Link to="/post-job" className="text-body-base font-medium text-text-primary dark:text-inverse-on-surface py-2">Post Job</Link>}
            <div className="flex items-center gap-3 pt-2 border-t border-border-default dark:border-outline-variant">
              <button onClick={toggle} className="material-symbols-outlined text-text-secondary dark:text-text-muted">{dark ? 'light_mode' : 'dark_mode'}</button>
              {user
                ? <button onClick={async () => { await logout(); navigate('/'); }} className="text-body-sm text-error">Sign Out</button>
                : <Link to="/login" className="text-body-sm font-medium text-primary">Sign In</Link>
              }
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
