import React, { Suspense, lazy } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { ProjectProvider } from './context/ProjectContext.jsx';
import Layout from './components/Layout.jsx';
import './styles.css';

const Login = lazy(() => import('./pages/Login.jsx'));
const Dashboard = lazy(() => import('./pages/Dashboard.jsx'));
const Projects = lazy(() => import('./pages/Projects.jsx'));
const TestCases = lazy(() => import('./pages/TestCases.jsx'));
const Suites = lazy(() => import('./pages/Suites.jsx'));
const Executions = lazy(() => import('./pages/Executions.jsx'));

function Protected({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
}

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <ProjectProvider>
          <BrowserRouter>
            <Suspense fallback={<div className="loader">Loading module...</div>}>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/" element={<Protected><Layout /></Protected>}>
                  <Route index element={<Dashboard />} />
                  <Route path="projects" element={<Projects />} />
                  <Route path="test-cases" element={<TestCases />} />
                  <Route path="suites" element={<Suites />} />
                  <Route path="executions" element={<Executions />} />
                </Route>
              </Routes>
            </Suspense>
          </BrowserRouter>
        </ProjectProvider>
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>
);
