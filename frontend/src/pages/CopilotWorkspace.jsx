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
import { invoiceApi, expenseApi, budgetApi, goalApi, aiApi, chatApi, aiWs } from '../api/client';
import './CopilotWorkspace.css';

// AI Persona Configurations for corporate operations
const COPILOT_MODES = [
  {
    id: 'advisor',
    label: 'Corporate Finance Director',
    icon: Shield,
    color: '#818cf8',
    description: 'Cash flows, cash runways, working capital allocations, and equity/debt balances.',
    greeting: "Greetings, CEO. I've compiled your company's balance sheets and income reports. How can I assist you with treasury strategy or operational runtimes today?",
    prompts: ['Analyze our cash runway duration', 'Audit monthly profit margins', 'Formulate surplus treasury plans']
  },
  {
    id: 'budget',
    label: 'Operating Budget Auditor',
    icon: PiggyBank,
    color: '#fbbf24',
    description: 'Department expense caps, vendor payouts compliance, and operational overrun prevention.',
    greeting: "Hello. I monitor operational expenditures. Let's audit your current department spending limits and identify overrun risks.",
    prompts: ['Show category spending spikes', 'Are we exceeding current month caps?', 'Identify excess travel expenditures']
  },
  {
    id: 'wealth',
    label: 'Treasury Optimizer',
    icon: TrendingUp,
    color: '#34d399',
    description: 'Short-term corporate paper yields, high-yield reserve cash holdings, and capital allocations.',
    greeting: "Short-term Treasury yield optimization active. Mapped 8% APR opportunities for rolling company surplus reserves.",
    prompts: ['Corporate paper interest models', 'Allocate surplus capital into reserves', 'Working capital yield advice']
  },
  {
    id: 'debt',
    label: 'Capital & Credit Manager',
    icon: Flame,
    color: '#f472b6',
    description: 'SBA loan balances, vendor credit lines, debt-service coverage audits.',
    greeting: "Capital Manager active. Audit of commercial loan schedules and vendor financing terms loaded.",
    prompts: ['Compare financing options', 'How to optimize SBA loan servicing', 'Debt-to-revenue ratio analysis']
  },
  {
    id: 'goals',
    label: 'Runway Strategist',
    icon: Target,
    color: '#a78bfa',
    description: 'Treasury target tracking, runway milestone buffers, operational reserves.',
    greeting: "Runway buffer diagnostics active. I track progress towards your 6-month operational survival reserve.",
    prompts: ['Days remaining to reach runway buffer', 'Establish a Tax Reserve target', 'Runway growth curve analytics']
  },
  {
    id: 'analyst',
    label: 'SaaS & Vendor Auditor',
    icon: BarChart2,
    color: '#38bdf8',
    description: 'SaaS license duplicate audits, host price optimizations, and vendor contract analysis.',
    greeting: "Vendor Auditor ready. Mapped developer license seats, cloud hosting bills, and software trials.",
    prompts: ['Find duplicate SaaS charges', 'Audit AWS hosting spikes', 'Review top vendor contracts']
  },
  {
    id: 'forecaster',
    label: 'Revenue & Runway Predictor',
    icon: LineChart,
    color: '#f43f5e',
    description: 'RandomForest cash flow predictions and monthly operational burn forecasts.',
    greeting: "Rolling cash flow regressor active. I model next month's vendor outlays and invoice collections.",
    prompts: ['Forecast next month burn rate', 'Simulate worst-case cash runways', 'Show revenue trajectory trendline']
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
          invoiceApi.getAll(),
          budgetApi.getAll(),
          goalApi.getAll()
        ]);
        setFinancialContext({
          expenses: expRes.data || [],
          incomes: incRes.data || [], // mapping invoices to incomes for python context compatibility
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
      const title = userQuery.substring(0, 30) || 'Corporate Cash Advice';
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
    const runway = totalExp > 0 ? (totalInc / totalExp) * 5.0 : 6.0;

    let replyText = "";

    try {
      if (q.includes('forecast') || q.includes('predict') || q.includes('burn') || q.includes('runway')) {
        const res = await aiApi.getPredictions();
        replyText = `[Offline Fallback] Mapped via RandomForest Cash Regressor:\n\n• Predicted next month burn rate: ₹${res.data.predictedNextMonthExpense?.toLocaleString()}\n• Forecasted Cash Surplus: ₹${res.data.forecastedSavings?.toLocaleString()}\n• Model Trend: ${res.data.trendSummary || 'Stable capital outlays forecasted.'}`;
      } else if (q.includes('anomal') || q.includes('outlier') || q.includes('risk') || q.includes('comply')) {
        const res = await aiApi.getAnomalies();
        replyText = `[Offline Fallback] AI Compliance Ledger audit completed. General cash risk index: ${res.data.riskScore}%.\n\n`;
        if (res.data.anomalies && res.data.anomalies.length > 0) {
          replyText += `Flagged outlier payouts:\n`;
          res.data.anomalies.forEach((a, i) => {
            replyText += `${i + 1}. ₹${a.amount} paid to ${a.category} — ${a.reason}\n`;
          });
        } else {
          replyText += `✓ All cash disbursements meet default corporate compliance rules.`;
        }
      } else if (q.includes('insight') || q.includes('save') || q.includes('saas') || q.includes('cut')) {
        const res = await aiApi.getInsights();
        replyText = `[Offline Fallback] Here are my savings recommendations:\n\n• Potential Monthly Savings: ₹${res.data.potentialSavings?.toLocaleString()}\n\n`;
        if (res.data.savingsSuggestions && res.data.savingsSuggestions.length > 0) {
          res.data.savingsSuggestions.forEach((s) => {
            replyText += `• ${s}\n`;
          });
        }
      } else {
        await new Promise(r => setTimeout(r, 600)); // Simulate thinking
        
        switch (activeMode.id) {
          case 'budget':
            replyText = `[Offline Fallback] Company monthly operating limit is set to ₹1,50,000. Current burn logged is ₹${totalExp.toLocaleString()}.\n\nCategory focus: Infrastructure and Payroll Contractors represent the largest outlays. Recommend enforcing strict caps.`;
            break;
          case 'wealth':
            replyText = `[Offline Fallback] Rolling surplus stands at ₹${netSavings.toLocaleString()}. Placing 40% of this cash buffer in short-term treasury deposits yields 8% APR annually, protecting your capital reserves against inflation.`;
            break;
          case 'debt':
            replyText = "[Offline Fallback] For lines of credit, verify debt service coverage ratios. Service high-interest merchant factoring debt first to prevent EBITDA compression.";
            break;
          case 'goals':
            replyText = `[Offline Fallback] Active target: '6-Month Runway Reserve'. Current progress represents ₹4,50,000. At rolling burn rates, you will achieve full reserve security within 4 months.`;
            break;
          case 'analyst':
            replyText = `[Offline Fallback] SaaS auditor report. Mapped AWS hosting outlays at 35% of burn. Slack Enterprise seat counts have remained static. Pausing developer sandbox instances could optimize ₹15,000/month instantly.`;
            break;
          default:
            replyText = `[Offline Fallback] Executive Balance Sheet Profile:\n\n• Rolling Inflows: ₹${totalInc.toLocaleString()}\n• Monthly Burn: ₹${totalExp.toLocaleString()}\n• Capital Runway Coefficient: ${runway.toFixed(1)} Months\n\nAsk me about cash forecasts, SaaS contract anomalies, or runway projections.`;
        }
      }
    } catch (err) {
      replyText = `[Offline Fallback] Executive Balance Sheet Profile:\n\n• Rolling Inflows: ₹${totalInc.toLocaleString()}\n• Monthly Burn: ₹${totalExp.toLocaleString()}\n• Runway Coefficient: ${runway.toFixed(1)} Months`;
    }

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
    }, 20);
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
    <div className="copilot-workspace-wrapper animate-fadeIn">
      <div className="copilot-workspace-grid">
        {/* Left Side: Modes Selector & Saved Sessions */}
        <div className="copilot-modes-sidebar glass-card flex flex-col justify-between p-6">
          <div>
            <div className="sidebar-header flex justify-between items-center pb-4 border-b border-white/5">
              <span className="flex items-center gap-1.5 text-xs font-bold text-gray-400 uppercase tracking-wider">
                <Sparkles size={16} className="text-cyan-400" />
                <span>BIZ AI PERSONAS</span>
              </span>
              <button 
                onClick={handleNewSession}
                className="btn-glass text-[10px] px-2.5 py-1"
                title="Start a fresh workspace conversation context"
              >
                + New Board
              </button>
            </div>
            
            <div className="modes-list mt-4 space-y-2 max-h-[300px] overflow-y-auto pr-1">
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

            {/* Saved Chat Sessions */}
            <div className="saved-chats-section mt-6 pt-4 border-t border-white/5">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block font-mono">ADVISORY RECORDS</span>
                <button 
                  onClick={() => setShowDeleted(!showDeleted)}
                  className="text-[9px] text-violet-400 hover:text-violet-300 font-bold transition-all cursor-pointer"
                >
                  {showDeleted ? "Active Sessions" : "Archive"}
                </button>
              </div>

              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search audits..."
                className="w-full mb-3 p-2 bg-black/40 border border-white/5 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500"
              />

              <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1">
                {filteredSessions.length > 0 ? (
                  filteredSessions.map(sess => (
                    <div 
                      key={sess.id}
                      className={`w-full flex items-center justify-between p-2 rounded-lg text-[11px] hover:bg-white/2 border ${currentSessionId === sess.id ? 'border-cyan-500/20 text-white font-bold bg-white/2' : 'border-transparent text-gray-400'}`}
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
                          className="bg-black border border-cyan-500 text-white p-0.5 rounded text-[11px] w-3/4 focus:outline-none"
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
                              className="text-gray-400 hover:text-cyan-400 text-[10px] bg-transparent border-none p-0 cursor-pointer"
                            >
                              ✎
                            </button>
                            <button 
                              onClick={() => handleDelete(sess.id)}
                              className="text-rose-500 hover:text-rose-400 text-[10px] bg-transparent border-none p-0 cursor-pointer"
                            >
                              ✕
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-[10px] text-gray-500 text-center italic">No audit records.</p>
                )}
              </div>
            </div>
          </div>
          
          <div className="sidebar-footer-stats mt-4 pt-4 border-t border-white/5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">ENGINE LINK</span>
              <span className={`font-semibold ${wsConnected ? 'text-emerald-400' : 'text-amber-400'}`}>
                {wsConnected ? 'WebSocket Live' : 'REST Fallback'}
              </span>
            </div>
          </div>
        </div>

        {/* Right Side: Chat Viewport */}
        <div className="copilot-chat-container glass-card flex flex-col justify-between">
          <div className="chat-header p-4 border-b border-white/5 flex justify-between items-center">
            <div className="chat-header-identity flex items-center gap-3">
              <div className="avatar-box w-9 h-9 rounded-lg flex items-center justify-center text-white" style={{ background: activeMode.color }}>
                <activeMode.icon size={18} />
              </div>
              <div>
                <h3 className="text-white text-sm font-bold">{activeMode.label}</h3>
                <p className="text-[10px] text-gray-500">CentricBiz Audit Protocol v3.0</p>
              </div>
            </div>
            
            <div className="engine-status flex items-center gap-1.5">
              <div className="pulse-dot w-2 h-2 rounded-full bg-cyan-400 animate-ping"></div>
              <span className="text-[10px] font-bold text-cyan-400 tracking-wider">AI ACTIVE</span>
            </div>
          </div>

          {/* Messages area */}
          <div className="chat-viewport flex-1 p-6 overflow-y-auto space-y-4">
            {messages.map((m) => (
              <div key={m.id} className={`chat-message-row flex gap-3 ${m.sender}`}>
                <div className={`message-avatar w-7 h-7 rounded-full flex items-center justify-center text-white text-xs ${
                  m.sender === 'bot' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-400/20' : 'bg-violet-600/30 text-violet-300 border border-violet-500/20'
                }`}>
                  {m.sender === 'bot' ? <Bot size={14} /> : <User size={14} />}
                </div>
                <div className="message-content max-w-[80%]">
                  <div className="message-bubble p-4 rounded-2xl bg-white/5 border border-white/5 text-xs text-white leading-relaxed whitespace-pre-wrap">
                    {m.text}
                  </div>

                  {/* suggested prompts */}
                  {m.id === 'greet' && (
                    <div className="chat-suggested-prompts mt-3 flex flex-wrap gap-2">
                      {activeMode.prompts.map((p, idx) => (
                        <button 
                          key={idx} 
                          className="prompt-suggestion-chip btn-glass text-[10px] py-1.5 px-3 rounded-full"
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
              <div className="chat-message-row bot typing flex gap-3">
                <div className="message-avatar bot w-7 h-7 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-400/20 flex items-center justify-center text-xs">
                  <Bot size={14} />
                </div>
                <div className="message-content">
                  <div className="message-bubble p-4 rounded-2xl bg-white/5 border border-white/5 text-xs text-white">
                    <div className="flex gap-1 animate-pulse">
                      <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full"></span>
                      <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full"></span>
                      <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full"></span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={chatEndRef} />
          </div>

          {/* Input Area */}
          <form className="chat-input-bar p-4 border-t border-white/5 flex gap-3" onSubmit={handleSend}>
            <input 
              type="text" 
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder={`Ask ${activeMode.label} (e.g. "${activeMode.prompts[0]}")...`}
              className="input-glass flex-1 py-3 text-xs"
              disabled={typing}
            />
            <button type="submit" className="btn-glass btn-glass-primary px-5" disabled={typing}>
              <Send size={14} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
