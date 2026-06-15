import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppStore } from '../../store/appStore';
import {
  LayoutDashboard,
  Package,
  Users,
  ArrowUpRight,
  ArrowDownLeft,
  BarChart3,
  Settings,
  LogOut,
  Cpu,
  Receipt,
  Target,
  User,
  Info,
  LifeBuoy,
  Mail,
  Search,
  Shield,
  MessageSquare
} from 'lucide-react';

interface NavItem {
  name: string;
  path: string;
  icon: React.ElementType;
  workspace: 'both' | 'business' | 'personal';
}

const navItems: NavItem[] = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, workspace: 'both' },
  { name: 'Receivables', path: '/receivables', icon: ArrowUpRight, workspace: 'business' },
  { name: 'Payables', path: '/payables', icon: ArrowDownLeft, workspace: 'business' },
  { name: 'Inventory', path: '/inventory', icon: Package, workspace: 'business' },
  { name: 'Customers', path: '/customers', icon: Users, workspace: 'business' },
  { name: 'Expenses', path: '/expenses', icon: Receipt, workspace: 'personal' },
  { name: 'Goals', path: '/goals', icon: Target, workspace: 'personal' },
  { name: 'Analytics', path: '', icon: BarChart3, workspace: 'both' },
  { name: 'Audit Center', path: '/copilot', icon: Shield, workspace: 'both' },
];

export default function Sidebar({ onClose }: { onClose?: () => void }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { activeWorkspace, logout, user } = useAppStore();

  const isBusiness = activeWorkspace === 'business';
  const accentClass = isBusiness ? 'text-primary' : 'text-primary-emerald';
  const borderHoverClass = isBusiness ? 'hover:border-primary/30 hover:bg-primary/5' : 'hover:border-primary-emerald/30 hover:bg-primary-emerald/5';
  const activeBgClass = isBusiness ? 'bg-primary/10 border-primary text-primary' : 'bg-primary-emerald/10 border-primary-emerald text-primary-emerald';

  const filteredLinks = navItems
    .filter(item => item.workspace === 'both' || item.workspace === activeWorkspace)
    .map(item => ({
      ...item,
      path: item.path || (isBusiness ? '/reports' : '/personal-reports'),
    }));

  return (
    <aside className="w-full h-full glass-panel border-r border-border flex flex-col">
      {/* Brand Header */}
      <div className="p-6 border-b border-border flex items-center gap-3 shrink-0">
        <div className={`w-8 h-8 rounded-lg bg-gradient-to-tr ${isBusiness ? 'from-cyan-500 to-violet-600' : 'from-emerald-500 to-teal-600'} flex items-center justify-center`}>
          <Cpu size={18} className="text-white" />
        </div>
        <div>
          <h1 className="font-bold text-lg leading-tight text-white font-display">Nexora AI</h1>
          <span className={`text-[10px] uppercase font-bold tracking-wider ${accentClass}`}>
            {isBusiness ? 'Business' : 'Personal'}
          </span>
        </div>
      </div>

      {/* Workspace Indicator */}
      <div className="p-4 mx-4 mt-4 rounded-xl glass-card flex flex-col gap-2 shrink-0">
        <span className="text-[10px] text-secondary font-bold uppercase tracking-wider">Workspace</span>
        <div className="flex items-center justify-between">
          <span className="font-semibold text-sm text-white capitalize">{activeWorkspace}</span>
          <div className={`w-2 h-2 rounded-full ${isBusiness ? 'bg-primary' : 'bg-primary-emerald'} animate-pulse`} />
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        {filteredLinks.map((link) => {
          const isActive = location.pathname === link.path;
          const Icon = link.icon as any;
          return (
            <button
              key={link.name}
              onClick={() => { navigate(link.path); onClose?.(); }}
              className={`group w-full flex items-center gap-3.5 px-4 py-3 rounded-lg border text-sm font-medium transition-all duration-300 ${
                isActive
                  ? `${activeBgClass} border-l-4 glow-accent`
                  : `border-transparent text-secondary ${borderHoverClass} hover:text-foreground`
              }`}
            >
              <Icon size={18} className={isActive ? '' : 'text-secondary group-hover:text-foreground transition-colors'} />
              <span>{link.name}</span>
            </button>
          );
        })}

        {/* Bottom Actions (Settings / Help / Contact / About) */}
        <div className="pt-4 mt-4 border-t border-border space-y-1">
          {[
            { name: 'Settings', path: '/settings', icon: Settings },
            { name: 'Help', path: '/help', icon: LifeBuoy },
            { name: 'Contact', path: '/contact', icon: Mail },
            { name: 'About', path: '/about', icon: Info },
          ].map((link) => {
            const isActive = location.pathname === link.path;
            const Icon = link.icon as any;
            return (
              <button
                key={link.name}
                onClick={() => { navigate(link.path); onClose?.(); }}
                className={`group w-full flex items-center gap-3 px-4 py-2.5 rounded-lg border text-xs font-medium transition-all duration-300 ${
                  isActive
                    ? `${activeBgClass} border-l-4`
                    : `border-transparent text-secondary ${borderHoverClass} hover:text-foreground`
                }`}
              >
                <Icon size={16} className={isActive ? '' : 'text-secondary group-hover:text-foreground transition-colors'} />
                <span>{link.name}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Footer - User Profile (pinned to bottom) */}
      <div className="mt-auto p-4 border-t border-border bg-black/20">
        <div className="flex items-center gap-3 px-2 py-1.5">
          <div className="w-9 h-9 rounded-full bg-white/10 border border-white/10 flex items-center justify-center shrink-0">
            <User size={16} className="text-gray-300" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-semibold text-white truncate">{user?.name || 'User'}</h4>
            <p className="text-[10px] text-secondary truncate">{user?.email || 'user@nexora.ai'}</p>
          </div>
        </div>

        <button
          onClick={() => {
            logout();
            navigate('/');
            onClose?.();
          }}
          className="mt-2 w-full flex items-center gap-2 px-3 py-2 text-xs text-danger hover:text-red-300 hover:bg-red-500/5 rounded transition-colors"
        >
          <LogOut size={14} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
