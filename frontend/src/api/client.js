import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8000/api/ai/ws';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jwt_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle invalid tokens
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('jwt_token');
      localStorage.removeItem('user_info');
    }
    return Promise.reject(error);
  }
);

// API Abstractions
export const authApi = {
  login: (data) => apiClient.post('/auth/login', data),
  register: (data) => apiClient.post('/auth/register', data),
  updateProfile: (data) => apiClient.put('/auth/profile', data),
};

export const expenseApi = {
  getAll: () => apiClient.get('/expenses'),
  create: (data) => apiClient.post('/expenses', data),
  update: (id, data) => apiClient.put(`/expenses/${id}`, data),
  delete: (id) => apiClient.delete(`/expenses/${id}`),
};

export const incomeApi = {
  getAll: () => apiClient.get('/income'),
  create: (data) => apiClient.post('/income', data),
  delete: (id) => apiClient.delete(`/income/${id}`),
};

export const budgetApi = {
  getAll: () => apiClient.get('/budgets'),
  getForMonth: (month) => apiClient.get(`/budgets/${month}`),
  setBudget: (data) => apiClient.post('/budgets', data),
};

export const analyticsApi = {
  getMonthly: (months = 6) => apiClient.get(`/analytics/monthly?months=${months}`),
  getCategory: (month = '') => apiClient.get(`/analytics/category${month ? `?month=${month}` : ''}`),
  getSavings: (month = '') => apiClient.get(`/analytics/savings${month ? `?month=${month}` : ''}`),
};

export const aiApi = {
  getInsights: () => apiClient.get('/ai/insights'),
  getPredictions: () => apiClient.get('/ai/predict'),
  scanOcr: (base64Image, fileName) => apiClient.post('/ai/ocr', { image: base64Image, fileName }),
  getAnomalies: () => apiClient.get('/ai/anomalies'),
  getSegment: () => apiClient.get('/ai/segment'),
  getRiskScore: () => apiClient.get('/ai/risk-score'),
  getHealth: () => apiClient.get('/ai/health'),
};

// WebSocket client for real-time AI streaming
export class AiWebSocket {
  constructor() {
    this.ws = null;
    this.listeners = new Map();
    this.reconnectAttempts = 0;
    this.maxRetries = 5;
  }

  connect() {
    try {
      this.ws = new WebSocket(WS_URL);
      this.ws.onopen = () => {
        this.reconnectAttempts = 0;
        this.emit('connected', true);
        // Auto-ping every 30s
        this.pingInterval = setInterval(() => {
          this.send({ action: 'ping' });
        }, 30000);
      };
      this.ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          this.emit(msg.type, msg.payload);
          this.emit('message', msg);
        } catch (e) {
          // ignore parse errors
        }
      };
      this.ws.onclose = () => {
        clearInterval(this.pingInterval);
        this.emit('connected', false);
        this._reconnect();
      };
      this.ws.onerror = () => {
        this.ws.close();
      };
    } catch (e) {
      // WS not available
    }
    return this;
  }

  _reconnect() {
    if (this.reconnectAttempts >= this.maxRetries) return;
    this.reconnectAttempts++;
    setTimeout(() => this.connect(), 2000 * this.reconnectAttempts);
  }

  send(data) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    }
  }

  analyze(expenses, income) {
    this.send({ action: 'analyze', expenses, income });
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
    return () => {
      const arr = this.listeners.get(event);
      if (arr) {
        const idx = arr.indexOf(callback);
        if (idx >= 0) arr.splice(idx, 1);
      }
    };
  }

  emit(event, data) {
    const arr = this.listeners.get(event);
    if (arr) {
      arr.forEach((cb) => cb(data));
    }
  }

  disconnect() {
    clearInterval(this.pingInterval);
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

// Singleton WebSocket instance
export const aiWs = new AiWebSocket();
