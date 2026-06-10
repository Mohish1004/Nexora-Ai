import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  CreditCard, 
  ShieldAlert, 
  Activity, 
  Sparkles, 
  Settings, 
  LogOut,
  Building2
} from 'lucide-react';
import './Sidebar.css';

export default function Sidebar({ onLogout, userInfo }) {
  const navigate = useNavigate();
  const displayUser = userInfo || JSON.parse(localStorage.getItem('user_info') || '{}');

  const navItems = [
    { path: '/dashboard', label: 'Cash Flow Board', icon: LayoutDashboard },
    { path: '/invoices', label: 'Client Invoices', icon: FileText },
    { path: '/expenses', label: 'Vendor Expenses', icon: CreditCard },
    { path: '/budget', label: 'Department Caps', icon: ShieldAlert },
    { path: '/runway', label: 'Runway Reserves', icon: Activity },
    { path: '/copilot', label: 'AI Advisory Copilot', icon: Sparkles },
    { path: '/profile', label: 'Company Settings', icon: Settings },
  ];

  return (
    <aside className="app-sidebar glass-card">
      <div className="sidebar-brand">
        <div className="brand-logo bg-gradient-to-tr from-violet-500 to-cyan-400">
          <Building2 className="brand-icon text-white" size={20} />
        </div>
        <div className="brand-text">
          <h2 className="text-gradient font-black">CentricBiz</h2>
          <span className="brand-tag">AI Cash Control</span>
        </div>
      </div>

      <div className="sidebar-user">
        <div className="user-avatar bg-violet-600/30 text-violet-300 border border-violet-500/30">
          {displayUser?.name ? displayUser.name.charAt(0).toUpperCase() : 'C'}
        </div>
        <div className="user-details">
          <h4 className="text-white truncate">{displayUser?.name || 'Company Director'}</h4>
          <span className="user-email truncate">{displayUser?.email || 'ceo@centric.ai'}</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <span className="nav-section-title">COMMAND PORTAL</span>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink 
              key={item.path} 
              to={item.path} 
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              <Icon size={18} className="nav-icon" />
              <span>{item.label}</span>
              {item.path === '/copilot' && <span className="nav-badge bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">Biz AI</span>}
            </NavLink>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <button onClick={onLogout} className="btn-logout text-red-400 hover:bg-red-500/10 hover:text-red-300">
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
