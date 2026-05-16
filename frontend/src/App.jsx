import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/layout/ProtectedRoute';
import Navbar from './components/layout/Navbar';
import ErrorBoundary from './components/ErrorBoundary';

import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Jobs from './pages/Jobs';
import JobDetail from './pages/JobDetail';
import PostJob from './pages/PostJob';
import NotFound from './pages/NotFound';
import SeekerDashboard from './pages/seeker/SeekerDashboard';
import RecruiterDashboard from './pages/recruiter/RecruiterDashboard';
import ApplicantsList from './pages/recruiter/ApplicantsList';
import ActiveJobs from './pages/recruiter/ActiveJobs';
import Candidates from './pages/recruiter/Candidates';
import Reports from './pages/recruiter/Reports';

import './styles/globals.css';

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <ErrorBoundary>
            <Navbar />
            <main style={{ flex: 1 }}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/jobs" element={<Jobs />} />
                <Route path="/jobs/:id" element={<JobDetail />} />
                <Route
                  path="/post-job"
                  element={
                    <ProtectedRoute requiredRole="recruiter">
                      <PostJob />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute requiredRole="seeker">
                      <SeekerDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/recruiter/dashboard"
                  element={
                    <ProtectedRoute requiredRole="recruiter">
                      <RecruiterDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/recruiter/jobs/:id/applicants"
                  element={
                    <ProtectedRoute requiredRole="recruiter">
                      <ApplicantsList />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/recruiter/jobs"
                  element={
                    <ProtectedRoute requiredRole="recruiter">
                      <ActiveJobs />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/recruiter/candidates"
                  element={
                    <ProtectedRoute requiredRole="recruiter">
                      <Candidates />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/recruiter/reports"
                  element={
                    <ProtectedRoute requiredRole="recruiter">
                      <Reports />
                    </ProtectedRoute>
                  }
                />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <Toaster
              position="bottom-right"
              toastOptions={{
                style: {
                  background: 'var(--c-surface)',
                  color: 'var(--c-text)',
                  border: '1px solid var(--c-border)',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '14px',
                  borderRadius: '10px',
                  boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
                },
                success: {
                  iconTheme: { primary: 'var(--c-score-high-text)', secondary: 'var(--c-score-high-bg)' },
                },
                error: {
                  iconTheme: { primary: 'var(--c-error)', secondary: '#ffdad6' },
                },
                duration: 3500,
              }}
            />
          </ErrorBoundary>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
