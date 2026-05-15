import { useNavigate } from 'react-router-dom';
import JobTypeBadge from './JobTypeBadge';
import { daysAgo, formatSalary } from '../../lib/utils';

export default function JobCard({ job }) {
  const navigate = useNavigate();
  const salary = formatSalary(job.salary_min, job.salary_max);

  return (
    <div
      onClick={() => navigate(`/jobs/${job.id}`)}
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: '10px',
        padding: '24px',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.2s ease',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = 'var(--border-accent)';
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 0 0 1px var(--border-accent), 0 4px 20px rgba(0,0,0,0.5)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'var(--border)';
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {/* Top row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
        <span style={{ color: 'var(--text-muted)', fontSize: '13px', fontWeight: 400 }}>
          {job.company}
        </span>
        <JobTypeBadge type={job.type} />
      </div>

      {/* Title */}
      <h3 style={{
        fontFamily: '"DM Sans", sans-serif',
        fontWeight: 600,
        fontSize: '18px',
        color: 'var(--text-primary)',
        margin: '12px 0 0',
        lineHeight: 1.3,
      }}>
        {job.title}
      </h3>

      {/* Meta */}
      <div style={{ display: 'flex', gap: '16px', marginTop: '10px', flexWrap: 'wrap' }}>
        <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>📍 {job.location}</span>
        <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>🕐 {daysAgo(job.created_at)}</span>
      </div>

      {/* Salary */}
      {salary && (
        <div style={{ marginTop: '8px' }}>
          <span style={{ color: 'var(--status-selected)', fontSize: '13px', fontWeight: 500 }}>{salary}</span>
        </div>
      )}

      {/* Skills */}
      {job.skills_required?.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '16px' }}>
          {job.skills_required.slice(0, 3).map(skill => (
            <span key={skill} style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border)',
              borderRadius: '4px',
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: '11px',
              color: 'var(--text-secondary)',
              padding: '3px 8px',
            }}>
              {skill}
            </span>
          ))}
        </div>
      )}

      {/* CTA */}
      <div style={{ marginTop: '16px', textAlign: 'right' }}>
        <span style={{ color: 'var(--accent)', fontSize: '13px', fontWeight: 500 }}>View Job →</span>
      </div>
    </div>
  );
}
