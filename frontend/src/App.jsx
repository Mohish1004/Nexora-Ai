import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Invoices from './pages/Invoices';
import Expenses from './pages/Expenses';
import Budgets from './pages/Budgets';
import Runway from './pages/Runway';
import CopilotWorkspace from './pages/CopilotWorkspace';
import Profile from './pages/Profile';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [theme, setTheme] = useState('dark');
  const [userInfo, setUserInfo] = useState({});

  useEffect(() => {
    // Check session
    const token = localStorage.getItem('jwt_token');
    if (token) {
      setIsAuthenticated(true);
      setUserInfo(JSON.parse(localStorage.getItem('user_info') || '{}'));
    }

    // Set dark theme as default for Liquid Glass UI
    const savedTheme = localStorage.getItem('app_theme') || 'dark';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    localStorage.setItem('app_theme', nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
  };

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    setUserInfo(JSON.parse(localStorage.getItem('user_info') || '{}'));
  };

  const handleLogout = () => {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('user_info');
    setIsAuthenticated(false);
    setUserInfo({});
  };

  const handleProfileUpdate = () => {
    setUserInfo(JSON.parse(localStorage.getItem('user_info') || '{}'));
  };

  const Layout = ({ children }) => (
    <>
      <Sidebar onLogout={handleLogout} userInfo={userInfo} />
      <div className="main-content">
        <Topbar theme={theme} toggleTheme={toggleTheme} onLogout={handleLogout} userInfo={userInfo} />
        <main className="content-area">
          {children}
        </main>
      </div>
    </>
  );

  return (
    <BrowserRouter>
      {/* Background liquid blobs */}
      <div className="liquid-bg">
        <div className="liquid-blob liquid-blob-1"></div>
        <div className="liquid-blob liquid-blob-2"></div>
        <div className="liquid-blob liquid-blob-3"></div>
      </div>

      <div className="app-container">
        <Routes>
          {/* Landing page */}
          <Route path="/" element={<Landing isAuthenticated={isAuthenticated} />} />

          {/* Auth routes */}
          <Route 
            path="/login" 
            element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login onLoginSuccess={handleLoginSuccess} />} 
          />
          <Route 
            path="/register" 
            element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Register />} 
          />

          {/* Authenticated SME / B2B routes */}
          <Route 
            path="/dashboard" 
            element={isAuthenticated ? <Layout><Dashboard /></Layout> : <Navigate to="/login" replace />} 
          />
          <Route 
            path="/invoices" 
            element={isAuthenticated ? <Layout><Invoices /></Layout> : <Navigate to="/login" replace />} 
          />
          <Route 
            path="/expenses" 
            element={isAuthenticated ? <Layout><Expenses /></Layout> : <Navigate to="/login" replace />} 
          />
          <Route 
            path="/budget" 
            element={isAuthenticated ? <Layout><Budgets /></Layout> : <Navigate to="/login" replace />} 
          />
          <Route 
            path="/runway" 
            element={isAuthenticated ? <Layout><Runway /></Layout> : <Navigate to="/login" replace />} 
          />
          <Route 
            path="/copilot" 
            element={isAuthenticated ? <Layout><CopilotWorkspace /></Layout> : <Navigate to="/login" replace />} 
          />
          <Route 
            path="/profile" 
            element={isAuthenticated ? <Layout><Profile onLogout={handleLogout} onProfileUpdate={handleProfileUpdate} /></Layout> : <Navigate to="/login" replace />} 
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
