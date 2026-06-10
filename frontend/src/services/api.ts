import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

const client = axios.create({ baseURL: API_BASE });

export const api = {
  login: (email: string, password: string) =>
    client.post('/auth/login', { email, password }).then(r => r.data),

  register: (data: { name: string; email: string; workspaceMode: string }) =>
    client.post('/auth/register', data).then(r => r.data),

  getInventory: () => client.get('/inventory').then(r => r.data),

  addProduct: (data: any) =>
    client.post('/inventory', data).then(r => r.data),

  updateProduct: (id: string, data: any) =>
    client.put(`/inventory/${id}`, data).then(r => r.data),

  deleteProduct: (id: string) =>
    client.delete(`/inventory/${id}`).then(r => r.data),

  getCustomers: () => client.get('/customers').then(r => r.data),

  addCustomer: (data: { name: string; email: string; outstanding?: number }) =>
    client.post('/customers', data).then(r => r.data),

  updateCustomer: (id: string, data: any) =>
    client.put(`/customers/${id}`, data).then(r => r.data),

  deleteCustomer: (id: string) =>
    client.delete(`/customers/${id}`).then(r => r.data),

  getVendors: () => client.get('/vendors').then(r => r.data),

  getReceivables: () => client.get('/receivables').then(r => r.data),

  sendReminder: (id: string) =>
    client.post(`/receivables/${id}/remind`).then(r => r.data),

  getPayables: () => client.get('/payables').then(r => r.data),

  getExpenses: () => client.get('/expenses').then(r => r.data),

  addExpense: (data: any) =>
    client.post('/expenses', data).then(r => r.data),

  getGoals: () => client.get('/goals').then(r => r.data),

  addGoal: (data: any) =>
    client.post('/goals', data).then(r => r.data),

  saveToGoal: (id: string, amount: number) =>
    client.put(`/goals/${id}/save`, { amount }).then(r => r.data),

  getNotifications: () => client.get('/notifications').then(r => r.data),

  markNotificationRead: (id: string) =>
    client.put(`/notifications/${id}/read`).then(r => r.data),

  scanReceipt: (fileName: string) =>
    client.post('/ocr/scan', { fileName }).then(r => r.data),

  getInventoryForecast: (productId: string) =>
    client.get(`/inventory/forecast/${productId}`).then(r => r.data),

  runSaaSContractAudit: () =>
    client.post('/saas/audit').then(r => r.data),
};
