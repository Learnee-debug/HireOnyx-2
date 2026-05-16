import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-surface-container-lowest dark:bg-inverse-surface border-t border-border-default dark:border-outline-variant">
      <div className="flex flex-col md:flex-row justify-between items-center py-6 px-margin-page w-full max-w-7xl mx-auto gap-4">
        <div className="flex flex-col items-center md:items-start gap-1">
          <span className="font-bold text-body-base text-text-primary dark:text-inverse-on-surface">HireOnyx</span>
          <p className="text-body-sm text-text-secondary dark:text-text-muted">© 2024 HireOnyx. All rights reserved.</p>
        </div>
        <div className="flex items-center gap-6 text-body-sm">
          <a href="#" className="text-text-secondary dark:text-text-muted hover:text-primary transition-colors underline">Privacy</a>
          <a href="#" className="text-text-secondary dark:text-text-muted hover:text-primary transition-colors underline">Terms</a>
          <a href="#" className="text-text-secondary dark:text-text-muted hover:text-primary transition-colors underline">Cookie Policy</a>
        </div>
      </div>
    </footer>
  );
}
