import React, { useEffect, useState, useCallback, useRef } from 'react';
import { aiApi, aiWs, expenseApi, incomeApi } from '../api/client';
import { 
  Sparkles, 
  Brain, 
  AlertOctagon, 
  TrendingUp, 
  DollarSign, 
  Award, 
  RefreshCw, 
  Zap, 
  Shield, 
  Activity, 
  PieChart, 
  Wifi, 
  WifiOff,
  Send,
  User,
  Bot
} from 'lucide-react';
import './Insights.css';

export default function Insights() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [insights, setInsights] = useState(null);
  const [predictions, setPredictions] = useState(null);
  const [anomalies, setAnomalies] = useState(null);
  const [riskScore, setRiskScore] = useState(null);
  const [segment, setSegment] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);
  const [activeTab, setActiveTab] = useState('chat'); // Default to flagship chatbot tab
  
  // Chatbot State
  const [messages, setMessages] = useState([
    { id: 1, sender: 'bot', text: 'Hello! I am your CentricAI Financial Advisor. Ask me anything about your current budget performance, spending anomalies, or cashflow predictions.' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const chatEndRef = useRef(null);

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      const [expRes, incRes] = await Promise.all([
        expenseApi.getAll(),
        incomeApi.getAll()
      ]);
      const expenses = expRes.data || [];
      const incomes = incRes.data || [];
      const totalIncome = incomes.reduce((acc, curr) => acc + (curr.amount || 0), 0);

      if (wsConnected) {
        // Trigger live WebSocket ML ensemble analysis
        aiWs.analyze(expenses, totalIncome);
        // Load segment/clusters asynchronously via REST (not streamed over websocket)
        try {
          const segRes = await aiApi.getSegment();
          setSegment(segRes.data);
        } catch (e) {
          console.error("Failed to load clusters:", e);
        }
      } else {
        // REST Fallback mode (downtime or connection retry phase)
        const [insRes, predRes, anoRes, segRes, riskRes] = await Promise.all([
          aiApi.getInsights(),
          aiApi.getPredictions(),
          aiApi.getAnomalies(),
          aiApi.getSegment(),
          aiApi.getRiskScore(),
        ]);
        setInsights(insRes.data);
        setPredictions(predRes.data);
        setAnomalies(anoRes.data);
        setSegment(segRes.data);
        setRiskScore(riskRes.data);
      }
    } catch (err) {
      console.error('Remote AI link error:', err);
      setError('AI Subsystem is offline or unreachable. Please make sure the FastAPI server is running.');
      setInsights(null);
      setPredictions(null);
      setAnomalies(null);
      setSegment(null);
      setRiskScore(null);
    } finally {
      setLoading(false);
    }
  }, [wsConnected]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // WebSocket connection
  useEffect(() => {
    aiWs.on('connected', (connected) => setWsConnected(connected));
    aiWs.on('analysis_complete', (payload) => {
      if (payload.insights) setInsights(payload.insights);
      if (payload.predictions) setPredictions(payload.predictions);
      if (payload.anomalies) setAnomalies(payload.anomalies);
      if (payload.riskScore) setRiskScore(payload.riskScore);
    });
    aiWs.connect();
    return () => aiWs.disconnect();
  }, []);

  // Auto scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleManualRebuild = async () => {
    setRefreshing(true);
    setError('');
    try {
      await fetchAll();
    } catch (err) {
      setError('Recalculation failed: ' + err.message);
    } finally {
      setRefreshing(false);
    }
  };

  // Chat reply generation logic based on actual fetched database state
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userText = chatInput.trim();
    const newMsg = { id: Date.now(), sender: 'user', text: userText };
    setMessages(prev => [...prev, newMsg]);
    setChatInput('');

    // Simulate thinking delay
    setTimeout(() => {
      let reply = '';
      const query = userText.toLowerCase();

      if (!insights && !predictions) {
        reply = "I don't have access to your financial metrics right now because the AI service is offline. Please resolve the server connections.";
      } else if (query.includes('savings') || query.includes('optimize') || query.includes('cut')) {
        const potential = insights?.potentialSavings || 0;
        const suggestions = insights?.savingsSuggestions || [];
        reply = `According to our RandomForest optimization loops, your potential savings cushion is ₹${potential.toLocaleString()} this period. `;
        if (suggestions.length > 0) {
          reply += `Here is what I suggest: ${suggestions.join(' ')}`;
        } else {
          reply += `Log more expenses to allow me to extract custom savings routes.`;
        }
      } else if (query.includes('forecast') || query.includes('predict') || query.includes('future') || query.includes('next month')) {
        const nextMonth = predictions?.predictedNextMonthExpense || 0;
        const trend = predictions?.trendSummary || '';
        reply = `I forecast your aggregate spending for next month will be approximately ₹${nextMonth.toLocaleString()}. ${trend}`;
      } else if (query.includes('anomaly') || query.includes('risk') || query.includes('suspicious') || query.includes('unsafe')) {
        const risk = anomalies?.riskScore || riskScore?.overallRisk || 0;
        const flagList = anomalies?.anomalies || [];
        reply = `Your overall portfolio risk profile is calculated at ${risk}%. `;
        if (flagList.length > 0) {
          reply += `We flagged ${flagList.length} anomalies: ${flagList.map(a => `₹${a.amount} under ${a.category} (${a.reason})`).join(', ')}.`;
        } else {
          reply += `No suspicious transaction z-score variances were flagged. All items run within standard bounds.`;
        }
      } else if (query.includes('categories') || query.includes('spending') || query.includes('patterns') || query.includes('group')) {
        const pattern = segment?.pattern || 'Balanced Spender';
        const sumText = segment?.summary || '';
        reply = `Your spending behavior conforms to the "${pattern}" template. ${sumText}`;
      } else {
        reply = `I parsed your question. Based on your active portfolio, your current month expenses are under analysis. Your calculated potential savings is ₹${(insights?.potentialSavings || 0).toLocaleString()} and your forecast next month cost is ₹${(predictions?.predictedNextMonthExpense || 0).toLocaleString()}. Feel free to ask about "savings", "forecasting", "anomalies", or "spending patterns"!`;
      }

      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        sender: 'bot',
        text: reply
      }]);
    }, 800);
  };

  const riskColor = (score) => {
    if (score < 25) return 'text-success';
    if (score < 50) return 'text-warning';
    return 'text-danger';
  };

  const riskBg = (score) => {
    if (score < 25) return 'bg-success/10 border-success/20';
    if (score < 50) return 'bg-warning/10 border-warning/20';
    return 'bg-danger/10 border-danger/20';
  };

  return (
    <div className="insights-page fade-in">
      {error && <div className="alert alert-danger mb-4 p-3 rounded bg-danger-bg text-danger border border-danger/20 text-xs font-semibold">{error}</div>}

      {/* Top Banner Feature */}
      <div className="ai-premium-banner glass-panel mb-6">
        <div className="banner-bg-glow"></div>
        <div className="banner-content">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white text-accent rounded-md shadow-md">
              <Brain size={28} className="text-primary-hover" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="badge badge-bills">Live ML Engine v2.0</span>
                <span className={`text-xs font-bold flex items-center gap-1 ${wsConnected ? 'text-success' : 'text-muted'}`}>
                  {wsConnected ? <Wifi size={12} /> : <WifiOff size={12} />}
                  {wsConnected ? 'WebSocket Live' : 'REST Mode'}
                </span>
              </div>
              <h2 className="text-xl font-bold mt-1">Autonomous Machine Learning Insight Engine</h2>
              <p className="text-xs text-muted-dark mt-0.5">RandomForest ensemble + IsolationForest security + real-time streaming</p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            {anomalies && (
              <span className={`text-xs font-semibold px-2 py-1 rounded-full ${riskBg(anomalies.riskScore)} ${riskColor(anomalies.riskScore)}`}>
                <Shield size={12} className="inline mr-1" />
                Risk: {anomalies.riskScore}%
              </span>
            )}
            <button
              onClick={handleManualRebuild}
              disabled={refreshing || loading}
              className="btn btn-secondary text-xs flex items-center gap-1"
            >
              <RefreshCw size={14} className={refreshing ? 'spin' : ''} />
              <span>{refreshing ? 'Re-evaluating...' : 'Re-run Predictions'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="tab-bar glass-panel mb-6">
        <button className={`tab-btn ${activeTab === 'chat' ? 'active' : ''}`} onClick={() => setActiveTab('chat')}>
          <Bot size={16} /> AI Financial Advisor Chat
        </button>
        <button className={`tab-btn ${activeTab === 'insights' ? 'active' : ''}`} onClick={() => setActiveTab('insights')}>
          <Sparkles size={16} /> Performance Insights
        </button>
        <button className={`tab-btn ${activeTab === 'security' ? 'active' : ''}`} onClick={() => setActiveTab('security')}>
          <Shield size={16} /> Security & Risk
        </button>
        <button className={`tab-btn ${activeTab === 'segments' ? 'active' : ''}`} onClick={() => setActiveTab('segments')}>
          <PieChart size={16} /> Spending Patterns
        </button>
        <button className={`tab-btn ${activeTab === 'predictions' ? 'active' : ''}`} onClick={() => setActiveTab('predictions')}>
          <TrendingUp size={16} /> Forecast
        </button>
      </div>

      {loading ? (
        <div className="p-12 text-center text-primary font-bold animate-pulse">
          Querying FastAPI ML nodes (RandomForest, IsolationForest, KMeans)...
        </div>
      ) : (
        <>
          {/* Flagship Tab: AI Advisor Chat */}
          {activeTab === 'chat' && (
            <div className="chat-container-panel glass-panel flex flex-col justify-between">
              <div className="chat-header p-4 border-b border-color flex justify-between items-center bg-base/30">
                <div className="flex items-center gap-2">
                  <Bot size={20} className="text-primary" />
                  <div>
                    <h3 className="text-sm font-bold">Interactive Advisor</h3>
                    <span className="text-[10px] text-success font-semibold flex items-center gap-0.5">● Dynamic context loaded</span>
                  </div>
                </div>
                <span className="text-[10px] text-muted">Answers derived from your active database variables</span>
              </div>

              <div className="chat-messages p-4 space-y-4 overflow-y-auto" style={{ height: '380px' }}>
                {messages.map((m) => (
                  <div key={m.id} className={`chat-bubble-wrapper flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`flex items-start gap-2 max-w-[80%] ${m.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                      <div className={`p-2 rounded-full ${m.sender === 'user' ? 'bg-primary text-white' : 'bg-base border border-color'}`}>
                        {m.sender === 'user' ? <User size={14} /> : <Bot size={14} />}
                      </div>
                      <div className={`chat-bubble p-3 rounded-lg text-xs leading-relaxed ${m.sender === 'user' ? 'bg-primary text-white rounded-tr-none' : 'bg-base border border-color rounded-tl-none'}`}>
                        {m.text}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>

              <form onSubmit={handleSendMessage} className="chat-input-area p-3 border-t border-color flex gap-2 bg-base/20">
                <input 
                  type="text" 
                  className="form-input text-xs" 
                  value={chatInput} 
                  onChange={(e) => setChatInput(e.target.value)} 
                  placeholder="Ask advisor: e.g. How can I optimize spending? / What is my forecast?" 
                />
                <button type="submit" className="btn btn-primary px-4 py-2">
                  <Send size={14} />
                </button>
              </form>
            </div>
          )}

          {/* Tab: Insights */}
          {activeTab === 'insights' && (
            <div className="insights-grid">
              <div className="flex flex-col gap-6">
                <div className="glass-panel p-6">
                  <div className="panel-header mb-4">
                    <h3 className="flex items-center gap-2">
                      <Sparkles className="text-primary" size={20} />
                      <span>Spending Behavior Diagnostics</span>
                    </h3>
                    <span className="badge badge-shopping">ML Analysis</span>
                  </div>
                  <div className="advisory-items">
                    {insights?.behaviorAnalysis?.map((text, idx) => (
                      <div key={idx} className="advice-capsule behavior fade-in">
                        <span className="bullet-glow"></span>
                        <p className="text-sm font-medium">{text}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="glass-panel p-6">
                  <div className="panel-header mb-4">
                    <h3 className="flex items-center gap-2">
                      <Award className="text-success" size={20} />
                      <span>Strategic Savings Optimizers</span>
                    </h3>
                    <span className="badge badge-food">AI Recommended</span>
                  </div>
                  <div className="p-4 bg-success-light rounded-md border border-success mb-4 flex justify-between items-center">
                    <div>
                      <span className="text-xs text-success uppercase font-bold block">AI-Optimized Route</span>
                      <span className="text-lg font-bold">Potential Monthly Savings</span>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-bold text-success">
                        ₹{(insights?.potentialSavings || 0).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className="advisory-items">
                    {insights?.savingsSuggestions?.filter(t => !t.startsWith('Potential monthly')).map((text, idx) => (
                      <div key={idx} className="advice-capsule suggestion fade-in">
                        <span className="bullet-glow success"></span>
                        <p className="text-sm font-medium">{text}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="glass-panel p-6">
                  <div className="panel-header mb-4">
                    <h3 className="flex items-center gap-2">
                      <AlertOctagon className="text-danger" size={20} />
                      <span>Unusual Activity Detectors</span>
                    </h3>
                    <span className="badge badge-transport">IsolationForest</span>
                  </div>
                  <div className="advisory-items">
                    {insights?.unusualSpendingAlerts?.map((text, idx) => (
                      <div key={idx} className="advice-capsule anomaly fade-in">
                        <span className="bullet-glow danger"></span>
                        <p className="text-sm font-medium text-danger-dark">{text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-6">
                <div className="glass-panel p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="panel-header mb-4">
                      <div>
                        <h3 className="flex items-center gap-2">
                          <TrendingUp className="text-accent" size={20} />
                          <span>RandomForest Forecast</span>
                        </h3>
                        <p className="panel-desc">100-tree ensemble predicting next 90 days</p>
                      </div>
                      <span className="badge badge-education">ML Predictor</span>
                    </div>

                    <div className="p-4 bg-base rounded-md border border-color my-4">
                      <span className="text-xs text-muted block uppercase mb-2 font-bold">Feature Extrapolation</span>
                      <div className="flex justify-between text-xs font-semibold text-muted mb-1">
                        <span>Historical Base</span>
                        <span>30-Day RF Node</span>
                      </div>
                      <div className="h-16 w-full flex items-center relative py-2">
                        <svg className="w-full h-full overflow-visible" viewBox="0 0 100 40" preserveAspectRatio="none">
                          <path d="M 0 35 Q 25 32 50 25 T 100 8" fill="none" stroke="#6366f1" strokeWidth="3" strokeDasharray="4" />
                          <circle cx="0" cy="35" r="4" fill="#10b981" />
                          <circle cx="50" cy="25" r="4" fill="#6366f1" />
                          <circle cx="100" cy="8" r="5" fill="#f59e0b" className="animate-pulse" />
                        </svg>
                      </div>
                    </div>

                    <div className="prediction-numbers grid grid-cols-2 gap-4 mt-6">
                      <div className="p-4 bg-base rounded-md border border-color text-center">
                        <span className="text-xs text-muted uppercase block font-semibold">Predicted Core Cost</span>
                        <span className="text-xl font-bold text-accent mt-1 block">
                          ₹{(predictions?.predictedNextMonthExpense || 0).toLocaleString()}
                        </span>
                      </div>
                      <div className="p-4 bg-base rounded-md border border-color text-center">
                        <span className="text-xs text-muted uppercase block font-semibold">Forecasted Safe Savings</span>
                        <span className="text-xl font-bold text-success mt-1 block">
                          ₹{(predictions?.forecastedSavings || 0).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className="trend-summary-box mt-6 p-4 bg-primary-light/30 rounded-md border border-primary/20 text-xs leading-relaxed">
                      <span className="font-bold text-primary block mb-1">Ensemble Synthesis:</span>
                      {predictions?.trendSummary || 'RandomForest feature inference detected systemic patterns.'}
                    </div>
                  </div>

                  <div className="mt-8 pt-4 border-t border-color text-xs text-muted flex items-center justify-between">
                    <span>Model: sklearn.ensemble.RandomForestRegressor (n=100)</span>
                    <span className="badge badge-bills">v1.3.2</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab: Security & Risk */}
          {activeTab === 'security' && (
            <div className="insights-grid">
              <div className="flex flex-col gap-6">
                <div className="glass-panel p-6">
                  <div className="panel-header mb-4">
                    <h3 className="flex items-center gap-2">
                      <Shield className="text-primary" size={20} />
                      <span>Portfolio Security Risk Assessment</span>
                    </h3>
                    <span className="badge badge-bills">IsolationForest</span>
                  </div>

                  <div className={`p-6 rounded-md border mb-4 ${riskBg(anomalies?.riskScore || 0)}`}>
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-xs uppercase font-bold block">Overall Risk Score</span>
                        <span className={`text-3xl font-bold mt-1 block ${riskColor(anomalies?.riskScore || 0)}`}>
                          {anomalies?.riskScore || 0}%
                        </span>
                      </div>
                      <Activity size={40} className={riskColor(anomalies?.riskScore || 0)} />
                    </div>
                    <p className="text-xs text-muted mt-2">{anomalies?.summary || 'Analyzing...'}</p>
                  </div>

                  {anomalies?.anomalies?.length > 0 ? (
                    <div>
                      <h4 className="font-bold text-sm mb-3">Flagged Transactions ({anomalies.anomalies.length})</h4>
                      <div className="flex flex-col gap-2">
                        {anomalies.anomalies.map((a, idx) => (
                          <div key={idx} className="p-3 bg-danger/5 rounded-md border border-danger/20 text-sm">
                            <div className="flex justify-between items-center">
                              <span className="font-bold text-danger">₹{a.amount?.toLocaleString()}</span>
                              <span className={`badge badge-${(a.category || '').toLowerCase()}`}>{a.category}</span>
                            </div>
                            <p className="text-xs text-muted mt-1">{a.date} — Risk: {a.riskScore}%</p>
                            <p className="text-xs text-danger-dark mt-1">{a.reason}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="p-6 text-center text-success font-medium text-sm">
                      <Shield size={32} className="inline mb-2 opacity-50" />
                      <p>No suspicious transactions detected.</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-6">
                <div className="glass-panel p-6">
                  <div className="panel-header mb-4">
                    <h3 className="flex items-center gap-2">
                      <Activity className="text-warning" size={20} />
                      <span>Transaction Risk Breakdown</span>
                    </h3>
                    <span className="badge badge-transport">Per-Item Scoring</span>
                  </div>

                  {riskScore?.transactionRisks?.length > 0 ? (
                    <div className="flex flex-col gap-2 max-h-[400px] overflow-y-auto">
                      {riskScore.transactionRisks.slice(0, 20).map((t, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 rounded-md bg-base text-xs">
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${t.riskScore > 60 ? 'bg-danger' : t.riskScore > 30 ? 'bg-warning' : 'bg-success'}`}></span>
                            <span className="font-medium">{t.category}</span>
                            <span className="text-muted">₹{t.amount?.toLocaleString()}</span>
                          </div>
                          <span className={`font-semibold ${riskColor(t.riskScore)}`}>
                            {t.riskScore}%
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted p-4">No transaction data to analyze.</p>
                  )}

                  {riskScore?.recommendations?.length > 0 && (
                    <div className="mt-4 p-4 bg-primary-light/20 rounded-md border border-primary/20">
                      <h4 className="font-bold text-xs uppercase mb-2">Recommendations</h4>
                      {riskScore.recommendations.map((r, idx) => (
                        <p key={idx} className="text-xs text-muted mt-1">• {r}</p>
                      ))}
                    </div>
                  )}
                </div>

                <div className="glass-panel p-6">
                  <div className="panel-header mb-4">
                    <h3 className="flex items-center gap-2">
                      <DollarSign className="text-success" size={20} />
                      <span>Risk Factor Detail</span>
                    </h3>
                  </div>
                  <div className="text-xs text-muted space-y-2">
                    <div className="flex justify-between"><span>Anomaly Score (IsolationForest)</span><span className="font-semibold">Weight: 40%</span></div>
                    <div className="flex justify-between"><span>Income Ratio (30% threshold)</span><span className="font-semibold">Weight: 30%</span></div>
                    <div className="flex justify-between"><span>Transaction Velocity</span><span className="font-semibold">Weight: 20%</span></div>
                    <div className="flex justify-between"><span>Time-Based (weekends)</span><span className="font-semibold">Weight: 10%</span></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab: Spending Patterns */}
          {activeTab === 'segments' && (
            <div className="insights-grid">
              <div className="flex flex-col gap-6">
                <div className="glass-panel p-6">
                  <div className="panel-header mb-4">
                    <h3 className="flex items-center gap-2">
                      <PieChart className="text-primary" size={20} />
                      <span>Spending Pattern Segmentation</span>
                    </h3>
                    <span className="badge badge-education">KMeans Clustering</span>
                  </div>

                  <div className="p-6 bg-primary-light/20 rounded-md border border-primary/20 mb-4 text-center">
                    <span className="text-xs uppercase font-bold text-muted block">Your Pattern</span>
                    <span className="text-2xl font-bold text-primary mt-1 block">{segment?.pattern || 'Analyzing...'}</span>
                    <p className="text-xs text-muted mt-1">{segment?.summary || ''}</p>
                  </div>

                  {segment?.segments?.length > 0 && (
                    <div className="flex flex-col gap-3">
                      <h4 className="font-bold text-sm">Category Clusters</h4>
                      {segment.segments.map((s, idx) => (
                        <div key={idx} className="p-3 bg-base rounded-md border border-color">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-sm">{s.dominantCategory}</span>
                            <span className="badge badge-bills">{s.transactionCount} txns</span>
                          </div>
                          <div className="flex justify-between text-xs text-muted mt-2">
                            <span>Avg: ₹{s.averageAmount?.toLocaleString()}</span>
                            <span>Total: ₹{s.totalSpend?.toLocaleString()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-6">
                <div className="glass-panel p-6">
                  <div className="panel-header mb-4">
                    <h3 className="flex items-center gap-2">
                      <TrendingUp className="text-accent" size={20} />
                      <span>Spending Profile Analysis</span>
                    </h3>
                  </div>
                  <div className="text-sm text-muted space-y-4">
                    <p><strong>Focused Spender:</strong> 1-2 dominant categories. Consider diversifying to reduce risk.</p>
                    <p><strong>Balanced Spender:</strong> 3-4 categories with moderate distribution. Healthy financial profile.</p>
                    <p><strong>Diversified Spender:</strong> 5+ categories. Good spread but monitor for small unnecessary expenses.</p>
                    <div className="p-4 bg-base rounded-md border border-color mt-4">
                      <span className="text-xs font-bold uppercase">ML Note</span>
                      <p className="text-xs mt-1">Segmentation uses KMeans clustering on transaction features. Clusters are recomputed as new data arrives.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab: Forecast */}
          {activeTab === 'predictions' && (
            <div className="insights-grid">
              <div className="flex flex-col gap-6">
                <div className="glass-panel p-6">
                  <div className="panel-header mb-4">
                    <h3 className="flex items-center gap-2">
                      <TrendingUp className="text-accent" size={20} />
                      <span>RandomForest 90-Day Forecast</span>
                    </h3>
                    <span className="badge badge-bills">Ensemble Model</span>
                  </div>

                  <div className="p-4 bg-base rounded-md border border-color mb-4">
                    <span className="text-xs text-muted block uppercase mb-2 font-bold">30/60/90 Day Projection</span>
                    <div className="h-24 w-full relative">
                      <svg className="w-full h-full" viewBox="0 0 100 50" preserveAspectRatio="none">
                        <path d="M 0 45 Q 33 35 50 25 Q 75 15 100 10" fill="none" stroke="#6366f1" strokeWidth="2" />
                        <circle cx="0" cy="45" r="3" fill="#10b981" />
                        <text x="0" y="52" fontSize="4" fill="#94a3b8">Now</text>
                        <circle cx="33" cy="35" r="3" fill="#6366f1" />
                        <text x="28" y="42" fontSize="4" fill="#94a3b8">30d</text>
                        <circle cx="66" cy="22" r="3" fill="#8b5cf6" />
                        <text x="61" y="29" fontSize="4" fill="#94a3b8">60d</text>
                        <circle cx="100" cy="10" r="4" fill="#f59e0b" className="animate-pulse" />
                        <text x="92" y="17" fontSize="4" fill="#94a3b8">90d</text>
                      </svg>
                    </div>
                  </div>

                  <div className="prediction-numbers grid grid-cols-2 gap-4">
                    <div className="p-4 bg-base rounded-md border border-color text-center">
                      <span className="text-xs text-muted uppercase block font-semibold">Next Month</span>
                      <span className="text-xl font-bold text-accent mt-1 block">
                        ₹{(predictions?.predictedNextMonthExpense || 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="p-4 bg-base rounded-md border border-color text-center">
                      <span className="text-xs text-muted uppercase block font-semibold">Forecasted Savings</span>
                      <span className="text-xl font-bold text-success mt-1 block">
                        ₹{(predictions?.forecastedSavings || 0).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-6">
                <div className="glass-panel p-6">
                  <div className="panel-header mb-4">
                    <h3 className="flex items-center gap-2">
                      <Brain className="text-primary" size={20} />
                      <span>Model Details</span>
                    </h3>
                  </div>
                  <div className="text-xs text-muted space-y-2">
                    <div className="flex justify-between py-1 border-b border-color"><span>Algorithm</span><span className="font-semibold">RandomForestRegressor</span></div>
                    <div className="flex justify-between py-1 border-b border-color"><span>Estimators</span><span className="font-semibold">100 trees</span></div>
                    <div className="flex justify-between py-1 border-b border-color"><span>Max Depth</span><span className="font-semibold">10</span></div>
                    <div className="flex justify-between py-1 border-b border-color"><span>Features</span><span className="font-semibold">Timestamp, Day, Weekday, Month, Category</span></div>
                    <div className="flex justify-between py-1 border-b border-color"><span>Training</span><span className="font-semibold">Online (per request)</span></div>
                    <div className="flex justify-between py-1"><span>Fallback</span><span className="font-semibold">Statistical projection</span></div>
                  </div>
                </div>

                <div className="glass-panel p-6">
                  <div className="panel-header mb-4">
                    <h3 className="flex items-center gap-2">
                      <Award className="text-success" size={20} />
                      <span>Trend Summary</span>
                    </h3>
                  </div>
                  <div className="trend-summary-box p-4 bg-primary-light/30 rounded-md border border-primary/20 text-xs leading-relaxed">
                    {predictions?.trendSummary || 'Machine Learning feature inference detected systemic patterns.'}
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
