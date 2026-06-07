import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  PlusCircle, 
  Target, 
  PieChart, 
  Sparkles, 
  User, 
  LogOut,
  Wallet,
  Brain
} from 'lucide-react';
import './Sidebar.css';

export default function Sidebar({ onLogout, userInfo }) {
  const navigate = useNavigate();
  const displayUser = userInfo || JSON.parse(localStorage.getItem('user_info') || '{}');

  const navItems = [
    { path: '/copilot', label: 'AI Copilot', icon: Sparkles },
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/expenses', label: 'Expenses & OCR', icon: PlusCircle },
    { path: '/budget', label: 'Budget Planner', icon: Wallet },
    { path: '/goals', label: 'Milestone Goals', icon: Target },
    { path: '/reports', label: 'Analytics Reports', icon: PieChart },
    { path: '/insights', label: 'AI Insights & Forecasts', icon: Brain },
    { path: '/profile', label: 'User Settings', icon: User },
  ];

  return (
    <aside className="app-sidebar glass-panel">
      <div className="sidebar-brand">
        <div className="brand-logo">
          <Sparkles className="brand-icon" size={24} />
        </div>
        <div className="brand-text">
          <h2>Centric<span>AI</span></h2>
          <span className="brand-tag">Finance & Predictor</span>
        </div>
      </div>

      <div className="sidebar-user">
        <div className="user-avatar">
          {displayUser?.name ? displayUser.name.charAt(0).toUpperCase() : 'U'}
        </div>
        <div className="user-details">
          <h4>{displayUser?.name || 'Demo Investor'}</h4>
          <span className="user-email">{displayUser?.email || 'demo@finance.ai'}</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <span className="nav-section-title">Main Navigation</span>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink 
              key={item.path} 
              to={item.path} 
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              <Icon size={20} className="nav-icon" />
              <span>{item.label}</span>
              {item.path === '/insights' && <span className="nav-badge">AI</span>}
            </NavLink>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <button onClick={onLogout} className="btn-logout">
          <LogOut size={18} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
