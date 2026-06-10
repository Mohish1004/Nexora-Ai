import { create } from 'zustand';

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
  user: {
    name: string;
    email: string;
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
  
  // Actions
  login: (name: string, email: string, mode: 'business' | 'personal' | 'both') => void;
  logout: () => void;
  setActiveWorkspace: (workspace: 'business' | 'personal') => void;
  markNotificationRead: (id: string) => void;
  addProduct: (product: Omit<Product, 'id' | 'status'>) => void;
  editProduct: (id: string, updated: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  addExpense: (expense: Omit<Expense, 'id'>) => void;
  addGoal: (goal: Omit<Goal, 'id'>) => void;
  updateGoalAmount: (id: string, amount: number) => void;
  sendPaymentReminder: (receivableId: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  isAuthenticated: false,
  user: null,
  activeWorkspace: 'business',
  
  notifications: [
    {
      id: 'n1',
      title: 'Low Stock Alert: MacBook Pro M3',
      description: 'MacBook Pro M3 inventory is down to 2 units (Min: 5).',
      type: 'low_stock',
      timestamp: '10 minutes ago',
      read: false,
    },
    {
      id: 'n2',
      title: 'Payment Outstanding: TechCorp Solutions',
      description: 'Invoice #TX-4890 (₹28,000) is due in 2 days.',
      type: 'payment_due',
      timestamp: '2 hours ago',
      read: false,
    },
    {
      id: 'n3',
      title: 'Expense Warning: Food Delivery',
      description: 'You spent ₹5,400 on food delivery this week, exceeding your goal limits.',
      type: 'expense_alert',
      timestamp: '1 day ago',
      read: true,
    },
  ],

  inventory: [
    { id: 'p1', name: 'MacBook Pro M3 Max', sku: 'LAP-MBP-01', category: 'Laptops', stock: 12, minStock: 5, purchasePrice: 160000, sellingPrice: 220000, status: 'In Stock' },
    { id: 'p2', name: 'Dell XPS 15', sku: 'LAP-DEL-02', category: 'Laptops', stock: 3, minStock: 5, purchasePrice: 110000, sellingPrice: 150000, status: 'Low Stock' },
    { id: 'p3', name: 'iPhone 16 Pro', sku: 'PHN-IPH-03', category: 'Phones', stock: 25, minStock: 8, purchasePrice: 90000, sellingPrice: 120000, status: 'In Stock' },
    { id: 'p4', name: 'iPad Pro 11"', sku: 'TAB-IPA-04', category: 'Tablets', stock: 0, minStock: 4, purchasePrice: 65000, sellingPrice: 85000, status: 'Out of Stock' },
    { id: 'p5', name: 'Keychron K2 Keyboard', sku: 'ACC-KEY-05', category: 'Accessories', stock: 4, minStock: 10, purchasePrice: 6000, sellingPrice: 9000, status: 'Low Stock' },
  ],

  customers: [
    { id: 'c1', name: 'TechCorp Solutions', email: 'billing@techcorp.com', outstanding: 28000, lastPaymentDate: '2026-05-15' },
    { id: 'c2', name: 'Ananya Sharma', email: 'ananya@gmail.com', outstanding: 12000, lastPaymentDate: '2026-05-28' },
    { id: 'c3', name: 'GrowthScale Inc.', email: 'finance@growthscale.io', outstanding: 18000, lastPaymentDate: '2026-06-01' },
    { id: 'c4', name: 'Vikram Aditya', email: 'vikram@aditya.dev', outstanding: 0, lastPaymentDate: '2026-06-08' },
  ],

  vendors: [
    { id: 'v1', name: 'Amazon Web Services', service: 'Cloud Hosting', amountOwed: 45000, dueDate: '2026-06-15' },
    { id: 'v2', name: 'WeWork Spaces', service: 'Office Rent', amountOwed: 60000, dueDate: '2026-06-20' },
    { id: 'v3', name: 'Upwork Dev Team', service: 'Contractor Payroll', amountOwed: 80000, dueDate: '2026-06-12' },
  ],

  receivables: [
    { id: 'r1', customerName: 'TechCorp Solutions', amount: 28000, dueDate: '2026-06-12', daysRemaining: 2, status: 'urgent' },
    { id: 'r2', customerName: 'Ananya Sharma', amount: 12000, dueDate: '2026-06-18', daysRemaining: 8, status: 'current' },
    { id: 'r3', customerName: 'GrowthScale Inc.', amount: 18000, dueDate: '2026-06-14', daysRemaining: 4, status: 'warning' },
  ],

  payables: [
    { id: 'py1', vendorName: 'Amazon Web Services', amount: 45000, dueDate: '2026-06-15', status: 'pending' },
    { id: 'py2', vendorName: 'WeWork Spaces', amount: 60000, dueDate: '2026-06-20', status: 'scheduled' },
    { id: 'py3', vendorName: 'Upwork Dev Team', amount: 80000, dueDate: '2026-06-12', status: 'pending' },
  ],

  expenses: [
    { id: 'e1', amount: 1200, category: 'Food', date: '2026-06-08', notes: 'Dinner with colleagues' },
    { id: 'e2', amount: 4500, category: 'Travel', date: '2026-06-05', notes: 'Flight ticket booking' },
    { id: 'e3', amount: 800, category: 'Shopping', date: '2026-06-07', notes: 'Desk accessories' },
    { id: 'e4', amount: 3500, category: 'Bills', date: '2026-06-01', notes: 'Monthly broadband & electricity' },
  ],

  goals: [
    { id: 'g1', title: 'New Creator Setup', targetAmount: 120000, currentAmount: 85000, deadline: '2026-08-01' },
    { id: 'g2', title: 'Emergency Cash Reserves', targetAmount: 200000, currentAmount: 150000, deadline: '2026-12-31' },
    { id: 'g3', title: 'Investment Fund', targetAmount: 50000, currentAmount: 12000, deadline: '2026-07-15' },
  ],

  login: (name, email, mode) => set({
    isAuthenticated: true,
    user: { name, email, workspaceMode: mode },
    activeWorkspace: mode === 'personal' ? 'personal' : 'business',
  }),

  logout: () => set({
    isAuthenticated: false,
    user: null,
  }),

  setActiveWorkspace: (workspace) => set({ activeWorkspace: workspace }),

  markNotificationRead: (id) => set((state) => ({
    notifications: state.notifications.map((n) =>
      n.id === id ? { ...n, read: true } : n
    ),
  })),

  addProduct: (product) => set((state) => {
    const status = product.stock === 0
      ? 'Out of Stock'
      : product.stock <= product.minStock
        ? 'Low Stock'
        : 'In Stock';
    const newProduct: Product = {
      ...product,
      id: `p${state.inventory.length + 1}`,
      status,
    };
    return { inventory: [...state.inventory, newProduct] };
  }),

  editProduct: (id, updated) => set((state) => ({
    inventory: state.inventory.map((p) => {
      if (p.id === id) {
        const merged = { ...p, ...updated };
        const status = merged.stock === 0
          ? 'Out of Stock'
          : merged.stock <= merged.minStock
            ? 'Low Stock'
            : 'In Stock';
        return { ...merged, status };
      }
      return p;
    }),
  })),

  deleteProduct: (id) => set((state) => ({
    inventory: state.inventory.filter((p) => p.id !== id),
  })),

  addExpense: (expense) => set((state) => ({
    expenses: [
      ...state.expenses,
      { ...expense, id: `e${state.expenses.length + 1}` },
    ],
  })),

  addGoal: (goal) => set((state) => ({
    goals: [
      ...state.goals,
      { ...goal, id: `g${state.goals.length + 1}` },
    ],
  })),

  updateGoalAmount: (id, amount) => set((state) => ({
    goals: state.goals.map((g) =>
      g.id === id ? { ...g, currentAmount: Math.min(g.targetAmount, g.currentAmount + amount) } : g
    ),
  })),

  sendPaymentReminder: (id) => set((state) => {
    const target = state.receivables.find((r) => r.id === id);
    if (!target) return {};
    const newNotification: Notification = {
      id: `n${state.notifications.length + 1}`,
      title: `Reminder Sent to ${target.customerName}`,
      description: `Automated WhatsApp & Email notice dispatched for ₹${target.amount.toLocaleString()}.`,
      type: 'reminder_sent',
      timestamp: 'Just now',
      read: false,
    };
    return {
      notifications: [newNotification, ...state.notifications],
    };
  }),
}));
