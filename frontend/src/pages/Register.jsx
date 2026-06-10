import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../api/client';
import { Building2, User, Key, Mail, AlertCircle } from 'lucide-react';

export default function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!name || !email || !password) {
      setError('Please fill in all details.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await authApi.register({ name, email, password });
      setSuccess('Account registered successfully! Directing to login...');
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-card glass-card">
        <div className="login-header">
          <div className="brand-logo bg-gradient-to-tr from-violet-500 to-cyan-400 mx-auto">
            <Building2 size={22} className="text-white" />
          </div>
          <h2 className="mt-4 text-center text-gradient font-black">Initialize Entity</h2>
          <p className="text-xs text-gray-400 mt-1 text-center">Set up your company workspace</p>
        </div>

        {error && (
          <div className="error-alert mt-4 bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-xs flex items-center gap-2">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="success-alert mt-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-3 rounded-lg text-xs">
            {success}
          </div>
        )}

        <form className="login-form mt-6 space-y-4" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">EXECUTIVE NAME</label>
            <div className="input-container relative">
              <User size={16} className="input-icon absolute left-3 top-4 text-gray-500" />
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="CEO Name"
                className="input-glass pl-10"
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">BUSINESS EMAIL</label>
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
            {loading ? 'Registering Workspace...' : 'Initialize Workspace'}
          </button>
        </form>

        <p className="auth-footer-text mt-6 text-center text-xs text-gray-500">
          Already registered? <Link to="/login" className="text-violet-400 hover:text-violet-300 font-semibold">Sign In</Link>
        </p>
      </div>
    </div>
  );
}
