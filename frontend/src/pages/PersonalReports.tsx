import React from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid,
  BarChart,
  Bar
} from 'recharts';
import { FileDown, Calendar, PiggyBank } from 'lucide-react';

export default function PersonalReports() {
  const savingsTrajectory = [
    { month: 'Jan', Savings: 12000 },
    { month: 'Feb', Savings: 27000 },
    { month: 'Mar', Savings: 45000 },
    { month: 'Apr', Savings: 67000 },
    { month: 'May', Savings: 85000 },
    { month: 'Jun', Savings: 112000 },
  ];

  const categoryAverages = [
    { name: 'Dining', average: 1800 },
    { name: 'Travel', average: 3200 },
    { name: 'Tech', average: 8500 },
    { name: 'Utilities', average: 4000 },
  ];

  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-white font-display">Personal Wealth Registry</h2>
          <p className="text-xs text-gray-400 mt-1">Audit personal savings rates, category spending averages, and projected asset trajectories.</p>
        </div>
        <button 
          onClick={() => alert('Wealth dossier exported.')}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-primary-emerald text-black font-semibold text-xs hover:bg-emerald-400 transition-all shadow-lg"
        >
          <FileDown size={14} />
          <span>Export Asset Dossier</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Savings Growth */}
        <div className="glass-card p-6 rounded-2xl border border-white/10 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-white">Savings Account Trajectory (H1)</h3>
            <span className="text-[10px] text-primary-emerald font-bold uppercase">Compound Tracking</span>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={savingsTrajectory}>
                <defs>
                  <linearGradient id="colorPersonalSavings" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00E676" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#00E676" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" stroke="rgba(255,255,255,0.2)" fontSize={10} />
                <YAxis stroke="rgba(255,255,255,0.2)" fontSize={10} />
                <Tooltip 
                  contentStyle={{ 
                    background: 'rgba(8, 11, 20, 0.9)', 
                    borderColor: 'rgba(255,255,255,0.1)',
                    color: '#fff',
                    fontSize: '11px'
                  }} 
                />
                <Area type="monotone" dataKey="Savings" stroke="#00E676" strokeWidth={2} fillOpacity={1} fill="url(#colorPersonalSavings)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Averages */}
        <div className="glass-card p-6 rounded-2xl border border-white/10 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-white">Average Outflows By Category</h3>
            <span className="text-[10px] text-primary-emerald font-bold uppercase">Average Audit</span>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryAverages}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.2)" fontSize={10} />
                <YAxis stroke="rgba(255,255,255,0.2)" fontSize={10} />
                <Tooltip 
                  contentStyle={{ 
                    background: 'rgba(8, 11, 20, 0.9)', 
                    borderColor: 'rgba(255,255,255,0.1)',
                    color: '#fff',
                    fontSize: '11px'
                  }} 
                />
                <Bar dataKey="average" fill="#00E676" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
