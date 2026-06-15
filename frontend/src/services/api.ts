import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

const client = axios.create({ baseURL: API_BASE });

function unwrap(res: any): any {
  return res?.data?.data;
}

// ── Auth ──
export const api = {
  login: (email: string, password: string) =>
    client.post('/auth/login', { email, password }).then(unwrap),

  register: (data: { email: string; password: string; fullName: string; workspaceType: string }) =>
    client.post('/auth/register', data).then(unwrap),

  refreshToken: (refreshToken: string) =>
    client.post('/auth/refresh', { refreshToken }).then(unwrap),

  logout: () =>
    client.post('/auth/logout').then(r => r.data),

  loginWithGoogle: (email: string, fullName: string, idToken: string) =>
    client.post('/auth/google', { email, fullName, idToken }).then(unwrap),

  // ── Workspaces ──
  getWorkspaces: () =>
    client.get('/workspaces').then(unwrap),

  // ── Products ──
  getProducts: (wsId: number) =>
    client.get(`/workspaces/${wsId}/products`).then(unwrap),

  addProduct: (wsId: number, data: any) =>
    client.post(`/workspaces/${wsId}/products`, data).then(unwrap),

  getProduct: (wsId: number, productId: number) =>
    client.get(`/workspaces/${wsId}/products/${productId}`).then(unwrap),

  updateProduct: (wsId: number, productId: string, data: any) =>
    client.put(`/workspaces/${wsId}/products/${productId}`, data).then(unwrap),

  deleteProduct: (wsId: number, productId: string) =>
    client.delete(`/workspaces/${wsId}/products/${productId}`).then(unwrap),

  getInventoryValuation: (wsId: number) =>
    client.get(`/workspaces/${wsId}/products/valuation`).then(unwrap),

  // ── Customers ──
  getCustomers: (wsId: number) =>
    client.get(`/workspaces/${wsId}/customers`).then(unwrap),

  addCustomer: (wsId: number, data: any) =>
    client.post(`/workspaces/${wsId}/customers`, data).then(unwrap),

  getCustomer: (wsId: number, customerId: number) =>
    client.get(`/workspaces/${wsId}/customers/${customerId}`).then(unwrap),

  updateCustomer: (wsId: number, customerId: string, data: any) =>
    client.put(`/workspaces/${wsId}/customers/${customerId}`, data).then(unwrap),

  deleteCustomer: (wsId: number, customerId: string) =>
    client.delete(`/workspaces/${wsId}/customers/${customerId}`).then(unwrap),

  // ── Vendors ──
  getVendors: (wsId: number) =>
    client.get(`/workspaces/${wsId}/vendors`).then(unwrap),

  addVendor: (wsId: number, data: any) =>
    client.post(`/workspaces/${wsId}/vendors`, data).then(unwrap),

  updateVendor: (wsId: number, vendorId: string, data: any) =>
    client.put(`/workspaces/${wsId}/vendors/${vendorId}`, data).then(unwrap),

  deleteVendor: (wsId: number, vendorId: string) =>
    client.delete(`/workspaces/${wsId}/vendors/${vendorId}`).then(unwrap),

  // ── Transactions (expenses/income) ──
  getTransactions: (wsId: number) =>
    client.get(`/workspaces/${wsId}/transactions`).then(unwrap),

  addTransaction: (wsId: number, data: any) =>
    client.post(`/workspaces/${wsId}/transactions`, data).then(unwrap),

  // ── Receivables & Payables ──
  getReceivablesPayables: (wsId: number) =>
    client.get(`/workspaces/${wsId}/receivables-payables`).then(unwrap),

  addReceivablesPayables: (wsId: number, data: any) =>
    client.post(`/workspaces/${wsId}/receivables-payables`, data).then(unwrap),

  updateReceivablesPayablesStatus: (wsId: number, id: number, status: string) =>
    client.patch(`/workspaces/${wsId}/receivables-payables/${id}/status`, null, { params: { status } }).then(unwrap),

  // ── Dashboard ──
  getBusinessDashboard: (wsId: number) =>
    client.get(`/workspaces/${wsId}/dashboard/business`).then(unwrap),

  getPersonalDashboard: (wsId: number) =>
    client.get(`/workspaces/${wsId}/dashboard/personal`).then(unwrap),

  // ── Profile ──
  getProfile: () =>
    client.get('/profile').then(unwrap),

  updateProfile: (data: any) =>
    client.put('/profile', data).then(unwrap),

  updateSubscription: (planType: string) =>
    client.put('/profile/subscription', null, { params: { planType } }).then(unwrap),

  // ── Health ──
  getHealth: () =>
    client.get('/health').then(unwrap),
};
