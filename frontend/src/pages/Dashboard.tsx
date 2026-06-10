import React from 'react';
import { useAppStore } from '../store/appStore';
import { 
  TrendingUp, 
  Package, 
  ArrowUpRight, 
  ArrowDownLeft, 
  DollarSign, 
  AlertTriangle,
  Wallet,
  PiggyBank,
  TrendingDown
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';

export default function Dashboard() {
  const { activeWorkspace, inventory, receivables, payables, expenses } = useAppStore();
  const isBusiness = activeWorkspace === 'business';

  const invValue = inventory.reduce((a, b) => a + b.purchasePrice * b.stock, 0);
  const lowStockCount = inventory.filter(p => p.status === 'Low Stock' || p.status === 'Out of Stock').length;
  const receivablesTotal = receivables.reduce((a, b) => a + b.amount, 0);
  const payablesTotal = payables.reduce((a, b) => a + b.amount, 0);
  const expensesTotal = expenses.reduce((a, b) => a + b.amount, 0);
  const pendingCount = receivables.filter(r => r.status === 'urgent' || r.status === 'warning').length;

  // --- BUSINESS DATA ---
  const businessKpis = [
    { name: 'Inventory Value', value: `₹${invValue.toLocaleString()}`, icon: Package, trend: `${inventory.length} Items`, color: 'text-cyan-400' },
    { name: 'Receivables', value: `₹${receivablesTotal.toLocaleString()}`, icon: ArrowUpRight, trend: `${pendingCount} Pending`, color: 'text-violet-400' },
    { name: 'Payables Due', value: `₹${payablesTotal.toLocaleString()}`, icon: ArrowDownLeft, trend: `${payables.length} Bills`, color: 'text-yellow-400' },
    { name: 'Low Stock Alerts', value: `${lowStockCount} Items`, icon: AlertTriangle, trend: lowStockCount > 0 ? 'Action Needed' : 'All Good', color: lowStockCount > 0 ? 'text-amber-500' : 'text-emerald-400' },
  ];

  const businessChartData = [
    { month: 'Jan', Revenue: 0, Expenses: 0 },
    { month: 'Feb', Revenue: 0, Expenses: 0 },
    { month: 'Mar', Revenue: 0, Expenses: 0 },
    { month: 'Apr', Revenue: 0, Expenses: 0 },
    { month: 'May', Revenue: 0, Expenses: 0 },
    { month: 'Jun', Revenue: 0, Expenses: 0 },
  ];

  const categoryMap: Record<string, number> = {};
  inventory.forEach(p => {
    categoryMap[p.category] = (categoryMap[p.category] || 0) + p.purchasePrice * p.stock;
  });
  const inventoryCategoryData = Object.entries(categoryMap).map(([name, value]) => ({ name, value }));
  if (inventoryCategoryData.length === 0) {
    inventoryCategoryData.push({ name: 'No Data', value: 1 });
  }

  // --- PERSONAL DATA ---
  const personalKpis = [
    { name: 'Outflows (MTD)', value: `₹${expensesTotal.toLocaleString()}`, icon: TrendingDown, trend: `${expenses.length} Entries`, color: 'text-rose-400' },
    { name: 'Expense Categories', value: `${new Set(expenses.map(e => e.category)).size}`, icon: Wallet, trend: 'Active', color: 'text-emerald-400' },
    { name: 'Receipts Scanned', value: `${expenses.length}`, icon: TrendingUp, trend: 'MTD Total', color: 'text-cyan-400' },
  ];

  const personalChartData = [
    { month: 'Week 1', Spent: 0, Savings: 0 },
    { month: 'Week 2', Spent: 0, Savings: 0 },
    { month: 'Week 3', Spent: 0, Savings: 0 },
    { month: 'Week 4', Spent: 0, Savings: 0 },
  ];

  const expenseCatMap: Record<string, number> = {};
  expenses.forEach(e => {
    expenseCatMap[e.category] = (expenseCatMap[e.category] || 0) + e.amount;
  });
  const expenseBreakdownData = Object.entries(expenseCatMap).map(([name, value]) => ({ name, value }));
  if (expenseBreakdownData.length === 0) {
    expenseBreakdownData.push({ name: 'No Expenses', value: 1 });
  }

  const COLORS = ['#00D4FF', '#7C4DFF', '#00E676', '#FFB300'];

  const activeAccent = isBusiness ? 'text-primary' : 'text-primary-emerald';

  return (
    <div className="space-y-8">
      {/* Title & Page Header */}
      <div>
        <h2 className="text-3xl font-black text-white font-display">
          {isBusiness ? 'Business Command Center' : 'Personal Finance Deck'}
        </h2>
        <p className="text-xs text-gray-400 mt-1">Real-time ledger indicators, active telemetry, and regression models.</p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {(isBusiness ? businessKpis : personalKpis).map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.name} className="glass-card p-6 rounded-2xl border border-white/10 hover:border-white/20 transition-all flex items-center justify-between">
              <div className="space-y-2">
                <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">{kpi.name}</span>
                <h3 className="text-2xl font-black text-white font-display">{kpi.value}</h3>
                <span className="text-[10px] text-emerald-400 font-bold block">{kpi.trend}</span>
              </div>
              <div className={`w-12 h-12 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center ${kpi.color}`}>
                <Icon size={22} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Charts & Visualizations Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Core Line Chart */}
        <div className="glass-card p-6 rounded-2xl border border-white/10 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-sm text-white">
              {isBusiness ? 'Corporate Revenue & Operational Expenses' : 'Weekly Outflow Tracker'}
            </h3>
            <span className={`text-[10px] font-bold uppercase ${activeAccent}`}>MTD Auditing</span>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={(isBusiness ? businessChartData : personalChartData) as any}>
                <defs>
                  <linearGradient id="colorPrimary" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={isBusiness ? '#00D4FF' : '#00E676'} stopOpacity={0.2}/>
                    <stop offset="95%" stopColor={isBusiness ? '#00D4FF' : '#00E676'} stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorSecondary" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7C4DFF" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#7C4DFF" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" stroke="rgba(255,255,255,0.3)" fontSize={10} />
                <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} />
                <Tooltip 
                  contentStyle={{ 
                    background: 'rgba(8, 11, 20, 0.9)', 
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '11px'
                  }} 
                />
                {isBusiness ? (
                  <>
                    <Area type="monotone" dataKey="Revenue" stroke="#00D4FF" strokeWidth={2} fillOpacity={1} fill="url(#colorPrimary)" />
                    <Area type="monotone" dataKey="Expenses" stroke="#7C4DFF" strokeWidth={2} fillOpacity={1} fill="url(#colorSecondary)" />
                  </>
                ) : (
                  <>
                    <Area type="monotone" dataKey="Spent" stroke="#00E676" strokeWidth={2} fillOpacity={1} fill="url(#colorPrimary)" />
                    <Area type="monotone" dataKey="Savings" stroke="#7C4DFF" strokeWidth={2} fillOpacity={1} fill="url(#colorSecondary)" />
                  </>
                )}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Circular Distribution Chart */}
        <div className="glass-card p-6 rounded-2xl border border-white/10">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-sm text-white">
              {isBusiness ? 'Inventory Valuation Share' : 'Outflow Distribution'}
            </h3>
            <span className={`text-[10px] font-bold uppercase ${activeAccent}`}>Audited Categories</span>
          </div>
          <div className="h-64 w-full flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={isBusiness ? inventoryCategoryData : expenseBreakdownData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {(isBusiness ? inventoryCategoryData : expenseBreakdownData).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    background: 'rgba(8, 11, 20, 0.9)', 
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '11px'
                  }} 
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Total logged</span>
              <span className="text-lg font-black text-white mt-0.5">
                {isBusiness ? '₹9,50,000' : `₹${expenses.reduce((a, b) => a + b.amount, 0).toLocaleString()}`}
              </span>
            </div>
          </div>

          {/* Legend */}
          <div className="grid grid-cols-2 gap-2 mt-4">
            {(isBusiness ? inventoryCategoryData : expenseBreakdownData).map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-2 text-[10px] text-gray-400">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                <span className="truncate">{entry.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
