import React from 'react';
import { useAppStore } from '../store/appStore';
import { ArrowDownLeft, Clock, DollarSign, Calendar } from 'lucide-react';

export default function Payables() {
  const { payables } = useAppStore();
  const totalOwed = payables.reduce((sum, item) => sum + item.amount, 0);

  // Grouping payables for timelines
  const dueToday = payables.filter(p => p.dueDate.includes('12') || p.dueDate.includes('13')); // Mock sorting
  const dueThisWeek = payables.filter(p => p.dueDate.includes('15') || p.dueDate.includes('14'));
  const dueLater = payables.filter(p => !p.dueDate.includes('12') && !p.dueDate.includes('13') && !p.dueDate.includes('15') && !p.dueDate.includes('14'));

  return (
    <div className="space-y-8 animate-float-slow">
      {/* Title & Stats */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-white font-display">Payables Command</h2>
          <p className="text-xs text-gray-400 mt-1">Audit outgoing vendor obligations, bills, office rentals, and SaaS license dates.</p>
        </div>
        <div className="glass-card px-6 py-4 rounded-xl border border-white/10 flex items-center gap-4">
          <div>
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Total Vendor Payables</span>
            <span className="text-2xl font-black text-white font-display">₹{totalOwed.toLocaleString()}</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center">
            <ArrowDownLeft size={20} />
          </div>
        </div>
      </div>

      {/* Visual Timeline Lanes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lane 1: Today/Tomorrow */}
        <div className="glass-card p-6 rounded-2xl border border-rose-500/20 bg-rose-500/[0.01]">
          <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>
              <h3 className="font-bold text-sm text-white">Due Immediate</h3>
            </div>
            <span className="text-[10px] text-rose-400 font-bold font-mono">{dueToday.length} Bills</span>
          </div>
          
          <div className="space-y-4">
            {dueToday.length === 0 ? (
              <div className="p-8 text-center text-xs text-gray-500 border border-dashed border-white/5 rounded-xl">No immediate outlays.</div>
            ) : (
              dueToday.map((item) => (
                <div key={item.id} className="p-4 rounded-xl border glass-card border-white/5 space-y-3">
                  <div className="flex justify-between items-start">
                    <h4 className="text-xs font-bold text-white truncate max-w-[120px]">{item.vendorName}</h4>
                    <span className="text-xs font-black text-rose-400 font-display">₹{item.amount.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-gray-400 flex items-center gap-1 font-mono">
                      <Calendar size={12} className="text-rose-400" />
                      <span>{item.dueDate}</span>
                    </span>
                    <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 text-[9px] uppercase font-bold border border-rose-500/30">
                      Pending
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Lane 2: This Week */}
        <div className="glass-card p-6 rounded-2xl border border-amber-500/20 bg-amber-500/[0.01]">
          <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              <h3 className="font-bold text-sm text-white">Due This Week</h3>
            </div>
            <span className="text-[10px] text-amber-400 font-bold font-mono">{dueThisWeek.length} Bills</span>
          </div>

          <div className="space-y-4">
            {dueThisWeek.length === 0 ? (
              <div className="p-8 text-center text-xs text-gray-500 border border-dashed border-white/5 rounded-xl">No weekly outlays.</div>
            ) : (
              dueThisWeek.map((item) => (
                <div key={item.id} className="p-4 rounded-xl border glass-card border-white/5 space-y-3">
                  <div className="flex justify-between items-start">
                    <h4 className="text-xs font-bold text-white truncate max-w-[120px]">{item.vendorName}</h4>
                    <span className="text-xs font-black text-amber-400 font-display">₹{item.amount.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-gray-400 flex items-center gap-1 font-mono">
                      <Calendar size={12} className="text-amber-400" />
                      <span>{item.dueDate}</span>
                    </span>
                    <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[9px] uppercase font-bold border border-amber-500/30">
                      Pending
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Lane 3: Later / Scheduled */}
        <div className="glass-card p-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.01]">
          <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <h3 className="font-bold text-sm text-white">Scheduled Later</h3>
            </div>
            <span className="text-[10px] text-emerald-400 font-bold font-mono">{dueLater.length} Bills</span>
          </div>

          <div className="space-y-4">
            {dueLater.length === 0 ? (
              <div className="p-8 text-center text-xs text-gray-500 border border-dashed border-white/5 rounded-xl">No safe outlays.</div>
            ) : (
              dueLater.map((item) => (
                <div key={item.id} className="p-4 rounded-xl border glass-card border-white/5 space-y-3">
                  <div className="flex justify-between items-start">
                    <h4 className="text-xs font-bold text-white truncate max-w-[120px]">{item.vendorName}</h4>
                    <span className="text-xs font-black text-emerald-400 font-display">₹{item.amount.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-gray-400 flex items-center gap-1 font-mono">
                      <Calendar size={12} className="text-emerald-400" />
                      <span>{item.dueDate}</span>
                    </span>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[9px] uppercase font-bold border border-emerald-500/30">
                      Scheduled
                    </span>
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
