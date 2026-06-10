import React, { useState, useEffect } from 'react';
import { authApi } from '../api/client';
import { User, Mail, Key, ShieldCheck, AlertCircle, CheckCircle, LogOut } from 'lucide-react';

export default function Profile({ onLogout, onProfileUpdate }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const info = JSON.parse(localStorage.getItem('user_info') || '{}');
    if (info.name) setName(info.name);
    if (info.email) setEmail(info.email);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await authApi.updateProfile({ name, email, password });
      
      const info = JSON.parse(localStorage.getItem('user_info') || '{}');
      const updatedInfo = { ...info, name, email };
      localStorage.setItem('user_info', JSON.stringify(updatedInfo));
      
      if (onProfileUpdate) onProfileUpdate();
      
      setSuccess('Company settings updated successfully!');
      setPassword('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save settings.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-wrapper animate-fadeIn max-w-xl mx-auto mt-8">
      <div className="glass-card p-8">
        <div className="flex items-center gap-3 border-b border-white/5 pb-4 mb-6">
          <div className="bg-violet-500/10 text-violet-400 p-2.5 rounded-xl border border-violet-500/20">
            <ShieldCheck size={20} />
          </div>
          <div>
            <h3 className="text-white text-base font-bold">Company Settings</h3>
            <p className="text-xs text-gray-500 mt-0.5">Manage entity branding and executive credentials</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
            <CheckCircle size={16} />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="form-group">
            <label className="form-label">EXECUTIVE / COMPANY NAME</label>
            <div className="relative">
              <User size={16} className="absolute left-3 top-4 text-gray-500" />
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-glass pl-10"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">CORPORATE EMAIL ADDRESS</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-4 text-gray-500" />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-glass pl-10"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">UPDATE SECURITY PASSWORD</label>
            <div className="relative">
              <Key size={16} className="absolute left-3 top-4 text-gray-500" />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Leave blank to keep current password"
                className="input-glass pl-10"
              />
            </div>
          </div>

          <div className="flex gap-4 pt-4 border-t border-white/5 mt-6">
            <button 
              type="submit" 
              className="btn-glass btn-glass-primary flex-1 py-3 text-xs font-semibold"
              disabled={loading}
            >
              {loading ? 'Saving Settings...' : 'Save Settings'}
            </button>
            
            <button 
              type="button" 
              onClick={onLogout}
              className="btn-glass border-red-500/20 text-red-400 hover:bg-red-500/5 hover:border-red-500/40 px-6"
            >
              <LogOut size={16} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
