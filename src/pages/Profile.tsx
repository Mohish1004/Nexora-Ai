import React from 'react';
import { useAppStore } from '../store/appStore';
import { User, ShieldCheck, Cpu, Key, FileText, CheckCircle } from 'lucide-react';

export default function Profile() {
  const { user } = useAppStore();

  return (
    <div className="space-y-8 animate-float-medium">
      {/* Title */}
      <div>
        <h2 className="text-3xl font-black text-white font-display">Command Profile</h2>
        <p className="text-xs text-gray-400 mt-1">Audit profile credentials, workspace authorizations, and security settings.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User details */}
        <div className="glass-card p-6 rounded-2xl border border-white/10 lg:col-span-2 space-y-6">
          <div className="flex items-center gap-4 border-b border-white/5 pb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-400 to-violet-500 flex items-center justify-center font-bold text-2xl text-white">
              {user?.name?.[0] || 'D'}
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">{user?.name || 'Sarah Connor'}</h3>
              <span className="text-xs text-gray-400 block mt-0.5">{user?.email || 'ceo@nexora.ai'}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider block">Security Level</span>
              <div className="flex items-center gap-1.5 text-xs text-cyan-400 font-bold uppercase">
                <ShieldCheck size={14} />
                <span>Enterprise Administrator</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider block">Default Terminal Workspace</span>
              <span className="text-xs text-white font-semibold">Dual Sandbox (Business & Personal)</span>
            </div>
          </div>
        </div>

        {/* Diagnostic logs */}
        <div className="glass-card p-6 rounded-2xl border border-white/10 space-y-4">
          <h3 className="font-bold text-sm text-white">Active Session Audits</h3>
          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5 text-[10px] space-y-1">
              <div className="flex justify-between text-white font-semibold">
                <span>Vite Development Server</span>
                <span className="text-emerald-400">Online</span>
              </div>
              <p className="text-gray-500">Session ID: sess_active_38402</p>
            </div>
            
            <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5 text-[10px] space-y-1">
              <div className="flex justify-between text-white font-semibold">
                <span>Zustand State Store</span>
                <span className="text-emerald-400">Initialized</span>
              </div>
              <p className="text-gray-500">Seeded ledger items: 12 entries</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
