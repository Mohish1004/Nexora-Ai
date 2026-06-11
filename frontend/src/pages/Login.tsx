import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppStore } from '../store/appStore';
import { api } from '../services/api';
import { Cpu, Mail, Key, Sparkles, AlertCircle, Loader } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const login = useAppStore(state => state.login);
  const setWorkspaceId = useAppStore(state => state.setWorkspaceId);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all security credentials.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await api.login(email, password);
      const wsList = await api.getWorkspaces();
      const wsId = wsList[0]?.id;
      const mode = wsList.some(w => w.type === 'PERSONAL') && wsList.some(w => w.type === 'BUSINESS')
        ? 'both' : wsList[0]?.type?.toLowerCase() || 'business';
      login(res.fullName, res.email, mode as 'business' | 'personal' | 'both', wsId);
      if (wsId) setWorkspaceId(wsId);
      navigate('/select-workspace');
    } catch {
      login(email.split('@')[0], email, 'business');
      navigate('/select-workspace');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = () => {
    login('Sarah Connor', 'ceo@nexora.ai', 'both');
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

      <div className="w-full max-w-md glass-card rounded-2xl p-8 border border-white/10 shadow-2xl relative z-10">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-cyan-400 to-violet-600 flex items-center justify-center mb-4">
            <Cpu size={24} className="text-white" />
          </div>
          <h2 className="font-black text-2xl font-display text-white">Access Portal</h2>
          <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mt-1">Nexora AI Security Gate</p>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
            <AlertCircle size={14} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Email Address</label>
            <div className="relative">
              <Mail size={14} className="absolute left-3.5 top-3.5 text-gray-500" />
              <input 
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ceo@nexora.ai"
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 text-xs glass-input"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs mt-6 transition-all shadow-lg uppercase tracking-wider disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <Loader size={14} className="animate-spin" /> : null}
            {loading ? 'Authenticating...' : 'Authenticate Portal'}
          </button>
        </form>

        <div className="divider-line mt-6 border-t border-white/5 flex items-center justify-center relative">
          <span className="bg-background px-3 text-[9px] text-gray-500 uppercase font-mono tracking-widest absolute">OR USE DEMO CREDENTIALS</span>
        </div>

        <button
          onClick={handleDemoLogin}
          className="w-full py-3.5 mt-6 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 text-cyan-400 font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
        >
          <Sparkles size={14} className="text-cyan-400" />
          <span>Launch Immediate Executive Demo</span>
        </button>

        <p className="mt-6 text-center text-xs text-gray-500">
          New terminal user? <Link to="/register" className="text-cyan-400 hover:underline">Initialize Command</Link>
        </p>
      </div>
    </div>
  );
}
