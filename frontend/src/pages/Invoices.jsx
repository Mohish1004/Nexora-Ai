import React, { useState, useEffect } from 'react';
import { invoiceApi } from '../api/client';
import { 
  FileText, 
  Plus, 
  Trash2, 
  TrendingUp, 
  Sparkles, 
  Calendar,
  Building,
  DollarSign
} from 'lucide-react';

export default function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [clientName, setClientName] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState('PENDING');

  const [saving, setSaving] = useState(false);

  const loadInvoices = async () => {
    try {
      setLoading(true);
      const res = await invoiceApi.getAll();
      setInvoices(res.data || []);
    } catch (e) {
      console.error('Failed to load client invoices:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvoices();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!clientName || !amount || !date) return;

    setSaving(true);
    try {
      await invoiceApi.create({
        clientName,
        amount: parseFloat(amount),
        date,
        status
      });
      // reset form
      setClientName('');
      setAmount('');
      setStatus('PENDING');
      loadInvoices();
    } catch (err) {
      console.error('Failed to log client invoice:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await invoiceApi.delete(id);
      loadInvoices();
    } catch (e) {
      console.error('Failed to remove invoice record:', e);
    }
  };

  const totalRevenue = invoices.reduce((sum, inv) => sum + inv.amount, 0);
  const paidRevenue = invoices.filter(inv => inv.status === 'PAID').reduce((sum, inv) => sum + inv.amount, 0);
  const pendingRevenue = invoices.filter(inv => inv.status === 'PENDING').reduce((sum, inv) => sum + inv.amount, 0);

  return (
    <div className="invoices-wrapper animate-fadeIn">
      {/* Top statistics */}
      <div className="kpis-grid">
        <div className="glass-card p-6">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">GROSS BILLED REVENUE</span>
          <h3 className="text-white text-2xl font-black mt-2">₹{totalRevenue.toLocaleString()}</h3>
          <span className="text-xs text-gray-500 mt-2 block">All logged client contracts</span>
        </div>

        <div className="glass-card p-6">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">COLLECTED REVENUE</span>
          <h3 className="text-emerald-400 text-2xl font-black mt-2">₹{paidRevenue.toLocaleString()}</h3>
          <span className="text-xs text-gray-500 mt-2 block">Cleared invoice payments</span>
        </div>

        <div className="glass-card p-6">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">ACCOUNTS RECEIVABLE</span>
          <h3 className="text-amber-400 text-2xl font-black mt-2">₹{pendingRevenue.toLocaleString()}</h3>
          <span className="text-xs text-gray-500 mt-2 block">Unpaid invoices in pipeline</span>
        </div>
      </div>

      <div className="visuals-grid mt-8">
        {/* Left Column: Form to log new invoice */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-6 border-b border-white/5 pb-3">
            <Sparkles size={16} className="text-cyan-400" />
            <h4 className="text-white text-base font-bold">Log Client Invoice</h4>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="form-group">
              <label className="form-label">CLIENT NAME</label>
              <div className="relative">
                <Building size={16} className="absolute left-3 top-4 text-gray-500" />
                <input 
                  type="text" 
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="e.g. Acme Corp Retainer" 
                  className="input-glass pl-10"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">INVOICE VALUE (INR)</label>
              <div className="relative">
                <span className="absolute left-3.5 top-3.5 text-gray-500 font-bold text-sm">₹</span>
                <input 
                  type="number" 
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="250000" 
                  className="input-glass pl-10"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">BILLING DATE</label>
              <div className="relative">
                <Calendar size={16} className="absolute left-3 top-4 text-gray-500" />
                <input 
                  type="date" 
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="input-glass pl-10"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">PAYMENT STATUS</label>
              <select 
                value={status} 
                onChange={(e) => setStatus(e.target.value)}
                className="input-glass"
              >
                <option value="PAID">PAID / CLEARED</option>
                <option value="PENDING">PENDING / ISSUED</option>
                <option value="OVERDUE">OVERDUE</option>
              </select>
            </div>

            <button 
              type="submit" 
              className="btn-glass btn-glass-primary w-full py-3.5 text-sm font-semibold flex justify-center items-center gap-1.5"
              disabled={saving}
            >
              <Plus size={16} />
              <span>{saving ? 'Logging Invoice...' : 'Generate Invoice Entry'}</span>
            </button>
          </form>
        </div>

        {/* Right Column: Invoice Registry List */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-6 border-b border-white/5 pb-3">
            <FileText size={16} className="text-violet-400" />
            <h4 className="text-white text-base font-bold">Billing Registry</h4>
          </div>

          {loading ? (
            <div className="text-center py-10 text-gray-500 text-xs">Loading accounts ledger...</div>
          ) : invoices.length === 0 ? (
            <div className="text-center py-10 text-gray-500 text-xs italic">No client billing records found.</div>
          ) : (
            <div className="space-y-3 max-h-[440px] overflow-y-auto pr-1">
              {invoices.map((inv) => (
                <div key={inv.id} className="flex justify-between items-center p-4 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-all">
                  <div className="flex items-start gap-3">
                    <div className="bg-cyan-500/10 text-cyan-400 p-2 rounded-lg flex-shrink-0">
                      <FileText size={16} />
                    </div>
                    <div>
                      <h5 className="text-white text-xs font-bold">{inv.clientName}</h5>
                      <span className="text-[10px] text-gray-500 block mt-0.5">{inv.date}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <h5 className="text-white text-xs font-black">₹{inv.amount.toLocaleString()}</h5>
                      <span className={`badge-glass text-[8px] font-bold px-2 py-0.5 mt-1 inline-block ${
                        inv.status === 'PAID' ? 'badge-glass-success' : inv.status === 'PENDING' ? 'badge-glass-warning' : 'badge-glass-danger'
                      }`}>
                        {inv.status}
                      </span>
                    </div>
                    <button 
                      onClick={() => handleDelete(inv.id)}
                      className="text-red-400/60 hover:text-red-400 p-1.5 hover:bg-red-500/10 rounded transition-all"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
