import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../api/client';
import { Building2, Key, Mail, AlertCircle, Sparkles } from 'lucide-react';
import './Login.css';

export default function Login({ onLoginSuccess }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!email || !password) {
      setError('Please fill in all credentials.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await authApi.login({ email, password });
      localStorage.setItem('jwt_token', res.data.token);
      localStorage.setItem('refresh_token', res.data.refreshToken);
      localStorage.setItem('user_info', JSON.stringify({
        id: res.data.id,
        name: res.data.name,
        email: res.data.email
      }));
      onLoginSuccess();
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = () => {
    setEmail('ceo@centric.ai');
    setPassword('password');
    // We delay slightly so state updates before submitting
    setTimeout(() => {
      setLoading(true);
      authApi.login({ email: 'ceo@centric.ai', password: 'password' })
        .then(res => {
          localStorage.setItem('jwt_token', res.data.token);
          localStorage.setItem('refresh_token', res.data.refreshToken);
          localStorage.setItem('user_info', JSON.stringify({
            id: res.data.id,
            name: res.data.name,
            email: res.data.email
          }));
          onLoginSuccess();
          navigate('/dashboard');
        })
        .catch(() => setError('Demo login failed. Make sure the backend is seeded.'))
        .finally(() => setLoading(false));
    }, 100);
  };

  return (
    <div className="login-wrapper">
      <div className="login-card glass-card">
        <div className="login-header">
          <div className="brand-logo bg-gradient-to-tr from-violet-500 to-cyan-400 mx-auto">
            <Building2 size={22} className="text-white" />
          </div>
          <h2 className="mt-4 text-center text-gradient font-black">CentricBiz Command</h2>
          <p className="text-xs text-gray-400 mt-1 text-center">AI-Powered Business Cash Control</p>
        </div>

        {error && (
          <div className="error-alert mt-4 bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-xs flex items-center gap-2">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form className="login-form mt-6 space-y-4" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">CORPORATE EMAIL</label>
            <div className="input-container relative">
              <Mail size={16} className="input-icon absolute left-3 top-4 text-gray-500" />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ceo@centric.ai"
                className="input-glass pl-10"
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">SECURITY PASSWORD</label>
            <div className="input-container relative">
              <Key size={16} className="input-icon absolute left-3 top-4 text-gray-500" />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="input-glass pl-10"
                disabled={loading}
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="btn-glass btn-glass-primary w-full py-3.5 mt-2 text-sm font-semibold"
            disabled={loading}
          >
            {loading ? 'Authenticating...' : 'Sign In to Portal'}
          </button>
        </form>

        <div className="divider-line mt-6 border-t border-white/5 flex items-center justify-center relative">
          <span className="bg-base px-3 text-[10px] text-gray-500 uppercase font-mono absolute">OR USE DEMO ACCOUNT</span>
        </div>

        <button 
          onClick={handleDemoLogin} 
          className="btn-glass w-full py-3.5 mt-6 text-xs text-cyan-300 border border-cyan-500/20 hover:border-cyan-400/40 hover:bg-cyan-500/5 font-bold flex items-center justify-center gap-1.5"
          disabled={loading}
        >
          <Sparkles size={14} className="text-cyan-400" />
          <span>Launch Immediate Executive Demo</span>
        </button>

        <p className="auth-footer-text mt-6 text-center text-xs text-gray-500">
          New corporate entity? <Link to="/register" className="text-violet-400 hover:text-violet-300 font-semibold">Initialize Account</Link>
        </p>
      </div>
    </div>
  );
}
