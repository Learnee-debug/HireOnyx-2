const JOB_TYPES = ['All', 'full-time', 'part-time', 'remote', 'internship', 'contract'];
const TYPE_LABELS = {
  'All': 'All',
  'full-time': 'Full-time',
  'part-time': 'Part-time',
  'remote': 'Remote',
  'internship': 'Internship',
  'contract': 'Contract',
};

export default function JobFilters({ filters, onChange }) {
  function handleTypeChange(type) {
    onChange({ ...filters, type });
  }

  function handleLocationChange(e) {
    onChange({ ...filters, location: e.target.value });
  }

  function handleClear() {
    onChange({ type: 'All', location: '' });
  }

  return (
    <div style={{
      width: '260px',
      flexShrink: 0,
      position: 'sticky',
      top: '80px',
      alignSelf: 'flex-start',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <span style={{ fontWeight: 600, fontSize: '15px', color: 'var(--text-primary)', fontFamily: '"DM Sans"' }}>Filters</span>
        <button
          onClick={handleClear}
          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '12px', cursor: 'pointer', padding: 0 }}
        >
          Clear all
        </button>
      </div>

      {/* Job Type */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '12px', fontFamily: '"JetBrains Mono"' }}>
          Job Type
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {JOB_TYPES.map(type => (
            <label key={type} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
              <span style={{
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                border: filters.type === type ? '2px solid var(--accent)' : '2px solid var(--border)',
                background: filters.type === type ? 'var(--accent)' : 'transparent',
                display: 'inline-block',
                flexShrink: 0,
                boxShadow: filters.type === type ? '0 0 0 3px var(--accent-glow)' : 'none',
                transition: 'all 0.15s ease',
                cursor: 'pointer',
              }} onClick={() => handleTypeChange(type)} />
              <span
                style={{ color: filters.type === type ? 'var(--text-primary)' : 'var(--text-secondary)', fontSize: '14px', cursor: 'pointer' }}
                onClick={() => handleTypeChange(type)}
              >
                {TYPE_LABELS[type]}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div style={{ height: '1px', background: 'var(--border-subtle)', marginBottom: '24px' }} />

      {/* Location */}
      <div>
        <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '12px', fontFamily: '"JetBrains Mono"' }}>
          Location
        </div>
        <input
          type="text"
          value={filters.location}
          onChange={handleLocationChange}
          placeholder="e.g. Bangalore"
          style={{
            width: '100%',
            background: 'var(--bg-subtle)',
            border: '1px solid var(--border)',
            borderRadius: '6px',
            color: 'var(--text-primary)',
            padding: '8px 12px',
            fontSize: '14px',
            fontFamily: '"DM Sans", sans-serif',
            outline: 'none',
            boxSizing: 'border-box',
          }}
          onFocus={e => { e.target.style.borderColor = 'var(--accent)'; e.target.style.boxShadow = '0 0 0 3px var(--accent-glow)'; }}
          onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
        />
      </div>
    </div>
  );
}
