import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, 
  Sparkles, 
  ArrowRight, 
  Activity, 
  ShieldCheck, 
  Zap, 
  Cpu
} from 'lucide-react';
import './Landing.css';

export default function Landing({ isAuthenticated }) {
  const navigate = useNavigate();

  return (
    <div className="landing-wrapper">
      {/* Background blobs for Liquid Glass UI */}
      <div className="liquid-bg">
        <div className="liquid-blob liquid-blob-1"></div>
        <div className="liquid-blob liquid-blob-2"></div>
        <div className="liquid-blob liquid-blob-3"></div>
      </div>

      <header className="landing-header glass-card">
        <div className="brand-logo bg-gradient-to-tr from-violet-500 to-cyan-400">
          <Building2 size={22} className="text-white" />
        </div>
        <div className="brand-text">
          <h2 className="text-gradient">CentricBiz</h2>
          <span className="brand-tag">AI Cash Control</span>
        </div>
        <div className="auth-btn-group">
          {isAuthenticated ? (
            <button onClick={() => navigate('/dashboard')} className="btn-glass btn-glass-primary">
              <span>Go to Command Center</span>
              <ArrowRight size={16} />
            </button>
          ) : (
            <>
              <button onClick={() => navigate('/login')} className="btn-glass">Sign In</button>
              <button onClick={() => navigate('/register')} className="btn-glass btn-glass-primary">Get Started</button>
            </>
          )}
        </div>
      </header>

      <main className="landing-content">
        <section className="hero-section">
          <div className="hero-badge glass-card inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold text-indigo-300">
            <Sparkles size={14} className="text-cyan-400" />
            <span>Next-Gen B2B Runway Intelligence</span>
          </div>

          <h1 className="hero-title mt-6 text-6xl font-black tracking-tight leading-none text-white">
            AI-Powered Cash Flow <br />
            <span className="text-gradient">Command Center</span>
          </h1>

          <p className="hero-subtitle mt-6 text-lg text-gray-400 max-w-2xl mx-auto">
            Take complete control of corporate burn rates, track client invoices in real-time, scan vendor bills with advanced OCR models, and run regression-based runway scenarios.
          </p>

          <div className="hero-actions mt-8 flex justify-center gap-4">
            <button onClick={() => navigate('/register')} className="btn-glass btn-glass-primary px-8 py-4 text-base">
              <span>Initialize Command Center</span>
              <ArrowRight size={18} />
            </button>
            <button onClick={() => navigate('/login')} className="btn-glass px-8 py-4 text-base">
              Explore Demo Workspace
            </button>
          </div>
        </section>

        {/* Feature Grid */}
        <section className="features-grid mt-24 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="feature-card glass-card p-8">
            <div className="feature-icon bg-violet-600/20 text-violet-400 border border-violet-500/20">
              <Activity size={20} />
            </div>
            <h3 className="text-white mt-6 font-bold text-lg">Predictive Runway Modeling</h3>
            <p className="text-gray-400 text-sm mt-3">
              We leverage RandomForest models to map your next 90-day vendor burn, giving you precise, automated runway projections.
            </p>
          </div>

          <div className="feature-card glass-card p-8">
            <div className="feature-icon bg-cyan-600/20 text-cyan-400 border border-cyan-500/20">
              <Cpu size={20} />
            </div>
            <h3 className="text-white mt-6 font-bold text-lg">AI SaaS & Invoice Auditor</h3>
            <p className="text-gray-400 text-sm mt-3">
              Identify duplicate software billing, optimize hosting costs, and audit payouts via integrated IsolationForest anomaly detection.
            </p>
          </div>

          <div className="feature-card glass-card p-8">
            <div className="feature-icon bg-rose-600/20 text-rose-400 border border-rose-500/20">
              <Zap size={20} />
            </div>
            <h3 className="text-white mt-6 font-bold text-lg">Smart Bill OCR Scanner</h3>
            <p className="text-gray-400 text-sm mt-3">
              Upload vendor bills or client invoices. Our OCR engine parses items, total amounts, and dates, matching compliance groups.
            </p>
          </div>
        </section>
      </main>

      <footer className="landing-footer mt-24 py-8 border-t border-white/5 text-center text-xs text-gray-500">
        &copy; {new Date().getFullYear()} CentricBiz AI. Built for modern SMEs and high-growth teams. All rights reserved.
      </footer>
    </div>
  );
}
