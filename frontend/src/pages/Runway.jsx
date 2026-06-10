import React, { useState, useEffect } from 'react';
import { goalApi, analyticsApi } from '../api/client';
import { 
  Activity, 
  Plus, 
  Trash2, 
  Sparkles, 
  ShieldCheck, 
  Target, 
  Sliders,
  TrendingUp,
  SlidersHorizontal
} from 'lucide-react';

export default function Runway() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [runwayStats, setRunwayStats] = useState({
    cashBuffer: 0,
    monthlyBurnRate: 0,
    runwayMonths: 0
  });

  // Simulator Sliders states
  const [revenueMultiplier, setRevenueMultiplier] = useState(100); // percentage
  const [burnMultiplier, setBurnMultiplier] = useState(100);    // percentage

  // Goal Form states
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [goalRes, runRes] = await Promise.all([
        goalApi.getAll(),
        analyticsApi.getRunway()
      ]);
      setGoals(goalRes.data || []);
      if (runRes.data) {
        setRunwayStats({
          cashBuffer: runRes.data.cashBuffer || 0,
          monthlyBurnRate: runRes.data.monthlyBurnRate || 0,
          runwayMonths: runRes.data.runwayMonths || 0
        });
      }
    } catch (e) {
      console.error('Failed to load runway goal data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !targetAmount || !currentAmount) return;

    setSaving(true);
    try {
      await goalApi.create({
        name,
        targetAmount: parseFloat(targetAmount),
        currentAmount: parseFloat(currentAmount)
      });
      setName('');
      setTargetAmount('');
      setCurrentAmount('');
      loadData();
    } catch (err) {
      console.error('Failed to save runway goal:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await goalApi.delete(id);
      loadData();
    } catch (e) {
      console.error('Failed to remove goal:', e);
    }
  };

  // Simulator calculations
  const simRevenue = runwayStats.cashBuffer * (revenueMultiplier / 100);
  const simBurn = runwayStats.monthlyBurnRate * (burnMultiplier / 100);
  const simRunway = simBurn > 0 ? simRevenue / simBurn : 99.9;

  return (
    <div className="runway-wrapper animate-fadeIn">
      {/* KPI Stats cards */}
      <div className="kpis-grid">
        <div className="glass-card p-6">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">LIQUID CASH RESERVES</span>
          <h3 className="text-white text-2xl font-black mt-2">₹{Math.round(runwayStats.cashBuffer).toLocaleString()}</h3>
          <span className="text-xs text-gray-500 mt-2 block">Working treasury capital</span>
        </div>

        <div className="glass-card p-6">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">MONTHLY BURN RATE</span>
          <h3 className="text-rose-400 text-2xl font-black mt-2">₹{Math.round(runwayStats.monthlyBurnRate).toLocaleString()}</h3>
          <span className="text-xs text-gray-500 mt-2 block">Operating expenses velocity</span>
        </div>

        <div className="glass-card p-6">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">SURVIVAL RUNWAY COEFFICIENT</span>
          <h3 className="text-cyan-300 text-2xl font-black mt-2">{runwayStats.runwayMonths.toFixed(1)} Months</h3>
          <span className="text-xs text-gray-500 mt-2 block">Months company survives without new sales</span>
        </div>
      </div>

      <div className="visuals-grid mt-8">
        {/* Left Column: Interactive Runway Simulator */}
        <div className="glass-card p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-6 border-b border-white/5 pb-3">
              <Sliders size={16} className="text-cyan-400" />
              <h4 className="text-white text-base font-bold">Cash Runway Simulator</h4>
            </div>
            <p className="text-xs text-gray-500 mb-6">Drag the sliders to simulate the impact of revenue scaling or cost-cutting adjustments on company cash runways.</p>

            <div className="space-y-6">
              {/* Revenue Slider */}
              <div className="slider-group">
                <div className="flex justify-between text-xs font-semibold mb-2">
                  <span className="text-gray-400">LIQUID CAPITAL RESERVE MULTIPLIER</span>
                  <span className="text-cyan-400 font-bold">{revenueMultiplier}%</span>
                </div>
                <input 
                  type="range" 
                  min="50" 
                  max="200" 
                  value={revenueMultiplier}
                  onChange={(e) => setRevenueMultiplier(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-black/40 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
                <span className="text-[10px] text-gray-500 block mt-1">Simulated Capital: ₹{Math.round(simRevenue).toLocaleString()}</span>
              </div>

              {/* Burn Rate Slider */}
              <div className="slider-group">
                <div className="flex justify-between text-xs font-semibold mb-2">
                  <span className="text-gray-400">OPERATIONAL BURN MULTIPLIER</span>
                  <span className="text-rose-400 font-bold">{burnMultiplier}%</span>
                </div>
                <input 
                  type="range" 
                  min="50" 
                  max="200" 
                  value={burnMultiplier}
                  onChange={(e) => setBurnMultiplier(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-black/40 rounded-lg appearance-none cursor-pointer accent-rose-400"
                />
                <span className="text-[10px] text-gray-500 block mt-1">Simulated Burn: ₹{Math.round(simBurn).toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="simulated-result-box mt-8 p-6 rounded-2xl bg-gradient-to-br from-violet-600/10 to-cyan-500/10 border border-violet-500/15 text-center">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">SIMULATED CASH SURVIVAL</span>
            <h2 className="text-white text-3xl font-black mt-2 text-glow-primary">{simRunway.toFixed(1)} Months</h2>
            <p className="text-xs text-gray-500 mt-2">
              {simRunway >= 12 ? '✓ Highly secure runway target.' : simRunway >= 6 ? '⚡ Standard runway threshold.' : '⚠ Warning: Runway is short. Cost reductions suggested.'}
            </p>
          </div>
        </div>

        {/* Right Column: Runway Targets & Form */}
        <div className="space-y-6">
          {/* Form runway goals */}
          <div className="glass-card p-6">
            <div className="flex items-center gap-2 mb-6 border-b border-white/5 pb-3">
              <Sparkles size={16} className="text-violet-400" />
              <h4 className="text-white text-base font-bold">New Treasury Target</h4>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="form-group">
                <label className="form-label">TARGET NAME</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. 6-Month Operations Reserve" 
                  className="input-glass"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">TARGET AMOUNT (INR)</label>
                <input 
                  type="number" 
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                  placeholder="500000" 
                  className="input-glass"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">CURRENT RESERVE AMOUNT (INR)</label>
                <input 
                  type="number" 
                  value={currentAmount}
                  onChange={(e) => setCurrentAmount(e.target.value)}
                  placeholder="150000" 
                  className="input-glass"
                  required
                />
              </div>

              <button 
                type="submit" 
                className="btn-glass btn-glass-primary w-full py-3.5 text-sm font-semibold flex justify-center items-center gap-1.5"
                disabled={saving}
              >
                <Plus size={16} />
                <span>{saving ? 'Creating Target...' : 'Configure Target'}</span>
              </button>
            </form>
          </div>

          {/* Goals Checklist */}
          <div className="glass-card p-6">
            <h4 className="text-white text-base font-bold border-b border-white/5 pb-3 mb-6">Treasury Milestone Checklist</h4>

            {loading ? (
              <div className="text-center py-6 text-gray-500 text-xs">Loading targets...</div>
            ) : goals.length === 0 ? (
              <div className="text-center py-6 text-gray-500 text-xs italic">No runway goals saved.</div>
            ) : (
              <div className="space-y-4">
                {goals.map(goal => {
                  const pct = Math.round((goal.currentAmount / goal.targetAmount) * 100);
                  return (
                    <div key={goal.id} className="goal-checklist-node">
                      <div className="flex justify-between items-center text-xs font-semibold">
                        <span className="text-white">{goal.name}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-cyan-400 font-bold">{pct}%</span>
                          <button 
                            onClick={() => handleDelete(goal.id)}
                            className="text-red-400/50 hover:text-red-400 transition-all"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                      
                      <div className="w-full bg-black/40 h-2 rounded-full mt-2 overflow-hidden border border-white/5">
                        <div 
                          className="h-full bg-gradient-to-r from-violet-500 to-cyan-400 rounded-full"
                          style={{ width: `${Math.min(100, pct)}%` }}
                        ></div>
                      </div>
                      <span className="text-[10px] text-gray-500 mt-1 block">
                        ₹{goal.currentAmount.toLocaleString()} saved of ₹{goal.targetAmount.toLocaleString()} target
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
