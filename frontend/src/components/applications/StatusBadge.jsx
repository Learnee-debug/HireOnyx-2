const CONFIG = {
  applied:   { bg: 'bg-surface-container-low', text: 'text-text-secondary', dot: 'bg-text-muted', border: 'border-border-default', label: 'Applied' },
  reviewing: { bg: 'bg-score-low-bg', text: 'text-score-low-text', dot: 'bg-score-low-text', border: 'border-amber-100', label: 'Reviewing' },
  selected:  { bg: 'bg-score-high-bg', text: 'text-score-high-text', dot: 'bg-score-high-text', border: 'border-green-100', label: 'Selected' },
  rejected:  { bg: 'bg-error-container/30', text: 'text-error', dot: 'bg-error', border: 'border-error/20', label: 'Rejected' },
};

export default function StatusBadge({ status }) {
  const cfg = CONFIG[status] || CONFIG.applied;
  return (
    <span className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-data-label font-semibold ${cfg.bg} ${cfg.text} border ${cfg.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`}></span>
      {cfg.label}
    </span>
  );
}
