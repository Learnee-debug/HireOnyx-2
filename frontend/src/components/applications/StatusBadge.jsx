const CONFIG = {
  applied:   { bg: '#1A2A3A', color: '#60A5FA', label: 'Applied' },
  reviewing: { bg: '#2A1E0A', color: '#4F8EF7', label: 'Reviewing' },
  selected:  { bg: '#0A2A15', color: '#22C55E', label: 'Selected ✓' },
  rejected:  { bg: '#2A1010', color: '#EF4444', label: 'Not Selected' },
};

export default function StatusBadge({ status }) {
  const cfg = CONFIG[status] || CONFIG.applied;
  return (
    <span style={{
      background: cfg.bg,
      color: cfg.color,
      fontFamily: '"JetBrains Mono", monospace',
      fontSize: '11px',
      fontWeight: 500,
      padding: '3px 10px',
      borderRadius: '4px',
      whiteSpace: 'nowrap',
    }}>
      {cfg.label}
    </span>
  );
}
