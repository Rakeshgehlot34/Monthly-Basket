export type TransactionType = 'expense' | 'income';

export type PaymentMethod = 'Cash' | 'UPI / GPay' | 'Bank Transfer' | 'Credit / Debit Card' | 'Other';

export interface Transaction {
  id: string;
  date: string; // YYYY-MM-DD
  month: string; // YYYY-MM (e.g. 2026-09)
  type: TransactionType;
  category: string;
  title: string;
  amount: number;
  paymentMethod: PaymentMethod;
  notes?: string;
  // Dynamic unit-based purchase fields
  sectionId?: string;
  unit?: string;
  quantity?: number;
  unitPrice?: number;
  // RBAC & metadata
  createdBy?: string;
  role?: UserRole;
  timestamp: number;
  synced?: boolean;
}

export interface DynamicSection {
  id: string;
  name: string;
  icon: string;
  color: string;
  unit: string; // e.g. "Liter", "Kg", "Bag", "Piece", "Box", "Hour", "Packet"
  defaultUnitPrice: number;
  isFavorite: boolean; // Pinned to top 2-3 navigation
  navOrder: number;
  createdAt: number;
  description?: string;
}

export interface CategoryGroup {
  id: string;
  name: string;
  type: TransactionType;
  color: string;
  icon?: string;
  description?: string;
}

export interface Category {
  id: string;
  name: string;
  type: TransactionType;
  icon: string;
  color: string;
  groupId?: string; // References CategoryGroup.id (optional)
  estimatedBudget?: number; // Optional category-level budget
}

export interface CategoryGroupBudget {
  groupId: string;
  month: string; // YYYY-MM
  estimatedBudget: number;
}

export type UserRole = 'admin' | 'manager' | 'staff';

export interface UserProfile {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  role: UserRole;
}

export interface BudgetConfig {
  month: string; // YYYY-MM
  overallBudget: number;
  rolloverEnabled: boolean;
  currencySymbol: string;
  groupBudgets?: Record<string, number>; // groupId -> estimatedBudget
}

export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'offline' | 'error';

export interface OfflineQueueItem {
  id: string;
  action: 'create_tx' | 'update_tx' | 'delete_tx' | 'create_sec' | 'update_sec' | 'delete_sec' | 'save_all';
  entity: 'transaction' | 'section' | 'budget';
  payload: any;
  timestamp: number;
}
