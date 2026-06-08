import React, { useEffect, useState } from 'react';
import { 
  goalApi, 
  analyticsApi, 
  expenseApi, 
  incomeApi 
} from '../api/client';
import { 
  Target, 
  Plus, 
  Trash2, 
  Edit2, 
  Sparkles, 
  Calendar, 
  PiggyBank, 
  TrendingUp, 
  ShieldAlert, 
  CheckCircle,
  HelpCircle
} from 'lucide-react';
import './Goals.css';

const CATEGORIES = ['Emergency Fund', 'Vacation', 'Investments', 'Debt Repayment'];

export default function Goals() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Monthly surplus context for timeline forecasting
  const [monthlySurplus, setMonthlySurplus] = useState(15000);
  const [sliderSurplus, setSliderSurplus] = useState(15000);

  // Form State
  const [editingId, setEditingId] = useState(null);
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('0');
  const [deadline, setDeadline] = useState(new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]); // 6 months from now
  const [category, setCategory] = useState('Emergency Fund');

  const fetchGoalsAndSurplus = async () => {
    try {
      setLoading(true);
      setError('');
      const [goalRes, incRes, expRes] = await Promise.all([
        goalApi.getAll(),
        incomeApi.getAll(),
        expenseApi.getAll()
      ]);
      setGoals(goalRes.data || []);

      // Calculate rolling surplus
      const totalInc = (incRes.data || []).reduce((sum, item) => sum + (item.amount || 0), 0);
      const totalExp = (expRes.data || []).reduce((sum, item) => sum + (item.amount || 0), 0);
      const surplus = totalInc - totalExp;
      const finalSurplus = surplus > 0 ? surplus : 12000;
      setMonthlySurplus(finalSurplus);
      setSliderSurplus(finalSurplus);
    } catch (err) {
      console.error('Failed to load goals data:', err);
      setError('Failed to retrieve goals index from database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoalsAndSurplus();
  }, []);

  const handleSaveGoal = async (e) => {
    e.preventDefault();
    if (!name || !targetAmount) return;
    setError('');

    const payload = {
      name,
      targetAmount: parseFloat(targetAmount),
      currentAmount: parseFloat(currentAmount || 0),
      deadline,
      category
    };

    try {
      if (editingId) {
        await goalApi.update(editingId, payload);
      } else {
        await goalApi.create(payload);
      }
      
      // Reset form
      setEditingId(null);
      setName('');
      setTargetAmount('');
      setCurrentAmount('0');
      setCategory('Emergency Fund');
      fetchGoalsAndSurplus();
    } catch (err) {
      console.error('Failed saving goal:', err);
      setError('Failed to persist goal parameters in DB.');
    }
  };

  const handleEdit = (goal) => {
    setEditingId(goal.id);
    setName(goal.name);
    setTargetAmount(goal.targetAmount);
    setCurrentAmount(goal.currentAmount);
    setDeadline(goal.deadline);
    setCategory(goal.category);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    setError('');
    try {
      await goalApi.delete(id);
      setGoals(goals.filter(x => x.id !== id));
    } catch (err) {
      setError('Failed to delete goal.');
    }
  };

  // ────────────────────────────────────────────────────────
  // AI PREDICTIVE FORECAST MATH & ADVICE
  // ────────────────────────────────────────────────────────
  const calculateGoalTimeline = (goal) => {
    const remaining = goal.targetAmount - goal.currentAmount;
    if (remaining <= 0) return 'Goal Completed!';
    
    const months = Math.ceil(remaining / sliderSurplus);
    const targetDate = new Date();
    targetDate.setMonth(targetDate.getMonth() + months);
    
    const options = { year: 'numeric', month: 'long' };
    return {
      monthsText: `${months} month${months > 1 ? 's' : ''}`,
      dateText: targetDate.toLocaleDateString('en-US', options)
    };
  };

  const getAiAdvice = (goal) => {
    switch (goal.category) {
      case 'Emergency Fund':
        return `We suggest setting aside at least 3 to 6 months of absolute necessities. At your current average monthly expenditure, we suggest a target of ₹${(1.5 * goal.targetAmount).toLocaleString()} for enhanced security. Maintain these savings in a high-yield liquid account.`;
      case 'Vacation':
        return "Vacations are discretionary. Since you are saving for a trip, we recommend checking if your current monthly budget can be optimized by 10% on entertainment to reach the target 2 months earlier.";
      case 'Investments':
        return "Investments carry compound potential. Spreading allocations across index funds or diversified mutual funds will yield passive interest growth. Reinvest all dividends automatically.";
      default: // Debt Repayment
        return "Debt carries interest burdens. We suggest dedicating 100% of your extra cash flows to this goal. Eliminating credit or loan debt first yields an immediate guaranteed financial return.";
    }
  };

  return (
    <div className="goals-page-wrapper">
      <div className="radial-mesh"></div>
      <div className="radial-mesh-two"></div>

      {error && (
        <div className="alert alert-danger mb-4 p-3 rounded bg-rose-950/20 text-rose-400 border border-rose-900/20 text-xs font-semibold">
          {error}
        </div>
      )}

      {/* Page Header */}
      <div className="goals-page-header mb-6">
        <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">FINANCIAL DIRECTIVES</span>
        <h1 className="mt-2 text-2xl font-extrabold text-white">Milestone Goal Planner</h1>
        <p className="text-sm text-gray-400 mt-1">Configure saving targets, view predictive completion dates, and read AI advice.</p>
      </div>

      <div className="goals-layout-grid grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: Input Form */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Surplus Simulator Card */}
          <div className="glass-panel p-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400 mb-3 flex items-center gap-1.5">
              <Sparkles size={14} /> Forecast Engine Simulator
            </h3>
            <p className="text-xs text-muted mb-4 leading-relaxed font-sans">
              Drag the slider to simulate changes in your monthly savings surplus. Watch completion dates shift in real-time.
            </p>
            
            <div className="flex justify-between items-center text-xs font-semibold mb-2">
              <span>Simulated Surplus:</span>
              <span className="text-indigo-400 text-sm font-bold">₹{sliderSurplus.toLocaleString()}/mo</span>
            </div>
            
            <input 
              type="range" 
              min="2000" 
              max="100000" 
              step="1000"
              value={sliderSurplus} 
              onChange={(e) => setSliderSurplus(parseInt(e.target.value))}
              className="w-full accent-indigo-500 bg-gray-950 h-1.5 rounded-lg appearance-none cursor-pointer"
            />
            
            <div className="flex justify-between text-[10px] text-muted mt-2 font-mono">
              <span>₹2k</span>
              <span>₹50k</span>
              <span>₹100k</span>
            </div>
          </div>

          <div className="glass-panel p-6">
            <div className="card-header mb-4">
              <h3>{editingId ? 'Modify Saved Target' : 'Create New Target'}</h3>
              {editingId && (
                <button onClick={() => setEditingId(null)} className="text-xs text-indigo-400">Cancel Edit</button>
              )}
            </div>

            <form onSubmit={handleSaveGoal} className="space-y-4">
              <div className="form-group text-left">
                <label className="form-label">Goal Title</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Summer Vacation, Emergency Reserve"
                  required 
                />
              </div>

              <div className="form-group text-left">
                <label className="form-label">Category</label>
                <select 
                  className="form-select" 
                  value={category} 
                  onChange={(e) => setCategory(e.target.value)}
                >
                  {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>

              <div className="form-group text-left">
                <label className="form-label">Target Goal Amount (₹)</label>
                <input 
                  type="number" 
                  className="form-input text-lg font-bold" 
                  value={targetAmount} 
                  onChange={(e) => setTargetAmount(e.target.value)}
                  placeholder="0"
                  required 
                />
              </div>

              <div className="form-group text-left">
                <label className="form-label">Amount Already Saved (₹)</label>
                <input 
                  type="number" 
                  className="form-input" 
                  value={currentAmount} 
                  onChange={(e) => setCurrentAmount(e.target.value)}
                  placeholder="0" 
                />
              </div>

              <div className="form-group text-left">
                <label className="form-label">Target Completion Date</label>
                <input 
                  type="date" 
                  className="form-input" 
                  value={deadline} 
                  onChange={(e) => setDeadline(e.target.value)}
                  required 
                />
              </div>

              <button type="submit" className="btn btn-primary w-full justify-center gap-2">
                <Plus size={16} />
                <span>{editingId ? 'Save Reallocation' : 'Commit Saving Target'}</span>
              </button>
            </form>
          </div>
        </div>

        {/* RIGHT COLUMN: Active Goals Cards Grid */}
        <div className="lg:col-span-8 space-y-6">
          
          {loading ? (
            <div className="p-8 text-center text-gray-500 animate-pulse text-sm">Synchronizing goals catalog...</div>
          ) : goals.length === 0 ? (
            <div className="glass-panel p-12 text-center text-gray-500">
              <Target size={40} className="mx-auto mb-3 text-gray-600 animate-pulse" />
              <h4 className="font-bold text-white">No active goals configured yet</h4>
              <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">Create a savings target in the left panel to begin monitoring timelines and receiving AI advice.</p>
            </div>
          ) : (
            <div className="goals-cards-grid grid grid-cols-1 md:grid-cols-2 gap-6">
              {goals.map((goal) => {
                const pct = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
                const completed = pct >= 100;
                const forecast = calculateGoalTimeline(goal);
                
                return (
                  <div key={goal.id} className="goal-card glass-panel p-6 flex flex-col justify-between">
                    
                    {/* Top Row: Info & Icon */}
                    <div>
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">{goal.category}</span>
                          <h4 className="font-bold text-white text-base mt-1">{goal.name}</h4>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => handleEdit(goal)} className="text-gray-500 hover:text-white p-1" title="Edit">
                            <Edit2 size={13} />
                          </button>
                          <button onClick={() => handleDelete(goal.id)} className="text-gray-600 hover:text-rose-400 p-1" title="Delete">
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>

                      {/* Middle: Progress Bar */}
                      <div className="progress-bar-block mt-6">
                        <div className="flex justify-between text-xs font-semibold mb-1.5">
                          <span className="text-gray-400">₹{goal.currentAmount.toLocaleString()} of ₹{goal.targetAmount.toLocaleString()}</span>
                          <span className="text-indigo-400">{pct}%</span>
                        </div>
                        <div className="progress-track h-2 w-full bg-gray-950 rounded-full overflow-hidden">
                          <div className="progress-fill h-full bg-indigo-500 rounded-full" style={{ width: `${pct}%` }}></div>
                        </div>
                      </div>
                    </div>

                    {/* Bottom: Forecast and AI Advice */}
                    <div className="mt-6 pt-4 border-t border-gray-800/60">
                      {completed ? (
                        <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold mb-3">
                          <CheckCircle size={14} />
                          <span>Goal Completed!</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-xs text-indigo-300 font-semibold mb-3">
                          <Calendar size={14} className="text-indigo-400" />
                          <span>Est. Completion: <strong>{forecast.dateText}</strong> ({forecast.monthsText})</span>
                        </div>
                      )}
                      
                      {/* AI Advice Bubble */}
                      <div className="p-3 rounded-lg bg-indigo-950/20 border border-indigo-900/20 text-[10px] text-indigo-200/90 leading-relaxed">
                        <div className="flex items-start gap-1.5">
                          <Sparkles size={12} className="text-indigo-400 mt-0.5 flex-shrink-0" />
                          <p>{getAiAdvice(goal)}</p>
                        </div>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
