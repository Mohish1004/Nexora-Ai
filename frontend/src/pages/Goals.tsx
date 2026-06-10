import React, { useState } from 'react';
import { useAppStore } from '../store/appStore';
import { Target, Sparkles, Plus, CheckCircle2, TrendingUp, HelpCircle } from 'lucide-react';

export default function Goals() {
  const { goals, addGoal, updateGoalAmount } = useAppStore();
  const [showAddGoal, setShowAddGoal] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState<number>(0);
  const [currentAmount, setCurrentAmount] = useState<number>(0);
  const [deadline, setDeadline] = useState('');

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || targetAmount <= 0) return;
    addGoal({ title, targetAmount, currentAmount, deadline });
    setTitle('');
    setTargetAmount(0);
    setCurrentAmount(0);
    setShowAddGoal(false);
  };

  const coachRecommendations = [
    { id: 1, text: 'Reduce Swiggy Food orders by 30%', saving: '₹3,000/mo savings', impact: 'Medium impact (+2.1% progress speed)' },
    { id: 2, text: 'Cancel unused GitHub Copilot personal subscription', saving: '₹850/mo savings', impact: 'Low impact (+0.5% progress speed)' },
    { id: 3, text: 'Consolidate shared streaming subscriptions', saving: '₹1,500/mo savings', impact: 'Medium impact (+1.1% progress speed)' },
  ];

  return (
    <div className="space-y-8 animate-float-slow">
      {/* Title */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-white font-display">Savings & Financial Goals</h2>
          <p className="text-xs text-gray-400 mt-1">Audit personal savings buckets, progress rates, and AI advisory recommendations.</p>
        </div>
        <button
          onClick={() => setShowAddGoal(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-primary-emerald text-black font-semibold text-xs hover:bg-emerald-400 transition-all shadow-lg"
        >
          <Plus size={14} />
          <span>Create Goal Bucket</span>
        </button>
      </div>

      {/* Goal Cards with Progress Rings */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {goals.map((item) => {
          const progressPercent = Math.round((item.currentAmount / item.targetAmount) * 100);
          
          return (
            <div key={item.id} className="glass-card p-6 rounded-2xl border border-white/10 flex flex-col justify-between h-72">
              <div className="flex justify-between items-start gap-4">
                <div className="space-y-1">
                  <h3 className="font-bold text-sm text-white">{item.title}</h3>
                  <span className="text-[10px] text-gray-500 font-mono block">Target Date: {item.deadline}</span>
                </div>
                
                {/* SVG Progress Ring */}
                <div className="relative w-16 h-16 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="32"
                      cy="32"
                      r="26"
                      stroke="rgba(255, 255, 255, 0.05)"
                      strokeWidth="4"
                      fill="transparent"
                    />
                    <circle
                      cx="32"
                      cy="32"
                      r="26"
                      stroke="#00E676"
                      strokeWidth="4"
                      fill="transparent"
                      strokeDasharray={163}
                      strokeDashoffset={163 - (163 * progressPercent) / 100}
                      className="transition-all duration-1000 ease-out"
                    />
                  </svg>
                  <span className="absolute text-[10px] font-black text-white">{progressPercent}%</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-gray-500">Collected</span>
                  <span className="text-white">₹{item.currentAmount.toLocaleString()} / ₹{item.targetAmount.toLocaleString()}</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
                  <div className="h-full bg-primary-emerald" style={{ width: `${progressPercent}%` }}></div>
                </div>
              </div>

              <div className="border-t border-white/5 pt-4 flex gap-2">
                <button
                  onClick={() => updateGoalAmount(item.id, 5000)}
                  className="flex-1 py-2 rounded bg-primary-emerald/10 hover:bg-primary-emerald text-primary-emerald hover:text-black border border-primary-emerald/20 font-bold text-[10px] uppercase transition-all"
                >
                  Save ₹5,000
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* AI Savings Coach Widget */}
      <div className="glass-card p-6 rounded-2xl border border-white/10 space-y-6">
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
            <Sparkles size={16} className="text-emerald-400" />
            <span>AI Savings Coach Recommendations</span>
          </h3>
          <span className="text-[9px] text-emerald-400 font-bold uppercase tracking-wider">Coach Active</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {coachRecommendations.map((item) => (
            <div key={item.id} className="p-4 rounded-xl border border-emerald-500/10 bg-emerald-500/[0.01] space-y-3 flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-bold text-white leading-relaxed">{item.text}</h4>
                <span className="text-[10px] text-emerald-400 font-semibold block mt-1">{item.saving}</span>
              </div>
              <div className="flex items-center gap-1.5 text-[9px] text-gray-500 border-t border-white/5 pt-2">
                <TrendingUp size={12} className="text-emerald-400" />
                <span>{item.impact}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create Goal Modal */}
      {showAddGoal && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center p-6 z-50 backdrop-blur-sm">
          <div className="w-full max-w-md glass-card rounded-2xl border border-white/10 p-6 shadow-2xl relative">
            <h3 className="text-lg font-black text-white font-display mb-4">Create Goal Bucket</h3>

            <form onSubmit={handleCreateGoal} className="space-y-4">
              <div>
                <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Goal Title</label>
                <input 
                  type="text" 
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Creator Rig"
                  className="w-full px-3 py-2 text-xs glass-input"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Target Amount</label>
                  <input 
                    type="number" 
                    required
                    value={targetAmount || ''}
                    onChange={(e) => setTargetAmount(parseInt(e.target.value))}
                    className="w-full px-3 py-2 text-xs glass-input"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Initial Saved</label>
                  <input 
                    type="number" 
                    value={currentAmount || ''}
                    onChange={(e) => setCurrentAmount(parseInt(e.target.value))}
                    className="w-full px-3 py-2 text-xs glass-input"
                  />
                </div>
              </div>

              <div>
                <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Deadline Date</label>
                <input 
                  type="date" 
                  required
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full px-3 py-2 text-xs glass-input"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setShowAddGoal(false)}
                  className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-bold text-xs"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-primary-emerald text-black font-bold text-xs hover:bg-emerald-400 transition-all uppercase"
                >
                  Create Bucket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
