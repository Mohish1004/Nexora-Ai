import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppStore } from '../store/appStore';
import { Cpu, Mail, Key, User, Briefcase, PiggyBank, Layers, ArrowRight } from 'lucide-react';

export default function Register() {
  const navigate = useNavigate();
  const login = useAppStore(state => state.login);
  
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [workspaceMode, setWorkspaceMode] = useState<'business' | 'personal' | 'both'>('both');

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) return;
    setStep(2);
  };

  const handleComplete = () => {
    login(name || 'Executive Director', email || 'ceo@nexora.ai', workspaceMode);
    navigate('/select-workspace');
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6 relative">
      {/* Background ambient blobs */}
      <div className="liquid-bg">
        <div className="liquid-blob liquid-blob-cyan"></div>
        <div className="liquid-blob liquid-blob-emerald"></div>
        <div className="liquid-blob liquid-blob-purple"></div>
      </div>

      <div className="w-full max-w-lg glass-card rounded-2xl p-8 border border-white/10 shadow-2xl relative z-10">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-cyan-400 to-violet-600 flex items-center justify-center mb-4">
            <Cpu size={24} className="text-white" />
          </div>
          <h2 className="font-black text-2xl font-display text-white">Initialize Account</h2>
          <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mt-1">
            {step === 1 ? 'Step 1: Security Setup' : 'Step 2: Workspace Mapping'}
          </p>
        </div>

        {step === 1 ? (
          <form onSubmit={handleNextStep} className="mt-6 space-y-4">
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Full Name</label>
              <div className="relative">
                <User size={14} className="absolute left-3.5 top-3.5 text-gray-500" />
                <input 
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Sarah Connor"
                  className="w-full pl-10 pr-4 py-3 text-xs glass-input"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Email Address</label>
              <div className="relative">
                <Mail size={14} className="absolute left-3.5 top-3.5 text-gray-500" />
                <input 
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="sarah@nexora.ai"
                  className="w-full pl-10 pr-4 py-3 text-xs glass-input"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Security Password</label>
              <div className="relative">
                <Key size={14} className="absolute left-3.5 top-3.5 text-gray-500" />
                <input 
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 text-xs glass-input"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs mt-6 transition-all shadow-lg flex items-center justify-center gap-1.5 uppercase tracking-wider"
            >
              <span>Next Configuration</span>
              <ArrowRight size={14} />
            </button>
          </form>
        ) : (
          <div className="mt-6 space-y-6">
            <h3 className="text-sm font-semibold text-center text-gray-300">Choose your operational terminal</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Option Business */}
              <button
                onClick={() => setWorkspaceMode('business')}
                className={`p-4 rounded-xl border flex flex-col items-center justify-center text-center transition-all ${
                  workspaceMode === 'business'
                    ? 'border-primary bg-primary/10 text-white'
                    : 'border-white/10 bg-white/5 hover:border-white/20 text-gray-400'
                }`}
              >
                <Briefcase size={20} className={workspaceMode === 'business' ? 'text-primary' : 'text-gray-400'} />
                <span className="text-xs font-bold mt-2">Business</span>
                <span className="text-[9px] text-gray-500 mt-1">Inventory & Invoices</span>
              </button>

              {/* Option Personal */}
              <button
                onClick={() => setWorkspaceMode('personal')}
                className={`p-4 rounded-xl border flex flex-col items-center justify-center text-center transition-all ${
                  workspaceMode === 'personal'
                    ? 'border-primary-emerald bg-primary-emerald/10 text-white'
                    : 'border-white/10 bg-white/5 hover:border-white/20 text-gray-400'
                }`}
              >
                <PiggyBank size={20} className={workspaceMode === 'personal' ? 'text-primary-emerald' : 'text-gray-400'} />
                <span className="text-xs font-bold mt-2">Personal</span>
                <span className="text-[9px] text-gray-500 mt-1">Expenses & Goals</span>
              </button>

              {/* Option Both */}
              <button
                onClick={() => setWorkspaceMode('both')}
                className={`p-4 rounded-xl border flex flex-col items-center justify-center text-center transition-all ${
                  workspaceMode === 'both'
                    ? 'border-violet-500 bg-violet-500/10 text-white'
                    : 'border-white/10 bg-white/5 hover:border-white/20 text-gray-400'
                }`}
              >
                <Layers size={20} className={workspaceMode === 'both' ? 'text-violet-400' : 'text-gray-400'} />
                <span className="text-xs font-bold mt-2">Dual Sandbox</span>
                <span className="text-[9px] text-gray-500 mt-1">Both workspaces</span>
              </button>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setStep(1)}
                className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-xs transition-all"
              >
                Back
              </button>
              <button
                onClick={handleComplete}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs transition-all shadow-lg"
              >
                Complete Set
              </button>
            </div>
          </div>
        )}

        <p className="mt-6 text-center text-xs text-gray-500">
          Already mapped? <Link to="/login" className="text-cyan-400 hover:underline">Portal Login</Link>
        </p>
      </div>
    </div>
  );
}
