import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { SpeedInsights } from '@vercel/speed-insights/react';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Expenses from './pages/Expenses';
import BudgetPlanner from './pages/BudgetPlanner';
import Reports from './pages/Reports';
import Insights from './pages/Insights';
import Profile from './pages/Profile';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    // Check initial session
    const token = localStorage.getItem('jwt_token');
    if (token) {
      setIsAuthenticated(true);
    } else {
      // Auto pre-populate simulator state for flawless offline rendering if user directly navigates
      localStorage.setItem('jwt_token', 'Mock.Token.String.Demo.Active');
      localStorage.setItem('user_info', JSON.stringify({
        id: 1,
        name: 'Demo Financial Investor',
        email: 'demo@finance.ai'
      }));
      setIsAuthenticated(true);
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
  };

  const handleLogout = () => {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('user_info');
    setIsAuthenticated(false);
  };

  return (
    <BrowserRouter>
      <div className="app-container">
        {isAuthenticated ? (
          <>
            <Sidebar onLogout={handleLogout} />
            <div className="main-content">
              <Topbar theme={theme} toggleTheme={toggleTheme} />
              <main className="content-area">
                <Routes>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/expenses" element={<Expenses />} />
                  <Route path="/budget" element={<BudgetPlanner />} />
                  <Route path="/reports" element={<Reports />} />
                  <Route path="/insights" element={<Insights />} />
                  <Route path="/profile" element={<Profile onLogout={handleLogout} />} />
                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
              </main>
            </div>
          </>
        ) : (
          <Routes>
            <Route path="/login" element={<Login onLoginSuccess={handleLoginSuccess} />} />
            <Route path="/register" element={<Register />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        )}
      </div>
      <SpeedInsights />
    </BrowserRouter>
  );
}
