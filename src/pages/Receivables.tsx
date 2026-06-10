import React from 'react';
import { useAppStore } from '../store/appStore';
import { ArrowUpRight, Calendar, AlertCircle, MessageSquare, Check, Clock } from 'lucide-react';

export default function Receivables() {
  const { receivables, sendPaymentReminder } = useAppStore();
  const totalOutstanding = receivables.reduce((sum, item) => sum + item.amount, 0);

  // Grouping receivables for timeline lanes
  const dueToday = receivables.filter(r => r.daysRemaining <= 2);
  const dueThisWeek = receivables.filter(r => r.daysRemaining > 2 && r.daysRemaining <= 7);
  const currentLater = receivables.filter(r => r.daysRemaining > 7);

  const getUrgencyStyles = (status: 'urgent' | 'warning' | 'current') => {
    switch (status) {
      case 'urgent':
        return 'border-red-500/30 bg-red-500/10 text-red-400';
      case 'warning':
        return 'border-amber-500/30 bg-amber-500/10 text-amber-400';
      default:
        return 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400';
    }
  };

  const handleReminder = (id: string, customerName: string) => {
    sendPaymentReminder(id);
    alert(`Reminder notification dispatched to ${customerName} successfully.`);
  };

  return (
    <div className="space-y-8 animate-float-slow">
      {/* Title & Stats */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-white font-display">Receivables Pipeline</h2>
          <p className="text-xs text-gray-400 mt-1">Audit customer payment bounds and dispatch automated outstanding alerts.</p>
        </div>
        <div className="glass-card px-6 py-4 rounded-xl border border-white/10 flex items-center gap-4">
          <div>
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Outstanding Receivables</span>
            <span className="text-2xl font-black text-white font-display">₹{totalOutstanding.toLocaleString()}</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center">
            <ArrowUpRight size={20} />
          </div>
        </div>
      </div>

      {/* Visual Timeline Lanes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lane 1: Urgent (0-2 Days Left) */}
        <div className="glass-card p-6 rounded-2xl border border-red-500/20 bg-red-500/[0.01]">
          <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span>
              <h3 className="font-bold text-sm text-white">Overdue & Urgent</h3>
            </div>
            <span className="text-[10px] text-red-400 font-bold font-mono">{dueToday.length} Invoices</span>
          </div>
          
          <div className="space-y-4">
            {dueToday.length === 0 ? (
              <div className="p-8 text-center text-xs text-gray-500 border border-dashed border-white/5 rounded-xl">No immediate risk invoices.</div>
            ) : (
              dueToday.map((item) => (
                <div key={item.id} className="p-4 rounded-xl border glass-card border-red-500/10 space-y-3">
                  <div className="flex justify-between items-start">
                    <h4 className="text-xs font-bold text-white truncate max-w-[120px]">{item.customerName}</h4>
                    <span className="text-xs font-black text-red-400 font-display">₹{item.amount.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-gray-400 flex items-center gap-1">
                      <Clock size={12} className="text-red-400" />
                      <span>{item.daysRemaining} days left</span>
                    </span>
                    <button 
                      onClick={() => handleReminder(item.id, item.customerName)}
                      className="px-2 py-1 rounded bg-red-500/20 hover:bg-red-500 text-red-200 hover:text-white font-bold transition-all text-[9px] uppercase border border-red-500/30"
                    >
                      Remind Now
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Lane 2: Due this week (3-7 Days Left) */}
        <div className="glass-card p-6 rounded-2xl border border-amber-500/20 bg-amber-500/[0.01]">
          <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              <h3 className="font-bold text-sm text-white">Due This Week</h3>
            </div>
            <span className="text-[10px] text-amber-400 font-bold font-mono">{dueThisWeek.length} Invoices</span>
          </div>

          <div className="space-y-4">
            {dueThisWeek.length === 0 ? (
              <div className="p-8 text-center text-xs text-gray-500 border border-dashed border-white/5 rounded-xl">No weekly invoices due.</div>
            ) : (
              dueThisWeek.map((item) => (
                <div key={item.id} className="p-4 rounded-xl border glass-card border-amber-500/10 space-y-3">
                  <div className="flex justify-between items-start">
                    <h4 className="text-xs font-bold text-white truncate max-w-[120px]">{item.customerName}</h4>
                    <span className="text-xs font-black text-amber-400 font-display">₹{item.amount.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-gray-400 flex items-center gap-1">
                      <Clock size={12} className="text-amber-400" />
                      <span>{item.daysRemaining} days left</span>
                    </span>
                    <button 
                      onClick={() => handleReminder(item.id, item.customerName)}
                      className="px-2 py-1 rounded bg-amber-500/20 hover:bg-amber-500 text-amber-200 hover:text-white font-bold transition-all text-[9px] uppercase border border-amber-500/30"
                    >
                      Remind Now
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Lane 3: Current & Safe (>7 Days Left) */}
        <div className="glass-card p-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.01]">
          <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <h3 className="font-bold text-sm text-white">Current & Safe</h3>
            </div>
            <span className="text-[10px] text-emerald-400 font-bold font-mono">{currentLater.length} Invoices</span>
          </div>

          <div className="space-y-4">
            {currentLater.length === 0 ? (
              <div className="p-8 text-center text-xs text-gray-500 border border-dashed border-white/5 rounded-xl">No safe invoices.</div>
            ) : (
              currentLater.map((item) => (
                <div key={item.id} className="p-4 rounded-xl border glass-card border-emerald-500/10 space-y-3">
                  <div className="flex justify-between items-start">
                    <h4 className="text-xs font-bold text-white truncate max-w-[120px]">{item.customerName}</h4>
                    <span className="text-xs font-black text-emerald-400 font-display">₹{item.amount.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-gray-400 flex items-center gap-1">
                      <Clock size={12} className="text-emerald-400" />
                      <span>{item.daysRemaining} days left</span>
                    </span>
                    <button 
                      onClick={() => handleReminder(item.id, item.customerName)}
                      className="px-2 py-1 rounded bg-emerald-500/20 hover:bg-emerald-500 text-emerald-200 hover:text-white font-bold transition-all text-[9px] uppercase border border-emerald-500/30"
                    >
                      Remind Now
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
