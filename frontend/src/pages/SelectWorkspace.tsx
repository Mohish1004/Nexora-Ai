import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/appStore';
import { Briefcase, PiggyBank, Package, ShieldCheck, ArrowRight, User } from 'lucide-react';

export default function SelectWorkspace() {
  const navigate = useNavigate();
  const { setActiveWorkspace, user } = useAppStore();
  const mode = user?.workspaceMode || 'both';

  const handleSelect = (workspace: 'business' | 'personal') => {
    setActiveWorkspace(workspace);
    navigate('/dashboard');
  };

  const showBusiness = mode === 'business' || mode === 'both';
  const showPersonal = mode === 'personal' || mode === 'both';

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6 pt-24 relative">
      <div className="liquid-bg">
        <div className="liquid-blob liquid-blob-cyan"></div>
        <div className="liquid-blob liquid-blob-emerald"></div>
        <div className="liquid-blob liquid-blob-purple"></div>
      </div>

      <div className="text-center mb-12 relative z-10">
        <h1 className="text-4xl font-black font-display text-white">Select Workspace Command</h1>
        <p className="text-gray-400 text-sm mt-3">Welcome back, {user?.name || 'Director'}. Initialize your workspace dashboard below.</p>
      </div>

      <div className={`grid grid-cols-1 ${showBusiness && showPersonal ? 'md:grid-cols-2' : 'md:grid-cols-1 max-w-md'} gap-8 w-full relative z-10`}>
        {showBusiness && (
          <div 
            onClick={() => handleSelect('business')}
            className="group glass-card p-8 rounded-2xl border border-white/10 hover:border-cyan-500/40 hover:shadow-[0_0_50px_rgba(0,212,255,0.15)] cursor-pointer flex flex-col justify-between h-96 transition-all duration-500 hover:-translate-y-2"
          >
            <div>
              <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Briefcase size={28} />
              </div>
              <h2 className="text-2xl font-black font-display text-white group-hover:text-cyan-400 transition-colors">Business Command</h2>
              <p className="text-xs text-gray-400 mt-2">Manage operations, warehouse levels, invoice receivables, and contractor payrolls.</p>
              
              <div className="grid grid-cols-2 gap-3 mt-6">
                <span className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 text-[10px] font-semibold text-gray-300">✓ Inventory Management</span>
                <span className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 text-[10px] font-semibold text-gray-300">✓ Customer Invoices</span>
                <span className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 text-[10px] font-semibold text-gray-300">✓ Payables Track</span>
                <span className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 text-[10px] font-semibold text-gray-300">✓ Sales Reports</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between mt-8 border-t border-white/5 pt-4">
              <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">Initialize Corporate Desk</span>
              <div className="w-8 h-8 rounded-full bg-cyan-500/10 text-cyan-400 flex items-center justify-center group-hover:bg-cyan-500 group-hover:text-white transition-all">
                <ArrowRight size={16} />
              </div>
            </div>
          </div>
        )}

        {showPersonal && (
          <div 
            onClick={() => handleSelect('personal')}
            className="group glass-card p-8 rounded-2xl border border-white/10 hover:border-emerald-500/40 hover:shadow-[0_0_50px_rgba(0,230,118,0.15)] cursor-pointer flex flex-col justify-between h-96 transition-all duration-500 hover:-translate-y-2"
          >
            <div>
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <PiggyBank size={28} />
              </div>
              <h2 className="text-2xl font-black font-display text-white group-hover:text-emerald-400 transition-colors">Personal Command</h2>
              <p className="text-xs text-gray-400 mt-2">Oversee household budget limits, scan dining receipts, audit monthly outflows, and track savings goals.</p>
              
              <div className="grid grid-cols-2 gap-3 mt-6">
                <span className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 text-[10px] font-semibold text-gray-300">✓ Expense Log Ledger</span>
                <span className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 text-[10px] font-semibold text-gray-300">✓ Smart OCR Scanner</span>
                <span className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 text-[10px] font-semibold text-gray-300">✓ Savings Targets</span>
                <span className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 text-[10px] font-semibold text-gray-300">✓ AI Advisor Chat</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between mt-8 border-t border-white/5 pt-4">
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Initialize Personal Desk</span>
              <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-all">
                <ArrowRight size={16} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
