import React, { useState } from 'react';
import { useAppStore, Customer } from '../store/appStore';
import { Users, Search, UserCheck, DollarSign, Calendar, Mail, Plus, X, Trash2 } from 'lucide-react';

export default function Customers() {
  const { customers, addCustomer, deleteCustomer } = useAppStore();
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(customers[0]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');

  const filtered = customers.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newEmail) return;
    addCustomer({ name: newName, email: newEmail, outstanding: 0 });
    setNewName('');
    setNewEmail('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-white font-display">Client Ledgers</h2>
          <p className="text-xs text-gray-400 mt-1">Review active clients, account statuses, outstanding invoice balances.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-primary text-black font-semibold text-xs hover:bg-cyan-400 transition-all shadow-lg shadow-cyan-500/20"
        >
          <Plus size={14} />
          <span>Register Customer</span>
        </button>
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
                  <th className="pb-3 pr-4 text-center">Actions</th>
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
                    <td className="py-3.5 pr-4 text-center">
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteCustomer(item.id); }}
                        className="w-7 h-7 rounded bg-white/5 hover:bg-red-500/10 text-red-400 flex items-center justify-center border border-white/5 mx-auto"
                        title="Delete customer"
                      >
                        <Trash2 size={12} />
                      </button>
                    </td>
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
                onClick={() => alert(`Invoice ledger dispatched to ${selectedCustomer.email}`)}
                className="w-full text-center text-xs font-semibold py-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-all"
              >
                Dispatch Email Ledger
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add Customer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center p-6 z-50 backdrop-blur-sm">
          <div className="w-full max-w-md glass-card rounded-2xl border border-white/10 p-6 shadow-2xl relative">
            <button 
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X size={16} />
            </button>

            <h3 className="text-lg font-black text-white font-display mb-4">Register New Customer</h3>

            <form onSubmit={handleAddCustomer} className="space-y-4">
              <div>
                <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Customer Name</label>
                <input 
                  type="text" 
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Acme Corp"
                  className="w-full px-3 py-2 text-xs glass-input"
                />
              </div>

              <div>
                <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Email Address</label>
                <input 
                  type="email" 
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="e.g. billing@acme.com"
                  className="w-full px-3 py-2 text-xs glass-input"
                />
              </div>

              <p className="text-[10px] text-gray-500 flex items-center gap-1 mt-3">
                <Mail size={12} />
                A welcome notification will be sent automatically upon registration.
              </p>

              <button 
                type="submit"
                className="w-full py-3 rounded-xl bg-primary text-black font-bold text-xs hover:bg-cyan-400 transition-all uppercase mt-4"
              >
                Register Customer
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
