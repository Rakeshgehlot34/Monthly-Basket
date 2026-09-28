import React, { useState } from 'react';
import {
  Settings,
  FileSpreadsheet,
  Cloud,
  RefreshCw,
  ExternalLink,
  Shield,
  Layers,
  DollarSign,
  Calendar,
  Sun,
  Moon,
  Trash2,
  Plus,
  HelpCircle,
  Database,
  Download,
  Upload,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';

interface SettingsViewProps {
  onOpenGuidance: () => void;
  onOpenAddSectionModal: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  onOpenGuidance,
  onOpenAddSectionModal,
}) => {
  const {
    user,
    role,
    setRole,
    isLoggedIn,
    loginWithGoogle,
    logout,
    spreadsheetId,
    spreadsheetUrl,
    syncStatus,
    lastSyncedAt,
    isOnline,
    pendingOfflineChanges,
    triggerManualSync,
    setCustomSpreadsheetId,
    currency,
    setCurrency,
    monthlyBudget,
    setMonthlyBudget,
    rolloverEnabled,
    setRolloverEnabled,
    dynamicSections,
    togglePinSection,
    deleteDynamicSection,
    categories,
    addCategory,
    theme,
    toggleTheme,
    setActiveTab,
    canEditSettings,
    canDelete,
  } = useApp();

  const [inputBudget, setInputBudget] = useState(String(monthlyBudget));
  const [customSheetInput, setCustomSheetInput] = useState(spreadsheetId || '');
  const [showCustomSheetInput, setShowCustomSheetInput] = useState(false);
  const [isSyncingManual, setIsSyncingManual] = useState(false);

  // New Category input
  const [newCatName, setNewCatName] = useState('');
  const [newCatType, setNewCatType] = useState<'expense' | 'income'>('expense');

  const handleSaveBudget = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(inputBudget);
    if (!isNaN(val) && val > 0) {
      setMonthlyBudget(val);
      alert('Monthly budget limit updated!');
    }
  };

  const handleManualSyncClick = async () => {
    try {
      setIsSyncingManual(true);
      await triggerManualSync();
    } finally {
      setIsSyncingManual(false);
    }
  };

  const handleApplyCustomSheet = async () => {
    if (!customSheetInput.trim()) return;
    await setCustomSpreadsheetId(customSheetInput.trim());
    setShowCustomSheetInput(false);
  };

  const handleAddCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    addCategory({
      name: newCatName.trim(),
      type: newCatType,
      icon: 'Tag',
      color: newCatType === 'expense' ? '#f43f5e' : '#10b981',
    });
    setNewCatName('');
  };

  // Export JSON
  const handleExportJSON = () => {
    const backupData = {
      exportedAt: new Date().toISOString(),
      currency,
      monthlyBudget,
      categories,
      dynamicSections,
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SpendSync_Settings_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-300">
      {/* Settings Header */}
      <div className="bg-slate-900/90 border border-slate-800 p-4 sm:p-5 rounded-2xl shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-white">Application Control & Settings</h1>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              Manage All
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure Google Sheets integration, dynamic sections, budget resets, RBAC roles, and offline sync.
          </p>
        </div>

        <button
          onClick={onOpenGuidance}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs font-semibold border border-slate-700 transition-colors self-start sm:self-auto"
        >
          <HelpCircle className="w-4 h-4" />
          <span>User Guidance Guide</span>
        </button>
      </div>

      {/* 1. GOOGLE SHEETS CLOUD DATABASE CONFIGURATION */}
      <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl shadow-lg space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Google Spreadsheet Database</h2>
              <p className="text-[11px] text-slate-400">
                All ledger entries & dynamic procurement sections persist in your personal spreadsheet.
              </p>
            </div>
          </div>

          <span
            className={`text-xs font-semibold px-2.5 py-1 rounded-full uppercase flex items-center gap-1.5 ${
              spreadsheetUrl
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
            }`}
          >
            <Cloud className="w-3.5 h-3.5" />
            <span>{spreadsheetUrl ? 'Connected' : 'Offline / Local'}</span>
          </span>
        </div>

        {/* Connection status details */}
        <div className="bg-slate-950/50 p-3.5 rounded-xl border border-slate-800/80 text-xs space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <span className="text-slate-400">Google Account:</span>
            <span className="text-white font-medium">
              {user ? user.email : 'Not signed in (Local demo storage mode)'}
            </span>
          </div>

          {spreadsheetId && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <span className="text-slate-400">Active Spreadsheet ID:</span>
              <span className="font-mono text-slate-300 truncate max-w-xs">{spreadsheetId}</span>
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <span className="text-slate-400">Sync Status:</span>
            <span className="capitalize text-emerald-400 font-semibold">{syncStatus}</span>
          </div>

          {lastSyncedAt && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <span className="text-slate-400">Last Synced to Cloud:</span>
              <span className="text-slate-300">{lastSyncedAt.toLocaleString()}</span>
            </div>
          )}

          {pendingOfflineChanges > 0 && (
            <div className="flex items-center justify-between text-amber-400 pt-1 border-t border-slate-800">
              <span className="flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Queued offline changes:</span>
              </span>
              <span className="font-bold">{pendingOfflineChanges} mutations</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {spreadsheetUrl ? (
            <>
              <a
                href={spreadsheetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md transition-colors"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Open in Google Sheets</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <button
                onClick={handleManualSyncClick}
                disabled={isSyncingManual || !isOnline}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors disabled:opacity-40"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncingManual ? 'animate-spin' : ''}`} />
                <span>Force Sync Now</span>
              </button>
            </>
          ) : (
            <button
              onClick={loginWithGoogle}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md transition-colors"
            >
              <Cloud className="w-4 h-4" />
              <span>Connect Google Sheets Database</span>
            </button>
          )}

          <button
            onClick={() => setShowCustomSheetInput(!showCustomSheetInput)}
            className="text-xs text-slate-400 hover:text-white px-3 py-2 rounded-xl hover:bg-slate-800 transition-colors ml-auto"
          >
            {showCustomSheetInput ? 'Cancel' : 'Use Custom Sheet ID'}
          </button>
        </div>

        {/* Custom Sheet ID Input */}
        {showCustomSheetInput && (
          <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-700 space-y-2 text-xs">
            <label className="block text-slate-300 font-semibold">
              Connect to an Existing Google Spreadsheet ID:
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={customSheetInput}
                onChange={(e) => setCustomSheetInput(e.target.value)}
                placeholder="e.g. 1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
                className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
              />
              <button
                onClick={handleApplyCustomSheet}
                className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors"
              >
                Link Sheet
              </button>
            </div>
            <p className="text-[11px] text-slate-500">
              Ensure the sheet is shared with or accessible by your Google account.
            </p>
          </div>
        )}
      </div>

      {/* 2. MONTHLY RESET & FINANCIAL BUDGET SETTINGS */}
      <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl shadow-lg space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800">
          <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">Monthly Reset & Budget Parameters</h2>
            <p className="text-[11px] text-slate-400">
              Spending limits, currency format, and month-to-month rollover rules.
            </p>
          </div>
        </div>

        <form onSubmit={handleSaveBudget} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          {/* Currency selection */}
          <div>
            <label className="block font-semibold text-slate-300 mb-1">Currency Symbol</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="₹">₹ - Indian Rupee (INR)</option>
              <option value="$">$ - US Dollar (USD)</option>
              <option value="€">€ - Euro (EUR)</option>
              <option value="£">£ - British Pound (GBP)</option>
              <option value="¥">¥ - Japanese Yen (JPY)</option>
              <option value="A$">A$ - Australian Dollar (AUD)</option>
              <option value="C$">C$ - Canadian Dollar (CAD)</option>
            </select>
          </div>

          {/* Monthly Budget limit */}
          <div>
            <label className="block font-semibold text-slate-300 mb-1">
              Monthly Budget Limit ({currency})
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                value={inputBudget}
                onChange={(e) => setInputBudget(e.target.value)}
                className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono font-bold focus:outline-none focus:border-emerald-500"
              />
              <button
                type="submit"
                className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-colors"
              >
                Save
              </button>
            </div>
          </div>

          {/* Rollover Toggle */}
          <div className="sm:col-span-2 bg-slate-950/40 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
            <div>
              <div className="font-semibold text-white">Rollover Surplus / Deficit</div>
              <div className="text-[11px] text-slate-400">
                Carry forward unspent savings or overspend deficit to the next month&apos;s starting balance.
              </div>
            </div>
            <input
              type="checkbox"
              checked={rolloverEnabled}
              onChange={(e) => setRolloverEnabled(e.target.checked)}
              className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
            />
          </div>

          {/* Link to Category Groups & Budgets */}
          <div className="sm:col-span-2 bg-emerald-950/20 p-3.5 rounded-xl border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="font-bold text-white flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                Category Groups & Estimated Budgets
              </div>
              <div className="text-[11px] text-slate-300">
                Set individual spending caps for each group (Procurement, Nursery, Logistics, Labour, Utilities, etc.)
              </div>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab('budgets')}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors self-start sm:self-auto"
            >
              Open Budgets Hub →
            </button>
          </div>
        </form>
      </div>

      {/* 3. DYNAMIC DAILY PROCUREMENT SECTION MANAGER */}
      <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl shadow-lg space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Dynamic Daily Procurement Sections</h2>
              <p className="text-[11px] text-slate-400">
                Manage which 2–3 items appear in top navigation vs remaining in the sidebar.
              </p>
            </div>
          </div>

          <button
            onClick={onOpenAddSectionModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Section</span>
          </button>
        </div>

        {/* Section List */}
        <div className="space-y-2 text-xs">
          {dynamicSections.map((sec, idx) => (
            <div
              key={sec.id}
              className="flex items-center justify-between p-3 rounded-xl bg-slate-800/60 border border-slate-700/60"
            >
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-lg bg-slate-700 text-slate-300 flex items-center justify-center text-xs font-mono font-bold">
                  {idx + 1}
                </span>
                <div>
                  <div className="font-semibold text-white flex items-center gap-2">
                    <span>{sec.name}</span>
                    {sec.isFavorite ? (
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-bold uppercase">
                        Top Nav
                      </span>
                    ) : (
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-700 text-slate-400">
                        Sidebar Only
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                    {currency}{sec.defaultUnitPrice} / {sec.unit}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => togglePinSection(sec.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-colors ${
                    sec.isFavorite
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      : 'bg-slate-700 text-slate-300 border-slate-600 hover:text-white'
                  }`}
                >
                  {sec.isFavorite ? 'In Top Nav' : 'Move to Top Nav'}
                </button>

                {canDelete && (
                  <button
                    onClick={() => deleteDynamicSection(sec.id)}
                    className="p-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 transition-colors"
                    title="Delete section"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. ROLE-BASED ACCESS CONTROL (RBAC) */}
      <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl shadow-lg space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">Role-Based Access Control (RBAC)</h2>
            <p className="text-[11px] text-slate-400">
              Enforce role permissions across team members and daily loggers.
            </p>
          </div>
        </div>

        {/* Role Switcher */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-2">Switch Active Role:</label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {(['admin', 'manager', 'staff'] as UserRole[]).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  role === r
                    ? 'bg-indigo-500/20 border-indigo-500/50 shadow-md shadow-indigo-950/40'
                    : 'bg-slate-800/60 border-slate-700/60 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-white capitalize">{r}</span>
                  {role === r && <CheckCircle2 className="w-4 h-4 text-indigo-400" />}
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  {r === 'admin'
                    ? 'Full CRUD, Budgets & Google Sheets Settings'
                    : r === 'manager'
                    ? 'Add/Edit, Update Unit Prices & Quantities'
                    : 'Quick Daily Procurement Logger Only'}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Permissions Table */}
        <div className="overflow-x-auto pt-2">
          <table className="w-full text-left text-xs border border-slate-800 rounded-xl overflow-hidden">
            <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="p-2.5">Capability</th>
                <th className="p-2.5 text-center">Admin</th>
                <th className="p-2.5 text-center">Manager</th>
                <th className="p-2.5 text-center">Staff Logger</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 bg-slate-900/40 text-slate-300 text-[11px]">
              <tr>
                <td className="p-2.5">Log Daily Unit Procurements</td>
                <td className="p-2.5 text-center text-emerald-400 font-bold">✓</td>
                <td className="p-2.5 text-center text-emerald-400 font-bold">✓</td>
                <td className="p-2.5 text-center text-emerald-400 font-bold">✓</td>
              </tr>
              <tr>
                <td className="p-2.5">Update Dynamic Unit Prices</td>
                <td className="p-2.5 text-center text-emerald-400 font-bold">✓</td>
                <td className="p-2.5 text-center text-emerald-400 font-bold">✓</td>
                <td className="p-2.5 text-center text-rose-400 font-bold">✗</td>
              </tr>
              <tr>
                <td className="p-2.5">Delete Transactions & Sections</td>
                <td className="p-2.5 text-center text-emerald-400 font-bold">✓</td>
                <td className="p-2.5 text-center text-rose-400 font-bold">✗</td>
                <td className="p-2.5 text-center text-rose-400 font-bold">✗</td>
              </tr>
              <tr>
                <td className="p-2.5">Configure Google Sheet & Budgets</td>
                <td className="p-2.5 text-center text-emerald-400 font-bold">✓</td>
                <td className="p-2.5 text-center text-rose-400 font-bold">✗</td>
                <td className="p-2.5 text-center text-rose-400 font-bold">✗</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. BACKUP & THEME */}
      <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl shadow-lg space-y-4">
        <h2 className="text-sm font-bold text-white pb-2 border-b border-slate-800">
          Data Management & Preferences
        </h2>

        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <div>
            <div className="font-semibold text-white">Visual Theme</div>
            <div className="text-[11px] text-slate-400">Current mode: {theme}</div>
          </div>
          <button
            onClick={toggleTheme}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
          >
            {theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-amber-300" /> : <Moon className="w-3.5 h-3.5 text-slate-300" />}
            <span>Toggle Theme</span>
          </button>
        </div>

        <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div>
            <div className="font-semibold text-white">Export Local Configuration Backup</div>
            <div className="text-[11px] text-slate-400">Save your categories, dynamic sections, and budgets as JSON</div>
          </div>
          <button
            onClick={handleExportJSON}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download JSON</span>
          </button>
        </div>
      </div>
    </div>
  );
};
