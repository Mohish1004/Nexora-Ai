import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  PlusCircle, 
  Target, 
  PieChart, 
  Sparkles,
  User
} from 'lucide-react';
import './BottomNav.css';

export default function BottomNav() {
  const navItems = [
    { path: '/copilot', label: 'Copilot', icon: Sparkles },
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/expenses', label: 'Expenses', icon: PlusCircle },
    { path: '/goals', label: 'Goals', icon: Target },
    { path: '/reports', label: 'Reports', icon: PieChart },
    { path: '/profile', label: 'Profile', icon: User }
  ];

  return (
    <nav className="mobile-bottom-nav glass-panel">
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink 
            key={item.path} 
            to={item.path} 
            className={({ isActive }) => `bottom-nav-link ${isActive ? 'active' : ''}`}
          >
            <Icon size={20} className="bottom-nav-icon" />
            <span className="bottom-nav-label">{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}
