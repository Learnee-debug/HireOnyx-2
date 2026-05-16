import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function Spinner() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-page-bg dark:bg-[#1b1c1a]">
      <div className="w-8 h-8 border-2 border-border-default border-t-primary rounded-full animate-spin" />
    </div>
  );
}

export default function ProtectedRoute({ children, requiredRole }) {
  const { user, profile, loading } = useAuth();

  if (loading) return <Spinner />;
  if (!user) return <Navigate to="/login" replace />;
  if (!profile) return <Spinner />;

  if (requiredRole && profile.role !== requiredRole) {
    const dest = profile.role === 'recruiter' ? '/recruiter/dashboard' : '/dashboard';
    return <Navigate to={dest} replace />;
  }

  return children;
}
