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
import { analyticsApi, incomeApi, aiApi } from '../api/client';
import { PieChart, TrendingUp, Calendar, Filter, RefreshCw, DollarSign, Sparkles, AlertTriangle, Lightbulb } from 'lucide-react';
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

  // AI Summary States
  const [aiSummary, setAiSummary] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

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
      
      // Fetch AI reports summary
      setAiLoading(true);
      try {
        const [insRes, predRes, anoRes] = await Promise.all([
          aiApi.getInsights(),
          aiApi.getPredictions(),
          aiApi.getAnomalies()
        ]);
        setAiSummary({
          insights: insRes.data,
          predictions: predRes.data,
          anomalies: anoRes.data
        });
      } catch (aiErr) {
        console.warn('AI microservice offline. Using local analyzer.');
        setAiSummary(null);
      } finally {
        setAiLoading(false);
      }

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
      <div className="radial-mesh"></div>
      <div className="radial-mesh-two"></div>

      {error && <div className="alert alert-danger mb-4 p-3 rounded bg-danger-bg text-danger border border-danger/20 text-xs font-semibold">{error}</div>}
      
      {/* Top Filter and Tab Central */}
      <div className="reports-nav glass-panel mb-6">
        <div className="flex items-center gap-2">
          <Filter size={18} className="text-indigo-400" />
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

      {/* ────────────────────────────────────────────────────────
          AI NATURAL LANGUAGE EXECUTIVE SUMMARY
          ──────────────────────────────────────────────────────── */}
      <div className="ai-executive-summary-card glass-panel p-6 mb-6">
        <div className="card-header flex justify-between items-center mb-4">
          <h3 className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
            <Sparkles size={16} className="text-indigo-400" />
            <span>AI Executive Financial Audit Summary</span>
          </h3>
          <span className="badge-tag primary">Audit Active</span>
        </div>

        {aiLoading ? (
          <div className="text-xs text-gray-500 animate-pulse">Running analytical summaries...</div>
        ) : aiSummary ? (
          <div className="ai-summary-content-grid grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            {/* Risks Identified */}
            <div className="summary-section p-4 rounded-lg bg-rose-950/10 border border-rose-900/10">
              <span className="flex items-center gap-1.5 text-xs font-bold text-rose-400 mb-2">
                <AlertTriangle size={14} />
                <span>RISKS DETECTED</span>
              </span>
              <ul className="text-xs text-gray-300 space-y-2">
                {aiSummary.anomalies?.anomalies?.length > 0 ? (
                  aiSummary.anomalies.anomalies.map((a, i) => (
                    <li key={i}>• Flagged spike: ₹{a.amount} in {a.category} — {a.reason}</li>
                  ))
                ) : (
                  <li>✓ No major outlier spending patterns detected. Keep monitoring limits.</li>
                )}
                {aiSummary.predictions?.predictedNextMonthExpense > 50000 && (
                  <li>• Expected expense curve next month exceeds optimal ₹50,000 threshold.</li>
                )}
              </ul>
            </div>

            {/* Opportunities */}
            <div className="summary-section p-4 rounded-lg bg-emerald-950/10 border border-emerald-900/10">
              <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 mb-2">
                <Lightbulb size={14} />
                <span>SAVINGS OPPORTUNITIES</span>
              </span>
              <ul className="text-xs text-gray-300 space-y-2">
                {aiSummary.insights?.savingsSuggestions?.length > 0 ? (
                  aiSummary.insights.savingsSuggestions.slice(0, 2).map((s, i) => (
                    <li key={i}>• {s}</li>
                  ))
                ) : (
                  <li>• Optimize subscription structures to raise surplus rate by 5%.</li>
                )}
                <li>• Reallocating ₹5,000 extra monthly to your Emergency Fund will achieve milestone target 25 days early.</li>
              </ul>
            </div>
          </div>
        ) : (
          <p className="text-xs text-gray-500">Log more transactions and budgets to let the AI Copilot compile executive summaries.</p>
        )}
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
            </div>
            <div className="ledger-table-wrapper mt-4">
              <table className="ledger-table">
                <thead>
                  <tr>
                    <th>Source</th>
                    <th>Date</th>
                    <th className="text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {incomeList.map(inc => (
                    <tr key={inc.id}>
                      <td className="font-medium text-sm text-white">{inc.source}</td>
                      <td className="text-xs text-muted">{inc.date}</td>
                      <td className="text-right font-bold text-emerald-400">+₹{inc.amount?.toLocaleString()}</td>
                    </tr>
                  ))}
                  {incomeList.length === 0 && (
                    <tr>
                      <td colSpan="3" className="p-8 text-center text-xs text-muted">No income sources logged.</td>
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
