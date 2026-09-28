import React from 'react';
import {
  LayoutDashboard,
  Receipt,
  Layers,
  Settings,
  X,
  FileSpreadsheet,
  ExternalLink,
  Shield,
  HelpCircle,
  Pin,
  PinOff,
  Zap,
  Plus,
  Calendar,
  Sparkles,
  PieChart,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface SidebarProps {
  onOpenGuidance: () => void;
  onOpenQuickLogModal: (sectionId: string) => void;
  onOpenAddSectionModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  onOpenGuidance,
  onOpenQuickLogModal,
  onOpenAddSectionModal,
}) => {
  const {
    isSidebarOpen,
    setIsSidebarOpen,
    activeTab,
    setActiveTab,
    topNavSections,
    sidebarSections,
    dynamicSections,
    togglePinSection,
    currency,
    spreadsheetUrl,
    role,
    user,
    currentMonth,
    setCurrentMonth,
    canManageSections,
  } = useApp();

  if (!isSidebarOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity"
        onClick={() => setIsSidebarOpen(false)}
      />

      {/* Drawer */}
      <aside className="fixed inset-y-0 left-0 z-50 w-80 bg-slate-900 border-r border-slate-800 shadow-2xl flex flex-col text-slate-200">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-sm text-white">SpendSync Hub</h2>
              <p className="text-[11px] text-slate-400">Navigation & Dynamic Sections</p>
            </div>
          </div>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Main App Navigation */}
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              Core Modules
            </div>
            <div className="space-y-1">
              <button
                onClick={() => {
                  setActiveTab('dashboard');
                  setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                  activeTab === 'dashboard'
                    ? 'bg-emerald-500 text-white'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard & Analytics</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('transactions');
                  setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                  activeTab === 'transactions'
                    ? 'bg-emerald-500 text-white'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Receipt className="w-4 h-4" />
                <span>Monthly Transactions Ledger</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('sections');
                  setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                  activeTab === 'sections'
                    ? 'bg-emerald-500 text-white'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>Daily Procurement Hub</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('budgets');
                  setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                  activeTab === 'budgets'
                    ? 'bg-emerald-500 text-white'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <PieChart className="w-4 h-4 text-amber-400" />
                <span>Category Groups & Budgets</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('settings');
                  setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                  activeTab === 'settings'
                    ? 'bg-emerald-500 text-white'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Settings className="w-4 h-4" />
                <span>Settings & Sheet Config</span>
              </button>
            </div>
          </div>

          {/* DYNAMIC SECTIONS: Pinned vs Sidebar */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Zap className="w-3 h-3 text-amber-400" />
                <span>Dynamic Daily Procurement</span>
              </div>
              {canManageSections && (
                <button
                  onClick={() => {
                    setIsSidebarOpen(false);
                    onOpenAddSectionModal();
                  }}
                  className="text-[11px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-medium"
                >
                  <Plus className="w-3 h-3" />
                  <span>New</span>
                </button>
              )}
            </div>

            {/* Explanatory note */}
            <p className="text-[11px] text-slate-400 mb-3 bg-slate-800/50 p-2 rounded-lg border border-slate-800">
              The first 2–3 pinned items appear in the top navigation bar. Remaining items are accessible here in the sidebar.
            </p>

            {/* 1. Top Navigation Pinned Sections */}
            <div className="mb-3">
              <div className="text-[11px] font-semibold text-emerald-400 mb-1.5 flex items-center justify-between">
                <span>Top Navigation Items ({topNavSections.length}/3)</span>
                <span className="text-[10px] text-slate-400">Pinned to Top Bar</span>
              </div>
              <div className="space-y-1.5">
                {topNavSections.map((sec, idx) => (
                  <div
                    key={sec.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-emerald-950/20 border border-emerald-500/20 group hover:border-emerald-500/40 transition-colors"
                  >
                    <div
                      onClick={() => {
                        setIsSidebarOpen(false);
                        onOpenQuickLogModal(sec.id);
                      }}
                      className="flex-1 cursor-pointer flex items-center gap-2"
                    >
                      <div className="w-6 h-6 rounded-md bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold">
                        #{idx + 1}
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-white group-hover:text-emerald-300 transition-colors">
                          {sec.name}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {currency}
                          {sec.defaultUnitPrice} / {sec.unit}
                        </div>
                      </div>
                    </div>
                    {canManageSections && (
                      <button
                        onClick={() => togglePinSection(sec.id)}
                        className="p-1 rounded hover:bg-slate-800 text-emerald-400 hover:text-amber-400 transition-colors"
                        title="Unpin from top navigation (Move to sidebar)"
                      >
                        <PinOff className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* 2. Sidebar Remaining Sections */}
            <div>
              <div className="text-[11px] font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                <span>Remaining Sections ({sidebarSections.length})</span>
                <span className="text-[10px] text-slate-400">Sidebar Only</span>
              </div>
              {sidebarSections.length === 0 ? (
                <div className="text-center p-3 rounded-lg border border-dashed border-slate-800 text-[11px] text-slate-400">
                  No extra sections. All are pinned in top nav.
                </div>
              ) : (
                <div className="space-y-1.5">
                  {sidebarSections.map((sec) => (
                    <div
                      key={sec.id}
                      className="flex items-center justify-between p-2 rounded-lg bg-slate-800/60 border border-slate-700/60 group hover:border-slate-600 transition-colors"
                    >
                      <div
                        onClick={() => {
                          setIsSidebarOpen(false);
                          onOpenQuickLogModal(sec.id);
                        }}
                        className="flex-1 cursor-pointer flex items-center gap-2"
                      >
                        <div className="w-6 h-6 rounded-md bg-slate-700 text-slate-300 flex items-center justify-center text-xs">
                          •
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-slate-200 group-hover:text-white transition-colors">
                            {sec.name}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            {currency}
                            {sec.defaultUnitPrice} / {sec.unit}
                          </div>
                        </div>
                      </div>
                      {canManageSections && (
                        <button
                          onClick={() => togglePinSection(sec.id)}
                          className="p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-emerald-400 transition-colors"
                          title="Pin to top navigation"
                        >
                          <Pin className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Monthly Reset & Ledger Archives */}
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
              <Calendar className="w-3 h-3 text-emerald-400" />
              <span>Monthly Reset Ledger</span>
            </div>
            <div className="bg-slate-800/40 p-2.5 rounded-xl border border-slate-800 text-xs space-y-1.5">
              <div className="text-[11px] text-slate-400">
                Spends automatically reset each month with rolling balance history.
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="font-semibold text-emerald-400">Current Cycle:</span>
                <span className="font-mono text-white font-bold">{currentMonth}</span>
              </div>
            </div>
          </div>

          {/* RBAC Role & User Profile */}
          <div className="pt-2 border-t border-slate-800">
            <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-800/60 border border-slate-700/60">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
                <Shield className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-white capitalize flex items-center gap-1.5">
                  <span>{role} Mode</span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-indigo-500/30 text-indigo-300 font-mono">
                    RBAC
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 truncate">
                  {user ? user.email : 'Local Guest Session'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/50 space-y-2">
          {spreadsheetUrl && (
            <a
              href={spreadsheetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 text-xs font-semibold border border-emerald-500/30 transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Open in Google Sheets</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}

          <button
            onClick={() => {
              setIsSidebarOpen(false);
              onOpenGuidance();
            }}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
          >
            <HelpCircle className="w-4 h-4 text-emerald-400" />
            <span>App Guidance & FAQ</span>
          </button>
        </div>
      </aside>
    </>
  );
};
