import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer style={{
      background: '#080C14',
      borderTop: '1px solid rgba(255,255,255,0.06)',
      padding: '20px 32px',
      marginTop: 'auto',
    }}>
      <div style={{
        maxWidth: 1280, margin: '0 auto',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 12,
      }}>
        <span style={{ color: '#4B5563', fontSize: 13 }}>© 2026 HireOnyx. Built for serious hiring.</span>
        <div style={{ display: 'flex', gap: 20 }}>
          {['Jobs', 'Privacy', 'Terms'].map(l => (
            <Link key={l} to="/" style={{ color: '#4B5563', fontSize: 13 }}>{l}</Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
