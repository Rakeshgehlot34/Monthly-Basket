import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User } from 'firebase/auth';
import {
  Transaction,
  DynamicSection,
  Category,
  CategoryGroup,
  UserRole,
  BudgetConfig,
  SyncStatus,
  OfflineQueueItem,
} from '../types';
import {
  DEFAULT_CATEGORIES,
  DEFAULT_CATEGORY_GROUPS,
  DEFAULT_GROUP_BUDGETS,
  DEFAULT_DYNAMIC_SECTIONS,
  INITIAL_TRANSACTIONS,
  DEFAULT_CURRENCY,
} from '../data/defaults';
import { initAuth, googleSignIn, logout as authLogout, getAccessToken } from '../services/auth';
import { GoogleSheetsService } from '../services/googleSheets';

interface AppContextType {
  // Auth & RBAC
  user: User | null;
  role: UserRole;
  setRole: (role: UserRole) => void;
  isLoggedIn: boolean;
  isLoggingIn: boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;

  // Cloud & Sync
  spreadsheetId: string | null;
  spreadsheetUrl: string | null;
  syncStatus: SyncStatus;
  lastSyncedAt: Date | null;
  isOnline: boolean;
  pendingOfflineChanges: number;
  triggerManualSync: () => Promise<void>;
  setCustomSpreadsheetId: (id: string) => Promise<void>;

  // Month & Financials
  currentMonth: string; // YYYY-MM
  setCurrentMonth: (month: string) => void;
  currency: string;
  setCurrency: (c: string) => void;
  monthlyBudget: number;
  setMonthlyBudget: (budget: number) => void;
  rolloverEnabled: boolean;
  setRolloverEnabled: (enabled: boolean) => void;

  // Category Groups & Estimated Group Budgets
  categoryGroups: CategoryGroup[];
  groupBudgets: Record<string, number>; // groupId -> estimatedBudget
  setGroupBudget: (groupId: string, budget: number) => void;
  addCategoryGroup: (grp: Omit<CategoryGroup, 'id'>) => void;
  updateCategoryGroup: (id: string, updates: Partial<CategoryGroup>) => void;
  deleteCategoryGroup: (id: string) => void;

  // Transactions CRUD
  transactions: Transaction[];
  currentMonthTransactions: Transaction[];
  addTransaction: (tx: Omit<Transaction, 'id' | 'timestamp' | 'month' | 'synced'> & { month?: string }) => Promise<void>;
  updateTransaction: (id: string, updates: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;

  // Dynamic Procurement Sections
  dynamicSections: DynamicSection[];
  topNavSections: DynamicSection[]; // first 2-3 pinned to navigation
  sidebarSections: DynamicSection[]; // remaining dynamic sections
  addDynamicSection: (sec: Omit<DynamicSection, 'id' | 'createdAt' | 'navOrder'>) => Promise<void>;
  updateDynamicSection: (id: string, updates: Partial<DynamicSection>) => Promise<void>;
  deleteDynamicSection: (id: string) => Promise<void>;
  quickLogSectionPurchase: (sectionId: string, quantity: number, customUnitPrice?: number, notes?: string) => Promise<void>;
  togglePinSection: (id: string) => void;

  // Categories
  categories: Category[];
  addCategory: (cat: Omit<Category, 'id'>) => void;
  updateCategory: (id: string, updates: Partial<Category>) => void;
  deleteCategory: (id: string) => void;

  // Theme & UI
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  activeTab: 'dashboard' | 'transactions' | 'sections' | 'budgets' | 'settings';
  setActiveTab: (tab: 'dashboard' | 'transactions' | 'sections' | 'budgets' | 'settings') => void;
  activeSectionDetailId: string | null;
  setActiveSectionDetailId: (id: string | null) => void;

  // Permissions helpers
  canDelete: boolean;
  canEditSettings: boolean;
  canManageSections: boolean;
  canViewFinancialTotals: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY_PREFIX = 'spendsync_v1_';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Current Month default (current YYYY-MM)
  const defaultMonth = new Date().toISOString().slice(0, 7);
  const [currentMonth, setCurrentMonth] = useState<string>(() => {
    return localStorage.getItem(LOCAL_STORAGE_KEY_PREFIX + 'month') || defaultMonth;
  });

  // Auth & RBAC
  const [user, setUser] = useState<User | null>(null);
  const [role, setRoleState] = useState<UserRole>(() => {
    return (localStorage.getItem(LOCAL_STORAGE_KEY_PREFIX + 'role') as UserRole) || 'admin';
  });
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Cloud & Sync
  const [spreadsheetId, setSpreadsheetId] = useState<string | null>(() => {
    return localStorage.getItem(LOCAL_STORAGE_KEY_PREFIX + 'sheet_id') || null;
  });
  const [spreadsheetUrl, setSpreadsheetUrl] = useState<string | null>(() => {
    return localStorage.getItem(LOCAL_STORAGE_KEY_PREFIX + 'sheet_url') || null;
  });
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [offlineQueue, setOfflineQueue] = useState<OfflineQueueItem[]>(() => {
    try {
      const q = localStorage.getItem(LOCAL_STORAGE_KEY_PREFIX + 'offline_queue');
      return q ? JSON.parse(q) : [];
    } catch {
      return [];
    }
  });

  // Financial data
  const [currency, setCurrencyState] = useState<string>(() => {
    return localStorage.getItem(LOCAL_STORAGE_KEY_PREFIX + 'currency') || DEFAULT_CURRENCY;
  });
  const [monthlyBudget, setMonthlyBudgetState] = useState<number>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY_PREFIX + 'budget_' + currentMonth);
    return saved ? Number(saved) : 50000;
  });
  const [rolloverEnabled, setRolloverEnabledState] = useState<boolean>(true);

  // Category Groups & Group Budgets
  const [categoryGroups, setCategoryGroups] = useState<CategoryGroup[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_PREFIX + 'category_groups');
      return saved ? JSON.parse(saved) : DEFAULT_CATEGORY_GROUPS;
    } catch {
      return DEFAULT_CATEGORY_GROUPS;
    }
  });

  const [groupBudgets, setGroupBudgets] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_PREFIX + 'group_budgets_' + currentMonth);
      return saved ? JSON.parse(saved) : DEFAULT_GROUP_BUDGETS;
    } catch {
      return DEFAULT_GROUP_BUDGETS;
    }
  });

  // Core Data
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_PREFIX + 'transactions');
      return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
    } catch {
      return INITIAL_TRANSACTIONS;
    }
  });

  const [dynamicSections, setDynamicSections] = useState<DynamicSection[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_PREFIX + 'sections');
      return saved ? JSON.parse(saved) : DEFAULT_DYNAMIC_SECTIONS;
    } catch {
      return DEFAULT_DYNAMIC_SECTIONS;
    }
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_PREFIX + 'categories');
      return saved ? JSON.parse(saved) : DEFAULT_CATEGORIES;
    } catch {
      return DEFAULT_CATEGORIES;
    }
  });

  // UI state
  const [theme, setThemeState] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem(LOCAL_STORAGE_KEY_PREFIX + 'theme') as 'light' | 'dark') || 'dark';
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'transactions' | 'sections' | 'budgets' | 'settings'>('dashboard');
  const [activeSectionDetailId, setActiveSectionDetailId] = useState<string | null>(null);

  // Apply dark mode class to HTML
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem(LOCAL_STORAGE_KEY_PREFIX + 'theme', theme);
  }, [theme]);

  // Online / offline listeners
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Auto flush offline queue
      flushOfflineQueue();
    };
    const handleOffline = () => {
      setIsOnline(false);
      setSyncStatus('offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Persist state changes locally
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_PREFIX + 'transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_PREFIX + 'sections', JSON.stringify(dynamicSections));
  }, [dynamicSections]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_PREFIX + 'categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_PREFIX + 'category_groups', JSON.stringify(categoryGroups));
  }, [categoryGroups]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_PREFIX + 'group_budgets_' + currentMonth, JSON.stringify(groupBudgets));
  }, [groupBudgets, currentMonth]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_PREFIX + 'offline_queue', JSON.stringify(offlineQueue));
  }, [offlineQueue]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_PREFIX + 'month', currentMonth);
  }, [currentMonth]);

  // Auth initialization
  useEffect(() => {
    const unsubscribe = initAuth(
      (authUser) => {
        setUser(authUser);
        if (authUser.email === 'shreeramnursery91@gmail.com') {
          setRoleState('admin');
        }
      },
      () => {
        setUser(null);
      }
    );
    return () => unsubscribe();
  }, []);

  // RBAC permissions computation
  const canDelete = role === 'admin';
  const canEditSettings = role === 'admin';
  const canManageSections = role === 'admin' || role === 'manager';
  const canViewFinancialTotals = role === 'admin' || role === 'manager';

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
    localStorage.setItem(LOCAL_STORAGE_KEY_PREFIX + 'role', newRole);
  };

  const setCurrency = (c: string) => {
    setCurrencyState(c);
    localStorage.setItem(LOCAL_STORAGE_KEY_PREFIX + 'currency', c);
  };

  const setMonthlyBudget = (b: number) => {
    setMonthlyBudgetState(b);
    localStorage.setItem(LOCAL_STORAGE_KEY_PREFIX + 'budget_' + currentMonth, String(b));
  };

  const setRolloverEnabled = (val: boolean) => {
    setRolloverEnabledState(val);
  };

  const toggleTheme = () => {
    setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const setGroupBudget = (groupId: string, budget: number) => {
    setGroupBudgets((prev) => ({
      ...prev,
      [groupId]: Math.max(0, budget),
    }));
  };

  const addCategoryGroup = (grp: Omit<CategoryGroup, 'id'>) => {
    const newGrp: CategoryGroup = {
      ...grp,
      id: `grp-${Date.now()}`,
    };
    setCategoryGroups((prev) => [...prev, newGrp]);
  };

  const updateCategoryGroup = (id: string, updates: Partial<CategoryGroup>) => {
    setCategoryGroups((prev) => prev.map((g) => (g.id === id ? { ...g, ...updates } : g)));
  };

  const deleteCategoryGroup = (id: string) => {
    if (!canDelete) {
      alert('Only admin can delete category groups');
      return;
    }
    setCategoryGroups((prev) => prev.filter((g) => g.id !== id));
  };

  // Sections navigation split: First 2-3 are set in navigation, remainder show in sidebar
  const sortedSections = [...dynamicSections].sort((a, b) => a.navOrder - b.navOrder);
  const favoriteSections = sortedSections.filter((s) => s.isFavorite);
  // Cap top navigation to max 3
  const topNavSections = favoriteSections.slice(0, 3);
  const topNavIds = new Set(topNavSections.map((s) => s.id));
  const sidebarSections = sortedSections.filter((s) => !topNavIds.has(s.id));

  // Transactions filtered for currently selected month
  const currentMonthTransactions = transactions.filter((tx) => tx.month === currentMonth);

  // Sync to Google Sheets
  const syncWithGoogleSheet = useCallback(
    async (
      currentTxList: Transaction[],
      currentSecList: DynamicSection[],
      showLoading = true
    ) => {
      const token = await getAccessToken();
      if (!token) {
        setSyncStatus('idle');
        return;
      }
      if (!isOnline) {
        setSyncStatus('offline');
        return;
      }

      try {
        if (showLoading) setSyncStatus('syncing');

        // Check if spreadsheet exists, or create one
        let targetId = spreadsheetId;
        let targetUrl = spreadsheetUrl;

        if (!targetId) {
          const initRes = await GoogleSheetsService.getOrCreateSpreadsheet(token);
          targetId = initRes.spreadsheetId;
          targetUrl = initRes.spreadsheetUrl;
          setSpreadsheetId(targetId);
          setSpreadsheetUrl(targetUrl);
          localStorage.setItem(LOCAL_STORAGE_KEY_PREFIX + 'sheet_id', targetId);
          localStorage.setItem(LOCAL_STORAGE_KEY_PREFIX + 'sheet_url', targetUrl);
        }

        // Batch sync transactions & sections
        await GoogleSheetsService.syncAllTransactions(token, targetId, currentTxList);
        await GoogleSheetsService.syncAllSections(token, targetId, currentSecList);
        await GoogleSheetsService.syncBudgets(token, targetId, {
          [currentMonth]: {
            month: currentMonth,
            overallBudget: monthlyBudget,
            currencySymbol: currency,
            rolloverEnabled,
            groupBudgets,
          },
        });

        setLastSyncedAt(new Date());
        setSyncStatus('synced');
        // Clear offline queue on full sync
        setOfflineQueue([]);
      } catch (err) {
        console.error('Sync failed:', err);
        setSyncStatus('error');
      }
    },
    [spreadsheetId, spreadsheetUrl, isOnline, currentMonth, monthlyBudget, currency, rolloverEnabled, groupBudgets]
  );

  const flushOfflineQueue = async () => {
    if (offlineQueue.length > 0) {
      await syncWithGoogleSheet(transactions, dynamicSections, true);
    }
  };

  const loginWithGoogle = async () => {
    try {
      setIsLoggingIn(true);
      const res = await googleSignIn();
      if (res) {
        setUser(res.user);
        setSyncStatus('syncing');

        // Check / Create sheet & Load data
        const initRes = await GoogleSheetsService.getOrCreateSpreadsheet(res.accessToken, spreadsheetId || undefined);
        setSpreadsheetId(initRes.spreadsheetId);
        setSpreadsheetUrl(initRes.spreadsheetUrl);
        localStorage.setItem(LOCAL_STORAGE_KEY_PREFIX + 'sheet_id', initRes.spreadsheetId);
        localStorage.setItem(LOCAL_STORAGE_KEY_PREFIX + 'sheet_url', initRes.spreadsheetUrl);

        if (!initRes.isNew) {
          // Attempt to pull cloud data if exists
          const cloudData = await GoogleSheetsService.loadAllData(res.accessToken, initRes.spreadsheetId);
          if (cloudData && cloudData.transactions.length > 0) {
            setTransactions(cloudData.transactions);
            if (cloudData.sections.length > 0) {
              setDynamicSections(cloudData.sections);
            }
          } else {
            // First time seeding sheet with current data
            await syncWithGoogleSheet(transactions, dynamicSections, false);
          }
        } else {
          // Push initial data
          await syncWithGoogleSheet(transactions, dynamicSections, false);
        }

        setLastSyncedAt(new Date());
        setSyncStatus('synced');
      }
    } catch (err: any) {
      console.error('Login failed:', err);
      setSyncStatus('error');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const logout = async () => {
    await authLogout();
    setUser(null);
    setSyncStatus('idle');
  };

  const triggerManualSync = async () => {
    await syncWithGoogleSheet(transactions, dynamicSections, true);
  };

  const setCustomSpreadsheetId = async (id: string) => {
    const token = await getAccessToken();
    setSpreadsheetId(id);
    localStorage.setItem(LOCAL_STORAGE_KEY_PREFIX + 'sheet_id', id);
    const url = `https://docs.google.com/spreadsheets/d/${id}/edit`;
    setSpreadsheetUrl(url);
    localStorage.setItem(LOCAL_STORAGE_KEY_PREFIX + 'sheet_url', url);

    if (token) {
      setSyncStatus('syncing');
      const cloudData = await GoogleSheetsService.loadAllData(token, id);
      if (cloudData && cloudData.transactions.length > 0) {
        setTransactions(cloudData.transactions);
        if (cloudData.sections.length > 0) {
          setDynamicSections(cloudData.sections);
        }
      }
      setSyncStatus('synced');
    }
  };

  // Transaction mutations
  const addTransaction = async (
    newTxData: Omit<Transaction, 'id' | 'timestamp' | 'month' | 'synced'> & { month?: string }
  ) => {
    const txMonth = newTxData.month || newTxData.date.slice(0, 7) || currentMonth;
    const newTx: Transaction = {
      ...newTxData,
      id: `tx-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      month: txMonth,
      timestamp: Date.now(),
      createdBy: user?.email || user?.displayName || 'User',
      role,
      synced: false,
    };

    const updatedList = [newTx, ...transactions];
    setTransactions(updatedList);

    if (!isOnline) {
      setOfflineQueue((prev) => [
        ...prev,
        { id: newTx.id, action: 'create_tx', entity: 'transaction', payload: newTx, timestamp: Date.now() },
      ]);
    } else {
      syncWithGoogleSheet(updatedList, dynamicSections, false);
    }
  };

  const updateTransaction = async (id: string, updates: Partial<Transaction>) => {
    const updatedList = transactions.map((t) => (t.id === id ? { ...t, ...updates, synced: false } : t));
    setTransactions(updatedList);

    if (!isOnline) {
      setOfflineQueue((prev) => [
        ...prev,
        { id, action: 'update_tx', entity: 'transaction', payload: updates, timestamp: Date.now() },
      ]);
    } else {
      syncWithGoogleSheet(updatedList, dynamicSections, false);
    }
  };

  const deleteTransaction = async (id: string) => {
    if (!canDelete) {
      alert('Permission Denied: Only Admin users can delete transaction entries.');
      return;
    }
    const updatedList = transactions.filter((t) => t.id !== id);
    setTransactions(updatedList);

    if (!isOnline) {
      setOfflineQueue((prev) => [
        ...prev,
        { id, action: 'delete_tx', entity: 'transaction', payload: { id }, timestamp: Date.now() },
      ]);
    } else {
      syncWithGoogleSheet(updatedList, dynamicSections, false);
    }
  };

  // Dynamic Procurement Section mutations
  const addDynamicSection = async (secData: Omit<DynamicSection, 'id' | 'createdAt' | 'navOrder'>) => {
    const newSection: DynamicSection = {
      ...secData,
      id: `sec-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      navOrder: dynamicSections.length + 1,
      createdAt: Date.now(),
    };

    const updated = [...dynamicSections, newSection];
    setDynamicSections(updated);

    if (!isOnline) {
      setOfflineQueue((prev) => [
        ...prev,
        { id: newSection.id, action: 'create_sec', entity: 'section', payload: newSection, timestamp: Date.now() },
      ]);
    } else {
      syncWithGoogleSheet(transactions, updated, false);
    }
  };

  const updateDynamicSection = async (id: string, updates: Partial<DynamicSection>) => {
    const updated = dynamicSections.map((s) => (s.id === id ? { ...s, ...updates } : s));
    setDynamicSections(updated);

    if (!isOnline) {
      setOfflineQueue((prev) => [
        ...prev,
        { id, action: 'update_sec', entity: 'section', payload: updates, timestamp: Date.now() },
      ]);
    } else {
      syncWithGoogleSheet(transactions, updated, false);
    }
  };

  const deleteDynamicSection = async (id: string) => {
    if (!canDelete) {
      alert('Permission Denied: Only Admin users can remove dynamic procurement sections.');
      return;
    }
    const updated = dynamicSections.filter((s) => s.id !== id);
    setDynamicSections(updated);

    if (!isOnline) {
      setOfflineQueue((prev) => [
        ...prev,
        { id, action: 'delete_sec', entity: 'section', payload: { id }, timestamp: Date.now() },
      ]);
    } else {
      syncWithGoogleSheet(transactions, updated, false);
    }
  };

  // Toggle favorite / pinned status for top navigation (max 3 allowed)
  const togglePinSection = (id: string) => {
    const target = dynamicSections.find((s) => s.id === id);
    if (!target) return;

    if (!target.isFavorite) {
      // Trying to pin
      const currentlyPinned = dynamicSections.filter((s) => s.isFavorite).length;
      if (currentlyPinned >= 3) {
        alert('Navigation Limit: You can only pin up to 3 sections to the top navigation. Unpin another section first, or view this section in the sidebar.');
        return;
      }
    }

    updateDynamicSection(id, { isFavorite: !target.isFavorite });
  };

  // Fast-log a daily procurement purchase (calculating unit price x quantity)
  const quickLogSectionPurchase = async (
    sectionId: string,
    quantity: number,
    customUnitPrice?: number,
    notes?: string
  ) => {
    const section = dynamicSections.find((s) => s.id === sectionId);
    if (!section) return;

    const unitPrice = customUnitPrice !== undefined ? customUnitPrice : section.defaultUnitPrice;
    const totalAmount = Math.round(quantity * unitPrice * 100) / 100;
    const today = new Date().toISOString().slice(0, 10);

    // If unit price changed, optionally update the section default
    if (customUnitPrice !== undefined && customUnitPrice !== section.defaultUnitPrice) {
      updateDynamicSection(sectionId, { defaultUnitPrice: customUnitPrice });
    }

    await addTransaction({
      date: today,
      type: 'expense',
      category: section.name,
      title: `${section.name} (${quantity} ${section.unit})`,
      amount: totalAmount,
      paymentMethod: 'UPI / GPay',
      notes: notes || `Quick logged: ${quantity} ${section.unit} @ ${currency}${unitPrice}/${section.unit}`,
      sectionId: section.id,
      unit: section.unit,
      quantity,
      unitPrice,
    });
  };

  const addCategory = (catData: Omit<Category, 'id'>) => {
    const newCat: Category = {
      ...catData,
      id: `cat-${Date.now()}`,
    };
    setCategories((prev) => [...prev, newCat]);
  };

  const updateCategory = (id: string, updates: Partial<Category>) => {
    setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
  };

  const deleteCategory = (id: string) => {
    if (!canDelete) {
      alert('Only admin can delete categories');
      return;
    }
    setCategories((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <AppContext.Provider
      value={{
        user,
        role,
        setRole,
        isLoggedIn: !!user,
        isLoggingIn,
        loginWithGoogle,
        logout,

        spreadsheetId,
        spreadsheetUrl,
        syncStatus,
        lastSyncedAt,
        isOnline,
        pendingOfflineChanges: offlineQueue.length,
        triggerManualSync,
        setCustomSpreadsheetId,

        currentMonth,
        setCurrentMonth,
        currency,
        setCurrency,
        monthlyBudget,
        setMonthlyBudget,
        rolloverEnabled,
        setRolloverEnabled,

        categoryGroups,
        groupBudgets,
        setGroupBudget,
        addCategoryGroup,
        updateCategoryGroup,
        deleteCategoryGroup,

        transactions,
        currentMonthTransactions,
        addTransaction,
        updateTransaction,
        deleteTransaction,

        dynamicSections,
        topNavSections,
        sidebarSections,
        addDynamicSection,
        updateDynamicSection,
        deleteDynamicSection,
        quickLogSectionPurchase,
        togglePinSection,

        categories,
        addCategory,
        updateCategory,
        deleteCategory,

        theme,
        toggleTheme,
        isSidebarOpen,
        setIsSidebarOpen,
        activeTab,
        setActiveTab,
        activeSectionDetailId,
        setActiveSectionDetailId,

        canDelete,
        canEditSettings,
        canManageSections,
        canViewFinancialTotals,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
