const CONFIG = {
  'full-time':  { bg: 'var(--badge-fulltime)',   color: 'var(--badge-fulltime-text)',   label: 'Full-time' },
  'part-time':  { bg: 'var(--badge-parttime)',    color: 'var(--badge-parttime-text)',   label: 'Part-time' },
  'remote':     { bg: 'var(--badge-remote)',      color: 'var(--badge-remote-text)',     label: 'Remote' },
  'internship': { bg: 'var(--badge-internship)',  color: 'var(--badge-internship-text)', label: 'Internship' },
  'contract':   { bg: 'var(--badge-contract)',    color: 'var(--badge-contract-text)',   label: 'Contract' },
};

export default function JobTypeBadge({ type }) {
  const cfg = CONFIG[type] || CONFIG['full-time'];
  return (
    <span style={{
      background: cfg.bg,
      color: cfg.color,
      fontFamily: '"JetBrains Mono", monospace',
      fontSize: '11px',
      fontWeight: 500,
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      padding: '3px 10px',
      borderRadius: '4px',
      whiteSpace: 'nowrap',
    }}>
      {cfg.label}
    </span>
  );
}
