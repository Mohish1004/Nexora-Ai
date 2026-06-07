import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Sparkles, 
  ArrowRight, 
  Brain, 
  TrendingUp, 
  Target, 
  FileText, 
  Activity, 
  CheckCircle, 
  Upload, 
  ShieldAlert, 
  DollarSign, 
  Layers,
  ChevronRight,
  Zap
} from 'lucide-react';
import { authApi } from '../api/client';
import './Landing.css';

export default function Landing() {
  const navigate = useNavigate();
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrResult, setOcrResult] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [healthScore, setHealthScore] = useState(72);
  const [demoLoading, setDemoLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('insights');

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
    try {
      const response = await authApi.login({ email: 'demo@finance.ai', password: 'password' });
      const data = response.data;
      localStorage.setItem('jwt_token', data.token);
      localStorage.setItem('user_info', JSON.stringify({
        id: data.id,
        name: data.name,
        email: data.email
      }));
      // Force page reload or trigger auth state in parent
      window.location.href = '/dashboard';
    } catch (err) {
      navigate('/login');
    } finally {
      setDemoLoading(false);
    }
  };

  // Simulated Frontend OCR Scanner
  const handleOcrFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setSelectedImage(URL.createObjectURL(file));
    setOcrLoading(true);
    
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

  return (
    <div className="landing-wrapper">
      {/* Dynamic Background Mesh */}
      <div className="radial-mesh"></div>
      <div className="radial-mesh-two"></div>

      {/* Header Bar */}
      <header className="landing-header glass-navbar">
        <div className="logo-container">
          <Sparkles className="logo-icon animate-pulse" size={24} />
          <h2>Centric<span>AI</span></h2>
        </div>
        <div className="header-actions">
          <Link to="/login" className="link-signin text-sm font-semibold">Sign In</Link>
          <Link to="/register" className="btn-signup btn-glow">Create Account</Link>
          <button 
            onClick={handleDemoLogin} 
            disabled={demoLoading}
            className="btn-demo text-xs font-bold"
          >
            {demoLoading ? 'Launching...' : 'Try Demo'}
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section text-center">
        <div className="badge-announcement">
          <span className="badge-tag">NEW v2.0</span>
          <span className="badge-text">Proprietary RandomForest Cashflow Predictors</span>
        </div>

        <h1 className="hero-headline mt-4">
          AI-Powered<br />
          <span>Financial Intelligence</span>
        </h1>
        
        <p className="hero-subheadline max-w-2xl mx-auto mt-4">
          Transform transactions into actionable insights using predictive AI. Audit portfolios, predict future overhead curves, and parse physical invoices automatically.
        </p>

        <div className="hero-ctas mt-8 flex justify-center gap-4">
          <Link to="/register" className="btn btn-primary px-8 py-3 rounded-full flex items-center gap-2">
            <span>Get Started</span>
            <ArrowRight size={16} />
          </Link>
          <button onClick={handleDemoLogin} className="btn btn-secondary px-8 py-3 rounded-full border border-color">
            <span>Explore Demo Sandbox</span>
          </button>
        </div>

        {/* Floating Animated KPI Metrics */}
        <div className="hero-metrics-container max-w-4xl mx-auto mt-12 grid grid-cols-3 gap-6">
          <div className="metric-box glass-panel">
            <span className="metric-label">Analyzed Statements</span>
            <h4 className="metric-val">{metrics.transactions.toLocaleString()}+</h4>
          </div>
          <div className="metric-box glass-panel">
            <span className="metric-label">Classification Accuracy</span>
            <h4 className="metric-val">{metrics.accuracy.toFixed(1)}%</h4>
          </div>
          <div className="metric-box glass-panel">
            <span className="metric-label">Engine Latency</span>
            <h4 className="metric-val">{metrics.speed.toFixed(2)}s</h4>
          </div>
        </div>
      </section>

      {/* Flagship Showcases Section */}
      <section className="showcase-section max-w-6xl mx-auto py-16 px-4">
        <div className="section-title text-center mb-12">
          <h2>Immediate AI Capabilities</h2>
          <p className="text-muted">Analyze. Predict. Allocate. Automate.</p>
        </div>

        <div className="grid-showcases">
          {/* 1. Expense Intelligence */}
          <div className="showcase-card glass-panel flex flex-col justify-between">
            <div>
              <div className="icon-wrap color-one">
                <Brain size={24} />
              </div>
              <h3 className="mt-4 text-lg font-bold">Expense Intelligence</h3>
              <p className="text-sm text-muted mt-2">
                Categorize expenses using neural keyword maps. View spending profiles sorted by K-Means clustering.
              </p>
            </div>
            
            <div className="mockup-ui mt-6 p-4 rounded bg-base/60 text-left">
              <div className="flex justify-between items-center text-xs border-b border-color pb-2 mb-2">
                <span className="font-bold">Automated Category Mapper</span>
                <span className="badge badge-success text-[10px]">Active</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span>amazon.in/order-info</span>
                  <span className="badge badge-shopping">Shopping</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span>uber.trip/ride-share</span>
                  <span className="badge badge-transport">Transport</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span>coursera.cert/ai-ml</span>
                  <span className="badge badge-education">Education</span>
                </div>
              </div>
            </div>
          </div>

          {/* 2. AI Forecasting */}
          <div className="showcase-card glass-panel flex flex-col justify-between">
            <div>
              <div className="icon-wrap color-two">
                <TrendingUp size={24} />
              </div>
              <h3 className="mt-4 text-lg font-bold">AI Forecasting</h3>
              <p className="text-sm text-muted mt-2">
                Simulate next-month cost curves via RandomForestRegressor estimators. Compute predictive savings allocations.
              </p>
            </div>

            <div className="mockup-ui mt-6 p-4 rounded bg-base/60 text-left text-xs">
              <span className="text-[10px] text-muted block uppercase">90-Day Trend Projector</span>
              <div className="flex justify-between items-end mt-4 h-16 relative">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 100 40">
                  <path d="M 0 35 Q 25 30 50 18 T 100 5" fill="none" stroke="#6366f1" strokeWidth="2.5" />
                  <circle cx="50" cy="18" r="3" fill="#6366f1" />
                  <circle cx="100" cy="5" r="3" fill="#f59e0b" className="animate-pulse" />
                </svg>
              </div>
              <div className="flex justify-between mt-2 text-[10px] text-muted font-bold">
                <span>Month 1</span>
                <span>Month 2</span>
                <span className="text-accent">Month 3 (Forecast)</span>
              </div>
            </div>
          </div>

          {/* 3. Smart Budget Planning */}
          <div className="showcase-card glass-panel flex flex-col justify-between">
            <div>
              <div className="icon-wrap color-three">
                <Target size={24} />
              </div>
              <h3 className="mt-4 text-lg font-bold">Smart Budget Planning</h3>
              <p className="text-sm text-muted mt-2">
                Prevent financial leakage. Receive warnings when current allocations breach 80% of defined cycle limits.
              </p>
            </div>

            <div className="mockup-ui mt-6 p-4 rounded bg-base/60 text-left text-xs">
              <div className="flex justify-between font-semibold">
                <span>Budget Consumed</span>
                <span className="text-warning">86%</span>
              </div>
              <div className="w-full bg-base h-2 rounded-full overflow-hidden mt-2">
                <div className="bg-warning h-full w-[86%]"></div>
              </div>
              <p className="text-[10px] text-warning mt-2 flex items-center gap-1">
                <ShieldAlert size={10} /> Active warning: 14% remaining threshold
              </p>
            </div>
          </div>
        </div>

        {/* 4. Interactive OCR Receipt Scanner Preview */}
        <div className="ocr-interactive-showcase glass-panel mt-8 p-8 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <div className="icon-wrap color-four">
              <FileText size={24} />
            </div>
            <h3 className="mt-4 text-xl font-bold">Smart OCR Invoice Scanner</h3>
            <p className="text-sm text-muted mt-2 leading-relaxed">
              Upload physical shopping receipt bills or invoice copies. The OCR subsystem parses lines, extracts numerical totals, evaluates purchase date strings, and suggests categories automatically.
            </p>
            <div className="mt-4 flex flex-col gap-2 text-xs text-muted-dark">
              <span>✓ Auto-extract amount parameters</span>
              <span>✓ Auto-categorize items</span>
              <span>✓ Save ledger entry in one click</span>
            </div>
          </div>

          <div className="ocr-upload-box text-center p-6 border border-dashed border-color rounded-lg bg-base/30">
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
                  <img src={selectedImage} alt="Receipt preview" className="h-28 object-contain rounded" />
                  <span className="text-[10px] text-primary font-bold mt-2">Replace Invoice Image</span>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="p-3 bg-primary/10 rounded-full text-primary">
                    <Upload size={22} />
                  </div>
                  <span className="font-semibold text-xs mt-3 block">Upload receipt image to test OCR</span>
                  <span className="text-[10px] text-muted">Supports JPG, PNG or WebP files</span>
                </div>
              )}
            </label>

            {ocrLoading && (
              <div className="mt-4 text-[10px] text-primary animate-pulse flex items-center justify-center gap-1.5">
                <Zap size={12} className="spin" /> Parsing receipt contents...
              </div>
            )}

            {ocrResult && !ocrLoading && (
              <div className="ocr-result-pill mt-4 text-left p-3 bg-base/70 rounded border border-success/30 fade-in text-xs space-y-1">
                <div className="flex justify-between font-bold text-success text-[10px] uppercase">
                  <span>OCR Extraction Completed</span>
                  <span>{ocrResult.confidence} Conf.</span>
                </div>
                <div><strong>Merchant:</strong> {ocrResult.vendor}</div>
                <div><strong>Value:</strong> {ocrResult.amount}</div>
                <div><strong>Date:</strong> {ocrResult.date}</div>
                <div><strong>Suggested Category:</strong> <span className={`badge badge-${ocrResult.category.toLowerCase()}`}>{ocrResult.category}</span></div>
              </div>
            )}
          </div>
        </div>

        {/* 5. Financial Health Scoring Showcase */}
        <div className="health-score-showcase glass-panel mt-8 p-8 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="text-center flex flex-col items-center justify-center">
            <div className="radial-score-meter relative w-36 h-36 flex items-center justify-center rounded-full border border-color">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" stroke="var(--border-color)" strokeWidth="4" fill="transparent" />
                <circle cx="50" cy="50" r="42" stroke="var(--accent)" strokeWidth="6" fill="transparent" 
                        strokeDasharray={264} strokeDashoffset={264 - (264 * healthScore) / 100} 
                        className="transition-all duration-1000" />
              </svg>
              <div className="absolute text-center">
                <span className="text-3xl font-extrabold">{healthScore}</span>
                <span className="block text-[10px] text-muted uppercase">Health Index</span>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={() => setHealthScore(42)} className="btn btn-secondary text-[10px] py-1 px-2 border border-color">Low Score</button>
              <button onClick={() => setHealthScore(72)} className="btn btn-secondary text-[10px] py-1 px-2 border border-color">Medium Score</button>
              <button onClick={() => setHealthScore(95)} className="btn btn-secondary text-[10px] py-1 px-2 border border-color">High Score</button>
            </div>
          </div>

          <div>
            <div className="icon-wrap color-five">
              <Activity size={24} />
            </div>
            <h3 className="mt-4 text-xl font-bold">Dynamic Portfolio Health Score</h3>
            <p className="text-sm text-muted mt-2 leading-relaxed">
              CentricAI scores your cashflow allocations from 0 to 100 based on net balance margins, category concentration diversity, and transaction risk ratios. Try clicking the buttons on the left to see recommendations update dynamically.
            </p>
            <div className="onboarding-tip mt-4 p-4 rounded bg-accent/5 border border-accent/15 text-xs text-accent-light">
              {healthScore < 50 ? (
                <span>⚠️ <b>High Portfolio Risk:</b> Outflows exceed 90% of monthly income. We suggest establishing category limit caps on Shopping and Dining variables.</span>
              ) : healthScore < 80 ? (
                <span>💡 <b>Medium Portfolio Balance:</b> Savings rate stands at 22%. Consider setting automated allocations for freelancing earnings.</span>
              ) : (
                <span>✓ <b>Healthy Investment Status:</b> Low category dependency combined with a strong 35% cash buffer. Optimal parameters maintained.</span>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Landing Footer */}
      <footer className="landing-footer py-12 border-t border-color text-center text-xs text-muted-dark mt-16">
        <div className="logo-container justify-center mb-4">
          <Sparkles className="logo-icon text-muted" size={16} />
          <h3 className="text-sm font-bold">CentricAI</h3>
        </div>
        <p>© 2026 CentricAI Finance Intelligence Platforms Inc. All rights reserved.</p>
        <p className="mt-2 text-[10px]">Powered by RandomForest & IsolationForest ML models.</p>
      </footer>
    </div>
  );
}
