import React, { useState } from 'react';
import { useAppStore } from '../store/appStore';
import { Settings as SettingsIcon, Bell, Shield, Smartphone, Sliders, Check } from 'lucide-react';

export default function Settings() {
  const [activeSec, setActiveSec] = useState<'general' | 'notifications' | 'security'>('general');
  const { activeWorkspace } = useAppStore();

  const isBusiness = activeWorkspace === 'business';
  const accentBorder = isBusiness ? 'border-primary' : 'border-primary-emerald';
  const accentText = isBusiness ? 'text-primary' : 'text-primary-emerald';

  return (
    <div className="space-y-8 animate-float-medium">
      {/* Title */}
      <div>
        <h2 className="text-3xl font-black text-white font-display">Workspace Configuration</h2>
        <p className="text-xs text-gray-400 mt-1">Configure global notification triggers, security channels, and themes.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Left side settings menu */}
        <div className="glass-card rounded-2xl border border-white/10 p-3 space-y-1">
          <button
            onClick={() => setActiveSec('general')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all border ${
              activeSec === 'general' 
                ? `${accentText} bg-white/5 border-white/10` 
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <Sliders size={14} />
            <span>General Preferences</span>
          </button>
          
          <button
            onClick={() => setActiveSec('notifications')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all border ${
              activeSec === 'notifications' 
                ? `${accentText} bg-white/5 border-white/10` 
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <Bell size={14} />
            <span>Notification Triggers</span>
          </button>

          <button
            onClick={() => setActiveSec('security')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all border ${
              activeSec === 'security' 
                ? `${accentText} bg-white/5 border-white/10` 
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <Shield size={14} />
            <span>Security & 2FA</span>
          </button>
        </div>

        {/* Right side config editor panels */}
        <div className="glass-card rounded-2xl border border-white/10 p-6 lg:col-span-3">
          {activeSec === 'general' && (
            <div className="space-y-6">
              <h3 className="font-bold text-sm text-white border-b border-white/5 pb-3">General Settings</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5">System Language</label>
                  <select className="w-full px-3 py-2.5 text-xs glass-input bg-background focus:outline-none">
                    <option>English (IN)</option>
                    <option>English (US)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5">Default Timezone</label>
                  <select className="w-full px-3 py-2.5 text-xs glass-input bg-background focus:outline-none">
                    <option>Asia/Kolkata (GMT +5:30)</option>
                    <option>UTC (GMT +0:00)</option>
                  </select>
                </div>
              </div>

              <div className="pt-4">
                <button className="px-5 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-white border border-white/10 font-bold text-xs">
                  Save General Changes
                </button>
              </div>
            </div>
          )}

          {activeSec === 'notifications' && (
            <div className="space-y-6">
              <h3 className="font-bold text-sm text-white border-b border-white/5 pb-3">Notification Channels</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-white/[0.01] border border-white/5">
                  <div>
                    <h4 className="text-xs font-semibold text-white">Email Daily Digest</h4>
                    <p className="text-[10px] text-gray-500 mt-0.5">Receive summary reports of inventory alerts and payables at 08:00 AM.</p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-4 h-4 accent-cyan-500" />
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-white/[0.01] border border-white/5">
                  <div>
                    <h4 className="text-xs font-semibold text-white">Realtime Push Notifications</h4>
                    <p className="text-[10px] text-gray-500 mt-0.5">Instant alerts for low stock items and direct AI advisory reports.</p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-4 h-4 accent-cyan-500" />
                </div>
              </div>
            </div>
          )}

          {activeSec === 'security' && (
            <div className="space-y-6">
              <h3 className="font-bold text-sm text-white border-b border-white/5 pb-3">Security Channels</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-white/[0.01] border border-white/5">
                  <div>
                    <h4 className="text-xs font-semibold text-white">Two-Factor Authentication (2FA)</h4>
                    <p className="text-[10px] text-gray-500 mt-0.5">Secure your portal login sessions using TOTP verification codes.</p>
                  </div>
                  <button className="px-3 py-1.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[9px] uppercase font-bold">
                    Enabled
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
