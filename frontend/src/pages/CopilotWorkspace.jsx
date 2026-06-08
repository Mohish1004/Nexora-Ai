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
import { expenseApi, incomeApi, budgetApi, goalApi, aiApi, chatApi, aiWs } from '../api/client';
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
    label: 'Goal Coach',
    icon: Target,
    color: '#a78bfa',
    description: 'Savings goal milestone estimations and target trajectories.',
    greeting: "Goal Coach active. I monitor your saving targets and estimate milestone achievement timelines.",
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
  
  // Database Chat Sessions Memory State
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [showDeleted, setShowDeleted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [renamingId, setRenamingId] = useState(null);
  const [renameTitle, setRenameTitle] = useState('');

  // Financial context for AI answering
  const [financialContext, setFinancialContext] = useState({
    expenses: [],
    incomes: [],
    budgets: [],
    goals: []
  });

  const chatEndRef = useRef(null);
  const activeMessageIdRef = useRef(null);
  const activeSessionIdRef = useRef(null);

  // Sync ref to currentSessionId to prevent stale closures inside WebSocket event handlers
  useEffect(() => {
    activeSessionIdRef.current = currentSessionId;
  }, [currentSessionId]);

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
    if (!currentSessionId) {
      setMessages([
        { id: 'greet', sender: 'bot', text: activeMode.greeting, mode: activeMode.id }
      ]);
    }
  }, [activeMode, currentSessionId]);

  const loadSessionsList = async () => {
    try {
      const res = showDeleted ? await chatApi.getDeletedSessions() : await chatApi.getActiveSessions();
      setSessions(res.data || []);
    } catch (e) {
      console.error("Failed to load chat sessions from database:", e);
    }
  };

  // Connect to WebSocket and load database-backed memory sessions
  useEffect(() => {
    loadSessionsList();

    const unsub = aiWs.on('connected', (c) => setWsConnected(c));
    aiWs.connect();

    // Listen for streaming chunks
    const unsubChunk = aiWs.on('chat_chunk', (payload) => {
      setTyping(false);
      setMessages(prev => {
        const exists = prev.some(m => m.id === activeMessageIdRef.current);
        if (exists) {
          return prev.map(m => m.id === activeMessageIdRef.current ? { ...m, text: payload.text } : m);
        } else {
          return [...prev, { id: activeMessageIdRef.current, sender: 'bot', text: payload.text }];
        }
      });
    });

    // Listen for streaming complete response
    const unsubComplete = aiWs.on('chat_complete', async (payload) => {
      const targetSessId = activeSessionIdRef.current;
      if (targetSessId) {
        try {
          await chatApi.appendMessage(targetSessId, 'bot', payload.text);
        } catch (e) {
          console.error("Failed to save bot response to database:", e);
        }
      }
    });

    return () => {
      unsub();
      unsubChunk();
      unsubComplete();
      aiWs.disconnect();
    };
  }, [showDeleted]);

  const handleNewSession = () => {
    setCurrentSessionId(null);
    setMessages([
      { id: 'greet', sender: 'bot', text: activeMode.greeting, mode: activeMode.id }
    ]);
  };

  const handleLoadSession = async (sess) => {
    setCurrentSessionId(sess.id);
    const targetMode = COPILOT_MODES.find(m => m.id === sess.mode) || activeMode;
    setActiveMode(targetMode);
    try {
      const mRes = await chatApi.getMessages(sess.id);
      if (mRes.data && mRes.data.length > 0) {
        setMessages(mRes.data.map(m => ({ id: m.id, sender: m.sender, text: m.text })));
      } else {
        setMessages([
          { id: 'greet', sender: 'bot', text: targetMode.greeting, mode: targetMode.id }
        ]);
      }
    } catch (e) {
      console.error("Failed to load session messages:", e);
    }
  };

  const ensureSession = async (userQuery) => {
    if (!currentSessionId) {
      const title = userQuery.substring(0, 30) || 'Financial Query';
      const res = await chatApi.createSession(title, activeMode.id);
      setCurrentSessionId(res.data.id);
      loadSessionsList();
      return res.data.id;
    }
    return currentSessionId;
  };

  const handleRename = async (sessionId, title) => {
    if (!title.trim()) return;
    try {
      await chatApi.renameSession(sessionId, title);
      setRenamingId(null);
      loadSessionsList();
    } catch (e) {
      console.error("Failed to rename session:", e);
    }
  };

  const handleDelete = async (sessionId) => {
    try {
      await chatApi.deleteSession(sessionId);
      if (currentSessionId === sessionId) {
        handleNewSession();
      }
      loadSessionsList();
    } catch (e) {
      console.error("Failed to delete session:", e);
    }
  };

  const handleRestore = async (sessionId) => {
    try {
      await chatApi.restoreSession(sessionId);
      loadSessionsList();
    } catch (e) {
      console.error("Failed to restore session:", e);
    }
  };

  // Auto scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  // AI response builder (incorporates actual backend state!)
  const generateResponse = async (query, sessId) => {
    setTyping(true);
    const q = query.toLowerCase();

    // Check if WebSocket is open and connected for real-time streaming
    if (wsConnected && aiWs.ws && aiWs.ws.readyState === WebSocket.OPEN) {
      const botMessageId = Date.now() + 1;
      activeMessageIdRef.current = botMessageId;
      aiWs.send({
        action: 'chat',
        query: query,
        mode: activeMode.id,
        context: financialContext
      });
      return;
    }
    
    // Derived values for local fallback
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
        replyText = `[Offline Fallback] Based on my RandomForest model:\n\n• Predicted Next Month Expenses: ₹${res.data.predictedNextMonthExpense?.toLocaleString()}\n• Forecasted Surplus: ₹${res.data.forecastedSavings?.toLocaleString()}\n• Model Trend: ${res.data.trendSummary || 'Stable spending trajectory detected.'}`;
      } else if (q.includes('anomal') || q.includes('risk') || q.includes('suspicious')) {
        const res = await aiApi.getAnomalies();
        replyText = `[Offline Fallback] I analyzed your transaction dataset. Portfolio risk score: ${res.data.riskScore}%.\n\n`;
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
        replyText = `[Offline Fallback] Here are my savings recommendations:\n\n• Potential Monthly Savings: ₹${res.data.potentialSavings?.toLocaleString()}\n\n`;
        if (res.data.savingsSuggestions && res.data.savingsSuggestions.length > 0) {
          res.data.savingsSuggestions.forEach((s, idx) => {
            replyText += `• ${s}\n`;
          });
        }
      } else {
        // Mock intelligent chat response depending on selected Mode
        await new Promise(r => setTimeout(r, 600)); // Simulate thinking
        
        switch (activeMode.id) {
          case 'budget':
            if (currentBudget > 0) {
              const usedPct = Math.round((totalExp / currentBudget) * 100);
              replyText = `[Offline Fallback] Your monthly budget is ₹${currentBudget.toLocaleString()}.\n\nYou have spent ₹${totalExp.toLocaleString()} (${usedPct}%). You have ₹${Math.max(0, currentBudget - totalExp).toLocaleString()} remaining.\n\n${usedPct > 85 ? '⚠ Suggest cutting Swiggy or entertainment immediately to avoid overrun.' : '✓ Spending velocity looks healthy.'}`;
            } else {
              replyText = "[Offline Fallback] You have not configured a budget limit yet. Tell me 'create a budget' or visit the Budget Planner page to configure one.";
            }
            break;
          case 'wealth':
            if (netSavings > 0) {
              const compound5yr = Math.round(netSavings * 12 * 5 * 1.10); // 10% returns
              replyText = `[Offline Fallback] Your monthly financial surplus is ₹${netSavings.toLocaleString()}.\n\nIf you invest this surplus at a conservative 10% annual return rate, you will accumulate approximately ₹${compound5yr.toLocaleString()} in 5 years.\n\nI suggest moving ₹${Math.round(netSavings * 0.4).toLocaleString()} to high-yield mutual funds.`;
            } else {
              replyText = "[Offline Fallback] Your net monthly balance is currently in deficit. We must optimize your expenses before allocating wealth assets.";
            }
            break;
          case 'debt':
            replyText = "[Offline Fallback] If you have credit card debts, I suggest using the Avalanche method: pay off the highest interest card first while paying minimums on the others. This saves the most interest.";
            break;
          case 'goals':
            if (firstGoal) {
              const monthsLeft = Math.round((firstGoal.targetAmount - firstGoal.currentAmount) / (netSavings > 0 ? netSavings : 5000));
              replyText = `[Offline Fallback] Goal: ${firstGoal.name} (Target: ₹${firstGoal.targetAmount.toLocaleString()}).\n\nAt your current saving rate, you will hit this goal in about ${Math.max(1, monthsLeft)} months.`;
            } else {
              replyText = "[Offline Fallback] You have no active goals saved. Let's create one! For example, set up an Emergency Fund of ₹1,0,000.";
            }
            break;
          case 'analyst':
            if (financialContext.expenses.length > 0) {
              const topEx = financialContext.expenses.sort((a,b) => b.amount - a.amount)[0];
              replyText = `[Offline Fallback] I audited your recent ledger.\n\n• Total Transactions: ${financialContext.expenses.length}\n• Top Expense: ₹${topEx.amount.toLocaleString()} for '${topEx.description || topEx.category}' on ${topEx.date}.\n\nCategory focus: Food represents the highest intensity node.`;
            } else {
              replyText = "[Offline Fallback] Add transactions so I can analyze categories and vendor trends.";
            }
            break;
          default:
            replyText = `[Offline Fallback] Here is your current financial vector:\n\n• Monthly Earnings: ₹${totalInc.toLocaleString()}\n• Monthly Spend: ₹${totalExp.toLocaleString()}\n• Net Surplus: ₹${netSavings.toLocaleString()}\n\nLet me know if you would like me to predict future costs or audit anomalies.`;
        }
      }
    } catch (err) {
      replyText = `[Offline Fallback] I could not query my ML microservices. Here is my local analytical feedback:\n\n• Monthly income: ₹${totalInc.toLocaleString()}\n• Monthly expenses: ₹${totalExp.toLocaleString()}\n• Budget limit: ₹${currentBudget.toLocaleString()}\n\nLet's add more transactions or adjust limits!`;
    }

    // Save fallback response to DB
    try {
      await chatApi.appendMessage(sessId, 'bot', replyText);
    } catch (e) {
      console.error("Failed to save fallback bot response to database:", e);
    }

    // Local Typewriter Simulation for Fallback
    const botMessageId = Date.now() + 1;
    setMessages(prev => [...prev, { id: botMessageId, sender: 'bot', text: '' }]);
    setTyping(false);

    const words = replyText.split(" ");
    let currentWordIdx = 0;
    const interval = setInterval(() => {
      if (currentWordIdx < words.length) {
        const text = words.slice(0, currentWordIdx + 1).join(" ");
        setMessages(prev => prev.map(m => m.id === botMessageId ? { ...m, text } : m));
        currentWordIdx++;
      } else {
        clearInterval(interval);
      }
    }, 30);
  };

  const handleSend = async (e) => {
    e?.preventDefault();
    const text = chatInput.trim();
    if (!text) return;

    let sessId;
    try {
      sessId = await ensureSession(text);
      await chatApi.appendMessage(sessId, 'user', text);
    } catch (err) {
      console.error("Failed to prepare session or save message:", err);
      return;
    }

    setMessages(prev => [...prev, { id: Date.now(), sender: 'user', text }]);
    setChatInput('');
    generateResponse(text, sessId);
  };

  const handleQuickAction = async (text) => {
    let sessId;
    try {
      sessId = await ensureSession(text);
      await chatApi.appendMessage(sessId, 'user', text);
    } catch (err) {
      console.error("Failed to prepare session or save message:", err);
      return;
    }

    setMessages(prev => [...prev, { id: Date.now(), sender: 'user', text }]);
    generateResponse(text, sessId);
  };

  const filteredSessions = sessions.filter(s => 
    s.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="copilot-workspace-wrapper">
      <div className="workspace-mesh"></div>
      <div className="workspace-mesh-two"></div>

      <div className="copilot-workspace-grid">
        {/* Left Side: Copilot Modes Selector & DB Chats memory */}
        <div className="copilot-modes-sidebar glass-panel flex flex-col justify-between">
          <div>
            <div className="sidebar-header flex justify-between items-center pb-3 border-b border-gray-800">
              <span className="flex items-center gap-1.5 text-xs font-bold text-gray-400 uppercase tracking-wider">
                <Sparkles size={16} className="text-indigo-400" />
                <span>AI Copilot Engines</span>
              </span>
              <button 
                onClick={handleNewSession}
                className="px-2.5 py-1 bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 rounded text-[10px] font-bold transition-all cursor-pointer"
                title="Start a fresh workspace conversation context"
              >
                + New Chat
              </button>
            </div>
            
            <div className="modes-list mt-4 space-y-2">
              {COPILOT_MODES.map((mode) => {
                const Icon = mode.icon;
                return (
                  <div 
                    key={mode.id}
                    className={`mode-btn ${activeMode.id === mode.id && !currentSessionId ? 'active' : ''}`}
                    onClick={() => {
                      setActiveMode(mode);
                      handleNewSession();
                    }}
                    style={{ '--mode-color': mode.color }}
                  >
                    <div className="mode-btn-icon">
                      <Icon size={16} />
                    </div>
                    <div className="mode-btn-meta">
                      <h5>{mode.label}</h5>
                      <p>{mode.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Relational DB Chat Sessions List */}
            <div className="saved-chats-section mt-6 pt-4 border-t border-gray-800">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block font-mono">Saved Chats</span>
                <button 
                  onClick={() => setShowDeleted(!showDeleted)}
                  className="text-[9px] text-indigo-400 hover:text-indigo-300 font-bold transition-all cursor-pointer"
                >
                  {showDeleted ? "Show Active" : "Show Deleted"}
                </button>
              </div>

              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search conversations..."
                className="w-full mb-3 p-1.5 bg-base border border-gray-800 rounded text-xs text-white focus:outline-none focus:border-indigo-500"
              />

              <div className="space-y-1.5 max-h-[160px] overflow-y-auto">
                {filteredSessions.length > 0 ? (
                  filteredSessions.map(sess => (
                    <div 
                      key={sess.id}
                      className={`w-full flex items-center justify-between p-2 rounded text-[11px] hover:bg-base border ${currentSessionId === sess.id ? 'border-primary/30 text-white font-bold bg-base' : 'border-transparent text-gray-400'}`}
                    >
                      {renamingId === sess.id ? (
                        <input
                          type="text"
                          value={renameTitle}
                          onChange={(e) => setRenameTitle(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleRename(sess.id, renameTitle);
                            if (e.key === 'Escape') setRenamingId(null);
                          }}
                          onBlur={() => handleRename(sess.id, renameTitle)}
                          autoFocus
                          className="bg-black border border-indigo-500 text-white p-0.5 rounded text-[11px] w-3/4 focus:outline-none"
                        />
                      ) : (
                        <button 
                          onClick={() => handleLoadSession(sess)}
                          className="text-left truncate w-3/4 text-[11px] text-inherit cursor-pointer bg-transparent border-none p-0"
                        >
                          • {sess.title}
                        </button>
                      )}
                      
                      <div className="flex gap-1.5 opacity-60 hover:opacity-100 transition-all">
                        {showDeleted ? (
                          <button 
                            onClick={() => handleRestore(sess.id)}
                            className="text-emerald-400 hover:text-emerald-300 text-[10px] font-bold bg-transparent border-none p-0 cursor-pointer"
                            title="Restore Chat"
                          >
                            Restore
                          </button>
                        ) : (
                          <>
                            <button 
                              onClick={() => {
                                setRenamingId(sess.id);
                                setRenameTitle(sess.title);
                              }}
                              className="text-gray-400 hover:text-indigo-400 text-[10px] bg-transparent border-none p-0 cursor-pointer"
                              title="Rename Chat"
                            >
                              ✎
                            </button>
                            <button 
                              onClick={() => handleDelete(sess.id)}
                              className="text-rose-500 hover:text-rose-400 text-[10px] bg-transparent border-none p-0 cursor-pointer"
                              title="Delete Chat"
                            >
                              ✕
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-[10px] text-gray-500 text-center italic">No conversations.</p>
                )}
              </div>
            </div>
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
