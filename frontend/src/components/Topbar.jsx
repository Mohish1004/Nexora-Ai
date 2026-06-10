import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Sun, 
  Moon, 
  Activity, 
  Flame, 
  Wallet,
  Settings,
  LogOut,
  Sparkles
} from 'lucide-react';
import { analyticsApi } from '../api/client';
import './Topbar.css';

export default function Topbar({ theme, toggleTheme, onLogout, userInfo }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    cashBuffer: 0,
    monthlyBurnRate: 0,
    runwayMonths: 0
  });

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/dashboard': return 'Executive Command Center';
      case '/invoices': return 'Client Billing & Revenue';
      case '/expenses': return 'Vendor Payouts & Invoices';
      case '/budget': return 'Operational Department Budgets';
      case '/runway': return 'Cash Runway Reserves';
      case '/copilot': return 'Biz AI Advisory Copilot';
      case '/profile': return 'Company Settings';
      default: return 'CentricBiz Control';
    }
  };

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await analyticsApi.getRunway();
        if (res.data) {
          setStats({
            cashBuffer: res.data.cashBuffer || 0,
            monthlyBurnRate: res.data.monthlyBurnRate || 0,
            runwayMonths: res.data.runwayMonths || 0
          });
        }
      } catch (e) {
        // Fallback mock
        setStats({
          cashBuffer: 350000,
          monthlyBurnRate: 48000,
          runwayMonths: 7.3
        });
      }
    }
    loadStats();
    
    // Refresh stats when the page changes
    const interval = setInterval(loadStats, 10000);
    return () => clearInterval(interval);
  }, [location]);

  return (
    <header className="app-topbar glass-card">
      <div className="topbar-left">
        <h1 className="topbar-title text-white">{getPageTitle()}</h1>
      </div>

      <div className="topbar-stats">
        <div className="topbar-stat-node border-r border-white/5">
          <div className="stat-icon text-cyan-400">
            <Wallet size={16} />
          </div>
          <div>
            <span className="stat-lbl">CASH BUFFER</span>
            <h5 className="text-white">₹{Math.round(stats.cashBuffer).toLocaleString()}</h5>
          </div>
        </div>

        <div className="topbar-stat-node border-r border-white/5">
          <div className="stat-icon text-rose-400">
            <Flame size={16} />
          </div>
          <div>
            <span className="stat-lbl">MONTHLY BURN</span>
            <h5 className="text-white">₹{Math.round(stats.monthlyBurnRate).toLocaleString()}</h5>
          </div>
        </div>

        <div className="topbar-stat-node">
          <div className="stat-icon text-violet-400">
            <Activity size={16} />
          </div>
          <div>
            <span className="stat-lbl">AI RUNWAY</span>
            <h5 className="text-white">{stats.runwayMonths.toFixed(1)} Mo</h5>
          </div>
        </div>
      </div>

      <div className="topbar-right">
        <button onClick={toggleTheme} className="theme-toggle-btn text-gray-400 hover:text-white">
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <div className="profile-dropdown">
          <div className="avatar-chip border border-white/10" onClick={() => navigate('/profile')}>
            <span className="font-bold text-violet-300">
              {userInfo?.name ? userInfo.name.substring(0, 2).toUpperCase() : 'CO'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
