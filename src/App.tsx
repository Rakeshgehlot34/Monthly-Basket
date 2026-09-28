import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { QuickLogModal } from './components/QuickLogModal';
import { TransactionModal } from './components/TransactionModal';
import { DynamicSectionModal } from './components/DynamicSectionModal';
import { UserGuidanceModal } from './components/UserGuidanceModal';
import { DashboardView } from './views/DashboardView';
import { TransactionsView } from './views/TransactionsView';
import { DynamicSectionsView } from './views/DynamicSectionsView';
import { BudgetsView } from './views/BudgetsView';
import { SettingsView } from './views/SettingsView';
import { Transaction, DynamicSection } from './types';
import {
  LayoutDashboard,
  Receipt,
  Layers,
  Settings,
  PlusCircle,
  Zap,
  PieChart,
} from 'lucide-react';

const AppContent: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    topNavSections,
  } = useApp();

  // Modals state
  const [isGuidanceOpen, setIsGuidanceOpen] = useState(false);
  const [quickLogSectionId, setQuickLogSectionId] = useState<string | null>(null);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [selectedTransactionToEdit, setSelectedTransactionToEdit] = useState<Transaction | null>(null);
  const [isSectionModalOpen, setIsSectionModalOpen] = useState(false);
  const [selectedSectionToEdit, setSelectedSectionToEdit] = useState<DynamicSection | null>(null);

  const handleOpenAddTransaction = () => {
    setSelectedTransactionToEdit(null);
    setIsTransactionModalOpen(true);
  };

  const handleEditTransaction = (tx: Transaction) => {
    setSelectedTransactionToEdit(tx);
    setIsTransactionModalOpen(true);
  };

  const handleOpenAddSection = () => {
    setSelectedSectionToEdit(null);
    setIsSectionModalOpen(true);
  };

  const handleEditSection = (sec: DynamicSection) => {
    setSelectedSectionToEdit(sec);
    setIsSectionModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        onOpenGuidance={() => setIsGuidanceOpen(true)}
        onOpenQuickLogModal={(id) => setQuickLogSectionId(id)}
        onOpenAddTransactionModal={handleOpenAddTransaction}
      />

      {/* Sidebar Drawer */}
      <Sidebar
        onOpenGuidance={() => setIsGuidanceOpen(true)}
        onOpenQuickLogModal={(id) => setQuickLogSectionId(id)}
        onOpenAddSectionModal={handleOpenAddSection}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 pb-20 md:pb-8">
        {activeTab === 'dashboard' && (
          <DashboardView
            onOpenAddTransactionModal={handleOpenAddTransaction}
            onOpenQuickLogModal={(id) => setQuickLogSectionId(id)}
            onOpenAddSectionModal={handleOpenAddSection}
            onSelectTransactionToEdit={handleEditTransaction}
          />
        )}

        {activeTab === 'transactions' && (
          <TransactionsView
            onOpenAddTransactionModal={handleOpenAddTransaction}
            onSelectTransactionToEdit={handleEditTransaction}
          />
        )}

        {activeTab === 'sections' && (
          <DynamicSectionsView
            onOpenAddSectionModal={handleOpenAddSection}
            onSelectSectionToEdit={handleEditSection}
            onOpenQuickLogModal={(id) => setQuickLogSectionId(id)}
          />
        )}

        {activeTab === 'budgets' && (
          <BudgetsView onOpenAddTransactionModal={handleOpenAddTransaction} />
        )}

        {activeTab === 'settings' && (
          <SettingsView
            onOpenGuidance={() => setIsGuidanceOpen(true)}
            onOpenAddSectionModal={handleOpenAddSection}
          />
        )}
      </main>

      {/* Mobile Floating Action & Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-slate-900/95 backdrop-blur-lg border-t border-slate-800 px-2 py-1.5 flex items-center justify-around">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center gap-0.5 text-[9px] font-semibold transition-colors ${
            activeTab === 'dashboard' ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Dashboard</span>
        </button>

        <button
          onClick={() => setActiveTab('transactions')}
          className={`flex flex-col items-center gap-0.5 text-[9px] font-semibold transition-colors ${
            activeTab === 'transactions' ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>Ledger</span>
        </button>

        {/* Center Quick Action button */}
        <button
          onClick={handleOpenAddTransaction}
          className="w-10 h-10 -mt-4 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-lg shadow-emerald-950/80 active:scale-95 transition-transform border-2 border-slate-900"
          title="Add Transaction"
        >
          <PlusCircle className="w-5 h-5" />
        </button>

        <button
          onClick={() => setActiveTab('budgets')}
          className={`flex flex-col items-center gap-0.5 text-[9px] font-semibold transition-colors ${
            activeTab === 'budgets' ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <PieChart className="w-4 h-4 text-amber-400" />
          <span>Budgets</span>
        </button>

        <button
          onClick={() => setActiveTab('sections')}
          className={`flex flex-col items-center gap-0.5 text-[9px] font-semibold transition-colors ${
            activeTab === 'sections' ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Procure</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`flex flex-col items-center gap-0.5 text-[9px] font-semibold transition-colors ${
            activeTab === 'settings' ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>More</span>
        </button>
      </div>

      {/* Modals */}
      <QuickLogModal
        sectionId={quickLogSectionId}
        onClose={() => setQuickLogSectionId(null)}
      />

      <TransactionModal
        isOpen={isTransactionModalOpen}
        initialTransaction={selectedTransactionToEdit}
        onClose={() => {
          setIsTransactionModalOpen(false);
          setSelectedTransactionToEdit(null);
        }}
      />

      <DynamicSectionModal
        isOpen={isSectionModalOpen}
        initialSection={selectedSectionToEdit}
        onClose={() => {
          setIsSectionModalOpen(false);
          setSelectedSectionToEdit(null);
        }}
      />

      <UserGuidanceModal
        isOpen={isGuidanceOpen}
        onClose={() => setIsGuidanceOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
