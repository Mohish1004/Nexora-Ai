import React, { useState, useEffect } from 'react';
import { budgetApi, expenseApi } from '../api/client';
import { ShieldAlert, Plus, Sparkles, AlertTriangle, CheckCircle, Percent } from 'lucide-react';

export default function Budgets() {
  const [budgetLimit, setBudgetLimit] = useState(0);
  const [monthlyExpenses, setMonthlyExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [month] = useState(new Date().toISOString().substring(0, 7)); // "yyyy-MM"

  // Form state
  const [inputLimit, setInputLimit] = useState('');
  const [updating, setUpdating] = useState(false);
  const [success, setSuccess] = useState('');

  const loadBudgetData = async () => {
    try {
      setLoading(true);
      const [budRes, expRes] = await Promise.all([
        budgetApi.getForMonth(month),
        expenseApi.getAll()
      ]);
      
      setBudgetLimit(budRes.data?.monthlyLimit || 0);
      setInputLimit(budRes.data?.monthlyLimit || '');
      setMonthlyExpenses(expRes.data || []);
    } catch (e) {
      console.error('Failed to load budget cap datasets:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBudgetData();
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!inputLimit) return;

    setUpdating(true);
    setSuccess('');
    try {
      await budgetApi.setBudget({
        monthlyLimit: parseFloat(inputLimit),
        month
      });
      setBudgetLimit(parseFloat(inputLimit));
      setSuccess('Operational cap updated successfully!');
      setTimeout(() => setSuccess(''), 2000);
    } catch (err) {
      console.error('Failed to set budget limit:', err);
    } finally {
      setUpdating(false);
    }
  };

  const totalSpent = monthlyExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  const usedPercent = budgetLimit > 0 ? (totalSpent / budgetLimit) * 100 : 0;

  // Breakdown by category
  const categories = [
    "Infrastructure",
    "Marketing",
    "SaaS & Software",
    "Payroll & Contractors",
    "Office & Operations",
    "Travel & Meals"
  ];

  const categorySpent = (cat) => {
    return monthlyExpenses
      .filter(exp => exp.category === cat)
      .reduce((sum, exp) => sum + exp.amount, 0);
  };

  return (
    <div className="budgets-wrapper animate-fadeIn">
      {/* Top statistics summary */}
      <div className="kpis-grid">
        <div className="glass-card p-6">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">MONTHLY OPERATING CAP</span>
          <h3 className="text-white text-2xl font-black mt-2">₹{budgetLimit.toLocaleString()}</h3>
          <span className="text-xs text-gray-500 mt-2 block">Active limit for month: {month}</span>
        </div>

        <div className="glass-card p-6">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">LEADER OUTBURSTS (SPENT)</span>
          <h3 className="text-violet-400 text-2xl font-black mt-2">₹{totalSpent.toLocaleString()}</h3>
          <span className="text-xs text-gray-500 mt-2 block">Rolling corporate burn logged</span>
        </div>

        <div className="glass-card p-6">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">REMAINING OPERATING MARGIN</span>
          <h3 className={`text-2xl font-black mt-2 ${budgetLimit - totalSpent >= 0 ? 'text-cyan-300' : 'text-rose-400'}`}>
            ₹{Math.max(0, budgetLimit - totalSpent).toLocaleString()}
          </h3>
          <span className="text-xs text-gray-500 mt-2 block">Capital buffer prior to overruns</span>
        </div>
      </div>

      <div className="visuals-grid mt-8">
        {/* Left Column: Set Limit and Health Dial */}
        <div className="space-y-6">
          <div className="glass-card p-6">
            <div className="flex items-center gap-2 mb-6 border-b border-white/5 pb-3">
              <Sparkles size={16} className="text-cyan-400" />
              <h4 className="text-white text-base font-bold">Configure Operating Limit</h4>
            </div>

            {success && (
              <div className="mb-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
                <CheckCircle size={16} />
                <span>{success}</span>
              </div>
            )}

            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="form-group">
                <label className="form-label">MONTHLY LIMIT (INR)</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-3.5 text-gray-500 font-bold text-sm">₹</span>
                  <input 
                    type="number" 
                    value={inputLimit}
                    onChange={(e) => setInputLimit(e.target.value)}
                    placeholder="450000" 
                    className="input-glass pl-10"
                    required
                  />
                </div>
              </div>

              <button 
                type="submit" 
                className="btn-glass btn-glass-primary w-full py-3.5 text-sm font-semibold"
                disabled={updating}
              >
                {updating ? 'Updating Caps...' : 'Enforce Department Caps'}
              </button>
            </form>
          </div>

          {/* Alert Dial card */}
          <div className="glass-card p-6">
            <h4 className="text-white text-base font-bold mb-4">Operational Burn Velocity</h4>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-gray-500 text-xs">CAP UTILIZATION RATE</span>
                <h3 className="text-white text-2xl font-black mt-1">{usedPercent.toFixed(1)}%</h3>
              </div>
              <span className={`badge-glass text-xs font-bold px-3 py-1 ${
                usedPercent > 100 ? 'badge-glass-danger' : usedPercent > 80 ? 'badge-glass-warning' : 'badge-glass-success'
              }`}>
                {usedPercent > 100 ? 'OVERRUN' : usedPercent > 80 ? 'WARNING' : 'HEALTHY'}
              </span>
            </div>

            {/* Simulated progress tracker */}
            <div className="w-full bg-black/40 h-3 rounded-full mt-6 overflow-hidden border border-white/5">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  usedPercent > 100 ? 'bg-rose-500' : usedPercent > 80 ? 'bg-amber-500' : 'bg-cyan-400'
                }`}
                style={{ width: `${Math.min(100, usedPercent)}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Right Column: Category breakdown and targets */}
        <div className="glass-card p-6">
          <h4 className="text-white text-base font-bold border-b border-white/5 pb-3 mb-6">Category Allocation Audit</h4>
          
          <div className="space-y-6">
            {categories.map(cat => {
              const spent = categorySpent(cat);
              const limit = budgetLimit / categories.length; // flat allocation target comparison
              const pct = limit > 0 ? (spent / limit) * 100 : 0;

              return (
                <div key={cat} className="category-budget-node">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-white font-semibold">{cat}</span>
                    <div className="text-right">
                      <span className="text-white font-bold">₹{spent.toLocaleString()}</span>
                      <span className="text-gray-500 ml-1">/ target ₹{Math.round(limit).toLocaleString()}</span>
                    </div>
                  </div>
                  
                  <div className="w-full bg-black/40 h-2 rounded-full mt-2 overflow-hidden border border-white/5">
                    <div 
                      className={`h-full rounded-full ${spent > limit ? 'bg-rose-500' : 'bg-violet-400'}`}
                      style={{ width: `${Math.min(100, pct)}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
