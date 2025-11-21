import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';

import { Layout } from './components/Layout/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';

// Auth Pages
import { Login } from './pages/Login';
import { Register } from './pages/Register';

// Main Pages
import { Dashboard } from './pages/Dashboard';
import { Requirements } from './pages/Requirements';
import { RequirementDetail } from './pages/RequirementDetail';
import { Profile } from './pages/Profile';
import { Class } from './pages/Class';
import { Files } from './pages/Files';
import { Calendar } from './pages/Calendar';
import { Messages } from './pages/Messages';
import { MessageThread } from './pages/MessageThread';

// Admin Pages
import { AdminRequirements } from './pages/admin/AdminRequirements';
import { AdminCalendar } from './pages/admin/AdminCalendar';
import { AdminUsers } from './pages/admin/AdminUsers';
import { AdminClasses } from './pages/admin/AdminClasses';
import { AdminAssignments } from './pages/admin/AdminAssignments';

// Create query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="App">
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* Requirements */}
            <Route
              path="/requirements"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Requirements />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/requirements/:id"
              element={
                <ProtectedRoute>
                  <Layout>
                    <RequirementDetail />
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* Profile & Class */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Profile />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/class/:id/members"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Class />
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* Files */}
            <Route
              path="/files"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Files />
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* Calendar */}
            <Route
              path="/calendar"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Calendar />
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* Messages */}
            <Route
              path="/messages"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Messages />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/messages/:id"
              element={
                <ProtectedRoute>
                  <Layout>
                    <MessageThread />
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* Admin Routes */}
            <Route
              path="/admin/classes"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'TUTEUR_ECOLE']}>
                  <Layout>
                    <AdminClasses />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/assignments"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'TUTEUR_ECOLE']}>
                  <Layout>
                    <AdminAssignments />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/requirements"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'TUTEUR_ECOLE', 'MAITRE_APP']}>
                  <Layout>
                    <AdminRequirements />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/calendar"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'TUTEUR_ECOLE', 'MAITRE_APP']}>
                  <Layout>
                    <AdminCalendar />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <Layout>
                    <AdminUsers />
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            {/* Catch all - redirect to dashboard */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>

          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#fff',
                color: '#333',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
              },
            }}
          />
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
