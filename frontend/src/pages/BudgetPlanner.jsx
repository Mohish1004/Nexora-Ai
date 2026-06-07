import React, { useEffect, useState } from 'react';
import { budgetApi, analyticsApi } from '../api/client';
import { Target, AlertTriangle, CheckCircle, TrendingUp, Calendar, RefreshCw } from 'lucide-react';
import './BudgetPlanner.css';

export default function BudgetPlanner() {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Custom Month Input
  const [selectedMonth, setSelectedMonth] = useState('2026-06');
  const [monthlyLimit, setMonthlyLimit] = useState('');
  const [activeBudget, setActiveBudget] = useState(null);
  
  // Comparison metrics
  const [totalExpenseForMonth, setTotalExpenseForMonth] = useState(0);
  const [savedStatus, setSavedStatus] = useState(false);

  const fetchBudgetContext = async (monthStr) => {
    try {
      setLoading(true);
      setError('');
      const [bListRes, bCurrRes, cRes] = await Promise.all([
        budgetApi.getAll(),
        budgetApi.getForMonth(monthStr),
        analyticsApi.getCategory(monthStr)
      ]);

      setBudgets(bListRes.data || []);
      const active = bCurrRes.data;
      setActiveBudget(active);
      if (active?.monthlyLimit) {
        setMonthlyLimit(active.monthlyLimit);
      } else {
        setMonthlyLimit(0); // defaults
      }

      // calculate current spend
      const cats = cRes.data || [];
      const spent = cats.reduce((acc, curr) => acc + (curr.amount || 0), 0);
      setTotalExpenseForMonth(spent);
    } catch (err) {
      console.error('Failed budget loading context:', err);
      setError('Failed to fetch budget boundaries from server.');
      setMonthlyLimit(0);
      setTotalExpenseForMonth(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgetContext(selectedMonth);
  }, [selectedMonth]);

  const handleSaveBudget = async (e) => {
    e.preventDefault();
    if (!monthlyLimit) return;
    setError('');

    try {
      await budgetApi.setBudget({
        month: selectedMonth,
        monthlyLimit: parseFloat(monthlyLimit)
      });
      setSavedStatus(true);
      setTimeout(() => setSavedStatus(false), 3000);
      fetchBudgetContext(selectedMonth);
    } catch (err) {
      setError('Failed to persist budget parameters: ' + (err.response?.data?.message || err.message));
    }
  };

  const limitNum = parseFloat(monthlyLimit) || 0;
  const percentageSpent = limitNum > 0 ? Math.round((totalExpenseForMonth / limitNum) * 100) : 0;
  const remaining = limitNum - totalExpenseForMonth;

  // Advisory logic
  let alertStatus = 'safe'; // safe, warning, critical
  if (percentageSpent >= 100) alertStatus = 'critical';
  else if (percentageSpent >= 80) alertStatus = 'warning';

  return (
    <div className="budget-planner-page fade-in">
      {error && <div className="alert alert-danger mb-4 p-3 rounded bg-danger-bg text-danger border border-danger/20 text-xs font-semibold">{error}</div>}
      <div className="budget-grid">
        {/* Left Control Card */}
        <div className="glass-panel edit-budget-card">
          <div className="panel-header">
            <div>
              <h3>Portfolio Budget Directives</h3>
              <p className="panel-desc">Module 4: Manage cycle boundary values</p>
            </div>
            <Target className="text-warning" size={24} />
          </div>

          {savedStatus && (
            <div className="alert-badge success fade-in mb-3 flex items-center gap-2">
              <CheckCircle size={16} />
              <span>Budget parameter routing completed successfully!</span>
            </div>
          )}

          <form onSubmit={handleSaveBudget}>
            <div className="form-group">
              <label className="form-label flex items-center gap-1">
                <Calendar size={14} />
                <span>Target Tracking Period</span>
              </label>
              <input 
                type="month" 
                className="form-input font-bold" 
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
              />
              <span className="text-xs text-muted">Format: YYYY-MM boundary constraints</span>
            </div>

            <div className="form-group mt-2">
              <label className="form-label">Absolute Spending Limit (₹)</label>
              <input 
                type="number" 
                step="100" 
                required 
                className="form-input text-lg font-bold text-primary" 
                value={monthlyLimit}
                onChange={(e) => setMonthlyLimit(e.target.value)}
              />
            </div>

            <button type="submit" className="btn btn-primary w-full mt-4">
              <RefreshCw size={16} />
              <span>Update Spending Directives</span>
            </button>
          </form>

          {/* Quick Info Box */}
          <div className="advisory-notice mt-6 p-3 bg-base rounded-md text-xs text-muted leading-relaxed border border-color">
            💡 <b>Smart Notifications Auto-Trigger:</b> The embedded AI model periodically executes rule loops against these constraints. If cumulative overhead breaches the 80% mark, proactive background advisory arrays are routed to topbar logs.
          </div>
        </div>

        {/* Right Output Visuals */}
        <div className="glass-panel tracking-output-card flex flex-col justify-between">
          <div>
            <div className="panel-header">
              <h3>Cycle Consumption Indicators</h3>
              <span className={`badge badge-${alertStatus === 'safe' ? 'education' : alertStatus === 'warning' ? 'food' : 'bills'}`}>
                {alertStatus.toUpperCase()} TRAJECTORY
              </span>
            </div>

            {/* Huge Meter */}
            <div className="big-limit-tracker mt-6">
              <div className="flex justify-between items-end mb-2">
                <div>
                  <span className="text-xs text-muted block uppercase">Current Period Overhead</span>
                  <span className="text-2xl font-bold">₹{totalExpenseForMonth.toLocaleString()}</span>
                  <span className="text-xs text-muted mx-1">/ ₹{limitNum.toLocaleString()}</span>
                </div>
                <div className="text-right">
                  <span className={`text-xl font-bold ${alertStatus === 'critical' ? 'text-danger' : alertStatus === 'warning' ? 'text-warning' : 'text-success'}`}>
                    {percentageSpent}%
                  </span>
                  <span className="text-xs text-muted block">Consumed</span>
                </div>
              </div>

              {/* Progress Container */}
              <div className="thick-progress-bar">
                <div 
                  className={`thick-fill ${alertStatus}`} 
                  style={{ width: `${Math.min(percentageSpent, 100)}%` }}
                ></div>
              </div>
            </div>

            {/* Smart Evaluation Card */}
            <div className={`status-eval-box mt-8 p-4 rounded-md border ${alertStatus === 'critical' ? 'bg-danger-light border-danger' : alertStatus === 'warning' ? 'bg-warning-light border-warning' : 'bg-success-light border-success'}`}>
              <div className="flex items-start gap-3">
                {alertStatus === 'critical' ? (
                  <AlertTriangle className="text-danger flex-shrink-0 mt-0.5" size={20} />
                ) : alertStatus === 'warning' ? (
                  <AlertTriangle className="text-warning flex-shrink-0 mt-0.5" size={20} />
                ) : (
                  <CheckCircle className="text-success flex-shrink-0 mt-0.5" size={20} />
                )}
                <div>
                  <h4 className="text-sm font-bold">
                    {alertStatus === 'critical' 
                      ? 'Overspending Critical Alert!' 
                      : alertStatus === 'warning' 
                      ? 'Budget Limit Caution Triggered' 
                      : 'Optimal Allocation Distribution'}
                  </h4>
                  <p className="text-xs mt-1 leading-normal text-muted-dark">
                    {alertStatus === 'critical' 
                      ? `Deficit notice: You have exceeded limits by ₹${Math.abs(remaining).toLocaleString()}. Immediate restriction of non-essential variables is strongly suggested.`
                      : alertStatus === 'warning'
                      ? `Caution: Only ₹${remaining.toLocaleString()} remaining. Restrict discretionary expenses to avoid hitting negative margin boundary conditions.`
                      : `Excellent balance control. You have a highly supportive unspent allowance buffer of ₹${remaining.toLocaleString()} preserved for remainder operations.`}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Historical Presets Listing */}
          <div className="history-budgets mt-8 pt-4 border-t border-color">
            <h4 className="text-xs text-muted uppercase mb-3">Saved Monthly Directives</h4>
            <div className="grid grid-cols-3 gap-2">
              {budgets.length > 0 ? budgets.slice(0, 3).map(b => (
                <button 
                  key={b.id || b.month} 
                  onClick={() => setSelectedMonth(b.month)}
                  className={`p-2 text-center rounded-md border text-xs transition-all ${selectedMonth === b.month ? 'border-primary bg-primary-light text-primary font-bold' : 'border-color bg-base hover:border-muted'}`}
                >
                  <span className="block text-[10px] text-muted">{b.month}</span>
                  <span>₹{(b.monthlyLimit || 0).toLocaleString()}</span>
                </button>
              )) : (
                <div className="col-span-3 text-muted text-xs text-center py-3 bg-base/50 rounded border border-color">No budget directives configured.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
