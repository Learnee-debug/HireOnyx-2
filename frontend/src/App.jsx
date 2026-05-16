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
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <Toaster
              position="bottom-right"
              toastOptions={{
                style: {
                  background: '#FFFFFF',
                  color: '#0D0D0C',
                  border: '1px solid #E4E4E0',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '14px',
                  borderRadius: '8px',
                },
                success: {
                  iconTheme: { primary: '#166534', secondary: '#F0FDF4' },
                },
                error: {
                  iconTheme: { primary: '#ba1a1a', secondary: '#ffdad6' },
                },
              }}
            />
          </ErrorBoundary>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
