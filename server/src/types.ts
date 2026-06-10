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

export interface OCRResult {
  vendor: string;
  amount: number;
  date: string;
  category: string;
  detectedItems: string[];
}

export interface User {
  name: string;
  email: string;
  workspaceMode: 'business' | 'personal' | 'both';
}
