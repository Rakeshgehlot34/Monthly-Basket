import React, { useState, useRef, useEffect } from 'react';
import {
  FileSpreadsheet,
  Calendar,
  Cloud,
  CloudOff,
  RefreshCw,
  Sun,
  Moon,
  Menu,
  Shield,
  ExternalLink,
  ChevronDown,
  HelpCircle,
  Plus,
  Zap,
  PieChart,
  LayoutDashboard,
  Receipt,
  Layers,
  Settings,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';

interface NavbarProps {
  onOpenGuidance: () => void;
  onOpenQuickLogModal: (sectionId: string) => void;
  onOpenAddTransactionModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenGuidance,
  onOpenQuickLogModal,
  onOpenAddTransactionModal,
}) => {
  const {
    user,
    role,
    setRole,
    isLoggedIn,
    isLoggingIn,
    loginWithGoogle,
    logout,
    spreadsheetUrl,
    syncStatus,
    lastSyncedAt,
    isOnline,
    pendingOfflineChanges,
    triggerManualSync,
    currentMonth,
    setCurrentMonth,
    theme,
    toggleTheme,
    isSidebarOpen,
    setIsSidebarOpen,
    activeTab,
    setActiveTab,
    topNavSections,
    sidebarSections,
  } = useApp();

  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showSyncMenu, setShowSyncMenu] = useState(false);
  const [showMonthMenu, setShowMonthMenu] = useState(false);
  const [showQuickLogMenu, setShowQuickLogMenu] = useState(false);

  // Month navigation options
  const monthsList = [
    { value: '2026-09', label: 'Sep 2026 (Current)' },
    { value: '2026-08', label: 'Aug 2026' },
    { value: '2026-07', label: 'Jul 2026' },
    { value: '2026-06', label: 'Jun 2026' },
    { value: '2026-10', label: 'Oct 2026 (Upcoming)' },
  ];

  const currentMonthLabel =
    monthsList.find((m) => m.value === currentMonth)?.label.split(' ')[0] +
    ' ' +
    currentMonth.split('-')[0];

  const handleRoleChange = (newRole: UserRole) => {
    setRole(newRole);
    setShowRoleMenu(false);
  };

  return (
    <header className="sticky top-0 z-30 bg-slate-900/95 dark:bg-slate-950/95 backdrop-blur-md border-b border-slate-800 text-white">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 h-16 flex items-center justify-between gap-2">
        {/* Left: Mobile Drawer Trigger & Brand Logo */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-1.5 sm:p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors lg:hidden"
            title="Toggle Sidebar"
            aria-label="Toggle navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-2 cursor-pointer select-none group"
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform flex-shrink-0">
              <FileSpreadsheet className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm sm:text-base tracking-tight text-white group-hover:text-emerald-400 transition-colors">
                  SpendSync
                </span>
                <span className="hidden xl:inline-block text-[10px] font-semibold uppercase px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Sheets DB
                </span>
              </div>
              <span className="text-[10px] text-slate-400 hidden sm:block -mt-0.5">
                Daily Finance & Budgets
              </span>
            </div>
          </div>
        </div>

        {/* Center: Main Navigation Tabs (Clean & Compact) */}
        <nav className="hidden md:flex items-center gap-0.5 lg:gap-1 bg-slate-800/70 p-1 rounded-xl border border-slate-700/60 flex-shrink-0">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-1 px-2.5 lg:px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'dashboard'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab('transactions')}
            className={`flex items-center gap-1 px-2.5 lg:px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'transactions'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
            }`}
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>Ledger</span>
          </button>

          <button
            onClick={() => setActiveTab('sections')}
            className={`flex items-center gap-1 px-2.5 lg:px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'sections'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Procurement</span>
          </button>

          <button
            onClick={() => setActiveTab('budgets')}
            className={`flex items-center gap-1 px-2.5 lg:px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'budgets'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
            }`}
          >
            <PieChart className="w-3.5 h-3.5 text-amber-400" />
            <span>Budgets</span>
          </button>

          {/* Pinned Quick Action Dropdown or Pinned Pills */}
          {topNavSections.length > 0 && (
            <div className="relative">
              <button
                onClick={() => setShowQuickLogMenu(!showQuickLogMenu)}
                className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium text-emerald-300 bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-500/30 transition-colors ml-1"
                title="Quick Log Daily Procurement Items"
              >
                <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span className="hidden xl:inline">Quick Log</span>
                <span className="text-[10px] px-1 rounded-full bg-emerald-500/30 font-bold">
                  {topNavSections.length}
                </span>
                <ChevronDown className="w-3 h-3" />
              </button>

              {showQuickLogMenu && (
                <div
                  className="absolute left-0 mt-2 w-56 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-2 z-50 text-xs"
                  onMouseLeave={() => setShowQuickLogMenu(false)}
                >
                  <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Pinned Daily Sections
                  </div>
                  {topNavSections.map((sec) => (
                    <button
                      key={sec.id}
                      onClick={() => {
                        onOpenQuickLogModal(sec.id);
                        setShowQuickLogMenu(false);
                      }}
                      className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-slate-800 transition-colors flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <Zap className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
                        <span className="text-slate-200 font-medium truncate">{sec.name}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {sec.unit}
                      </span>
                    </button>
                  ))}
                  <div className="pt-1 mt-1 border-t border-slate-800">
                    <button
                      onClick={() => {
                        setActiveTab('sections');
                        setShowQuickLogMenu(false);
                      }}
                      className="w-full text-center py-1 text-[11px] text-emerald-400 hover:underline"
                    >
                      Manage all sections →
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </nav>

        {/* Right: Controls, Actions, and User Account */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Quick Action: New Transaction Button */}
          <button
            onClick={onOpenAddTransactionModal}
            className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-900/40 transition-all active:scale-95 flex-shrink-0"
            title="Record New Transaction"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Entry</span>
          </button>

          {/* Month Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowMonthMenu(!showMonthMenu)}
              className="flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 transition-colors"
              title="Select Month"
            >
              <Calendar className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-mono text-xs">{currentMonthLabel}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {showMonthMenu && (
              <div
                className="absolute right-0 mt-2 w-52 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-2 z-50 text-xs"
                onMouseLeave={() => setShowMonthMenu(false)}
              >
                <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Select Financial Month
                </div>
                {monthsList.map((m) => (
                  <button
                    key={m.value}
                    onClick={() => {
                      setCurrentMonth(m.value);
                      setShowMonthMenu(false);
                    }}
                    className={`w-full text-left px-2.5 py-2 rounded-lg transition-colors flex items-center justify-between ${
                      currentMonth === m.value
                        ? 'bg-emerald-500/20 text-emerald-300 font-semibold'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span>{m.label}</span>
                    {currentMonth === m.value && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Cloud Sync Status Icon */}
          <div className="relative">
            <button
              onClick={() => setShowSyncMenu(!showSyncMenu)}
              className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg text-xs font-medium border transition-colors flex items-center gap-1.5 ${
                !isOnline
                  ? 'bg-amber-950/40 border-amber-800/50 text-amber-300'
                  : syncStatus === 'syncing'
                  ? 'bg-blue-950/40 border-blue-800/50 text-blue-300'
                  : syncStatus === 'synced' && spreadsheetUrl
                  ? 'bg-emerald-950/40 border-emerald-800/50 text-emerald-300'
                  : 'bg-slate-800 border-slate-700 text-slate-300'
              }`}
              title="Google Sheets Database Status"
            >
              {!isOnline ? (
                <CloudOff className="w-3.5 h-3.5 text-amber-400" />
              ) : syncStatus === 'syncing' ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-400" />
              ) : (
                <Cloud className="w-3.5 h-3.5 text-emerald-400" />
              )}
              <span className="hidden lg:inline text-[11px]">
                {!isOnline
                  ? 'Offline'
                  : syncStatus === 'syncing'
                  ? 'Syncing'
                  : spreadsheetUrl
                  ? 'Sheets Synced'
                  : 'Sheets DB'}
              </span>
            </button>

            {showSyncMenu && (
              <div
                className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-3 z-50 text-xs"
                onMouseLeave={() => setShowSyncMenu(false)}
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="font-semibold text-white flex items-center gap-1.5">
                    <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                    Google Sheets Database
                  </span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                      isOnline ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                    }`}
                  >
                    {isOnline ? 'Online' : 'Offline'}
                  </span>
                </div>

                <div className="py-2.5 space-y-1.5 text-slate-300">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-400">Sync Status:</span>
                    <span className="font-medium text-white capitalize">{syncStatus}</span>
                  </div>
                  {lastSyncedAt && (
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-400">Last Synced:</span>
                      <span className="text-slate-300">{lastSyncedAt.toLocaleTimeString()}</span>
                    </div>
                  )}
                  {pendingOfflineChanges > 0 && (
                    <div className="flex justify-between text-[11px] text-amber-400 font-semibold">
                      <span>Pending offline edits:</span>
                      <span>{pendingOfflineChanges}</span>
                    </div>
                  )}
                </div>

                {spreadsheetUrl ? (
                  <div className="pt-2 border-t border-slate-800 space-y-2">
                    <a
                      href={spreadsheetUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 text-xs font-semibold transition-colors"
                    >
                      <span>Open in Google Sheets</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                    <button
                      onClick={triggerManualSync}
                      className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs transition-colors"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Force Push & Pull</span>
                    </button>
                  </div>
                ) : (
                  <div className="pt-2 border-t border-slate-800">
                    <p className="text-[11px] text-slate-400 mb-2">
                      Connect your Google Account to automatically store and update records in your Google Spreadsheet.
                    </p>
                    <button
                      onClick={loginWithGoogle}
                      disabled={isLoggingIn}
                      className="w-full py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors"
                    >
                      {isLoggingIn ? 'Connecting...' : 'Connect Google Sheets'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* RBAC Role Selector */}
          <div className="relative">
            <button
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 transition-colors"
              title="Role-Based Access Control"
            >
              <Shield className="w-3.5 h-3.5 text-indigo-400" />
              <span className="capitalize font-semibold text-[11px] hidden sm:inline">{role}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {showRoleMenu && (
              <div
                className="absolute right-0 mt-2 w-52 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-2 z-50 text-xs"
                onMouseLeave={() => setShowRoleMenu(false)}
              >
                <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Role-Based Access Control
                </div>
                {(['admin', 'manager', 'staff'] as UserRole[]).map((r) => (
                  <button
                    key={r}
                    onClick={() => handleRoleChange(r)}
                    className={`w-full text-left px-2.5 py-2 rounded-lg transition-colors flex items-center justify-between ${
                      role === r
                        ? 'bg-indigo-500/20 text-indigo-300 font-semibold'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div>
                      <div className="capitalize">{r}</div>
                      <div className="text-[10px] text-slate-400 font-normal">
                        {r === 'admin'
                          ? 'Full CRUD & Budgets'
                          : r === 'manager'
                          ? 'Add/Edit, Section Pricing'
                          : 'Quick Daily Logger'}
                      </div>
                    </div>
                    {role === r && <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* User Guide Icon */}
          <button
            onClick={onOpenGuidance}
            className="p-1.5 sm:p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            title="User Guide & App Walkthrough"
          >
            <HelpCircle className="w-4 h-4 text-emerald-400" />
          </button>

          {/* Dark / Light Mode Toggle */}
          <button
            onClick={toggleTheme}
            className="p-1.5 sm:p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            title="Toggle Dark / Light Theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-300" />
            ) : (
              <Moon className="w-4 h-4 text-slate-300" />
            )}
          </button>

          {/* Google Auth Profile / Sign-In */}
          {isLoggedIn && user ? (
            <div className="flex items-center gap-1.5 pl-0.5 sm:pl-1">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'User'}
                  className="w-7 h-7 rounded-full border border-emerald-500"
                  title={user.email || ''}
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs">
                  {(user.displayName || user.email || 'U')[0].toUpperCase()}
                </div>
              )}
              <button
                onClick={logout}
                className="text-[11px] text-slate-400 hover:text-red-400 transition-colors hidden xl:block"
                title="Sign out"
              >
                Logout
              </button>
            </div>
          ) : (
            <button
              onClick={loginWithGoogle}
              disabled={isLoggingIn}
              className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-white text-slate-900 hover:bg-slate-100 text-xs font-semibold shadow transition-colors"
              title="Connect Google Sheets"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span className="hidden sm:inline">Connect</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
