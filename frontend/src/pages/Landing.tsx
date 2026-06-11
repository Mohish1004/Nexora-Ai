import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/appStore';
import Orb3D from '../components/ai/Orb3D';
import { 
  ArrowRight, 
  Cpu, 
  Activity, 
  ShieldCheck, 
  Zap, 
  Sparkles, 
  Terminal,
  Layers,
  ArrowUpRight,
  TrendingUp
} from 'lucide-react';

export default function Landing() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAppStore();
  const [typingText, setTypingText] = useState('');
  const [demoState, setDemoState] = useState<'typing' | 'generating' | 'done'>('typing');

  const fullPrompt = 'Show outstanding vendor payables & SaaS health...';

  // Live Typing Simulator effect
  useEffect(() => {
    let index = 0;
    let timeout: any;

    const runDemo = () => {
      if (demoState === 'typing') {
        if (index < fullPrompt.length) {
          setTypingText(fullPrompt.substring(0, index + 1));
          index++;
          timeout = setTimeout(runDemo, 60);
        } else {
          setDemoState('generating');
          timeout = setTimeout(() => {
            setDemoState('done');
          }, 1500);
        }
      } else if (demoState === 'done') {
        timeout = setTimeout(() => {
          setTypingText('');
          index = 0;
          setDemoState('typing');
        }, 5000); // Loop demo every 5s
      }
    };

    runDemo();
    return () => clearTimeout(timeout);
  }, [demoState]);

  return (
    <div className="min-h-screen bg-background text-foreground relative flex flex-col items-center">
      {/* Mesh Background */}
      <div className="liquid-bg">
        <div className="liquid-blob liquid-blob-cyan"></div>
        <div className="liquid-blob liquid-blob-emerald"></div>
        <div className="liquid-blob liquid-blob-purple"></div>
      </div>

      {/* Floating Header */}
      <header className="w-full max-w-7xl mx-auto px-6 h-20 flex items-center justify-between z-30 fixed top-0 left-0 right-0 glass-panel border-b border-white/10 rounded-b-2xl">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-cyan-400 to-violet-600 flex items-center justify-center shadow-lg">
            <Cpu size={20} className="text-white" />
          </div>
          <span className="font-black text-xl tracking-tight text-white font-display">Nexora AI</span>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-sm text-gray-400 font-medium">
          <a href="#features" className="landing-nav-link">Features</a>
          <a href="#solutions" className="landing-nav-link">Solutions</a>
          <a href="#pricing" className="landing-nav-link">Pricing</a>
          <button onClick={() => navigate('/contact')} className="landing-nav-link">Contact</button>
          <button onClick={() => navigate('/about')} className="landing-nav-link">About</button>
          <button onClick={() => navigate('/help')} className="landing-nav-link">Help</button>
        </nav>

        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <button 
              onClick={() => navigate('/dashboard')} 
              className="btn-glass px-5 py-2.5 rounded-lg bg-primary/10 border-primary/20 text-primary hover:bg-primary/20 flex items-center gap-1.5 text-sm font-semibold"
            >
              <span>Command Center</span>
              <ArrowRight size={14} />
            </button>
          ) : (
            <>
              <button onClick={() => navigate('/login')} className="text-sm text-gray-300 hover:text-white font-medium">Sign In</button>
              <button 
                onClick={() => navigate('/register')} 
                className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-sm transition-all shadow-lg flex items-center gap-1"
              >
                <span>Get Started</span>
                <ArrowRight size={14} />
              </button>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <main className="w-full max-w-7xl px-6 pt-36 flex-1 flex flex-col items-center z-10">
        <section className="w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[70vh]">
          {/* Left Hero Pitch */}
          <div className="flex flex-col items-start text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-cyan-300 shadow-inner">
              <Sparkles size={12} className="text-cyan-400" />
              <span>AI-First Intelligence Platform</span>
            </div>

            <h1 className="text-5xl lg:text-7xl font-black font-display tracking-tight leading-none text-white mt-6">
              AI-First <br />
              <span className="text-gradient-rainbow">Workspace Control</span>
            </h1>

            <p className="text-gray-400 text-base lg:text-lg mt-6 leading-relaxed max-w-xl">
              An enterprise-grade cash command deck. Seamlessly manage inventory limits, track customer receivables, scan vendor receipts via neural OCR models, and audit personal metrics inside a unified glass-themed shell.
            </p>

            <div className="flex flex-wrap gap-4 mt-8">
              <button 
                onClick={() => navigate('/register')}
                className="landing-hover-btn px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-base shadow-lg flex items-center gap-2"
              >
                <span>Initialize Platform</span>
                <ArrowRight size={18} />
              </button>
              <button 
                onClick={() => navigate('/login')}
                className="landing-hover-btn px-8 py-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold text-base flex items-center gap-2"
              >
                Launch Demo Desk
              </button>
            </div>
          </div>

          {/* Right Hero Interactive 3D Canvas */}
          <div className="flex flex-col items-center justify-center relative">
            <Orb3D />

            {/* Live Typing Simulator glass widget */}
            <div className="w-full max-w-md glass-card border border-white/10 rounded-2xl p-4 mt-6 shadow-2xl relative z-10">
              <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3">
                <div className="flex items-center gap-1.5">
                  <Terminal size={14} className="text-cyan-400" />
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Interactive AI Terminal</span>
                </div>
                <div className="flex gap-1">
                  <span className="w-2 h-2 rounded-full bg-red-500"></span>
                  <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                  <span className="w-2 h-2 rounded-full bg-green-500"></span>
                </div>
              </div>

              {/* Typing Line */}
              <div className="flex items-center gap-2 text-xs font-mono text-white mb-2">
                <span className="text-cyan-400 font-bold">&gt;</span>
                <span>{typingText}</span>
                <span className="w-1.5 h-4 bg-cyan-400 animate-pulse"></span>
              </div>

              {/* Response output */}
              <div className="min-h-[60px] flex items-center justify-center">
                {demoState === 'generating' && (
                  <div className="flex items-center gap-2 text-xs text-violet-400 font-bold uppercase animate-pulse">
                    <Sparkles size={14} />
                    <span>Analyzing Ledgers...</span>
                  </div>
                )}
                {demoState === 'done' && (
                  <div className="w-full p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex flex-col gap-1.5 animate-float-medium">
                    <div className="flex items-center justify-between font-semibold">
                      <span>Vendor Payables Risk</span>
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-[9px] uppercase font-bold">Optimized</span>
                    </div>
                    <p className="text-[10px] text-gray-300">
                      Found ₹18,000 in redundant Cloud seats. Low-stock laptops flagged. Receivables runway extends by +1.5 months.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Feature Highlights Grid */}
        <section id="features" className="w-full py-24 border-t border-white/5 mt-16">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl lg:text-5xl font-black font-display text-white">Full-Stack Command Capabilities</h2>
            <p className="text-gray-400 text-sm mt-4">Everything an executive needs to audit business operations and personal assets side-by-side.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            {/* Feature 1 */}
            <div className="landing-hover-card glass-card p-8 rounded-2xl flex flex-col items-start text-left">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Activity size={20} />
              </div>
              <h3 className="font-bold text-lg text-white">Business Cash & Inventory</h3>
              <p className="text-gray-400 text-sm mt-3 leading-relaxed">
                Log items, set stock bounds with smart low-stock alarms, track payables/receivables, and send instant payment reminders.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="landing-hover-card glass-card p-8 rounded-2xl flex flex-col items-start text-left">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Layers size={20} />
              </div>
              <h3 className="font-bold text-lg text-white">Dual-Workspace Sandboxing</h3>
              <p className="text-gray-400 text-sm mt-3 leading-relaxed">
                Switch between commercial ledgers and personal wealth accounts. Separate credentials, views, charts, and colors.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="landing-hover-card glass-card p-8 rounded-2xl flex flex-col items-start text-left">
              <div className="w-12 h-12 rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <ShieldCheck size={20} />
              </div>
              <h3 className="font-bold text-lg text-white">AI-Driven Auditing</h3>
              <p className="text-gray-400 text-sm mt-3 leading-relaxed">
                Scan billing receipts via automated OCR extraction, generate ARIMA stock forecasts, and converse with our AI Advisor.
              </p>
            </div>
          </div>
        </section>

        {/* Problems & Solutions Section */}
        <section id="solutions" className="w-full py-20 border-t border-white/5">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl lg:text-4xl font-black font-display text-white">The SME Problem</h2>
              <p className="text-gray-400 text-sm mt-4">Modern directors juggle too many separate dashboards.</p>
              <div className="mt-8 space-y-4">
                <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/10 text-red-400 text-xs flex gap-3">
                  <span className="font-bold">✕</span>
                  <span>Scattered metrics: invoices in email, inventory in Excel sheets, personal bills on mobile.</span>
                </div>
                <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/10 text-red-400 text-xs flex gap-3">
                  <span className="font-bold">✕</span>
                  <span>No forward-looking analytics: blind spots on low stock thresholds and SaaS fee creep.</span>
                </div>
              </div>
            </div>
            <div>
              <h2 className="text-3xl lg:text-4xl font-black font-display text-emerald-400">The Nexora Solution</h2>
              <p className="text-gray-400 text-sm mt-4">One command bridge for business logs and personal goals.</p>
              <div className="mt-8 space-y-4">
                <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10 text-emerald-400 text-xs flex gap-3">
                  <span className="font-bold">✓</span>
                  <span>Unified workspace switching with fluid animations.</span>
                </div>
                <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10 text-emerald-400 text-xs flex gap-3">
                  <span className="font-bold">✓</span>
                  <span>Neural OCR processing, smart ARIMA forecasts, and a floating interactive chat companion.</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="w-full py-24 border-t border-white/5">
          <div className="text-center max-w-xl mx-auto mb-16">
            <h2 className="text-3xl lg:text-5xl font-black font-display text-white">Scale With Nexora</h2>
            <p className="text-gray-400 text-sm mt-4">Transparent plans for starting freelancers and scaling operations.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Plan 1 */}
            <div className="landing-hover-card glass-card p-8 rounded-2xl border border-white/10 flex flex-col items-start relative overflow-hidden">
              <h3 className="text-lg font-bold text-white">Starter Pilot</h3>
              <p className="text-xs text-gray-400 mt-2">Perfect for single workspace managers.</p>
              <div className="text-4xl font-black text-white mt-6 font-display">₹0 <span className="text-xs text-gray-500 font-normal">/ forever</span></div>
              <ul className="text-xs text-gray-300 space-y-3 mt-8 flex-1">
                <li className="flex items-center gap-2">✓ Access to either Business or Personal view</li>
                <li className="flex items-center gap-2">✓ Basic analytics & item listing</li>
                <li className="flex items-center gap-2">✓ Standard manual forms</li>
              </ul>
              <button 
                onClick={() => navigate('/register')}
                className="w-full py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold text-xs mt-8 transition-all"
              >
                Sign Up Free
              </button>
            </div>

            {/* Plan 2 */}
            <div className="landing-hover-card glass-card p-8 rounded-2xl border-2 border-cyan-500/30 flex flex-col items-start relative overflow-hidden bg-white/[0.04]">
              <div className="absolute top-4 right-4 px-2 py-0.5 rounded bg-cyan-500/20 text-[9px] uppercase font-bold text-cyan-400 tracking-wider">Most Premium</div>
              <h3 className="text-lg font-bold text-white">Enterprise Nexus</h3>
              <p className="text-xs text-gray-400 mt-2">Dual workspace access and advanced AI modules.</p>
              <div className="text-4xl font-black text-cyan-400 mt-6 font-display">₹1,999 <span className="text-xs text-gray-500 font-normal">/ month</span></div>
              <ul className="text-xs text-gray-300 space-y-3 mt-8 flex-1">
                <li className="flex items-center gap-2">✓ Both workspaces linked with instant switching</li>
                <li className="flex items-center gap-2">✓ AI-powered receipt scanning & auto categorization</li>
                <li className="flex items-center gap-2">✓ Interactive 3D modules & ARIMA product forecast</li>
                <li className="flex items-center gap-2">✓ Nexora Advisory Copilot panel</li>
              </ul>
              <button 
                onClick={() => navigate('/register')}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs mt-8 transition-all shadow-lg"
              >
                Unlock Premium Desk
              </button>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="w-full py-24 border-t border-white/5">
          <div className="text-center max-w-xl mx-auto mb-12">
            <h2 className="text-3xl lg:text-5xl font-black font-display text-white">Get In Touch</h2>
            <p className="text-gray-400 text-sm mt-4">Questions, partnerships, or feedback — reach out to our team.</p>
          </div>
          <div className="max-w-2xl mx-auto glass-card p-8 rounded-2xl border border-white/10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="flex flex-col items-start text-left">
                <h3 className="text-sm font-bold text-white">Email</h3>
                <p className="text-xs text-gray-400 mt-1">hello@nexora.ai</p>
                <h3 className="text-sm font-bold text-white mt-6">Response Time</h3>
                <p className="text-xs text-gray-400 mt-1">Usually within 24 hours</p>
              </div>
              <div className="flex flex-col items-start text-left">
                <h3 className="text-sm font-bold text-white">Location</h3>
                <p className="text-xs text-gray-400 mt-1">Remote-first, global team</p>
                <h3 className="text-sm font-bold text-white mt-6">Support</h3>
                <p className="text-xs text-gray-400 mt-1">support@nexora.ai</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="w-full border-t border-white/5 py-12 mt-20 text-center text-xs text-gray-500 z-10 relative">
        <div className="flex items-center justify-center gap-6 mb-4">
          <button onClick={() => navigate('/about')} className="hover:text-white transition-colors">About</button>
          <button onClick={() => navigate('/help')} className="hover:text-white transition-colors">Help</button>
          <button onClick={() => navigate('/contact')} className="hover:text-white transition-colors text-sm">Contact</button>
        </div>
        <p>&copy; {new Date().getFullYear()} Nexora AI. All rights reserved.</p>
      </footer>
    </div>
  );
}
