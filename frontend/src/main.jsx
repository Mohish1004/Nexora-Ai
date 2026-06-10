import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

window.onerror = (msg, url, line, col, err) => {
  const div = document.createElement('div');
  div.style.cssText = 'position:fixed;bottom:0;left:0;right:0;background:#1a1a2e;color:#ff6b6b;padding:20px;z-index:99999;font-family:monospace;font-size:13px;white-space:pre-wrap;border-top:3px solid #ff6b6b';
  div.textContent = `ERROR: ${msg}\n  at ${url}:${line}:${col}\n${err?.stack || ''}`;
  document.body.appendChild(div);
};

const root = document.getElementById('root');
if (!root) {
  document.write('<div style="color:red;padding:40px;font-size:20px;">ERROR: #root element not found in index.html</div>');
} else {
  try {
    ReactDOM.createRoot(root).render(<App />);
  } catch (e) {
    root.innerHTML = `<div style="color:red;padding:40px;font-size:18px;font-family:monospace;">
      <h2>React Render Error</h2>
      <pre>${e.stack || e.message || e}</pre>
    </div>`;
  }
}
