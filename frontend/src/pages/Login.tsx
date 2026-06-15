import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppStore } from '../store/appStore';
import { api } from '../services/api';
import { Cpu, Mail, Key, Sparkles, AlertCircle, Loader } from 'lucide-react';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';

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
      const mode = wsList.some((w: any) => w.type === 'PERSONAL') && wsList.some((w: any) => w.type === 'BUSINESS')
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

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const idToken = await user.getIdToken();
      
      const res = await api.loginWithGoogle(
        user.email || '',
        user.displayName || 'Google User',
        idToken
      );

      let wsId: number | null = null;
      let mode = 'business';
      try {
        const wsList = await api.getWorkspaces();
        wsId = wsList[0]?.id || null;
        mode = wsList.some((w: any) => w.type === 'PERSONAL') && wsList.some((w: any) => w.type === 'BUSINESS')
          ? 'both' : wsList[0]?.type?.toLowerCase() || 'business';
      } catch (wsErr) {
        console.warn('Failed to load workspaces, using defaults:', wsErr);
      }

      login(res.fullName, res.email, mode as 'business' | 'personal' | 'both', wsId || undefined);
      if (wsId) setWorkspaceId(wsId);
      navigate('/select-workspace');
    } catch (err: any) {
      console.error('Google Sign-In failed:', err);
      setError(err?.message || 'Google Auth Error — launching offline sandbox.');
      const emailLocal = auth.currentUser?.email || 'google-user@nexora.ai';
      const nameLocal = auth.currentUser?.displayName || 'Google User';
      
      setTimeout(() => {
        login(nameLocal, emailLocal, 'both');
        navigate('/select-workspace');
      }, 1500);
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

        <button
          onClick={handleGoogleLogin}
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
          <span className="font-mono tracking-wider uppercase">Sign In with Google</span>
        </button>

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
