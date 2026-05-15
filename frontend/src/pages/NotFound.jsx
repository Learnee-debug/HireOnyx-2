import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div style={{ textAlign: 'center', padding: '120px 24px', maxWidth: 1280, margin: '0 auto' }}>
      <div style={{
        fontSize: 80, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1,
        background: 'linear-gradient(135deg, #4F8EF7 0%, #00C2A8 100%)',
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        marginBottom: 16,
      }}>404</div>
      <h2 style={{ fontSize: 24, fontWeight: 600, color: '#F0F4FF', margin: '0 0 10px' }}>Role not found</h2>
      <p style={{ color: '#94A3B8', fontSize: 15, margin: '0 0 32px' }}>
        That page may have been archived. Browse open roles instead.
      </p>
      <Link to="/jobs" style={{
        display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 24px',
        borderRadius: 10, background: 'linear-gradient(135deg, #4F8EF7 0%, #00C2A8 100%)',
        color: '#080C14', fontSize: 14, fontWeight: 600,
        boxShadow: '0 0 20px rgba(79,142,247,0.30)',
      }}>Browse jobs</Link>
    </div>
  );
}
