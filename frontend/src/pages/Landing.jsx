import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Sparkles, 
  ArrowRight, 
  Brain, 
  TrendingUp, 
  Target, 
  FileText, 
  Activity, 
  Upload, 
  ShieldAlert, 
  Zap,
  Send,
  User,
  CheckCircle,
  Play
} from 'lucide-react';
import { authApi } from '../api/client';
import './Landing.css';

export default function Landing({ isAuthenticated }) {
  const navigate = useNavigate();
  const chatEndRef = useRef(null);

  const logTelemetryEvent = (eventName, data) => {
    try {
      const logs = JSON.parse(localStorage.getItem('centricai_telemetry_logs') || '[]');
      logs.push({
        timestamp: new Date().toISOString(),
        event: eventName,
        details: data
      });
      localStorage.setItem('centricai_telemetry_logs', JSON.stringify(logs.slice(-100)));
    } catch (e) {
      console.warn('Telemetry logging failed:', e);
    }
  };
  
  // States
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrResult, setOcrResult] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [healthScore, setHealthScore] = useState(72);
  const [demoLoading, setDemoLoading] = useState(false);
  
  // Interactive Live Chat Demo
  const [chatInput, setChatInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [demoMessages, setDemoMessages] = useState([
    { id: 1, sender: 'bot', text: "Hello! I'm your CentricAI Copilot. You can try testing my financial analysis capabilities right here. Ask me anything about budgeting, anomalies, or forecasts." }
  ]);

  // Simulated metrics counter animation
  const [metrics, setMetrics] = useState({ transactions: 1420, accuracy: 94.2, speed: 0.8 });
  useEffect(() => {
    const timer = setInterval(() => {
      setMetrics(prev => ({
        transactions: prev.transactions + Math.floor(Math.random() * 3),
        accuracy: Math.min(99.9, prev.accuracy + (Math.random() * 0.05)),
        speed: Math.max(0.4, prev.speed - 0.01)
      }));
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const handleDemoLogin = async () => {
    setDemoLoading(true);
    logTelemetryEvent('landing_demo_login_clicked', {});
    try {
      const response = await authApi.login({ email: 'demo@finance.ai', password: 'password' });
      const data = response.data;
      localStorage.setItem('jwt_token', data.token);
      localStorage.setItem('user_info', JSON.stringify({
        id: data.id,
        name: data.name,
        email: data.email
      }));
      window.location.href = '/copilot';
    } catch (err) {
      navigate('/login');
    } finally {
      setDemoLoading(false);
    }
  };

  const handleOcrFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setSelectedImage(URL.createObjectURL(file));
    setOcrLoading(true);
    logTelemetryEvent('landing_ocr_upload', { fileName: file.name });
    
    setTimeout(() => {
      setOcrResult({
        vendor: "Whole Foods Market #1029",
        amount: "₹1,842.50",
        date: "2026-06-05",
        category: "Food",
        confidence: "99.4%"
      });
      setOcrLoading(false);
    }, 1800);
  };

  // Simulated Live AI Chat Brain
  const runLiveDemoResponse = (query) => {
    setTyping(true);
    
    const replyDb = {
      overspend: "Your restaurant spending has increased by 28% over the last 14 days, primarily driven by weekend dinners. I suggest setting a dining budget limit of ₹8,000 to save ₹2,400 this month.",
      forecast: "Our RandomForest model projects next month's overhead at ₹24,850. Based on your current income streams, your savings trajectory will hit 24.5% if discretionary shopping is reduced by 10%.",
      anomalies: "I scanned your recent records. I detected 1 anomaly: a duplicate charge of ₹4,200 from 'AWS cloud-hosting' on June 3rd. It has been flagged for audit.",
      budget: "To save ₹15,000 for your Vacation Goal by August, you need to adjust your discretionary spending buffer to 12% of net income and maintain a minimum balance surplus of ₹22,000.",
      default: "That is a great question. In a full account, I will link directly to your real-time bank ledger, parse receipts automatically, and compute custom RandomForest forecasts. Sign up below to unlock personalized analysis!"
    };

    setTimeout(() => {
      let text = replyDb.default;
      const q = query.toLowerCase();
      if (q.includes('overspend') || q.includes('spending') || q.includes('leakage')) {
        text = replyDb.overspend;
      } else if (q.includes('forecast') || q.includes('predict') || q.includes('future')) {
        text = replyDb.forecast;
      } else if (q.includes('anomal') || q.includes('suspicious') || q.includes('risk')) {
        text = replyDb.anomalies;
      } else if (q.includes('budget') || q.includes('save') || q.includes('limit')) {
        text = replyDb.budget;
      }

      setDemoMessages(prev => [...prev, { id: Date.now() + 1, sender: 'bot', text }]);
      setTyping(false);
    }, 1500);
  };

  const handleDemoSend = (e) => {
    e?.preventDefault();
    const text = chatInput.trim();
    if (!text) return;

    logTelemetryEvent('landing_chat_message_sent', { query: text });
    setDemoMessages(prev => [...prev, { id: Date.now(), sender: 'user', text }]);
    setChatInput('');
    runLiveDemoResponse(text);
  };

  const handleDemoQuickAction = (text) => {
    logTelemetryEvent('landing_chat_quick_action', { action: text });
    setDemoMessages(prev => [...prev, { id: Date.now(), sender: 'user', text }]);
    runLiveDemoResponse(text);
  };

  return (
    <div className="landing-wrapper">
      {/* Background Mesh Overlays */}
      <div className="radial-mesh"></div>
      <div className="radial-mesh-two"></div>
      <div className="glow-overlay" style={{ top: '10%', left: '10%' }}></div>
      <div className="glow-overlay-rose" style={{ top: '40%', right: '15%' }}></div>

      {/* Glass Navbar */}
      <header className="landing-header glass-navbar">
        <div className="logo-container">
          <Sparkles className="logo-icon animate-pulse" size={24} />
          <h2>Centric<span>AI</span></h2>
        </div>
        <nav className="navbar-links">
          <a href="#features">Capabilities</a>
          <a href="#demo">AI Sandbox</a>
          <a href="#testimonials">Reviews</a>
        </nav>
        <div className="header-actions">
          {isAuthenticated ? (
            <Link to="/copilot" className="btn-signup btn-glow">Enter Workspace</Link>
          ) : (
            <>
              <Link to="/login" className="link-signin text-sm font-semibold">Sign In</Link>
              <Link to="/register" className="btn-signup btn-glow">Create Account</Link>
              <button 
                onClick={handleDemoLogin} 
                disabled={demoLoading}
                className="btn-demo text-xs font-bold"
              >
                {demoLoading ? 'Launching...' : 'Try Demo'}
              </button>
            </>
          )}
        </div>
      </header>

      {/* Main Hero & Split Playroom */}
      <section className="hero-section">
        <div className="hero-container max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Hero Left: Copy & Actions */}
          <div className="lg:col-span-6 text-left">
            <div className="badge-announcement">
              <span className="badge-tag">NEW v2.0</span>
              <span className="badge-text">Autopilot Financial Intelligence</span>
            </div>

            <h1 className="hero-headline mt-6">
              Understand Your Money.<br />
              <span>Predict Your Future.</span>
            </h1>
            
            <p className="hero-subheadline mt-6">
              CentricAI is your self-hosted AI Financial Copilot. Automatically audit your ledger anomalies, estimate future cost curves, and track smart goals through intuitive conversation.
            </p>

            <div className="hero-ctas mt-8 flex flex-wrap gap-4">
              {isAuthenticated ? (
                <Link to="/copilot" className="btn btn-primary px-8 py-3.5 rounded-full flex items-center gap-2 btn-glow">
                  <span>Enter Workspace</span>
                  <ArrowRight size={16} />
                </Link>
              ) : (
                <>
                  <Link to="/register" className="btn btn-primary px-8 py-3.5 rounded-full flex items-center gap-2 btn-glow">
                    <span>Activate Copilot</span>
                    <ArrowRight size={16} />
                  </Link>
                  <button onClick={handleDemoLogin} className="btn btn-secondary px-8 py-3.5 rounded-full border border-color">
                    <span>Explore Demo Sandbox</span>
                  </button>
                </>
              )}
            </div>

            {/* Metrics */}
            <div className="hero-metrics-container mt-12 grid grid-cols-3 gap-4 border-t border-color/40 pt-8">
              <div>
                <span className="metric-label block text-[10px] text-muted uppercase font-bold tracking-wider">Analyzed Receipts</span>
                <h4 className="metric-val text-xl font-extrabold mt-1">{metrics.transactions.toLocaleString()}+</h4>
              </div>
              <div>
                <span className="metric-label block text-[10px] text-muted uppercase font-bold tracking-wider">ML Accuracy</span>
                <h4 className="metric-val text-xl font-extrabold mt-1">{metrics.accuracy.toFixed(1)}%</h4>
              </div>
              <div>
                <span className="metric-label block text-[10px] text-muted uppercase font-bold tracking-wider">Engine Latency</span>
                <h4 className="metric-val text-xl font-extrabold mt-1">{metrics.speed.toFixed(2)}s</h4>
              </div>
            </div>
          </div>

          {/* Hero Right: Live Interactive Sandbox Demo */}
          <div className="lg:col-span-6" id="demo">
            <div className="landing-chat-sandbox glass-panel-glow p-6 text-left">
              
              <div className="sandbox-header flex items-center justify-between pb-4 border-b border-color/55 mb-4">
                <div className="flex items-center gap-2">
                  <div className="avatar-bot">
                    <Sparkles size={14} className="text-white" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold">Interactive Sandbox Copilot</h4>
                    <span className="text-[10px] text-success flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse inline-block"></span>
                      Interactive Demo Mode
                    </span>
                  </div>
                </div>
                <span className="badge badge-education">ML v2.0</span>
              </div>

              {/* Chat View */}
              <div className="sandbox-messages space-y-4">
                {demoMessages.map((m) => (
                  <div key={m.id} className={`sandbox-msg-row ${m.sender}`}>
                    <div className="sandbox-msg-icon">
                      {m.sender === 'bot' ? <Sparkles size={12} /> : <User size={12} />}
                    </div>
                    <div className="sandbox-msg-body">
                      {m.text}
                    </div>
                  </div>
                ))}
                {typing && (
                  <div className="sandbox-msg-row bot">
                    <div className="sandbox-msg-icon">
                      <Sparkles size={12} />
                    </div>
                    <div className="sandbox-msg-body typing-indicator">
                      <span></span><span></span><span></span>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Prompt Suggestions */}
              {demoMessages.length === 1 && (
                <div className="sandbox-suggestions mt-4">
                  <p className="text-[10px] text-muted mb-2 uppercase font-bold">Click to test capabilities:</p>
                  <div className="flex flex-wrap gap-2">
                    <button className="quick-chip" onClick={() => handleDemoQuickAction("Why am I overspending?")}>
                      💡 Overspending Details
                    </button>
                    <button className="quick-chip" onClick={() => handleDemoQuickAction("Predict next month expenses")}>
                      📈 Forecast Outflows
                    </button>
                    <button className="quick-chip" onClick={() => handleDemoQuickAction("Any duplicates or anomalies?")}>
                      🔍 Flag Anomalies
                    </button>
                  </div>
                </div>
              )}

              {/* Input */}
              <form className="sandbox-input-form mt-4 flex gap-2" onSubmit={handleDemoSend}>
                <input 
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask the copilot: 'Why am I overspending?'"
                  className="sandbox-input flex-grow bg-surface border border-color rounded-xl px-4 py-2 text-xs text-main focus:outline-none focus:border-primary"
                />
                <button type="submit" className="sandbox-send-btn flex items-center justify-center">
                  <Send size={14} />
                </button>
              </form>

            </div>
          </div>

        </div>
      </section>

      {/* Section 2: Features Grid */}
      <section className="features-section py-20 px-4" id="features">
        <div className="max-w-6xl mx-auto">
          <div className="section-title text-center mb-16">
            <h2 className="text-3xl font-extrabold text-main">Designed for Financial Clarity</h2>
            <p className="text-muted mt-2">Autopilot categorizations, anomaly detection, and predictive analytics.</p>
          </div>

          <div className="grid-showcases">
            
            {/* 1. Expense Intelligence */}
            <div className="showcase-card glass-panel p-6 flex flex-col justify-between">
              <div>
                <div className="icon-wrap color-one">
                  <Brain size={20} />
                </div>
                <h3 className="mt-4 text-base font-bold">Expense Intelligence</h3>
                <p className="text-xs text-muted mt-2">
                  No more manual tagging. CentricAI automatically routes your transactions into unified category buckets using semantic mapping.
                </p>
              </div>
              
              <div className="mockup-ui mt-6 p-4 rounded-xl bg-base/60 text-left border border-color/40">
                <div className="flex justify-between items-center text-[10px] border-b border-color/40 pb-2 mb-2">
                  <span className="font-bold">Automated category assignment</span>
                  <span className="badge badge-success text-[8px]">Active</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-[11px]">
                    <span>amazon.in/order-retail</span>
                    <span className="badge badge-shopping">Shopping</span>
                  </div>
                  <div className="flex justify-between items-center text-[11px]">
                    <span>uber.trip/commute</span>
                    <span className="badge badge-transport">Transport</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Predictive Forecasting */}
            <div className="showcase-card glass-panel p-6 flex flex-col justify-between">
              <div>
                <div className="icon-wrap color-two">
                  <TrendingUp size={20} />
                </div>
                <h3 className="mt-4 text-base font-bold">Autopilot Forecasting</h3>
                <p className="text-xs text-muted mt-2">
                  Our embedded RandomForest Regressor projects future outflow curves based on multi-month historical trends.
                </p>
              </div>

              <div className="mockup-ui mt-6 p-4 rounded-xl bg-base/60 text-left text-xs border border-color/40">
                <span className="text-[10px] text-muted block uppercase font-bold">90-Day Overhead Curve</span>
                <div className="flex justify-between items-end mt-4 h-14 relative">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 100 40">
                    <path d="M 0 35 Q 25 30 50 18 T 100 5" fill="none" stroke="hsl(var(--primary))" strokeWidth="2.5" />
                    <circle cx="50" cy="18" r="3.5" fill="hsl(var(--primary))" />
                    <circle cx="100" cy="5" r="3.5" fill="hsl(var(--accent))" className="animate-pulse" />
                  </svg>
                </div>
              </div>
            </div>

            {/* 3. Leakage Guard */}
            <div className="showcase-card glass-panel p-6 flex flex-col justify-between">
              <div>
                <div className="icon-wrap color-three">
                  <Target size={20} />
                </div>
                <h3 className="mt-4 text-base font-bold">Autopilot Leakage Guard</h3>
                <p className="text-xs text-muted mt-2">
                  Automatically set dynamic targets. The copilot warns you via alerts when a category consumes over 80% of its allocation.
                </p>
              </div>

              <div className="mockup-ui mt-6 p-4 rounded-xl bg-base/60 text-left text-xs border border-color/40">
                <div className="flex justify-between font-semibold text-[11px]">
                  <span>Budget Limit Used</span>
                  <span className="text-danger">86%</span>
                </div>
                <div className="w-full bg-base h-1.5 rounded-full overflow-hidden mt-2">
                  <div className="bg-danger h-full w-[86%]"></div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Section 3: Interactive OCR Receipt Scanner Preview */}
      <section className="ocr-interactive-showcase-section py-16 px-4">
        <div className="max-w-5xl mx-auto glass-panel p-8 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="icon-wrap color-four">
              <FileText size={20} />
            </div>
            <h3 className="mt-4 text-2xl font-bold">Smart OCR Receipt Parsing</h3>
            <p className="text-sm text-muted mt-3 leading-relaxed">
              Upload files or images of your bills. The OCR subsystem parses lines, extracts merchant details, purchase timestamps, total amounts, and suggests categories instantly.
            </p>
            <ul className="mt-6 space-y-2 text-xs text-muted">
              <li className="flex items-center gap-2"><CheckCircle size={14} className="text-success" /> Auto-extract amount parameters</li>
              <li className="flex items-center gap-2"><CheckCircle size={14} className="text-success" /> Suggest categorization instantly</li>
              <li className="flex items-center gap-2"><CheckCircle size={14} className="text-success" /> Save to ledger in one single click</li>
            </ul>
          </div>

          <div className="ocr-upload-box text-center p-8 border-2 border-dashed border-color rounded-2xl bg-base/30 hover:border-primary/45 transition-colors">
            <input 
              type="file" 
              id="landingOcrFile" 
              accept="image/*" 
              onChange={handleOcrFileChange} 
              className="hidden" 
            />
            <label htmlFor="landingOcrFile" className="cursor-pointer block">
              {selectedImage ? (
                <div className="flex flex-col items-center">
                  <img src={selectedImage} alt="Receipt preview" className="h-32 object-contain rounded-xl" />
                  <span className="text-[11px] text-primary font-bold mt-3">Replace Receipt Image</span>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="p-4 bg-primary/10 rounded-full text-primary">
                    <Upload size={24} />
                  </div>
                  <span className="font-semibold text-xs mt-4 block">Click to upload a receipt image</span>
                  <span className="text-[10px] text-muted mt-1">Supports JPG, PNG or WebP files</span>
                </div>
              )}
            </label>

            {ocrLoading && (
              <div className="mt-4 text-[11px] text-primary animate-pulse flex items-center justify-center gap-2">
                <Zap size={14} className="spin" /> Reading receipts via OCR...
              </div>
            )}

            {ocrResult && !ocrLoading && (
              <div className="ocr-result-pill mt-4 text-left p-4 bg-base/70 rounded-xl border border-success/30 fade-in text-xs space-y-1.5">
                <div className="flex justify-between font-bold text-success text-[10px] uppercase">
                  <span>OCR Parse Success</span>
                  <span>{ocrResult.confidence} Accuracy</span>
                </div>
                <div><strong>Merchant:</strong> {ocrResult.vendor}</div>
                <div><strong>Amount:</strong> {ocrResult.amount}</div>
                <div><strong>Date:</strong> {ocrResult.date}</div>
                <div><strong>Category:</strong> <span className={`badge badge-${ocrResult.category.toLowerCase()}`}>{ocrResult.category}</span></div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Section 4: Dynamic Portfolio Health Score */}
      <section className="health-score-section py-16 px-4">
        <div className="max-w-5xl mx-auto glass-panel p-8 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="text-center flex flex-col items-center justify-center">
            <div className="radial-score-meter relative w-40 h-40 flex items-center justify-center rounded-full border border-color">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" stroke="var(--border-color)" strokeWidth="4" fill="transparent" />
                <circle cx="50" cy="50" r="42" stroke="hsl(var(--primary))" strokeWidth="6" fill="transparent" 
                        strokeDasharray={264} strokeDashoffset={264 - (264 * healthScore) / 100} 
                        className="transition-all duration-1000" />
              </svg>
              <div className="absolute text-center">
                <span className="text-4xl font-extrabold">{healthScore}</span>
                <span className="block text-[10px] text-muted uppercase font-bold tracking-wider mt-1">Health Index</span>
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button onClick={() => setHealthScore(42)} className="btn btn-secondary text-[10px] py-1 px-3 border border-color">Low Score</button>
              <button onClick={() => setHealthScore(72)} className="btn btn-secondary text-[10px] py-1 px-3 border border-color">Medium Score</button>
              <button onClick={() => setHealthScore(95)} className="btn btn-secondary text-[10px] py-1 px-3 border border-color">High Score</button>
            </div>
          </div>

          <div>
            <div className="icon-wrap color-five">
              <Activity size={20} />
            </div>
            <h3 className="mt-4 text-2xl font-bold">Dynamic Financial Health Engine</h3>
            <p className="text-sm text-muted mt-3 leading-relaxed">
              We score your portfolio allocation from 0 to 100 based on cash buffer cushions, net surplus, category concentration risk, and anomaly patterns. Try toggling the score buttons on the left.
            </p>
            <div className="onboarding-tip mt-4 p-4 rounded-xl bg-primary/5 border border-primary/10 text-xs">
              {healthScore < 50 ? (
                <span>⚠️ <b>High Outflow Alert:</b> Discretionary spending consumes over 90% of income. Suggest category limit caps immediately.</span>
              ) : healthScore < 80 ? (
                <span>💡 <b>Healthy Status:</b> Savings cushion is stable. Maintain budget targets to optimize emergency buffer.</span>
              ) : (
                <span>✓ <b>Excellent Portfolio Balance:</b> Low category dependencies with a solid 35% cash buffer cushion. Optimal parameters.</span>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer py-16 border-t border-color/40 text-center text-xs text-muted-dark mt-20">
        <div className="logo-container justify-center mb-6">
          <Sparkles className="logo-icon text-muted" size={18} />
          <h3 className="text-sm font-bold">CentricAI</h3>
        </div>
        <p>© 2026 CentricAI FinTech Systems Inc. All rights reserved.</p>
        <p className="mt-2 text-[10px]">Autopilot intelligence powered by RandomForest cashflow predictors & IsolationForest anomaly models.</p>
      </footer>
    </div>
  );
}
