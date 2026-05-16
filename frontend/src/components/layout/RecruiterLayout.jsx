import { Link, useLocation } from 'react-router-dom';

const NAV = [
  { icon: 'dashboard',  label: 'Dashboard',   to: '/recruiter/dashboard' },
  { icon: 'work',       label: 'Active Jobs',  to: '/recruiter/jobs' },
  { icon: 'people',     label: 'Candidates',   to: '/recruiter/candidates' },
  { icon: 'bar_chart',  label: 'Reports',      to: '/recruiter/reports' },
];

function SidebarLink({ icon, label, to, active }) {
  return (
    <Link to={to} className={`flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors ${
      active
        ? 'bg-accent-light text-primary'
        : 'text-text-secondary hover:bg-surface-container-high hover:text-text-primary'
    }`}>
      <span className="material-symbols-outlined text-[18px]">{icon}</span>
      {label}
    </Link>
  );
}

export default function RecruiterLayout({ children }) {
  const { pathname } = useLocation();

  return (
    <div className="flex min-h-[calc(100vh-60px)] bg-page-bg">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-[220px] flex-shrink-0 bg-surface-container-lowest border-r border-border-default sticky top-nav-height h-[calc(100vh-60px)] overflow-y-auto">
        <div className="p-4 flex flex-col gap-0.5 flex-1">
          <p className="font-mono text-[10px] font-semibold text-text-muted uppercase tracking-[0.1em] px-3 pb-2 pt-1">
            Menu
          </p>
          {NAV.map(n => (
            <SidebarLink key={n.to} {...n} active={pathname === n.to} />
          ))}

          <div className="flex-1" />

          <Link
            to="/post-job"
            className="flex items-center justify-center gap-2 w-full h-10 bg-primary-container text-white font-semibold text-[13px] rounded-lg hover:opacity-90 active:scale-[0.98] transition-all mt-2"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            Post Job
          </Link>
        </div>
      </aside>

      {/* Page body */}
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}
