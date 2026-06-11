import React, { useState, useMemo } from 'react';
import { useAppStore, Customer } from '../store/appStore';
import { Users, Search, UserCheck, DollarSign, Calendar, Mail, Phone, Plus, X, Trash2, BarChart3, ArrowUpRight } from 'lucide-react';

export default function Customers() {
  const { customers, addCustomer, deleteCustomer } = useAppStore();
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(customers[0] || null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');

  const filtered = customers.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    (c.phone && c.phone.includes(search))
  );

  const stats = useMemo(() => {
    const total = customers.length;
    const totalOutstanding = customers.reduce((s, c) => s + c.outstanding, 0);
    const avgOutstanding = total > 0 ? Math.round(totalOutstanding / total) : 0;
    return { total, totalOutstanding, avgOutstanding };
  }, [customers]);

  const handleAddCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newEmail) return;
    addCustomer({ name: newName, email: newEmail, phone: newPhone || undefined, outstanding: 0 });
    setNewName('');
    setNewEmail('');
    setNewPhone('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-white font-display">Client Database</h2>
          <p className="text-xs text-gray-400 mt-1">Manage clients, outstanding balances, and account details.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-primary text-black font-semibold text-xs hover:bg-cyan-400 transition-all shadow-lg shadow-cyan-500/20"
        >
          <Plus size={14} />
          <span>Register Customer</span>
        </button>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="glass-card p-4 rounded-xl border border-white/10">
          <div className="flex items-center gap-2 text-gray-400 text-[10px] uppercase font-bold tracking-wider mb-1">
            <Users size={12} />
            <span>Total Clients</span>
          </div>
          <p className="text-2xl font-black text-white">{stats.total}</p>
        </div>
        <div className="glass-card p-4 rounded-xl border border-white/10">
          <div className="flex items-center gap-2 text-gray-400 text-[10px] uppercase font-bold tracking-wider mb-1">
            <DollarSign size={12} />
            <span>Total Outstanding</span>
          </div>
          <p className="text-2xl font-black text-warning">₹{stats.totalOutstanding.toLocaleString()}</p>
        </div>
        <div className="glass-card p-4 rounded-xl border border-white/10">
          <div className="flex items-center gap-2 text-gray-400 text-[10px] uppercase font-bold tracking-wider mb-1">
            <BarChart3 size={12} />
            <span>Avg Outstanding</span>
          </div>
          <p className="text-2xl font-black text-white">₹{stats.avgOutstanding.toLocaleString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Customer List */}
        <div className="glass-card p-6 rounded-2xl border border-white/10 lg:col-span-2 space-y-6">
          <div className="relative">
            <Search size={14} className="absolute left-3.5 top-3.5 text-gray-500" />
            <input 
              type="text" 
              placeholder="Search by name, email, or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-xs glass-input"
            />
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-12 text-gray-500 text-xs">
              <Users size={24} className="mx-auto mb-2 opacity-50" />
              <p>No customers found{customers.length === 0 ? '. Register your first customer above.' : ''}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-gray-500 font-bold uppercase tracking-wider">
                    <th className="pb-3 pr-4">Customer</th>
                    <th className="pb-3 pr-4">Email</th>
                    <th className="pb-3 pr-4">Phone</th>
                    <th className="pb-3 pr-4">Outstanding</th>
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
                      <td className="py-3.5 pr-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center font-bold text-xs">
                            {item.name[0]}
                          </div>
                          <span className="font-semibold text-white">{item.name}</span>
                        </div>
                      </td>
                      <td className="py-3.5 pr-4 font-mono">{item.email}</td>
                      <td className="py-3.5 pr-4">{item.phone || '—'}</td>
                      <td className={`py-3.5 pr-4 font-bold ${item.outstanding > 0 ? 'text-warning' : 'text-gray-500'}`}>
                        ₹{item.outstanding.toLocaleString()}
                      </td>
                      <td className="py-3.5 text-center">
                        <button
                          onClick={(e) => { e.stopPropagation(); deleteCustomer(item.id); }}
                          className="w-7 h-7 rounded bg-white/5 hover:bg-red-500/10 text-red-400 flex items-center justify-center border border-white/5 mx-auto"
                          aria-label={`Delete ${item.name}`}
                        >
                          <Trash2 size={12} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right Customer Detail Card */}
        {selectedCustomer ? (
          <div className="glass-card p-6 rounded-2xl border border-white/10 space-y-6">
            <div className="text-center border-b border-white/10 pb-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-400 to-violet-500 text-white flex items-center justify-center font-bold text-xl mx-auto mb-3">
                {selectedCustomer.name[0]}
              </div>
              <h3 className="font-bold text-base text-white">{selectedCustomer.name}</h3>
              <div className="flex items-center justify-center gap-1 text-[10px] text-gray-500 mt-1">
                <UserCheck size={10} />
                <span>Active Client</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3 p-2.5 rounded-lg bg-white/[0.02] border border-white/5">
                <Mail size={14} className="text-gray-500 shrink-0" />
                <div className="min-w-0">
                  <p className="text-[10px] text-gray-500">Email</p>
                  <p className="text-xs text-white truncate">{selectedCustomer.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-2.5 rounded-lg bg-white/[0.02] border border-white/5">
                <Phone size={14} className="text-gray-500 shrink-0" />
                <div>
                  <p className="text-[10px] text-gray-500">Phone</p>
                  <p className="text-xs text-white">{selectedCustomer.phone || 'Not provided'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-2.5 rounded-lg bg-white/[0.02] border border-white/5">
                <DollarSign size={14} className="text-gray-500 shrink-0" />
                <div>
                  <p className="text-[10px] text-gray-500">Outstanding Balance</p>
                  <p className={`text-xs font-bold ${selectedCustomer.outstanding > 0 ? 'text-warning' : 'text-white'}`}>
                    ₹{selectedCustomer.outstanding.toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-2.5 rounded-lg bg-white/[0.02] border border-white/5">
                <Calendar size={14} className="text-gray-500 shrink-0" />
                <div>
                  <p className="text-[10px] text-gray-500">Last Payment</p>
                  <p className="text-xs text-white">{selectedCustomer.lastPaymentDate}</p>
                </div>
              </div>
            </div>

            <div className="border-t border-white/10 pt-4 space-y-2">
              <button 
                onClick={() => alert(`Invoice ledger dispatched to ${selectedCustomer.email}`)}
                className="w-full flex items-center justify-center gap-1.5 text-xs font-semibold py-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-all"
              >
                <ArrowUpRight size={12} />
                <span>Send Invoice Ledger</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="glass-card p-6 rounded-2xl border border-white/10 flex items-center justify-center text-gray-500 text-xs min-h-[200px]">
            Select a customer to view details.
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
              aria-label="Close modal"
            >
              <X size={16} />
            </button>

            <h3 className="text-lg font-black text-white font-display mb-4">Register New Customer</h3>

            <form onSubmit={handleAddCustomer} className="space-y-4">
              <div>
                <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Customer Name *</label>
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
                <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Email Address *</label>
                <input 
                  type="email" 
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="e.g. billing@acme.com"
                  className="w-full px-3 py-2 text-xs glass-input"
                />
              </div>

              <div>
                <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Phone Number</label>
                <input 
                  type="tel" 
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="e.g. +91 98765 43210"
                  className="w-full px-3 py-2 text-xs glass-input"
                />
              </div>

              <p className="text-[10px] text-gray-500 flex items-center gap-1 mt-3">
                <Mail size={12} />
                A welcome notification will be sent upon registration.
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