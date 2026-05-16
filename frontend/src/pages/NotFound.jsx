import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-margin-page text-center">
      <span className="font-bold text-[80px] text-primary font-mono leading-none mb-4">404</span>
      <h2 className="font-bold text-[24px] text-text-primary dark:text-inverse-on-surface mb-2">Page not found</h2>
      <p className="text-text-secondary dark:text-text-muted text-body-base mb-8 max-w-sm">
        That page may have been archived. Browse open roles instead.
      </p>
      <Link to="/jobs"
        className="inline-flex items-center gap-2 px-6 py-3 bg-primary-container text-white text-button-text font-medium rounded-lg hover:opacity-90 transition-opacity">
        Browse jobs
        <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
      </Link>
    </div>
  );
}
