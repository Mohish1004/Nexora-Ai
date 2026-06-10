import React, { useState } from 'react';
import { useAppStore, Customer } from '../store/appStore';
import { Users, Search, UserCheck, DollarSign, Calendar, Mail } from 'lucide-react';

export default function Customers() {
  const { customers } = useAppStore();
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(customers[0]);

  const filtered = customers.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-float-slow">
      {/* Title */}
      <div>
        <h2 className="text-3xl font-black text-white font-display">Client Ledgers</h2>
        <p className="text-xs text-gray-400 mt-1">Review active clients, account statuses, outstanding invoice balances.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Customer List & Search */}
        <div className="glass-card p-6 rounded-2xl border border-white/10 lg:col-span-2 space-y-6">
          <div className="relative">
            <Search size={14} className="absolute left-3.5 top-3.5 text-gray-500" />
            <input 
              type="text" 
              placeholder="Search clients..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-xs glass-input"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 text-gray-500 font-bold uppercase tracking-wider pb-2">
                  <th className="pb-3 pr-4">Customer</th>
                  <th className="pb-3 pr-4">Email</th>
                  <th className="pb-3 pr-4">Outstanding</th>
                  <th className="pb-3 pr-4">Last Payment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-gray-300">
                {filtered.map((item) => (
                  <tr 
                    key={item.id} 
                    onClick={() => setSelectedCustomer(item)}
                    className={`hover:bg-white/[0.02] cursor-pointer transition-colors ${selectedCustomer?.id === item.id ? 'bg-cyan-500/5 text-cyan-300' : ''}`}
                  >
                    <td className="py-3.5 pr-4 font-semibold text-white">{item.name}</td>
                    <td className="py-3.5 pr-4 font-mono">{item.email}</td>
                    <td className="py-3.5 pr-4 font-bold">₹{item.outstanding.toLocaleString()}</td>
                    <td className="py-3.5 pr-4">{item.lastPaymentDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Customer Ledger Profile Card */}
        {selectedCustomer && (
          <div className="glass-card p-6 rounded-2xl border border-white/10 space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                <div className="w-12 h-12 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center font-bold text-lg">
                  {selectedCustomer.name[0]}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">{selectedCustomer.name}</h3>
                  <span className="text-[10px] text-gray-500 font-mono block">{selectedCustomer.email}</span>
                </div>
              </div>

              <div className="space-y-3 py-2">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Outstanding Balance</span>
                  <span className="text-red-400 font-bold">₹{selectedCustomer.outstanding.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Total Purchase Value</span>
                  <span className="text-white font-semibold">₹1,85,000</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Last Invoice Date</span>
                  <span className="text-white font-semibold">{selectedCustomer.lastPaymentDate}</span>
                </div>
              </div>
            </div>

            <div className="border-t border-white/10 pt-4 space-y-2">
              <button 
                onClick={() => alert(`Email invoice ledger generated for ${selectedCustomer.name}`)}
                className="w-full text-center text-xs font-semibold py-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-all"
              >
                Dispatch Email Ledger
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
