import React, { useState, useEffect } from 'react';
import { User, Shield, Key, Terminal, RefreshCw, CheckCircle, AlertTriangle, LogOut } from 'lucide-react';
import { authApi, aiApi } from '../api/client';

export default function Profile({ onLogout, onProfileUpdate }) {
  const userInfo = JSON.parse(localStorage.getItem('user_info') || '{}');
  const token = localStorage.getItem('jwt_token') || '';
  
  // Profile update state
  const [name, setName] = useState(userInfo?.name || '');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [updateStatus, setUpdateStatus] = useState({ type: '', message: '' });

  // AI service diagnostic state
  const [aiHealth, setAiHealth] = useState(null);
  const [checkingHealth, setCheckingHealth] = useState(false);

  const fetchAiHealth = async () => {
    setCheckingHealth(true);
    try {
      const res = await aiApi.getHealth();
      setAiHealth(res.data);
    } catch (err) {
      setAiHealth({
        status: 'offline',
        error: err.message || 'AI integration service unreachable.'
      });
    } finally {
      setCheckingHealth(false);
    }
  };

  useEffect(() => {
    fetchAiHealth();
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setUpdateStatus({ type: 'error', message: 'Display name cannot be empty.' });
      return;
    }
    
    setLoading(true);
    setUpdateStatus({ type: '', message: '' });
    try {
      const payload = { name };
      if (password) {
        if (password.length < 6) {
          setUpdateStatus({ type: 'error', message: 'Password must be at least 6 characters.' });
          setLoading(false);
          return;
        }
        payload.password = password;
      }

      await authApi.updateProfile(payload);
      
      // Update local storage
      const updatedUserInfo = { ...userInfo, name };
      localStorage.setItem('user_info', JSON.stringify(updatedUserInfo));
      
      if (onProfileUpdate) {
        onProfileUpdate();
      }

      setUpdateStatus({ type: 'success', message: 'Your profile has been updated successfully.' });
      setPassword(''); // Reset password field
    } catch (err) {
      setUpdateStatus({
        type: 'error',
        message: err.response?.data?.message || err.message || 'Failed to update profile.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-page fade-in max-w-4xl mx-auto p-4 md:p-6">
      <div className="glass-panel p-6 md:p-8 mb-6">
        
        {/* User Header */}
        <div className="flex flex-col md:flex-row items-center gap-6 mb-8 pb-6 border-b border-color">
          <div className="w-20 h-20 rounded-full bg-primary-light text-primary font-bold text-3xl flex items-center justify-center border-2 border-primary/20">
            {userInfo?.name ? userInfo.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="text-center md:text-left flex-grow">
            <h2 className="text-2xl font-bold text-main">{userInfo?.name || 'Copilot User'}</h2>
            <p className="text-sm text-muted mb-2">{userInfo?.email || 'user@finance.ai'}</p>
            <div className="flex flex-wrap justify-center md:justify-start gap-2">
              <span className="badge badge-education">Verified Investor Tier</span>
              <span className="badge badge-bills">Role: USER_MEMBER</span>
            </div>
          </div>
          <button 
            onClick={onLogout} 
            className="flex items-center gap-2 px-4 py-2 border border-color rounded-md text-xs font-semibold text-danger bg-danger-bg/20 hover:bg-danger-bg/40 transition-all self-center md:self-start mt-4 md:mt-0"
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Profile Form */}
          <div className="flex flex-col gap-5">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted flex items-center gap-2 mb-2">
              <User size={16} className="text-primary" /> Update Account Settings
            </h3>
            
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="text-xs text-muted block font-semibold mb-1 uppercase">Display Name</label>
                <input 
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-sm p-2.5 bg-surface border border-color rounded-md focus:border-primary focus:outline-none text-main transition-colors"
                  placeholder="Enter display name"
                />
              </div>

              <div>
                <label className="text-xs text-muted block font-semibold mb-1 uppercase">New Password (Optional)</label>
                <input 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full text-sm p-2.5 bg-surface border border-color rounded-md focus:border-primary focus:outline-none text-main transition-colors"
                  placeholder="Minimum 6 characters to update"
                />
              </div>

              {updateStatus.message && (
                <div className={`p-3 rounded-md text-xs flex gap-2 items-start ${
                  updateStatus.type === 'success' 
                    ? 'bg-success-bg/25 text-success border border-success/30' 
                    : 'bg-danger-bg/25 text-danger border border-danger/30'
                }`}>
                  {updateStatus.type === 'success' ? <CheckCircle size={16} className="flex-shrink-0 mt-0.5" /> : <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" />}
                  <span>{updateStatus.message}</span>
                </div>
              )}

              <button 
                type="submit" 
                disabled={loading}
                className="w-full btn btn-primary flex items-center justify-center py-2.5 text-xs font-bold transition-all"
              >
                {loading ? 'Updating Credentials...' : 'Save Profile Changes'}
              </button>
            </form>

            <div className="mt-4 p-4 bg-base rounded-md border border-color">
              <h4 className="text-xs text-muted block font-semibold mb-1.5 uppercase flex items-center gap-1.5">
                <Shield size={14} className="text-success" /> Security layer properties
              </h4>
              <div className="flex items-center gap-2 text-xs font-semibold text-muted mb-2">
                <Key size={12} className="text-warning" />
                <span>BCryptPasswordEncoder (Strength: 10)</span>
              </div>
              <div className="w-full">
                <label className="text-[10px] text-muted block mb-0.5 uppercase">Bearer JWT Session Token</label>
                <input 
                  type="text" 
                  readOnly 
                  className="w-full text-[10px] p-2 bg-surface border border-color rounded font-mono text-muted truncate select-all focus:outline-none" 
                  value={token}
                />
              </div>
            </div>
          </div>

          {/* AI Service Diagnostics */}
          <div className="flex flex-col gap-5">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted flex items-center gap-2">
                <Terminal size={16} className="text-primary" /> AI Diagnostic Console
              </h3>
              <button 
                onClick={fetchAiHealth}
                disabled={checkingHealth}
                className="p-1 rounded hover:bg-base border border-color text-muted transition-colors flex items-center gap-1"
                title="Pings the proxy AI health status endpoint"
              >
                <RefreshCw size={12} className={checkingHealth ? 'animate-spin' : ''} />
                <span className="text-[10px] font-semibold px-1">Check</span>
              </button>
            </div>

            <div className="p-4 bg-base rounded-md border border-color font-mono flex-grow flex flex-col justify-between min-h-[300px]">
              
              {/* Terminal Output */}
              <div className="space-y-3 flex-grow text-xs leading-relaxed text-main">
                <div className="flex items-center justify-between pb-2 border-b border-color">
                  <span>Diagnostic Service Status</span>
                  {aiHealth?.status === 'live' ? (
                    <span className="flex items-center gap-1 text-success font-semibold">
                      <span className="w-2.5 h-2.5 rounded-full bg-success animate-pulse inline-block"></span>
                      ONLINE (LIVE)
                    </span>
                  ) : aiHealth?.status === 'offline' ? (
                    <span className="flex items-center gap-1 text-danger font-semibold">
                      <span className="w-2.5 h-2.5 rounded-full bg-danger inline-block"></span>
                      OFFLINE
                    </span>
                  ) : (
                    <span className="text-muted">INITIALIZING...</span>
                  )}
                </div>

                {aiHealth?.status === 'live' ? (
                  <div className="space-y-2.5">
                    <div className="flex justify-between">
                      <span className="text-muted">FastAPI Service Version:</span>
                      <span className="font-semibold text-main">{aiHealth.version}</span>
                    </div>
                    
                    <div className="p-2.5 bg-surface rounded border border-color space-y-1.5">
                      <div className="text-[10px] text-muted uppercase font-bold tracking-wide">Model Status Cache</div>
                      <div className="flex justify-between text-xs">
                        <span>Predictor (RandomForest):</span>
                        <span className={aiHealth.models?.predictor ? 'text-success font-semibold' : 'text-warning font-semibold'}>
                          {aiHealth.models?.predictor ? 'TRAINED & CACHED' : 'UNINITIALIZED'}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span>Anomaly (IsolationForest):</span>
                        <span className={aiHealth.models?.anomalyDetector ? 'text-success font-semibold' : 'text-warning font-semibold'}>
                          {aiHealth.models?.anomalyDetector ? 'TRAINED & CACHED' : 'UNINITIALIZED'}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span>Segmenter (KMeans):</span>
                        <span className={aiHealth.models?.segmenter ? 'text-success font-semibold' : 'text-warning font-semibold'}>
                          {aiHealth.models?.segmenter ? 'TRAINED & CACHED' : 'UNINITIALIZED'}
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-muted">Last Trained Datetime:</span>
                      <span className="text-main font-semibold">
                        {aiHealth.lastTrained ? new Date(aiHealth.lastTrained).toLocaleString() : 'N/A'}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-muted">Active WS Connections:</span>
                      <span className="text-main font-semibold">{aiHealth.wsClients} client(s)</span>
                    </div>
                  </div>
                ) : aiHealth?.status === 'offline' ? (
                  <div className="p-3 bg-danger-bg/10 border border-danger/20 rounded text-danger text-[11px] space-y-2">
                    <div className="font-bold flex items-center gap-1">
                      <AlertTriangle size={14} /> Connection Failed
                    </div>
                    <p className="leading-snug">
                      Spring Boot backend is unable to connect to the FastAPI Python service at app.aiServiceUrl.
                    </p>
                    <div className="text-[10px] bg-surface p-1.5 rounded text-muted-dark border border-color font-mono truncate">
                      Err: {aiHealth.error || 'Connection refused.'}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted text-xs">
                    Scanning AI backend interfaces...
                  </div>
                )}
              </div>

              {/* Terminal Footer Info */}
              <div className="text-[10px] text-muted border-t border-color pt-3.5 mt-4">
                <span>CentricAI v2.0 - Core Intelligence Cluster Connection diagnostics. Checks telemetry via Spring Boot REST proxy layer.</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
