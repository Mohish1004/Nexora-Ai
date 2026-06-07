import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Expenses from './pages/Expenses';
import BudgetPlanner from './pages/BudgetPlanner';
import Reports from './pages/Reports';
import Insights from './pages/Insights';
import Profile from './pages/Profile';
import CopilotWorkspace from './pages/CopilotWorkspace';
import Goals from './pages/Goals';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [theme, setTheme] = useState('light');
  const [userInfo, setUserInfo] = useState({});

  useEffect(() => {
    // Check initial session
    const token = localStorage.getItem('jwt_token');
    if (token) {
      setIsAuthenticated(true);
      setUserInfo(JSON.parse(localStorage.getItem('user_info') || '{}'));
    }

    // Load custom theme
    const savedTheme = localStorage.getItem('app_theme') || 'light';
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
        <Topbar theme={theme} toggleTheme={toggleTheme} />
        <main className="content-area">
          {children}
        </main>
      </div>
    </>
  );

  return (
    <BrowserRouter>
      <div className="app-container">
        <Routes>
          {/* Landing page is always at root / */}
          <Route path="/" element={<Landing isAuthenticated={isAuthenticated} />} />

          {/* Auth routes - Redirect to /copilot on success */}
          <Route 
            path="/login" 
            element={isAuthenticated ? <Navigate to="/copilot" replace /> : <Login onLoginSuccess={handleLoginSuccess} />} 
          />
          <Route 
            path="/register" 
            element={isAuthenticated ? <Navigate to="/copilot" replace /> : <Register />} 
          />

          {/* Authenticated Dashboard & Feature routes */}
          <Route 
            path="/copilot" 
            element={isAuthenticated ? <Layout><CopilotWorkspace /></Layout> : <Navigate to="/login" replace />} 
          />
          <Route 
            path="/dashboard" 
            element={isAuthenticated ? <Layout><Dashboard /></Layout> : <Navigate to="/login" replace />} 
          />
          <Route 
            path="/expenses" 
            element={isAuthenticated ? <Layout><Expenses /></Layout> : <Navigate to="/login" replace />} 
          />
          <Route 
            path="/budget" 
            element={isAuthenticated ? <Layout><BudgetPlanner /></Layout> : <Navigate to="/login" replace />} 
          />
          <Route 
            path="/goals" 
            element={isAuthenticated ? <Layout><Goals /></Layout> : <Navigate to="/login" replace />} 
          />
          <Route 
            path="/reports" 
            element={isAuthenticated ? <Layout><Reports /></Layout> : <Navigate to="/login" replace />} 
          />
          <Route 
            path="/insights" 
            element={isAuthenticated ? <Layout><Insights /></Layout> : <Navigate to="/login" replace />} 
          />
          <Route 
            path="/profile" 
            element={isAuthenticated ? <Layout><Profile onLogout={handleLogout} onProfileUpdate={handleProfileUpdate} /></Layout> : <Navigate to="/login" replace />} 
          />

          {/* Wildcard redirects back to home/landing */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
