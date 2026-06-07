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
import { Line, Bar, Pie } from 'react-chartjs-2';
import { analyticsApi, expenseApi, incomeApi, budgetApi } from '../api/client';
import { Wallet, TrendingUp, TrendingDown, Target, AlertTriangle, ArrowUpRight } from 'lucide-react';
import GuidedOnboarding from '../components/GuidedOnboarding';
import './Dashboard.css';

// Register Chart.js components
ChartJS.register(
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
);

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [monthlyData, setMonthlyData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [savingsData, setSavingsData] = useState(null);
  const [recentExpenses, setRecentExpenses] = useState([]);
  const [budgetLimit, setBudgetLimit] = useState(0);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [mRes, cRes, sRes, eRes, bRes] = await Promise.all([
        analyticsApi.getMonthly(6),
        analyticsApi.getCategory(),
        analyticsApi.getSavings(),
        expenseApi.getAll(),
        budgetApi.getAll()
      ]);

      setMonthlyData(mRes.data || []);
      setCategoryData(cRes.data || []);
      setSavingsData(sRes.data || null);
      setRecentExpenses((eRes.data || []).slice(0, 5)); // top 5 recent

      if (bRes.data && bRes.data.length > 0) {
        setBudgetLimit(bRes.data[0].monthlyLimit || 0);
      } else {
        setBudgetLimit(0);
      }
    } catch (err) {
      console.error('Error loading dashboard analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const isOnboardingRequired = !loading && monthlyData.length === 0 && recentExpenses.length === 0;

  // Compute immediate month totals
  const currentMonthMetric = monthlyData[monthlyData.length - 1] || { totalIncome: 0, totalExpense: 0, month: 'No Data' };
  const totalInc = currentMonthMetric.totalIncome || 0;
  const totalExp = currentMonthMetric.totalExpense || 0;
  const balance = totalInc - totalExp;
  const budgetSpentPct = budgetLimit > 0 ? Math.round((totalExp / budgetLimit) * 100) : 0;

  // Visual Palette generation for Charts
  const themeMode = document.documentElement.getAttribute('data-theme');
  const isDark = themeMode === 'dark';

  // --- Line Chart Data (Monthly Income vs Expense) ---
  const lineChartData = {
    labels: monthlyData.map(d => d.month),
    datasets: [
      {
        label: 'Monthly Income (₹)',
        data: monthlyData.map(d => d.totalIncome),
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
        tension: 0.3,
        pointRadius: 4,
      },
      {
        label: 'Monthly Expense (₹)',
        data: monthlyData.map(d => d.totalExpense),
        borderColor: '#f43f5e',
        backgroundColor: 'rgba(244, 63, 94, 0.1)',
        fill: true,
        tension: 0.3,
        pointRadius: 4,
      }
    ]
  };

  // --- Bar Chart Data (Category Split Comparison) ---
  const barChartData = {
    labels: categoryData.map(c => c.category),
    datasets: [
      {
        label: 'Category Spending (₹)',
        data: categoryData.map(c => c.amount),
        backgroundColor: [
          '#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4'
        ],
        borderRadius: 6,
      }
    ]
  };

  // --- Pie Chart Data (Proportional Weights) ---
  const pieChartData = {
    labels: categoryData.map(c => c.category),
    datasets: [
      {
        data: categoryData.map(c => c.amount),
        backgroundColor: [
          '#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4'
        ],
        borderWidth: isDark ? 2 : 1,
        borderColor: isDark ? '#0f172a' : '#ffffff',
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: isDark ? '#e2e8f0' : '#1e293b', font: { family: 'Inter' } }
      }
    },
    scales: {
      x: { grid: { color: isDark ? '#1e293b' : '#f1f5f9' }, ticks: { color: isDark ? '#94a3b8' : '#64748b' } },
      y: { grid: { color: isDark ? '#1e293b' : '#f1f5f9' }, ticks: { color: isDark ? '#94a3b8' : '#64748b' } }
    }
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: { color: isDark ? '#e2e8f0' : '#1e293b', font: { family: 'Inter', size: 11 }, boxWidth: 12 }
      }
    }
  };

  return (
    <div className="dashboard-container fade-in">
      {isOnboardingRequired && <GuidedOnboarding onComplete={fetchData} />}

      {/* Top Value Blocks */}
      <div className="grid-kpis">
        <div className="kpi-card glass-panel">
          <div className="kpi-icon-box primary">
            <Wallet size={22} />
          </div>
          <div className="kpi-info">
            <span>Net Balance Cushion</span>
            <h3>₹{balance.toLocaleString()}</h3>
            <div className="kpi-indicator success">
              <TrendingUp size={14} />
              <span>{balance > 0 ? 'Healthy surplus' : 'No balance accumulated'}</span>
            </div>
          </div>
        </div>

        <div className="kpi-card glass-panel">
          <div className="kpi-icon-box success">
            <TrendingUp size={22} />
          </div>
          <div className="kpi-info">
            <span>Total Earned (Month)</span>
            <h3>₹{totalInc.toLocaleString()}</h3>
            <span className="text-xs text-muted">Primary streams + passive items</span>
          </div>
        </div>

        <div className="kpi-card glass-panel">
          <div className="kpi-icon-box danger">
            <TrendingDown size={22} />
          </div>
          <div className="kpi-info">
            <span>Total Spent (Month)</span>
            <h3>₹{totalExp.toLocaleString()}</h3>
            <div className="kpi-indicator danger">
              <TrendingDown size={14} />
              <span>{budgetLimit > 0 ? `${budgetSpentPct}% of budget` : 'No budget set'}</span>
            </div>
          </div>
        </div>

        <div className="kpi-card glass-panel">
          <div className="kpi-icon-box warning">
            <Target size={22} />
          </div>
          <div className="kpi-info">
            <span>Active Budget Limit</span>
            <h3>₹{budgetLimit.toLocaleString()}</h3>
            {budgetLimit > 0 && budgetSpentPct > 85 ? (
              <span className="text-xs text-danger flex items-center gap-1 mt-1">
                <AlertTriangle size={12} /> Limit Critical Warning!
              </span>
            ) : (
              <span className="text-xs text-success">{budgetLimit > 0 ? 'Safe operation trajectory' : 'No budget configured'}</span>
            )}
          </div>
        </div>
      </div>

      {/* Main Charts Array */}
      <div className="grid-charts">
        {/* Line Chart Panel */}
        <div className="chart-panel glass-panel">
          <div className="panel-header">
            <div>
              <h3>Income vs Expense Multi-Month Flow</h3>
              <p className="panel-desc">Visual history comparing recurring financial entries</p>
            </div>
            <span className="badge badge-entertainment">Line Series</span>
          </div>
          <div className="chart-container" style={{ height: '320px' }}>
            {monthlyData.length > 0 ? (
              <Line data={lineChartData} options={chartOptions} />
            ) : (
              <div className="h-full flex items-center justify-center text-muted text-sm">No multi-month flow history logged.</div>
            )}
          </div>
        </div>

        {/* Pie Chart Panel */}
        <div className="chart-panel glass-panel">
          <div className="panel-header">
            <div>
              <h3>Category Dispersion</h3>
              <p className="panel-desc">Proportional expense weights</p>
            </div>
            <span className="badge badge-shopping">Pie View</span>
          </div>
          <div className="chart-container" style={{ height: '320px' }}>
            {categoryData.length > 0 ? (
              <Pie data={pieChartData} options={pieOptions} />
            ) : (
              <div className="h-full flex items-center justify-center text-muted text-sm">No categorical divisions recorded.</div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Composite Trackers */}
      <div className="grid-charts" style={{ gridTemplateColumns: '1fr 1fr' }}>
        {/* Bar Chart Panel */}
        <div className="chart-panel glass-panel">
          <div className="panel-header">
            <div>
              <h3>Category-Wise Total Spend Output</h3>
              <p className="panel-desc">Aggregate categorical values for active selection cycle</p>
            </div>
            <span className="badge badge-transport">Bar Graph</span>
          </div>
          <div className="chart-container" style={{ height: '280px' }}>
            {categoryData.length > 0 ? (
              <Bar data={barChartData} options={{...chartOptions, plugins: { legend: { display: false } }}} />
            ) : (
              <div className="h-full flex items-center justify-center text-muted text-sm">No category totals calculated.</div>
            )}
          </div>
        </div>

        {/* Dynamic Savings Summary & Advisory Box */}
        <div className="chart-panel glass-panel flex flex-col justify-between">
          <div>
            <div className="panel-header">
              <div>
                <h3>Savings Efficiency Analysis</h3>
                <p className="panel-desc">Automated advisory evaluation logic</p>
              </div>
              <span className="badge badge-education">AI Index</span>
            </div>

            <div className="savings-meter mt-4">
              <div className="meter-header flex justify-between mb-1">
                <span className="font-semibold text-sm">Savings Cushion Target (20%)</span>
                <span className="font-bold text-primary">{savingsData?.savingsRate || 0}% Saved</span>
              </div>
              <div className="meter-track">
                <div 
                  className="meter-fill" 
                  style={{ width: `${Math.min(savingsData?.savingsRate || 0, 100)}%` }}
                ></div>
              </div>
            </div>

            <div className="recommendation-card mt-6">
              <h4>System Recommendations</h4>
              <p className="text-sm mt-2 leading-relaxed">
                {savingsData?.recommendation || 'No active advisory recommendations. Log income and transactions to receive automated analysis alerts.'}
              </p>
            </div>
          </div>

          <div className="recent-mini-list mt-6 pt-4 border-t border-color">
            <h4 className="text-xs text-muted uppercase mb-3">Recent Realtime Transactions</h4>
            <div className="flex flex-col gap-2">
              {recentExpenses.length > 0 ? (
                recentExpenses.map((ex) => (
                  <div key={ex.id} className="flex justify-between items-center text-xs">
                    <span className="font-medium truncate max-w-[180px]">{ex.description || ex.category}</span>
                    <div className="flex items-center gap-2">
                      <span className={`badge badge-${ex.category.toLowerCase()}`}>{ex.category}</span>
                      <span className="font-semibold text-danger">-₹{ex.amount}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-muted text-xs text-center py-2">No transactions recorded.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
