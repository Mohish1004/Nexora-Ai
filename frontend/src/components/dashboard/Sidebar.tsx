import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppStore } from '../../store/appStore';
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  Briefcase, 
  ArrowUpRight, 
  ArrowDownLeft, 
  BarChart3, 
  Settings, 
  LogOut, 
  Cpu, 
  PiggyBank, 
  Target, 
  Receipt,
  User
} from 'lucide-react';

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { activeWorkspace, setActiveWorkspace, logout, user } = useAppStore();

  const isBusiness = activeWorkspace === 'business';

  const businessLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Inventory', path: '/inventory', icon: Package },
    { name: 'Customers', path: '/customers', icon: Users },
    { name: 'Vendors', path: '/vendors', icon: Briefcase },
    { name: 'Receivables', path: '/receivables', icon: ArrowUpRight },
    { name: 'Payables', path: '/payables', icon: ArrowDownLeft },
    { name: 'Business Reports', path: '/reports', icon: BarChart3 },
  ];

  const personalLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Expense Manager', path: '/expenses', icon: Receipt },
    { name: 'Savings & Goals', path: '/goals', icon: Target },
    { name: 'Personal Reports', path: '/personal-reports', icon: BarChart3 },
  ];

  const links = isBusiness ? businessLinks : personalLinks;
  const accentClass = isBusiness ? 'text-primary' : 'text-primary-emerald';
  const borderHoverClass = isBusiness ? 'hover:border-primary/30 hover:bg-primary/5' : 'hover:border-primary-emerald/30 hover:bg-primary-emerald/5';
  const activeBgClass = isBusiness ? 'bg-primary/10 border-primary text-primary' : 'bg-primary-emerald/10 border-primary-emerald text-primary-emerald';

  return (
    <aside className="w-64 glass-panel border-r border-white/10 h-screen flex flex-col fixed left-0 top-0 z-20">
      {/* Brand Header */}
      <div className="p-6 border-b border-white/10 flex items-center gap-3">
        <div className={`w-8 h-8 rounded-lg bg-gradient-to-tr ${isBusiness ? 'from-cyan-500 to-violet-600' : 'from-emerald-500 to-teal-600'} flex items-center justify-center`}>
          <Cpu size={18} className="text-white" />
        </div>
        <div>
          <h1 className="font-bold text-lg leading-tight text-white font-display">Nexora AI</h1>
          <span className={`text-[10px] uppercase font-bold tracking-wider ${accentClass}`}>
            {isBusiness ? 'Business command' : 'Personal command'}
          </span>
        </div>
      </div>

      {/* Workspace Indicator Card */}
      <div className="p-4 mx-4 mt-6 rounded-xl glass-card border border-white/10 flex flex-col gap-2">
        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Current Workspace</span>
        <div className="flex items-center justify-between">
          <span className="font-semibold text-sm text-white capitalize">{activeWorkspace} Portal</span>
          <div className={`w-2.5 h-2.5 rounded-full ${isBusiness ? 'bg-primary' : 'bg-primary-emerald'} animate-pulse`} />
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        {links.map((link) => {
          const isActive = location.pathname === link.path;
          const Icon = link.icon;
          return (
            <button
              key={link.name}
              onClick={() => navigate(link.path)}
              className={`group w-full flex items-center gap-3.5 px-4 py-3 rounded-lg border text-sm font-medium transition-all duration-300 ${
                isActive 
                  ? `${activeBgClass} border-l-4` 
                  : `border-transparent text-gray-400 ${borderHoverClass} hover:text-white`
              }`}
            >
              <Icon size={18} className={isActive ? '' : 'text-gray-400 group-hover:text-white transition-colors'} />
              <span>{link.name}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer User Profile Summary */}
      <div className="p-4 border-t border-white/10 flex flex-col gap-2 bg-black/10">
        <div className="flex items-center gap-3 px-2 py-1.5">
          <div className="w-9 h-9 rounded-full bg-white/10 border border-white/10 flex items-center justify-center">
            <User size={16} className="text-gray-300" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-semibold text-white truncate">{user?.name || 'Director Mode'}</h4>
            <p className="text-[10px] text-gray-500 truncate">{user?.email || 'admin@nexora.ai'}</p>
          </div>
        </div>
        
        <button
          onClick={() => navigate('/settings')}
          className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-400 hover:text-white rounded transition-colors"
        >
          <Settings size={14} />
          <span>Workspace Settings</span>
        </button>

        <button
          onClick={() => {
            logout();
            navigate('/');
          }}
          className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/5 rounded transition-colors"
        >
          <LogOut size={14} />
          <span>Sign Out Session</span>
        </button>
      </div>
    </aside>
  );
}
