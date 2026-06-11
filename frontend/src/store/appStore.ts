import { create } from 'zustand';
import { api } from '../services/api';

export interface Notification {
  id: string;
  title: string;
  description: string;
  type: 'low_stock' | 'payment_due' | 'reminder_sent' | 'goal_achieved' | 'expense_alert';
  timestamp: string;
  read: boolean;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  stock: number;
  minStock: number;
  purchasePrice: number;
  sellingPrice: number;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  outstanding: number;
  lastPaymentDate: string;
}

export interface Vendor {
  id: string;
  name: string;
  service: string;
  amountOwed: number;
  dueDate: string;
}

export interface Receivable {
  id: string;
  customerName: string;
  amount: number;
  dueDate: string;
  daysRemaining: number;
  status: 'current' | 'warning' | 'urgent';
}

export interface Payable {
  id: string;
  vendorName: string;
  amount: number;
  dueDate: string;
  status: 'pending' | 'scheduled' | 'paid';
}

export interface Expense {
  id: string;
  amount: number;
  category: string;
  date: string;
  notes: string;
}

export interface Goal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
}

interface AppState {
  isAuthenticated: boolean;
  dataLoaded: boolean;
  theme: 'dark' | 'light';
  blobOpacity: number;
  accentHue: 'cyan' | 'emerald';
  user: {
    name: string;
    email: string;
    role: string;
    accountBalance: number;
    workspaceMode: 'business' | 'personal' | 'both';
  } | null;
  activeWorkspace: 'business' | 'personal';
  workspaceId: number | null;
  notifications: Notification[];
  inventory: Product[];
  customers: Customer[];
  vendors: Vendor[];
  receivables: Receivable[];
  payables: Payable[];
  expenses: Expense[];
  goals: Goal[];
  activeOverlay: 'notification' | 'profile' | 'assistant' | 'command' | 'modal' | null;

  login: (name: string, email: string, mode: 'business' | 'personal' | 'both', workspaceId?: number) => void;
  logout: () => void;
  setWorkspaceId: (id: number) => void;
  setTheme: (theme: 'dark' | 'light') => void;
  setBlobOpacity: (opacity: number) => void;
  setAccentHue: (hue: 'cyan' | 'emerald') => void;
  setActiveWorkspace: (workspace: 'business' | 'personal') => void;
  setActiveOverlay: (overlay: AppState['activeOverlay']) => void;
  markNotificationRead: (id: string) => Promise<void>;
  fetchAllData: () => Promise<void>;
  addProduct: (product: Omit<Product, 'id' | 'status'>) => Promise<void>;
  editProduct: (id: string, updated: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  addExpense: (expense: Omit<Expense, 'id'>) => Promise<void>;
  addGoal: (goal: Omit<Goal, 'id'>) => Promise<void>;
  updateGoalAmount: (id: string, amount: number) => Promise<void>;
  sendPaymentReminder: (receivableId: string) => Promise<void>;
  addCustomer: (customer: { name: string; email: string; phone?: string; outstanding?: number }) => Promise<void>;
  updateCustomer: (id: string, data: Partial<Customer>) => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;
}

export const useAppStore = create<AppState>((set) => ({
  isAuthenticated: false,
  dataLoaded: false,
  theme: (localStorage.getItem('nexora-theme') as 'dark' | 'light') || 'dark',
  blobOpacity: Number(localStorage.getItem('nexora-blob-opacity')) || 0.35,
  accentHue: (localStorage.getItem('nexora-accent-hue') as 'cyan' | 'emerald') || 'cyan',
  user: null,
  activeWorkspace: 'business',
  workspaceId: null,

  notifications: [],
  inventory: [],
  customers: [],
  vendors: [],
  receivables: [],
  payables: [],
  expenses: [],
  goals: [],
  activeOverlay: null,

  login: (name, email, mode, workspaceId) => set({
    isAuthenticated: true,
    user: { name, email, role: 'User', accountBalance: 0, workspaceMode: mode },
    activeWorkspace: mode === 'personal' ? 'personal' : 'business',
    workspaceId: workspaceId ?? null,
  }),

  setTheme: (theme) => {
    localStorage.setItem('nexora-theme', theme);
    set({ theme });
  },

  setBlobOpacity: (opacity) => {
    localStorage.setItem('nexora-blob-opacity', String(opacity));
    set({ blobOpacity: opacity });
  },

  setAccentHue: (hue) => {
    localStorage.setItem('nexora-accent-hue', hue);
    set({ accentHue: hue });
  },

  logout: () => set({
    isAuthenticated: false,
    user: null,
    dataLoaded: false,
    workspaceId: null,
    notifications: [],
    inventory: [],
    customers: [],
    vendors: [],
    receivables: [],
    payables: [],
    expenses: [],
    goals: [],
  }),

  setWorkspaceId: (id) => set({ workspaceId: id }),
  setActiveWorkspace: (workspace) => set({ activeWorkspace: workspace }),
  setActiveOverlay: (overlay) => set({ activeOverlay: overlay }),

  fetchAllData: async () => {
    try {
      const state = useAppStore.getState();
      const wsId = state.workspaceId;
      const mode = state.user?.workspaceMode || 'business';
      const isBusiness = mode === 'business' || mode === 'both';
      const isPersonal = mode === 'personal' || mode === 'both';
      if (!wsId) { set({ dataLoaded: true }); return; }

      const fetches: Promise<any>[] = [];
      if (isBusiness) {
        fetches.push(
          api.getProducts(wsId),
          api.getCustomers(wsId),
          api.getVendors(wsId),
          api.getReceivablesPayables(wsId),
        );
      }
      if (isPersonal) {
        fetches.push(
          api.getTransactions(wsId),
        );
      }

      const results = await Promise.all(fetches);
      const update: any = { dataLoaded: true };
      let idx = 0;
      if (isBusiness) {
        update.inventory = (results[idx++] || []).map((p: any) => ({
          id: String(p.id),
          name: p.name,
          sku: p.sku || '',
          category: p.category || '',
          stock: p.quantity ?? 0,
          minStock: p.threshold ?? 0,
          purchasePrice: Number(p.purchasePrice) || 0,
          sellingPrice: Number(p.sellingPrice) || 0,
          status: p.lowStock ? 'Low Stock' : 'In Stock',
        }));
        update.customers = (results[idx++] || []).map((c: any) => ({
          id: String(c.id),
          name: c.name,
          email: c.email || '',
          phone: c.phone,
          outstanding: Number(c.outstandingBalance) || 0,
          lastPaymentDate: '',
        }));
        update.vendors = (results[idx++] || []).map((v: any) => ({
          id: String(v.id),
          name: v.name,
          service: v.email || '',
          amountOwed: Number(v.amountOwed) || 0,
          dueDate: '',
        }));
        const rpList: any[] = results[idx++] || [];
        update.receivables = rpList
          .filter((r: any) => r.type === 'RECEIVABLE')
          .map((r: any) => ({
            id: String(r.id),
            customerName: r.partyName,
            amount: Number(r.amount) || 0,
            dueDate: r.dueDate || '',
            daysRemaining: 0,
            status: r.status === 'OVERDUE' ? 'urgent' : r.status === 'PAID' ? 'current' : 'warning',
          }));
        update.payables = rpList
          .filter((r: any) => r.type === 'PAYABLE')
          .map((r: any) => ({
            id: String(r.id),
            vendorName: r.partyName,
            amount: Number(r.amount) || 0,
            dueDate: r.dueDate || '',
            status: (r.status === 'PAID' ? 'paid' : r.status === 'OVERDUE' ? 'pending' : 'scheduled') as 'pending' | 'scheduled' | 'paid',
          }));
      }
      if (isPersonal) {
        update.expenses = (results[idx++] || []).map((t: any) => ({
          id: String(t.id),
          amount: Number(t.amount) || 0,
          category: t.category || '',
          date: t.date || '',
          notes: t.description || '',
        }));
        update.goals = [];
      }
      set(update);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      set({ dataLoaded: true });
    }
  },

  markNotificationRead: async (id) => {
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
    }));
  },

  addProduct: async (product) => {
    const wsId = useAppStore.getState().workspaceId;
    if (wsId) {
      try { await api.addProduct(wsId, product); } catch {}
    }
    const newProduct: Product = {
      ...product,
      id: Date.now().toString(),
      status: product.stock <= 0 ? 'Out of Stock' : product.stock <= product.minStock ? 'Low Stock' : 'In Stock',
    };
    set((state) => ({ inventory: [...state.inventory, newProduct] }));
  },

  editProduct: async (id, updated) => {
    const wsId = useAppStore.getState().workspaceId;
    if (wsId) {
      try { await api.updateProduct(wsId, id, updated); } catch {}
    }
    set((state) => ({
      inventory: state.inventory.map((p) => p.id === id ? { ...p, ...updated } : p),
    }));
  },

  deleteProduct: async (id) => {
    const wsId = useAppStore.getState().workspaceId;
    if (wsId) {
      try { await api.deleteProduct(wsId, id); } catch {}
    }
    set((state) => ({ inventory: state.inventory.filter((p) => p.id !== id) }));
  },

  addExpense: async (expense) => {
    set((state) => ({ expenses: [...state.expenses, expense as Expense] }));
  },

  addGoal: async (goal) => {
    set((state) => ({ goals: [...state.goals, goal as Goal] }));
  },

  updateGoalAmount: async (id, amount) => {
    set((state) => ({
      goals: state.goals.map((g) => g.id === id ? { ...g, currentAmount: amount } : g),
    }));
  },

  sendPaymentReminder: async (id) => {
    set((state) => ({
      notifications: [{ id: Date.now().toString(), title: 'Reminder Sent', description: `Payment reminder sent for receivable #${id}`, type: 'reminder_sent', timestamp: new Date().toISOString(), read: false }, ...state.notifications],
    }));
  },

  addCustomer: async (customer) => {
    const wsId = useAppStore.getState().workspaceId;
    if (wsId) {
      try { await api.addCustomer(wsId, customer); } catch {}
    }
    const newCustomer = { ...customer, id: Date.now().toString(), lastPaymentDate: new Date().toISOString() } as Customer;
    set((state) => ({
      customers: [...state.customers, newCustomer],
    }));
  },

  updateCustomer: async (id, data) => {
    const wsId = useAppStore.getState().workspaceId;
    if (wsId) {
      try { await api.updateCustomer(wsId, id, data); } catch {}
    }
    set((state) => ({
      customers: state.customers.map((c) => c.id === id ? { ...c, ...data } : c),
    }));
  },

  deleteCustomer: async (id) => {
    const wsId = useAppStore.getState().workspaceId;
    if (wsId) {
      try { await api.deleteCustomer(wsId, id); } catch {}
    }
    set((state) => ({
      customers: state.customers.filter((c) => c.id !== id),
    }));
  },
}));
