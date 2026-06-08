import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { authApi } from '../api/client';
import { Sparkles, ArrowRight, Lock, Mail } from 'lucide-react';
import './Auth.css';

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
}

function GithubIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
      <path fill="currentColor" d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
    </svg>
  );
}

export default function Login({ onLoginSuccess }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    if (code && state === 'github') {
      handleOAuthGithub(code);
      return;
    }
    if (window.location.hash) {
      const hash = window.location.hash.substring(1);
      const hashParams = new URLSearchParams(hash);
      const idToken = hashParams.get('id_token');
      const hashState = hashParams.get('state');
      if (idToken && hashState === 'google') {
        handleOAuthGoogle(idToken);
        window.history.replaceState(null, '', window.location.pathname);
      }
    }
  }, []);

  const processOAuthResult = (data) => {
    localStorage.setItem('jwt_token', data.token);
    if (data.refreshToken) localStorage.setItem('refresh_token', data.refreshToken);
    localStorage.setItem('user_info', JSON.stringify({
      id: data.id, name: data.name, email: data.email
    }));
    onLoginSuccess();
    navigate('/dashboard');
  };

  const handleOAuthGoogle = async (idToken) => {
    setOauthLoading(true);
    setError('');
    try {
      const res = await authApi.loginGoogle(idToken);
      processOAuthResult(res.data);
    } catch {
      setError('Google sign-in failed. Please try again.');
    } finally {
      setOauthLoading(false);
    }
  };

  const handleOAuthGithub = async (code) => {
    setOauthLoading(true);
    setError('');
    try {
      const res = await authApi.loginGithub(code);
      processOAuthResult(res.data);
    } catch {
      setError('GitHub sign-in failed. Please try again.');
    } finally {
      setOauthLoading(false);
    }
  };

  const handleGoogleRedirect = () => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) { setError('Google sign-in is not configured.'); return; }
    const redirectUri = `${window.location.origin}/login`;
    const nonce = crypto.randomUUID?.() || Math.random().toString(36);
    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=id_token&scope=openid%20email%20profile&nonce=${nonce}&state=google`;
  };

  const handleGithubRedirect = () => {
    const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID;
    if (!clientId) { setError('GitHub sign-in is not configured.'); return; }
    const redirectUri = `${window.location.origin}/login`;
    window.location.href = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=user:email&state=github`;
  };

  const handleDemoLogin = async () => {
    setError('');
    setLoading(true);
    try {
      const response = await authApi.login({ email: 'demo@finance.ai', password: 'password' });
      const data = response.data;
      localStorage.setItem('jwt_token', data.token);
      localStorage.setItem('user_info', JSON.stringify({
        id: data.id,
        name: data.name,
        email: data.email
      }));
      onLoginSuccess();
      navigate('/dashboard');
    } catch (err) {
      setError('Failed to log in as demo user. Please make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authApi.login({ email, password });
      const data = response.data;
      localStorage.setItem('jwt_token', data.token);
      localStorage.setItem('user_info', JSON.stringify({
        id: data.id,
        name: data.name,
        email: data.email
      }));
      onLoginSuccess();
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Incorrect credentials, or authentication service is currently offline.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card glass-panel fade-in">
        <div className="auth-header">
          <div className="brand-logo mx-auto mb-3">
            <Sparkles size={28} />
          </div>
          <h2>Sign in to Centric<span>AI</span></h2>
          <p>Access your automated finance intelligence hub</p>
        </div>

        {error && <div className="auth-alert danger">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div className="input-icon-wrapper">
              <Mail className="input-icon" size={18} />
              <input 
                type="email" 
                required 
                className="form-input with-icon" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
              />
            </div>
          </div>

          <div className="form-group">
            <div className="flex justify-between">
              <label className="form-label">Password</label>
              <a href="#forgot" onClick={(e) => { e.preventDefault(); alert('Demo password is: password'); }} className="forgot-link">Forgot?</a>
            </div>
            <div className="input-icon-wrapper">
              <Lock className="input-icon" size={18} />
              <input 
                type="password" 
                required 
                className="form-input with-icon" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
          </div>

          <button type="submit" disabled={loading || oauthLoading} className="btn btn-primary btn-block mt-2">
            {loading ? 'Authenticating...' : (
              <>
                <span>Sign In Command Central</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <div className="oauth-divider">
          <span>or continue with</span>
        </div>

        <div className="oauth-buttons">
          <button type="button" onClick={handleGoogleRedirect} disabled={oauthLoading} className="btn btn-oauth">
            <GoogleIcon />
            <span>Google</span>
          </button>
          <button type="button" onClick={handleGithubRedirect} disabled={oauthLoading} className="btn btn-oauth">
            <GithubIcon />
            <span>GitHub</span>
          </button>
        </div>

        <div className="auth-footer">
          <p>New to intelligence tracking? <Link to="/register">Create an account</Link></p>
        </div>

        <div className="demo-credentials flex flex-col gap-2 mt-4 pt-4 border-t border-color text-center">
          <span className="text-xs text-muted">Want to preview the AI capabilities?</span>
          <button 
            type="button" 
            onClick={handleDemoLogin} 
            disabled={loading || oauthLoading}
            className="btn btn-secondary btn-xs py-2 w-full text-xs font-semibold flex items-center justify-center gap-1.5"
          >
            🚀 Try Demo Sandbox (Pre-seeded Data)
          </button>
        </div>
      </div>
    </div>
  );
}
