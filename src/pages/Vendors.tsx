import React, { useState } from 'react';
import { useAppStore, Vendor } from '../store/appStore';
import { Briefcase, Search, ExternalLink, Calendar, Plus } from 'lucide-react';

export default function Vendors() {
  const { vendors } = useAppStore();
  const [search, setSearch] = useState('');
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(vendors[0]);

  const filtered = vendors.filter(v => 
    v.name.toLowerCase().includes(search.toLowerCase()) || 
    v.service.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-float-medium">
      {/* Title */}
      <div>
        <h2 className="text-3xl font-black text-white font-display">Corporate Suppliers</h2>
        <p className="text-xs text-gray-400 mt-1">Review vendor contracts, operational services, pending payables timeline.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Vendor List & Search */}
        <div className="glass-card p-6 rounded-2xl border border-white/10 lg:col-span-2 space-y-6">
          <div className="relative">
            <Search size={14} className="absolute left-3.5 top-3.5 text-gray-500" />
            <input 
              type="text" 
              placeholder="Search vendors..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-xs glass-input"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 text-gray-500 font-bold uppercase tracking-wider pb-2">
                  <th className="pb-3 pr-4">Vendor</th>
                  <th className="pb-3 pr-4">Service</th>
                  <th className="pb-3 pr-4">Owed Balance</th>
                  <th className="pb-3 pr-4">Due Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-gray-300">
                {filtered.map((item) => (
                  <tr 
                    key={item.id} 
                    onClick={() => setSelectedVendor(item)}
                    className={`hover:bg-white/[0.02] cursor-pointer transition-colors ${selectedVendor?.id === item.id ? 'bg-cyan-500/5 text-cyan-300' : ''}`}
                  >
                    <td className="py-3.5 pr-4 font-semibold text-white">{item.name}</td>
                    <td className="py-3.5 pr-4">{item.service}</td>
                    <td className="py-3.5 pr-4 font-bold">₹{item.amountOwed.toLocaleString()}</td>
                    <td className="py-3.5 pr-4 font-mono">{item.dueDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Vendor Profile Card */}
        {selectedVendor && (
          <div className="glass-card p-6 rounded-2xl border border-white/10 space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                <div className="w-12 h-12 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center">
                  <Briefcase size={22} />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">{selectedVendor.name}</h3>
                  <span className="text-[10px] text-gray-500 block">{selectedVendor.service}</span>
                </div>
              </div>

              <div className="space-y-3 py-2">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Amount Owed</span>
                  <span className="text-rose-400 font-bold">₹{selectedVendor.amountOwed.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Contract Due Date</span>
                  <span className="text-white font-semibold font-mono">{selectedVendor.dueDate}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Billing Type</span>
                  <span className="text-white font-semibold">Recurring Monthly</span>
                </div>
              </div>
            </div>

            <div className="border-t border-white/10 pt-4">
              <button 
                onClick={() => alert(`Supplier contract details opened for ${selectedVendor.name}`)}
                className="w-full text-center text-xs font-semibold py-2.5 rounded-lg bg-primary text-black hover:bg-cyan-400 transition-all flex items-center justify-center gap-1.5"
              >
                <span>Audit Service SLA</span>
                <ExternalLink size={12} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
