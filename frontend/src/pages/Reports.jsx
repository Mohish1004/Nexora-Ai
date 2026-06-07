import React, { useEffect, useState } from 'react';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement, 
  ArcElement, 
  Title, 
  Tooltip, 
  Legend, 
  Filler 
} from 'chart.js';
import { Bar, Line, Pie } from 'react-chartjs-2';
import { analyticsApi, incomeApi } from '../api/client';
import { PieChart, TrendingUp, Calendar, Filter, RefreshCw, DollarSign } from 'lucide-react';
import './Reports.css';

export default function Reports() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [monthlyData, setMonthlyData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [incomeList, setIncomeList] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState('');
  
  // Custom View Tabs
  const [activeTab, setActiveTab] = useState('overview'); // overview, category, income

  const fetchReportsData = async (monthStr = '') => {
    try {
      setLoading(true);
      setError('');
      const [mRes, cRes, iRes] = await Promise.all([
        analyticsApi.getMonthly(12), // full year
        analyticsApi.getCategory(monthStr),
        incomeApi.getAll()
      ]);

      setMonthlyData(mRes.data || []);
      setCategoryData(cRes.data || []);
      setIncomeList(iRes.data || []);
    } catch (err) {
      console.error('Error fetching analytical arrays:', err);
      setCategoryData([]);
      setError('Analytical server query failed. Data could not be loaded.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportsData(selectedMonth);
  }, [selectedMonth]);

  const themeMode = document.documentElement.getAttribute('data-theme');
  const isDark = themeMode === 'dark';

  // Multi-bar dataset (Income vs Expense side-by-side)
  const comparisonBarData = {
    labels: monthlyData.map(d => d.month),
    datasets: [
      {
        label: 'Gross Inflow (₹)',
        data: monthlyData.map(d => d.totalIncome),
        backgroundColor: '#10b981',
        borderRadius: 4,
      },
      {
        label: 'Gross Outflow (₹)',
        data: monthlyData.map(d => d.totalExpense),
        backgroundColor: '#f43f5e',
        borderRadius: 4,
      }
    ]
  };

  const categoryPieData = {
    labels: categoryData.map(c => c.category),
    datasets: [
      {
        data: categoryData.map(c => c.amount),
        backgroundColor: ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4'],
        borderWidth: isDark ? 2 : 1,
        borderColor: isDark ? '#0f172a' : '#ffffff',
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: isDark ? '#e2e8f0' : '#1e293b', font: { family: 'Inter' } } }
    },
    scales: {
      x: { grid: { color: isDark ? '#1e293b' : '#f1f5f9' }, ticks: { color: isDark ? '#94a3b8' : '#64748b' } },
      y: { grid: { color: isDark ? '#1e293b' : '#f1f5f9' }, ticks: { color: isDark ? '#94a3b8' : '#64748b' } }
    }
  };

  return (
    <div className="reports-page fade-in">
      {error && <div className="alert alert-danger mb-4 p-3 rounded bg-danger-bg text-danger border border-danger/20 text-xs font-semibold">{error}</div>}
      {/* Top Filter and Tab Central */}
      <div className="reports-nav glass-panel mb-6">
        <div className="flex items-center gap-2">
          <Filter size={18} className="text-primary" />
          <span className="font-bold text-sm uppercase text-muted">Analysis Perspective:</span>
          <div className="tab-pill-box ml-2">
            <button onClick={() => setActiveTab('overview')} className={`tab-pill ${activeTab === 'overview' ? 'active' : ''}`}>Flow Overview</button>
            <button onClick={() => setActiveTab('category')} className={`tab-pill ${activeTab === 'category' ? 'active' : ''}`}>Category Dispersion</button>
            <button onClick={() => setActiveTab('income')} className={`tab-pill ${activeTab === 'income' ? 'active' : ''}`}>Income Stream Logs</button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <label className="text-xs font-semibold text-muted">Target Interval:</label>
          <input 
            type="month" 
            className="form-input py-1.5 text-xs w-auto" 
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
          />
          {selectedMonth && (
            <button onClick={() => setSelectedMonth('')} className="btn btn-secondary btn-xs py-1">Reset</button>
          )}
        </div>
      </div>

      {/* Tab 1: Overview Flow */}
      {activeTab === 'overview' && (
        <div className="grid-charts fade-in" style={{ gridTemplateColumns: '1fr' }}>
          <div className="glass-panel p-6">
            <div className="panel-header">
              <div>
                <h3>Macro Comparative Flows (Inflow vs Outflow)</h3>
                <p className="panel-desc">Side-by-side grouped parameter values</p>
              </div>
              <span className="badge badge-bills">Double Series</span>
            </div>
            <div style={{ height: '420px' }}>
              <Bar data={comparisonBarData} options={chartOptions} />
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Category Breakdown */}
      {activeTab === 'category' && (
        <div className="grid-charts fade-in">
          <div className="glass-panel p-6">
            <div className="panel-header">
              <div>
                <h3>Proportional Weight Distribution</h3>
                <p className="panel-desc">Visual rendering of custom item lists</p>
              </div>
              <span className="badge badge-shopping">Pie Distribution</span>
            </div>
            <div style={{ height: '360px' }}>
              <Pie data={categoryPieData} options={{ responsive: true, maintainAspectRatio: false }} />
            </div>
          </div>

          <div className="glass-panel p-6 flex flex-col justify-between">
            <div>
              <h3 className="text-base font-bold mb-3">Categorical Rankings</h3>
              <div className="flex flex-col gap-3 mt-4">
                {categoryData.map((cat, i) => (
                  <div key={cat.category} className="flex flex-col gap-1 text-xs">
                    <div className="flex justify-between font-medium">
                      <span className="flex items-center gap-1.5">
                        <span className="font-bold text-muted">#{i+1}</span> 
                        {cat.category}
                      </span>
                      <span className="font-bold">₹{cat.amount.toLocaleString()} ({cat.percentage}%)</span>
                    </div>
                    <div className="w-full bg-base h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-primary h-full rounded-full" 
                        style={{ width: `${Math.min(cat.percentage, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Dedicated Income Tracking View */}
      {activeTab === 'income' && (
        <div className="grid-charts fade-in" style={{ gridTemplateColumns: '1fr' }}>
          <div className="glass-panel p-6">
            <div className="panel-header">
              <div>
                <h3>Income Source Ledger</h3>
                <p className="panel-desc">Module 2: Track continuous direct compensation flows</p>
              </div>
              <span className="badge badge-food">Incoming Ledger</span>
            </div>

            <div className="mt-4">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-color text-muted">
                    <th className="py-3">Origin Source</th>
                    <th className="py-3">Timestamp Date</th>
                    <th className="py-3 text-right">Value Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {incomeList.length > 0 ? incomeList.map(inc => (
                    <tr key={inc.id} className="border-b border-color hover:bg-base/40">
                      <td className="py-3 font-semibold flex items-center gap-2">
                        <DollarSign size={14} className="text-success" />
                        <span>{inc.source}</span>
                      </td>
                      <td className="py-3 text-muted">{inc.date}</td>
                      <td className="py-3 text-right font-bold text-success">+₹{inc.amount.toLocaleString()}</td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="3" className="py-8 text-center text-muted">No income streams logged yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
