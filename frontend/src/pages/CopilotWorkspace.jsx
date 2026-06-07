import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  Shield, 
  PiggyBank, 
  TrendingUp, 
  Flame, 
  Target, 
  BarChart2, 
  LineChart,
  HelpCircle,
  AlertCircle
} from 'lucide-react';
import { expenseApi, incomeApi, budgetApi, goalApi, aiApi, aiWs } from '../api/client';
import './CopilotWorkspace.css';

// ────────────────────────────────────────────────────────
// AI Modes definitions
// ────────────────────────────────────────────────────────
const COPILOT_MODES = [
  {
    id: 'advisor',
    label: 'Financial Advisor',
    icon: Shield,
    color: '#818cf8',
    description: 'General portfolio oversight, wealth optimization, and macro advice.',
    greeting: "Hello, I'm your primary Financial Advisor. I've audited your accounts. How can I assist you with your assets or spending today?",
    prompts: ['Can I save more money?', 'Explain my current cash flow', 'Suggest a financial strategy']
  },
  {
    id: 'budget',
    label: 'Budget Coach',
    icon: PiggyBank,
    color: '#fbbf24',
    description: 'Overspending prevention, budget alerts, and expense limits.',
    greeting: "Hi there! I'm your Budget Coach. I'll help you stay inside your caps. Let's inspect your spending limits.",
    prompts: ['How much budget is left?', 'Did I overspend this week?', 'Tips to reduce food expenses']
  },
  {
    id: 'wealth',
    label: 'Wealth Builder',
    icon: TrendingUp,
    color: '#34d399',
    description: 'Investment allocation, interest calculations, and compound growth.',
    greeting: "Welcome to the Wealth Builder terminal. I analyze compound assets and investment allocations.",
    prompts: ['Projections for my investments', 'How to allocate my surplus?', 'Best retirement savings target']
  },
  {
    id: 'debt',
    label: 'Debt Eliminator',
    icon: Flame,
    color: '#f472b6',
    description: 'Debt reduction planning, payoff curves, and snowball methods.',
    greeting: "Hello. I'm the Debt Eliminator agent. I specialize in optimizing payoffs and interest reductions.",
    prompts: ['Snowball vs Avalanche payoff', 'How to pay off credit card faster', 'Calculate debt-to-income ratio']
  },
  {
    id: 'goals',
    label: 'Goal Planner',
    icon: Target,
    color: '#a78bfa',
    description: 'Savings goal milestone estimations and target trajectories.',
    greeting: "Goal Planner active. I monitor your saving targets and estimate milestone achievement timelines.",
    prompts: ['When will I reach my vacation goal?', 'Set up a new emergency fund', 'Am I on track for my goals?']
  },
  {
    id: 'analyst',
    label: 'Expense Analyst',
    icon: BarChart2,
    color: '#38bdf8',
    description: 'Merchant spending breakdowns, category reviews, and subscription audit.',
    greeting: "Expense Analyst ready. I parse transaction categories and flag recurring subscriptions.",
    prompts: ['Analyze Swiggy spending', 'Find duplicate transactions', 'Show category breakdown']
  },
  {
    id: 'forecaster',
    label: 'Forecast Assistant',
    icon: LineChart,
    color: '#f43f5e',
    description: 'RandomForest projections, future cache limits, and spending curves.',
    greeting: "Forecast Assistant active. I use regression models to map your next month's cash trajectories.",
    prompts: ['What is my next month forecast?', 'Predict my bills for next month', 'Explain spending trend line']
  }
];

export default function CopilotWorkspace() {
  const [activeMode, setActiveMode] = useState(COPILOT_MODES[0]);
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [wsConnected, setWsConnected] = useState(false);
  const [typing, setTyping] = useState(false);
  
  // Financial context for AI answering
  const [financialContext, setFinancialContext] = useState({
    expenses: [],
    incomes: [],
    budgets: [],
    goals: []
  });

  const chatEndRef = useRef(null);

  // Fetch financial data to inform AI queries
  useEffect(() => {
    async function loadContext() {
      try {
        const [expRes, incRes, budRes, goalRes] = await Promise.all([
          expenseApi.getAll(),
          incomeApi.getAll(),
          budgetApi.getAll(),
          goalApi.getAll()
        ]);
        setFinancialContext({
          expenses: expRes.data || [],
          incomes: incRes.data || [],
          budgets: budRes.data || [],
          goals: goalRes.data || []
        });
      } catch (e) {
        console.error('Failed to load financial context for Copilot:', e);
      }
    }
    loadContext();
  }, []);

  // Set greeting when mode changes
  useEffect(() => {
    setMessages([
      { id: 'greet', sender: 'bot', text: activeMode.greeting, mode: activeMode.id }
    ]);
  }, [activeMode]);

  // Connect to WebSocket
  useEffect(() => {
    const unsub = aiWs.on('connected', (c) => setWsConnected(c));
    aiWs.connect();

    // Listen to messages from WS
    const unsubMsg = aiWs.on('message', (msg) => {
      if (msg.type === 'analysis_complete') {
        // Handle websocket replies if any
      }
    });

    return () => {
      unsub();
      unsubMsg();
      aiWs.disconnect();
    };
  }, []);

  // Auto scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  // AI response builder (incorporates actual backend state!)
  const generateResponse = async (query) => {
    setTyping(true);
    const q = query.toLowerCase();
    
    // Derived values
    const totalExp = financialContext.expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
    const totalInc = financialContext.incomes.reduce((sum, i) => sum + (i.amount || 0), 0);
    const netSavings = totalInc - totalExp;
    const currentBudget = financialContext.budgets[0]?.monthlyLimit || 0;
    const firstGoal = financialContext.goals[0];

    let replyText = "";

    try {
      // Direct call to python ML microservice if needed for specific queries
      if (q.includes('forecast') || q.includes('predict') || q.includes('future')) {
        const res = await aiApi.getPredictions();
        replyText = `Based on my RandomForest model:\n\n• Predicted Next Month Expenses: ₹${res.data.predictedNextMonthExpense?.toLocaleString()}\n• Forecasted Surplus: ₹${res.data.forecastedSavings?.toLocaleString()}\n• Model Trend: ${res.data.trendSummary || 'Stable spending trajectory detected.'}`;
      } else if (q.includes('anomal') || q.includes('risk') || q.includes('suspicious')) {
        const res = await aiApi.getAnomalies();
        replyText = `I analyzed your transaction dataset. Portfolio risk score: ${res.data.riskScore}%.\n\n`;
        if (res.data.anomalies && res.data.anomalies.length > 0) {
          replyText += `Flagged anomaly records:\n`;
          res.data.anomalies.forEach((a, i) => {
            replyText += `${i + 1}. ₹${a.amount} in ${a.category} — ${a.reason}\n`;
          });
        } else {
          replyText += `✓ No anomalous spikes or double billing detected in your ledger.`;
        }
      } else if (q.includes('insight') || q.includes('save') || q.includes('limit') || q.includes('cut')) {
        const res = await aiApi.getInsights();
        replyText = `Here are my savings recommendations:\n\n• Potential Monthly Savings: ₹${res.data.potentialSavings?.toLocaleString()}\n\n`;
        if (res.data.savingsSuggestions && res.data.savingsSuggestions.length > 0) {
          res.data.savingsSuggestions.forEach((s, idx) => {
            replyText += `• ${s}\n`;
          });
        }
      } else {
        // Mock intelligent chat response depending on selected Mode
        await new Promise(r => setTimeout(r, 1200)); // Simulate thinking
        
        switch (activeMode.id) {
          case 'budget':
            if (currentBudget > 0) {
              const usedPct = Math.round((totalExp / currentBudget) * 100);
              replyText = `Your monthly budget is ₹${currentBudget.toLocaleString()}.\n\nYou have spent ₹${totalExp.toLocaleString()} (${usedPct}%). You have ₹${Math.max(0, currentBudget - totalExp).toLocaleString()} remaining.\n\n${usedPct > 85 ? '⚠ Suggest cutting Swiggy or entertainment immediately to avoid overrun.' : '✓ Spending velocity looks healthy.'}`;
            } else {
              replyText = "You have not configured a budget limit yet. Tell me 'create a budget' or visit the Budget Planner page to configure one.";
            }
            break;
          case 'wealth':
            if (netSavings > 0) {
              const compound5yr = Math.round(netSavings * 12 * 5 * 1.10); // 10% returns
              replyText = `Your monthly financial surplus is ₹${netSavings.toLocaleString()}.\n\nIf you invest this surplus at a conservative 10% annual return rate, you will accumulate approximately ₹${compound5yr.toLocaleString()} in 5 years.\n\nI suggest moving ₹${Math.round(netSavings * 0.4).toLocaleString()} to high-yield mutual funds.`;
            } else {
              replyText = "Your net monthly balance is currently in deficit. We must optimize your expenses before allocating wealth assets.";
            }
            break;
          case 'debt':
            replyText = "If you have credit card debts, I suggest using the Avalanche method: pay off the highest interest card first while paying minimums on the others. This saves the most interest.";
            break;
          case 'goals':
            if (firstGoal) {
              const monthsLeft = Math.round((firstGoal.targetAmount - firstGoal.currentAmount) / (netSavings > 0 ? netSavings : 5000));
              replyText = `Goal: ${firstGoal.name} (Target: ₹${firstGoal.targetAmount.toLocaleString()}).\n\nAt your current saving rate, you will hit this goal in about ${Math.max(1, monthsLeft)} months.`;
            } else {
              replyText = "You have no active goals saved. Let's create one! For example, set up an Emergency Fund of ₹1,00,000.";
            }
            break;
          case 'analyst':
            if (financialContext.expenses.length > 0) {
              const topEx = financialContext.expenses.sort((a,b) => b.amount - a.amount)[0];
              replyText = `I audited your recent ledger.\n\n• Total Transactions: ${financialContext.expenses.length}\n• Top Expense: ₹${topEx.amount.toLocaleString()} for '${topEx.description || topEx.category}' on ${topEx.date}.\n\nCategory focus: Food represents the highest intensity node.`;
            } else {
              replyText = "Add transactions so I can analyze categories and vendor trends.";
            }
            break;
          default:
            replyText = `Here is your current financial vector:\n\n• Monthly Earnings: ₹${totalInc.toLocaleString()}\n• Monthly Spend: ₹${totalExp.toLocaleString()}\n• Net Surplus: ₹${netSavings.toLocaleString()}\n\nLet me know if you would like me to predict future costs or audit anomalies.`;
        }
      }
    } catch (err) {
      replyText = `I could not query my ML microservices. Here is my local analytical feedback:\n\n• Monthly income: ₹${totalInc.toLocaleString()}\n• Monthly expenses: ₹${totalExp.toLocaleString()}\n• Budget limit: ₹${currentBudget.toLocaleString()}\n\nLet's add more transactions or adjust limits!`;
    }

    setMessages(prev => [...prev, { id: Date.now() + 1, sender: 'bot', text: replyText }]);
    setTyping(false);
  };

  const handleSend = (e) => {
    e?.preventDefault();
    const text = chatInput.trim();
    if (!text) return;

    setMessages(prev => [...prev, { id: Date.now(), sender: 'user', text }]);
    setChatInput('');
    generateResponse(text);
  };

  const handleQuickAction = (text) => {
    setMessages(prev => [...prev, { id: Date.now(), sender: 'user', text }]);
    generateResponse(text);
  };

  return (
    <div className="copilot-workspace-wrapper">
      <div className="workspace-mesh"></div>
      <div className="workspace-mesh-two"></div>

      <div className="copilot-workspace-grid">
        {/* Left Side: Copilot Modes Selector */}
        <div className="copilot-modes-sidebar glass-panel">
          <div className="sidebar-header">
            <Sparkles size={18} className="text-indigo-400" />
            <h4>AI Copilot Engines</h4>
          </div>
          
          <div className="modes-list mt-4">
            {COPILOT_MODES.map((mode) => {
              const Icon = mode.icon;
              return (
                <div 
                  key={mode.id}
                  className={`mode-btn ${activeMode.id === mode.id ? 'active' : ''}`}
                  onClick={() => setActiveMode(mode)}
                  style={{ '--mode-color': mode.color }}
                >
                  <div className="mode-btn-icon">
                    <Icon size={18} />
                  </div>
                  <div className="mode-btn-meta">
                    <h5>{mode.label}</h5>
                    <p>{mode.description}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="sidebar-footer-stats mt-6 pt-4 border-t border-gray-800">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">Connection Status</span>
              <span className={`font-semibold ${wsConnected ? 'text-emerald-400' : 'text-amber-400'}`}>
                {wsConnected ? 'WebSocket Live' : 'REST Fallback'}
              </span>
            </div>
          </div>
        </div>

        {/* Right Side: Copilot Large Chat Viewport */}
        <div className="copilot-chat-container glass-panel">
          <div className="chat-header">
            <div className="chat-header-identity">
              <div className="avatar-box" style={{ background: activeMode.color }}>
                <activeMode.icon size={20} className="text-white" />
              </div>
              <div>
                <h3>{activeMode.label}</h3>
                <p className="text-xs text-gray-500">CentricAI Agent Engine v2.0</p>
              </div>
            </div>
            
            <div className="engine-status">
              <div className="pulse-dot"></div>
              <span className="text-xs font-semibold text-indigo-400">ML ACTIVE</span>
            </div>
          </div>

          {/* Messages area */}
          <div className="chat-viewport">
            {messages.map((m) => (
              <div key={m.id} className={`chat-message-row ${m.sender}`}>
                <div className={`message-avatar ${m.sender}`}>
                  {m.sender === 'bot' ? <Bot size={16} /> : <User size={16} />}
                </div>
                <div className="message-content">
                  <div className="message-bubble">
                    {m.text.split('\n').map((line, i) => (
                      <React.Fragment key={i}>
                        {line}
                        {i < m.text.split('\n').length - 1 && <br />}
                      </React.Fragment>
                    ))}
                  </div>

                  {/* Show mode-specific suggested prompts on first message */}
                  {m.id === 'greet' && (
                    <div className="chat-suggested-prompts">
                      {activeMode.prompts.map((p, idx) => (
                        <button 
                          key={idx} 
                          className="prompt-suggestion-chip"
                          onClick={() => handleQuickAction(p)}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {typing && (
              <div className="chat-message-row bot typing">
                <div className="message-avatar bot">
                  <Bot size={16} />
                </div>
                <div className="message-content">
                  <div className="message-bubble typing-dots">
                    <span className="dot"></span>
                    <span className="dot"></span>
                    <span className="dot"></span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={chatEndRef} />
          </div>

          {/* Input Area */}
          <form className="chat-input-bar" onSubmit={handleSend}>
            <input 
              type="text" 
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder={`Query ${activeMode.label} (e.g. "${activeMode.prompts[0]}")...`}
            />
            <button type="submit" className="chat-submit-btn" disabled={typing}>
              <Send size={18} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
