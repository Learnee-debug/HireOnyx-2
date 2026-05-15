import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function Spinner() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      minHeight: '100vh', background: 'var(--bg-base)',
    }}>
      <div style={{
        width: '32px', height: '32px',
        border: '3px solid var(--border)',
        borderTopColor: 'var(--accent)',
        borderRadius: '50%',
        animation: 'spin 0.7s linear infinite',
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default function ProtectedRoute({ children, requiredRole }) {
  const { user, profile, loading } = useAuth();

  // Still fetching session / profile
  if (loading) return <Spinner />;

  // Not logged in
  if (!user) return <Navigate to="/login" replace />;

  // Logged in but profile not yet in DB (edge case — show spinner briefly)
  if (!profile) return <Spinner />;

  // Wrong role — redirect to correct dashboard
  if (requiredRole && profile.role !== requiredRole) {
    const dest = profile.role === 'recruiter' ? '/recruiter/dashboard' : '/dashboard';
    return <Navigate to={dest} replace />;
  }

  return children;
}
