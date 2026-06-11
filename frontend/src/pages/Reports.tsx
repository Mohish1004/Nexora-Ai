import React, { useState } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  Legend
} from 'recharts';
import { BarChart3, FileDown, ShieldAlert, CheckCircle } from 'lucide-react';

export default function Reports() {
  const [activeTab, setActiveTab] = useState<'sales' | 'inventory' | 'profit'>('sales');

  const salesData = [
    { name: 'Week 1', Retail: 120000, Contract: 240000 },
    { name: 'Week 2', Retail: 150000, Contract: 280000 },
    { name: 'Week 3', Retail: 180000, Contract: 210000 },
    { name: 'Week 4', Retail: 220000, Contract: 310000 },
  ];

  const profitData = [
    { name: 'Jan', Revenue: 400000, Cost: 240000, Profit: 160000 },
    { name: 'Feb', Revenue: 500000, Cost: 280000, Profit: 220000 },
    { name: 'Mar', Revenue: 620000, Cost: 310000, Profit: 310000 },
    { name: 'Apr', Revenue: 580000, Cost: 300000, Profit: 280000 },
    { name: 'May', Revenue: 750000, Cost: 340000, Profit: 410000 },
    { name: 'Jun', Revenue: 850000, Cost: 410000, Profit: 440000 },
  ];

  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-white font-display">Business Intelligence Deck</h2>
          <p className="text-xs text-gray-400 mt-1">Review verified gross profit registers, client invoices, and sales performance telemetry.</p>
        </div>
        <button 
          onClick={() => alert('PDF export initialized.')}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-primary text-black font-semibold text-xs hover:bg-cyan-400 transition-all shadow-lg"
        >
          <FileDown size={14} />
          <span>Export PDF Dossier</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/10 pb-0.5">
        {(['sales', 'inventory', 'profit'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
              activeTab === tab 
                ? 'border-primary text-primary bg-primary/5' 
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            {tab} Report
          </button>
        ))}
      </div>

      {/* Report Panels */}
      <div className="glass-card p-6 rounded-2xl border border-white/10">
        {activeTab === 'sales' && (
          <div className="space-y-6">
            <h3 className="font-bold text-sm text-white">Sales Pipeline Channel Split (Weekly)</h3>
            <div className="h-96 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesData}>
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
                  <Legend wrapperStyle={{ fontSize: '10px' }} />
                  <Bar dataKey="Retail" fill="#00D4FF" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Contract" fill="#7C4DFF" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {activeTab === 'inventory' && (
          <div className="space-y-6">
            <h3 className="font-bold text-sm text-white">Warehouse SKU Stock Health Overview</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.02] flex items-start gap-3">
                <CheckCircle size={20} className="text-emerald-400 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-white">Laptops & Phones Level</h4>
                  <p className="text-[10px] text-gray-400 mt-1">Laptops and phones catalogs are currently within normal operating safety parameters.</p>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/[0.02] flex items-start gap-3">
                <ShieldAlert size={20} className="text-amber-400 mt-0.5 animate-pulse" />
                <div>
                  <h4 className="text-xs font-bold text-white">Low Stock Threshold Warning</h4>
                  <p className="text-[10px] text-gray-400 mt-1">Dell XPS 15 (3 remaining) and Keychron Keyboards (4 remaining) require restock purchasing.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'profit' && (
          <div className="space-y-6">
            <h3 className="font-bold text-sm text-white">Operational Profit Margins & Costs (Monthly)</h3>
            <div className="h-96 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={profitData}>
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
                  <Legend wrapperStyle={{ fontSize: '10px' }} />
                  <Line type="monotone" dataKey="Revenue" stroke="#00D4FF" strokeWidth={2} />
                  <Line type="monotone" dataKey="Cost" stroke="#FF5252" strokeWidth={2} />
                  <Line type="monotone" dataKey="Profit" stroke="#00E676" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
