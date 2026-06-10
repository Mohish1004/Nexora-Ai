import React, { useState } from 'react';
import { useAppStore } from '../../store/appStore';
import { useNavigate } from 'react-router-dom';
import { 
  Bell, 
  Search, 
  ChevronDown, 
  Sparkles, 
  MessageSquare,
  ShieldCheck, 
  Check, 
  Trash2,
  Briefcase,
  PiggyBank
} from 'lucide-react';

export default function Topbar() {
  const navigate = useNavigate();
  const { 
    activeWorkspace, 
    setActiveWorkspace, 
    user, 
    notifications, 
    markNotificationRead 
  } = useAppStore();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileCard, setShowProfileCard] = useState(false);

  const isBusiness = activeWorkspace === 'business';
  const unreadCount = notifications.filter(n => !n.read).length;

  const toggleWorkspace = () => {
    setActiveWorkspace(isBusiness ? 'personal' : 'business');
  };

  return (
    <header className="h-20 glass-panel border-b border-white/10 w-[calc(100%-16rem)] ml-64 px-8 flex items-center justify-between fixed top-0 right-0 z-10">
      {/* Search Bar */}
      <div className="relative w-96">
        <Search size={16} className="absolute left-3.5 top-3.5 text-gray-500" />
        <input 
          type="text" 
          placeholder="Search ledger items, assets, transactions..."
          className="w-full pl-10 pr-4 py-2 text-xs glass-input"
        />
      </div>

      {/* Actions & Profiles */}
      <div className="flex items-center gap-6">
        
        {/* Workspace Quick Switcher */}
        <button
          onClick={toggleWorkspace}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-xs font-semibold transition-all duration-300 ${
            isBusiness 
              ? 'border-primary/20 bg-primary/5 text-primary hover:bg-primary/10'
              : 'border-primary-emerald/20 bg-primary-emerald/5 text-primary-emerald hover:bg-primary-emerald/10'
          }`}
        >
          {isBusiness ? <Briefcase size={14} /> : <PiggyBank size={14} />}
          <span>Switch to {isBusiness ? 'Personal' : 'Business'}</span>
        </button>

        {/* Floating AI Status Indicator */}
        <button 
          onClick={() => navigate('/copilot')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-[10px] font-bold hover:bg-violet-500/20 transition-all duration-300"
        >
          <Sparkles size={12} className="text-violet-400 animate-pulse" />
          <span>Nexora Copilot Live</span>
        </button>

        {/* Notification Bell */}
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="w-10 h-10 rounded-lg glass-card flex items-center justify-center hover:border-white/20 transition-all relative"
          >
            <Bell size={18} className="text-gray-300" />
            {unreadCount > 0 && (
              <span className={`absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white ${isBusiness ? 'bg-primary' : 'bg-primary-emerald'} animate-bounce`}>
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown Drawer */}
          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 glass-card border border-white/10 rounded-xl overflow-hidden shadow-2xl z-50">
              <div className="p-4 border-b border-white/10 flex items-center justify-between">
                <h3 className="font-semibold text-sm text-white">Notifications</h3>
                <span className="text-[10px] text-gray-500">{unreadCount} unread</span>
              </div>
              <div className="max-height-[300px] overflow-y-auto divide-y divide-white/5">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-xs text-gray-500">No alerts found.</div>
                ) : (
                  notifications.map((item) => (
                    <div 
                      key={item.id} 
                      className={`p-4 hover:bg-white/5 transition-colors ${!item.read ? 'bg-white/[0.02]' : ''}`}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <h4 className={`text-xs font-semibold text-white ${!item.read ? 'flex items-center gap-1.5' : ''}`}>
                          {!item.read && <span className="w-1.5 h-1.5 rounded-full bg-violet-400"></span>}
                          {item.title}
                        </h4>
                        <span className="text-[9px] text-gray-500 whitespace-nowrap">{item.timestamp}</span>
                      </div>
                      <p className="text-[10px] text-gray-400 mt-1">{item.description}</p>
                      {!item.read && (
                        <button 
                          onClick={() => markNotificationRead(item.id)}
                          className={`mt-2 flex items-center gap-1 text-[9px] font-bold uppercase ${isBusiness ? 'text-primary' : 'text-primary-emerald'}`}
                        >
                          <Check size={10} />
                          <span>Mark Read</span>
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile Dropdown */}
        <div className="relative">
          <button 
            onClick={() => setShowProfileCard(!showProfileCard)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg glass-card border border-white/10 hover:border-white/20 transition-all"
          >
            <div className="w-7 h-7 rounded-full bg-violet-600/20 text-violet-300 flex items-center justify-center font-bold text-xs">
              {user?.name?.[0] || 'D'}
            </div>
            <ChevronDown size={14} className="text-gray-400" />
          </button>

          {/* Profile Statistics Card */}
          {showProfileCard && (
            <div className="absolute right-0 mt-3 w-72 glass-card border border-white/10 rounded-xl p-5 shadow-2xl z-50">
              <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-cyan-400 to-violet-500 flex items-center justify-center font-bold text-lg text-white">
                  {user?.name?.[0] || 'D'}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">{user?.name || 'Executive Director'}</h3>
                  <div className="flex items-center gap-1 text-[10px] text-cyan-400 font-bold uppercase mt-0.5">
                    <ShieldCheck size={10} />
                    <span>Nexora Enterprise</span>
                  </div>
                </div>
              </div>
              
              <div className="py-4 space-y-3">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Businesses Managed</span>
                  <span className="text-white font-semibold">1 Active (SME)</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Total Transactions</span>
                  <span className="text-white font-semibold">14,280</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">AI Tokens Used</span>
                  <span className="text-white font-semibold">92.4k</span>
                </div>
              </div>

              <div className="border-t border-white/10 pt-4">
                <button 
                  onClick={() => {
                    setShowProfileCard(false);
                    navigate('/profile');
                  }} 
                  className="w-full text-center text-xs font-semibold py-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-all"
                >
                  View Command Profile
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}
