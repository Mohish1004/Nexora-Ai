import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  Sparkles,
  Send,
  Bot,
  User,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Shield,
  PiggyBank,
  AlertTriangle,
  Zap,
  ChevronRight,
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Filler,
  Tooltip,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { analyticsApi, expenseApi, incomeApi, budgetApi, aiApi, aiWs } from '../api/client';
import GuidedOnboarding from '../components/GuidedOnboarding';
import './Dashboard.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Filler, Tooltip);

// ────────────────────────────────────────────────────────
// Category color map (shared with expense badges)
// ────────────────────────────────────────────────────────
const CAT_COLORS = {
  Food: '#f59e0b',
  Transport: '#06b6d4',
  Shopping: '#ec4899',
  Bills: '#f43f5e',
  Education: '#8b5cf6',
  Entertainment: '#10b981',
};

export default function Dashboard() {
  // ---- Core Data ----
  const [loading, setLoading] = useState(true);
  const [monthlyData, setMonthlyData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [savingsData, setSavingsData] = useState(null);
  const [recentExpenses, setRecentExpenses] = useState([]);
  const [budgetLimit, setBudgetLimit] = useState(0);
  const [insights, setInsights] = useState(null);
  const [predictions, setPredictions] = useState(null);
  const [anomalies, setAnomalies] = useState(null);

  // ---- AI Copilot Chat ----
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [wsConnected, setWsConnected] = useState(false);
  const chatEndRef = useRef(null);

  // ---- Data fetching ----
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [mRes, cRes, sRes, eRes, bRes] = await Promise.all([
        analyticsApi.getMonthly(6),
        analyticsApi.getCategory(),
        analyticsApi.getSavings(),
        expenseApi.getAll(),
        budgetApi.getAll(),
      ]);

      const monthly = mRes.data || [];
      const categories = cRes.data || [];
      const expenses = eRes.data || [];

      setMonthlyData(monthly);
      setCategoryData(categories);
      setSavingsData(sRes.data || null);
      setRecentExpenses(expenses.slice(0, 5));
      setBudgetLimit(bRes.data?.[0]?.monthlyLimit || 0);

      // Fetch AI insights for the intelligence sidebar
      try {
        const [insRes, predRes, anoRes] = await Promise.all([
          aiApi.getInsights(),
          aiApi.getPredictions(),
          aiApi.getAnomalies(),
        ]);
        setInsights(insRes.data);
        setPredictions(predRes.data);
        setAnomalies(anoRes.data);
      } catch {
        // AI service may be offline — degrade gracefully
      }
    } catch (err) {
      console.error('Dashboard data load error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ---- WebSocket ----
  useEffect(() => {
    const unsub = aiWs.on('connected', (c) => setWsConnected(c));
    aiWs.connect();
    return () => { unsub(); aiWs.disconnect(); };
  }, []);

  // ---- Auto-scroll chat ----
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ---- Build initial greeting message after data loads ----
  useEffect(() => {
    if (loading || messages.length > 0) return;

    const cur = monthlyData[monthlyData.length - 1] || {};
    const totalInc = cur.totalIncome || 0;
    const totalExp = cur.totalExpense || 0;
    const balance = totalInc - totalExp;
    const savingsRate = savingsData?.savingsRate || 0;

    let greeting = '';
    if (totalInc === 0 && totalExp === 0) {
      greeting = `Welcome to CentricAI. I'm your financial copilot. I don't see any transactions yet — try adding an expense or income to get started. Once you do, I'll analyze your spending patterns, forecast future costs, and flag anomalies in real time.`;
    } else {
      greeting = `Good ${getTimeOfDay()}. Here's your financial snapshot:\n\n`;
      greeting += `• Net balance this month: ₹${balance.toLocaleString()} ${balance >= 0 ? '(healthy)' : '(deficit — needs attention)'}\n`;
      if (savingsRate > 0) greeting += `• Savings rate: ${savingsRate}% ${savingsRate >= 20 ? '— on track' : '— below the 20% target'}\n`;
      if (insights?.savingsSuggestions?.length > 0) {
        greeting += `\nI found ${insights.savingsSuggestions.length} optimization${insights.savingsSuggestions.length > 1 ? 's' : ''} for your spending. Ask me for details.`;
      }
      if (anomalies?.anomalies?.length > 0) {
        greeting += `\n⚠ ${anomalies.anomalies.length} unusual transaction${anomalies.anomalies.length > 1 ? 's' : ''} detected. Ask about anomalies to learn more.`;
      }
    }

    setMessages([{ id: 1, sender: 'bot', text: greeting }]);
  }, [loading, monthlyData, savingsData, insights, anomalies]);

  // ---- Chat logic ----
  const handleSend = (e) => {
    e?.preventDefault();
    const text = chatInput.trim();
    if (!text) return;

    setMessages((prev) => [...prev, { id: Date.now(), sender: 'user', text }]);
    setChatInput('');

    // Generate reply based on actual data
    setTimeout(() => {
      const reply = generateReply(text);
      setMessages((prev) => [...prev, { id: Date.now() + 1, sender: 'bot', text: reply }]);
    }, 600);
  };

  const handleQuickAction = (prompt) => {
    setChatInput('');
    setMessages((prev) => [...prev, { id: Date.now(), sender: 'user', text: prompt }]);
    setTimeout(() => {
      const reply = generateReply(prompt);
      setMessages((prev) => [...prev, { id: Date.now() + 1, sender: 'bot', text: reply }]);
    }, 600);
  };

  const generateReply = (query) => {
    const q = query.toLowerCase();
    const cur = monthlyData[monthlyData.length - 1] || {};
    const totalInc = cur.totalIncome || 0;
    const totalExp = cur.totalExpense || 0;

    if (!insights && !predictions && totalInc === 0 && totalExp === 0) {
      return "I don't have enough financial data to analyze yet. Add some income and expenses, and I'll provide personalized insights.";
    }

    if (q.includes('sav') || q.includes('optim') || q.includes('cut') || q.includes('reduce')) {
      const potential = insights?.potentialSavings || 0;
      const suggestions = insights?.savingsSuggestions || [];
      let r = `Based on your spending patterns, you could save ₹${potential.toLocaleString()} this month.\n\n`;
      if (suggestions.length > 0) {
        suggestions.forEach((s, i) => { r += `${i + 1}. ${s}\n`; });
      }
      return r || 'Log more transactions so I can identify savings opportunities.';
    }

    if (q.includes('forecast') || q.includes('predict') || q.includes('next month') || q.includes('future')) {
      const next = predictions?.predictedNextMonthExpense || 0;
      const fSavings = predictions?.forecastedSavings || 0;
      return `My RandomForest model predicts your next month expenses will be approximately ₹${next.toLocaleString()}.\n\nForecasted savings: ₹${fSavings.toLocaleString()}\n\n${predictions?.trendSummary || ''}`;
    }

    if (q.includes('anomal') || q.includes('risk') || q.includes('suspicious') || q.includes('unusual')) {
      const risk = anomalies?.riskScore || 0;
      const flags = anomalies?.anomalies || [];
      let r = `Your portfolio risk score is ${risk}%.\n\n`;
      if (flags.length > 0) {
        r += `${flags.length} flagged transaction(s):\n`;
        flags.forEach((a) => {
          r += `• ₹${a.amount?.toLocaleString()} in ${a.category} — ${a.reason}\n`;
        });
      } else {
        r += 'No anomalies detected. All transactions are within normal bounds.';
      }
      return r;
    }

    if (q.includes('budget') || q.includes('limit') || q.includes('overspend')) {
      if (budgetLimit > 0) {
        const pct = Math.round((totalExp / budgetLimit) * 100);
        return `Your budget is ₹${budgetLimit.toLocaleString()} this month.\n\nYou've used ${pct}% (₹${totalExp.toLocaleString()} of ₹${budgetLimit.toLocaleString()}).\n\n${pct > 80 ? '⚠ You are approaching your limit. Consider reducing discretionary spending.' : '✓ You are within safe limits.'}`;
      }
      return "You haven't set a budget yet. Go to Budget Planner to configure one. I'll monitor it and alert you when you approach limits.";
    }

    if (q.includes('categor') || q.includes('spending') || q.includes('breakdown') || q.includes('where')) {
      if (categoryData.length > 0) {
        let r = 'Here is your category breakdown:\n\n';
        categoryData.forEach((c) => {
          const pct = totalExp > 0 ? Math.round((c.amount / totalExp) * 100) : 0;
          r += `• ${c.category}: ₹${c.amount.toLocaleString()} (${pct}%)\n`;
        });
        return r;
      }
      return 'No category data available yet. Add some expenses to see your breakdown.';
    }

    // Default response
    return `Your current month: earned ₹${totalInc.toLocaleString()}, spent ₹${totalExp.toLocaleString()}, net ₹${(totalInc - totalExp).toLocaleString()}.\n\nI can help with: savings optimization, forecasting, anomaly detection, budget tracking, or category breakdowns. What would you like to know?`;
  };

  // ---- Derived values ----
  const cur = monthlyData[monthlyData.length - 1] || {};
  const prev = monthlyData[monthlyData.length - 2] || {};
  const totalInc = cur.totalIncome || 0;
  const totalExp = cur.totalExpense || 0;
  const balance = totalInc - totalExp;
  const prevBalance = (prev.totalIncome || 0) - (prev.totalExpense || 0);
  const balanceDelta = prevBalance !== 0 ? Math.round(((balance - prevBalance) / Math.abs(prevBalance)) * 100) : 0;
  const savingsRate = savingsData?.savingsRate || 0;

  const isOnboardingRequired = !loading && monthlyData.length === 0 && recentExpenses.length === 0;

  // ---- Mini sparkline data for greeting metrics ----
  const sparkData = {
    labels: monthlyData.map((d) => d.month),
    datasets: [{
      data: monthlyData.map((d) => (d.totalIncome || 0) - (d.totalExpense || 0)),
      borderColor: balance >= 0 ? '#10b981' : '#f43f5e',
      backgroundColor: 'transparent',
      borderWidth: 2,
      tension: 0.4,
      pointRadius: 0,
    }],
  };

  const sparkOpts = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { enabled: false } },
    scales: { x: { display: false }, y: { display: false } },
  };

  // Gauge SVG values
  const circumference = 2 * Math.PI * 52;
  const gaugeOffset = circumference - (Math.min(savingsRate, 100) / 100) * circumference;
  const gaugeColor = savingsRate >= 20 ? 'hsl(152, 69%, 41%)' : savingsRate >= 10 ? 'hsl(38, 92%, 50%)' : 'hsl(350, 89%, 55%)';

  return (
    <div className="dashboard-v2">
      {isOnboardingRequired && <GuidedOnboarding onComplete={fetchData} />}

      {/* ── Greeting Header ── */}
      <div className="dash-greeting">
        <div className="greeting-text">
          <h1>Financial Intelligence</h1>
          <p>{getTimeGreeting()}</p>
        </div>

        <div className="greeting-metrics">
          {/* Metric 1: Net Balance */}
          <div className="metric-atom">
            <span className="metric-label">Net Balance</span>
            <span className={`metric-value ${balance >= 0 ? 'positive' : 'negative'}`}>
              ₹{Math.abs(balance).toLocaleString()}
            </span>
            {balanceDelta !== 0 && (
              <span className={`metric-delta ${balanceDelta >= 0 ? 'up' : 'down'}`}>
                {balanceDelta >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                {Math.abs(balanceDelta)}% vs last month
              </span>
            )}
          </div>

          {/* Metric 2: Sparkline */}
          {monthlyData.length > 1 && (
            <div style={{ width: 80, height: 40, alignSelf: 'center' }}>
              <Line data={sparkData} options={sparkOpts} />
            </div>
          )}
        </div>
      </div>

      {/* ── Primary: AI Copilot ── */}
      <div className="copilot-panel" id="ai-copilot">
        <div className="copilot-header">
          <div className="copilot-identity">
            <div className="copilot-avatar">
              <Sparkles size={20} />
            </div>
            <div>
              <h3>CentricAI Copilot</h3>
              <div className="status-line">
                <div className="status-dot" />
                <span>{wsConnected ? 'Live' : 'Ready'}</span>
              </div>
            </div>
          </div>
          <span className="copilot-badge">ML Engine v2.0</span>
        </div>

        <div className="copilot-messages">
          {messages.map((m) => (
            <div key={m.id} className={`msg-row ${m.sender}`}>
              <div className={`msg-icon ${m.sender}`}>
                {m.sender === 'bot' ? <Sparkles size={14} /> : <User size={14} />}
              </div>
              <div className="msg-body">
                {m.text.split('\n').map((line, i) => (
                  <React.Fragment key={i}>
                    {line}
                    {i < m.text.split('\n').length - 1 && <br />}
                  </React.Fragment>
                ))}

                {/* Show quick actions only on first bot message */}
                {m.sender === 'bot' && m.id === 1 && (
                  <div className="quick-actions">
                    <button className="quick-chip" onClick={() => handleQuickAction('How can I save more?')}>
                      💡 Savings tips
                    </button>
                    <button className="quick-chip" onClick={() => handleQuickAction('What is my forecast?')}>
                      📈 Forecast
                    </button>
                    <button className="quick-chip" onClick={() => handleQuickAction('Any anomalies?')}>
                      🔍 Anomalies
                    </button>
                    <button className="quick-chip" onClick={() => handleQuickAction('Where am I spending the most?')}>
                      📊 Breakdown
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        <form className="copilot-input-area" onSubmit={handleSend}>
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder="Ask your financial copilot anything..."
          />
          <button type="submit" className="copilot-send-btn" aria-label="Send message">
            <Send size={18} />
          </button>
        </form>
      </div>

      {/* ── Secondary: Intelligence Sidebar ── */}
      <div className="intel-sidebar">

        {/* Card 1: Savings Gauge — answers "Am I saving enough?" */}
        <div className="intel-card">
          <div className="intel-card-header">
            <h4>Savings Health</h4>
            <span className="intel-badge ai">AI Analysis</span>
          </div>
          <div className="savings-gauge">
            <div className="gauge-ring">
              <svg width="120" height="120" viewBox="0 0 120 120">
                <circle className="gauge-track" cx="60" cy="60" r="52" />
                <circle
                  className="gauge-fill"
                  cx="60" cy="60" r="52"
                  stroke={gaugeColor}
                  strokeDasharray={circumference}
                  strokeDashoffset={gaugeOffset}
                />
              </svg>
              <div className="gauge-center">
                <div className="gauge-pct" style={{ color: gaugeColor }}>{savingsRate}%</div>
                <div className="gauge-label">saved</div>
              </div>
            </div>
            <p className="savings-detail">
              {savingsRate >= 20
                ? <>You're saving above the <strong>20% target</strong>. Keep it up.</>
                : savingsRate > 0
                ? <>Aim for <strong>20%</strong> savings rate. Currently {(20 - savingsRate).toFixed(0)}% below target.</>
                : <>Start tracking income & expenses to see your savings health.</>
              }
            </p>
          </div>
        </div>

        {/* Card 2: AI-Powered Actions — answers "What should I do next?" */}
        <div className="intel-card">
          <div className="intel-card-header">
            <h4>Smart Actions</h4>
            <span className="intel-badge forecast">Personalized</span>
          </div>
          <div className="action-items">
            {/* Action: Top saving opportunity */}
            {insights?.savingsSuggestions?.[0] && (
              <div className="action-item">
                <div className="action-icon savings"><PiggyBank size={16} /></div>
                <div className="action-text">
                  <div className="action-title">{insights.savingsSuggestions[0]}</div>
                  <div className="action-desc">AI-identified opportunity</div>
                </div>
              </div>
            )}

            {/* Action: Anomaly alert */}
            {anomalies?.anomalies?.length > 0 && (
              <div className="action-item">
                <div className="action-icon alert"><AlertTriangle size={16} /></div>
                <div className="action-text">
                  <div className="action-title">
                    {anomalies.anomalies.length} unusual transaction{anomalies.anomalies.length > 1 ? 's' : ''} flagged
                  </div>
                  <div className="action-desc">
                    ₹{anomalies.anomalies[0].amount?.toLocaleString()} in {anomalies.anomalies[0].category}
                  </div>
                </div>
              </div>
            )}

            {/* Action: Forecast */}
            {predictions?.predictedNextMonthExpense > 0 && (
              <div className="action-item">
                <div className="action-icon forecast"><TrendingUp size={16} /></div>
                <div className="action-text">
                  <div className="action-title">
                    Next month forecast: ₹{predictions.predictedNextMonthExpense.toLocaleString()}
                  </div>
                  <div className="action-desc">{predictions.trendSummary || 'Based on RandomForest analysis'}</div>
                </div>
              </div>
            )}

            {/* Action: Budget status */}
            {budgetLimit > 0 && (
              <div className="action-item">
                <div className="action-icon trend">
                  {totalExp / budgetLimit > 0.8 ? <AlertTriangle size={16} /> : <Shield size={16} />}
                </div>
                <div className="action-text">
                  <div className="action-title">
                    Budget: {Math.round((totalExp / budgetLimit) * 100)}% used
                  </div>
                  <div className="action-desc">
                    ₹{totalExp.toLocaleString()} of ₹{budgetLimit.toLocaleString()} limit
                  </div>
                </div>
              </div>
            )}

            {/* Fallback when no actions */}
            {!insights?.savingsSuggestions?.length && !anomalies?.anomalies?.length && !predictions?.predictedNextMonthExpense && budgetLimit === 0 && (
              <div className="action-item">
                <div className="action-icon forecast"><Zap size={16} /></div>
                <div className="action-text">
                  <div className="action-title">Add more data to unlock insights</div>
                  <div className="action-desc">Log expenses, income, and budgets to activate AI analysis</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Card 3: Recent Activity — answers "What just happened?" */}
        <div className="intel-card">
          <div className="intel-card-header">
            <h4>Recent Activity</h4>
            <span className="intel-badge risk">Live</span>
          </div>
          {recentExpenses.length > 0 ? (
            <div>
              {recentExpenses.map((ex) => (
                <div key={ex.id} className="recent-txn">
                  <div className="txn-left">
                    <div
                      className="txn-cat-dot"
                      style={{ background: CAT_COLORS[ex.category] || '#6366f1' }}
                    />
                    <span className="txn-name">{ex.description || ex.category}</span>
                  </div>
                  <span className="txn-amount">-₹{ex.amount?.toLocaleString()}</span>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ fontSize: '0.82rem', color: 'hsl(var(--text-muted))', textAlign: 'center', padding: '20px 0' }}>
              No transactions recorded yet.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ---- Helpers ----
function getTimeOfDay() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}

function getTimeGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning. Here is your daily financial intelligence.';
  if (h < 17) return 'Good afternoon. Here is your financial intelligence update.';
  return 'Good evening. Here is your end-of-day financial summary.';
}
