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
  user: {
    name: string;
    email: string;
    role: string;
    accountBalance: number;
    workspaceMode: 'business' | 'personal' | 'both';
  } | null;
  activeWorkspace: 'business' | 'personal';
  notifications: Notification[];
  inventory: Product[];
  customers: Customer[];
  vendors: Vendor[];
  receivables: Receivable[];
  payables: Payable[];
  expenses: Expense[];
  goals: Goal[];

  login: (name: string, email: string, mode: 'business' | 'personal' | 'both') => void;
  logout: () => void;
  setActiveWorkspace: (workspace: 'business' | 'personal') => void;
  fetchAllData: () => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
  addProduct: (product: Omit<Product, 'id' | 'status'>) => Promise<void>;
  editProduct: (id: string, updated: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  addExpense: (expense: Omit<Expense, 'id'>) => Promise<void>;
  addGoal: (goal: Omit<Goal, 'id'>) => Promise<void>;
  updateGoalAmount: (id: string, amount: number) => Promise<void>;
  sendPaymentReminder: (receivableId: string) => Promise<void>;
  addCustomer: (customer: { name: string; email: string; outstanding?: number }) => Promise<void>;
  updateCustomer: (id: string, data: Partial<Customer>) => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;
}

export const useAppStore = create<AppState>((set) => ({
  isAuthenticated: false,
  dataLoaded: false,
  user: null,
  activeWorkspace: 'business',

  notifications: [],
  inventory: [],
  customers: [],
  vendors: [],
  receivables: [],
  payables: [],
  expenses: [],
  goals: [],

  login: (name, email, mode) => set({
    isAuthenticated: true,
    user: { name, email, role: 'Standard User', accountBalance: 0, workspaceMode: mode },
    activeWorkspace: mode === 'personal' ? 'personal' : 'business',
  }),

  logout: () => set({
    isAuthenticated: false,
    user: null,
    dataLoaded: false,
    notifications: [],
    inventory: [],
    customers: [],
    vendors: [],
    receivables: [],
    payables: [],
    expenses: [],
    goals: [],
  }),

  setActiveWorkspace: (workspace) => set({ activeWorkspace: workspace }),

  fetchAllData: async () => {
    try {
      const state = useAppStore.getState();
      const mode = state.user?.workspaceMode || 'business';
      const isBusiness = mode === 'business' || mode === 'both';
      const isPersonal = mode === 'personal' || mode === 'both';

      const fetches: Promise<any>[] = [];
      if (isBusiness) {
        fetches.push(
          api.getInventory(),
          api.getCustomers(),
          api.getVendors(),
          api.getReceivables(),
          api.getPayables(),
        );
      }
      if (isPersonal) {
        fetches.push(
          api.getExpenses(),
          api.getGoals(),
        );
      }
      fetches.push(api.getNotifications());

      const results = await Promise.all(fetches);
      const update: any = { dataLoaded: true };
      let idx = 0;
      if (isBusiness) {
        update.inventory = results[idx++];
        update.customers = results[idx++];
        update.vendors = results[idx++];
        update.receivables = results[idx++];
        update.payables = results[idx++];
      }
      if (isPersonal) {
        update.expenses = results[idx++];
        update.goals = results[idx++];
      }
      update.notifications = results[idx];
      set(update);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  },

  markNotificationRead: async (id) => {
    await api.markNotificationRead(id);
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
    }));
  },

  addProduct: async (product) => {
    const newProduct = await api.addProduct(product);
    set((state) => ({ inventory: [...state.inventory, newProduct] }));
  },

  editProduct: async (id, updated) => {
    const updatedProduct = await api.updateProduct(id, updated);
    set((state) => ({
      inventory: state.inventory.map((p) => p.id === id ? updatedProduct : p),
    }));
  },

  deleteProduct: async (id) => {
    await api.deleteProduct(id);
    set((state) => ({ inventory: state.inventory.filter((p) => p.id !== id) }));
  },

  addExpense: async (expense) => {
    const newExpense = await api.addExpense(expense);
    set((state) => ({ expenses: [...state.expenses, newExpense] }));
  },

  addGoal: async (goal) => {
    const newGoal = await api.addGoal(goal);
    set((state) => ({ goals: [...state.goals, newGoal] }));
  },

  updateGoalAmount: async (id, amount) => {
    const updatedGoal = await api.saveToGoal(id, amount);
    set((state) => ({
      goals: state.goals.map((g) => g.id === id ? updatedGoal : g),
    }));
  },

  sendPaymentReminder: async (id) => {
    const result = await api.sendReminder(id);
    set((state) => ({
      notifications: [result.notification, ...state.notifications],
    }));
  },

  addCustomer: async (customer) => {
    const result = await api.addCustomer(customer);
    set((state) => ({
      customers: [...state.customers, result.customer],
      notifications: [result.notification, ...state.notifications],
    }));
  },

  updateCustomer: async (id, data) => {
    const updated = await api.updateCustomer(id, data);
    set((state) => ({
      customers: state.customers.map((c) => c.id === id ? updated : c),
    }));
  },

  deleteCustomer: async (id) => {
    await api.deleteCustomer(id);
    set((state) => ({
      customers: state.customers.filter((c) => c.id !== id),
    }));
  },
}));
