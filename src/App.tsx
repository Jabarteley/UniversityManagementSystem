import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './hooks/useAuth';
import Layout from './components/Layout/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import Staff from './pages/Staff';
import Activities from './pages/Activities';
import Reports from './pages/Reports';
import Records from './pages/Records';
import Files from './pages/Files';
import Users from './pages/Users';
import ResultPortal from './pages/ResultPortal';
import Profile from './pages/Profile';
import StudentRecords from './pages/StudentRecords';
import StudentDocuments from './pages/StudentDocuments';
import Documents from './pages/Documents';
import UploadDocuments from './pages/UploadDocuments';
import MyStudents from './pages/MyStudents';
import ClassManagement from './pages/ClassManagement';
import GradeEntry from './pages/GradeEntry';
import CourseMaterials from './pages/CourseMaterials';
import ClassReports from './pages/ClassReports';
import CourseRegistration from './pages/CourseRegistration';
import LoadingSpinner from './components/UI/LoadingSpinner';
import { testConnection } from './api/client';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  return user ? <>{children}</> : <Navigate to="/login" />;
};

const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  return user ? <Navigate to="/dashboard" /> : <>{children}</>;
};

const RoleBasedRoute: React.FC<{ 
  children: React.ReactNode; 
  allowedRoles: string[];
}> = ({ children, allowedRoles }) => {
  const { user } = useAuth();
  
  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" />;
  }
  
  return <>{children}</>;
};

function App() {
  useEffect(() => {
    // Test API connection on app start
    testConnection();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Routes>
              <Route 
                path="/login" 
                element={
                  <PublicRoute>
                    <Login />
                  </PublicRoute>
                } 
              />
              <Route 
                path="/*" 
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Routes>
                        <Route path="/dashboard" element={<Dashboard />} />
                        
                        {/* Admin Only Routes */}
                        <Route path="/personnel/students" element={<RoleBasedRoute allowedRoles={['admin', 'system-admin']}><Students /></RoleBasedRoute>} />
                        <Route path="/personnel/staff" element={<RoleBasedRoute allowedRoles={['admin', 'system-admin']}><Staff /></RoleBasedRoute>} />
                        <Route path="/activities" element={<RoleBasedRoute allowedRoles={['admin', 'system-admin']}><Activities /></RoleBasedRoute>} />
                        <Route path="/records" element={<RoleBasedRoute allowedRoles={['admin', 'system-admin']}><Records /></RoleBasedRoute>} />
                        <Route path="/files" element={<RoleBasedRoute allowedRoles={['admin', 'system-admin']}><Files /></RoleBasedRoute>} />
                        <Route path="/users" element={<RoleBasedRoute allowedRoles={['admin', 'system-admin']}><Users /></RoleBasedRoute>} />
                        
                        {/* Admin & Staff Routes */}
                        <Route 
                          path="/reports" 
                          element={
                            <RoleBasedRoute allowedRoles={['admin', 'system-admin', 'staff']}>
                              <Reports />
                            </RoleBasedRoute>
                          } 
                        />
                        
                        {/* Staff Only Routes */}
                        <Route 
                          path="/my-students" 
                          element={
                            <RoleBasedRoute allowedRoles={['staff']}>
                              <MyStudents />
                            </RoleBasedRoute>
                          } 
                        />
                        <Route 
                          path="/class-management" 
                          element={
                            <RoleBasedRoute allowedRoles={['staff']}>
                              <ClassManagement />
                            </RoleBasedRoute>
                          } 
                        />
                        <Route 
                          path="/grade-entry" 
                          element={
                            <RoleBasedRoute allowedRoles={['staff']}>
                              <GradeEntry />
                            </RoleBasedRoute>
                          } 
                        />
                        <Route 
                          path="/course-materials" 
                          element={
                            <RoleBasedRoute allowedRoles={['staff']}>
                              <CourseMaterials />
                            </RoleBasedRoute>
                          } 
                        />
                        <Route 
                          path="/class-reports" 
                          element={
                            <RoleBasedRoute allowedRoles={['staff']}>
                              <ClassReports />
                            </RoleBasedRoute>
                          } 
                        />
                        
                        {/* Student Only Routes */}
                        <Route 
                          path="/results" 
                          element={
                            <RoleBasedRoute allowedRoles={['student']}>
                              <ResultPortal />
                            </RoleBasedRoute>
                          } 
                        />
                        <Route 
                          path="/my-records" 
                          element={
                            <RoleBasedRoute allowedRoles={['student']}>
                              <StudentRecords />
                            </RoleBasedRoute>
                          } 
                        />
                        <Route path="/documents" element={<RoleBasedRoute allowedRoles={['admin', 'system-admin', 'staff', 'student']}><Documents /></RoleBasedRoute>} />
                        <Route path="/my-documents" 
                          element={
                            <RoleBasedRoute allowedRoles={['student']}>
                              <StudentDocuments />
                            </RoleBasedRoute>
                          } 
                        />
                        <Route 
                          path="/upload-documents" 
                          element={
                            <RoleBasedRoute allowedRoles={['student']}>
                              <UploadDocuments />
                            </RoleBasedRoute>
                          } 
                        />
                        <Route 
                          path="/course-registration" 
                          element={
                            <RoleBasedRoute allowedRoles={['student']}>
                              <CourseRegistration />
                            </RoleBasedRoute>
                          } 
                        />
                        
                        {/* Common Routes */}
                        <Route path="/profile" element={<Profile />} />
                        <Route path="/" element={<Navigate to="/dashboard" />} />
                      </Routes>
                    </Layout>
                  </ProtectedRoute>
                } 
              />
            </Routes>
            <Toaster 
              position="top-right"
              toastOptions={{
                duration: 4000,
                className: 'bg-white shadow-lg',
              }}
            />
          </div>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;