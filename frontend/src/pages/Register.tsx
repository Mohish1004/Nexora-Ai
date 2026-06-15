import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppStore } from '../store/appStore';
import { api } from '../services/api';
import { Cpu, Mail, Key, User, Briefcase, PiggyBank, Layers, ArrowRight, Loader, AlertCircle } from 'lucide-react';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';

export default function Register() {
  const navigate = useNavigate();
  const login = useAppStore(state => state.login);
  const setWorkspaceId = useAppStore(state => state.setWorkspaceId);
  
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [workspaceMode, setWorkspaceMode] = useState<'business' | 'personal' | 'both' | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [googleInfo, setGoogleInfo] = useState<{ email: string; fullName: string; idToken: string } | null>(null);

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || (!password && !googleInfo)) return;
    setError('');
    setStep(2);
  };

  const handleGoogleRegister = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const idToken = await user.getIdToken();
      
      setGoogleInfo({
        email: user.email || '',
        fullName: user.displayName || 'Google User',
        idToken: idToken
      });
      setName(user.displayName || 'Google User');
      setEmail(user.email || '');
      setStep(2);
    } catch (err: any) {
      console.error('Google Sign-Up failed:', err);
      setError(err?.message || 'Google Auth Error during registration.');
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async () => {
    if (!workspaceMode) return;
    setLoading(true);
    setError('');
    try {
      let res;
      let wsId: number | undefined;

      if (googleInfo) {
        res = await api.loginWithGoogle(googleInfo.email, googleInfo.fullName, googleInfo.idToken);
        try {
          const wsList = await api.getWorkspaces();
          wsId = wsList[0]?.id;
        } catch {}
      } else {
        const wsType = workspaceMode === 'both' ? 'BOTH' : workspaceMode === 'business' ? 'BUSINESS' : 'PERSONAL';
        res = await api.register({ email, password, fullName: name, workspaceType: wsType });
        try {
          const wsList = await api.getWorkspaces();
          wsId = wsList[0]?.id;
        } catch {}
      }

      login(res.fullName, res.email, workspaceMode, wsId);
      if (wsId) setWorkspaceId(wsId);
      navigate('/select-workspace');
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Backend unavailable — proceeding in offline mode.';
      setError(msg);
      login(googleInfo ? googleInfo.fullName : name, googleInfo ? googleInfo.email : email, workspaceMode);
      navigate('/select-workspace');
    } finally {
      setLoading(false);
    }
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

        {error && (
          <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
            <AlertCircle size={14} />
            <span>{error}</span>
          </div>
        )}

        {step === 1 ? (
          <>
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
                    required={!googleInfo}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={googleInfo ? "Google accounts skip password setup" : "••••••••"}
                    disabled={!!googleInfo}
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

            <button
              onClick={handleGoogleRegister}
              type="button"
              disabled={loading}
              className="w-full py-3 mt-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-xs flex items-center justify-center gap-2.5 transition-all shadow-md active:scale-95 disabled:opacity-50"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.67 1.54 14.98 1 12 1 7.35 1 3.37 3.67 1.39 7.56l3.85 2.99c.92-2.75 3.48-4.51 6.76-4.51z"
                />
                <path
                  fill="#4285F4"
                  d="M23.49 12.27c0-.81-.07-1.59-.2-2.27H12v4.51h6.46c-.29 1.48-1.14 2.73-2.4 3.58l3.71 2.88c2.17-2 3.42-4.94 3.42-8.7z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.24 14.75c-.24-.72-.38-1.49-.38-2.3s.14-1.58.38-2.3L1.39 7.16C.5 8.93 0 10.91 0 13s.5 4.07 1.39 5.84l3.85-2.99z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.71-2.88c-1.03.69-2.35 1.11-4.25 1.11-3.28 0-5.84-1.76-6.76-4.51L1.39 16.8c1.98 3.89 5.96 6.56 10.61 6.56z"
                />
              </svg>
              <span className="font-mono tracking-wider uppercase">Register with Google</span>
            </button>
          </>
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
                onClick={() => {
                  setStep(1);
                  setGoogleInfo(null);
                }}
                className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-xs transition-all"
              >
                Back
              </button>
              <button
                onClick={handleComplete}
                disabled={!workspaceMode || loading}
                className={`flex-1 py-3 rounded-xl text-white font-bold text-xs transition-all shadow-lg flex items-center justify-center gap-2 ${
                  workspaceMode && !loading
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500'
                    : 'bg-white/5 text-gray-500 cursor-not-allowed'
                }`}
              >
                {loading ? <Loader size={14} className="animate-spin" /> : null}
                {loading ? 'Registering...' : 'Complete Set'}
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
