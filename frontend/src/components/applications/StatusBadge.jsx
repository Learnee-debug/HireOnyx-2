const CONFIG = {
  applied:   { bg: 'bg-surface-container-low',  text: 'text-text-secondary', dot: 'bg-text-muted',       border: 'border-border-default',           label: 'Applied' },
  reviewing: { bg: 'bg-score-mid-bg',            text: 'text-score-mid-text', dot: 'bg-score-mid-text',   border: 'border-score-mid-text/30',        label: 'Reviewing' },
  selected:  { bg: 'bg-score-high-bg',           text: 'text-score-high-text', dot: 'bg-score-high-text', border: 'border-score-high-text/30',       label: 'Selected' },
  rejected:  { bg: 'bg-error-container/30',      text: 'text-error',           dot: 'bg-error',           border: 'border-error/20',                 label: 'Rejected' },
};

export default function StatusBadge({ status }) {
  const cfg = CONFIG[status] || CONFIG.applied;
  return (
    <span className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-data-label font-semibold border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}
