import React, { useMemo } from 'react';
import {
  TrendingDown,
  TrendingUp,
  Wallet,
  Calendar,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  PlusCircle,
  FileSpreadsheet,
  ExternalLink,
  ChevronRight,
  Clock,
  PieChart as PieChartIcon,
  BarChart3,
  Layers,
  AlertCircle,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface DashboardViewProps {
  onOpenAddTransactionModal: () => void;
  onOpenQuickLogModal: (sectionId: string) => void;
  onOpenAddSectionModal: () => void;
  onSelectTransactionToEdit: (tx: any) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onOpenAddTransactionModal,
  onOpenQuickLogModal,
  onOpenAddSectionModal,
  onSelectTransactionToEdit,
}) => {
  const {
    currentMonthTransactions,
    currentMonth,
    currency,
    monthlyBudget,
    dynamicSections,
    topNavSections,
    spreadsheetUrl,
    setActiveTab,
    deleteTransaction,
    categoryGroups,
    groupBudgets,
    categories,
    setGroupBudget,
    canDelete,
    canViewFinancialTotals,
  } = useApp();

  // Calculations for current month
  const metrics = useMemo(() => {
    let totalExpense = 0;
    let totalIncome = 0;
    const dailyMap: Record<number, number> = {};
    const categoryMap: Record<string, number> = {};
    const sectionMap: Record<string, { total: number; quantity: number; unit: string; name: string }> = {};
    const groupSpendingMap: Record<string, number> = {};

    categoryGroups.forEach((g) => {
      groupSpendingMap[g.id] = 0;
    });

    currentMonthTransactions.forEach((tx) => {
      const day = parseInt(tx.date.split('-')[2], 10) || 1;
      if (tx.type === 'expense') {
        totalExpense += tx.amount;
        dailyMap[day] = (dailyMap[day] || 0) + tx.amount;
        categoryMap[tx.category] = (categoryMap[tx.category] || 0) + tx.amount;

        const matchedCat = categories.find(
          (c) => c.name.toLowerCase() === tx.category.toLowerCase()
        );
        const groupId = matchedCat?.groupId || 'grp-admin-misc';
        groupSpendingMap[groupId] = (groupSpendingMap[groupId] || 0) + tx.amount;

        if (tx.sectionId) {
          if (!sectionMap[tx.sectionId]) {
            sectionMap[tx.sectionId] = {
              total: 0,
              quantity: 0,
              unit: tx.unit || 'units',
              name: tx.category,
            };
          }
          sectionMap[tx.sectionId].total += tx.amount;
          sectionMap[tx.sectionId].quantity += tx.quantity || 0;
        }
      } else {
        totalIncome += tx.amount;
      }
    });

    const netSavings = totalIncome - totalExpense;
    const daysInMonth = 30; // standard month cycle
    const currentDay = Math.min(new Date().getDate(), daysInMonth);
    const dailyAverage = currentDay > 0 ? totalExpense / currentDay : 0;
    const projectedSpend = dailyAverage * daysInMonth;
    const budgetPct = monthlyBudget > 0 ? Math.min(100, Math.round((totalExpense / monthlyBudget) * 100)) : 0;

    return {
      totalExpense,
      totalIncome,
      netSavings,
      dailyAverage,
      projectedSpend,
      budgetPct,
      dailyMap,
      categoryMap,
      sectionMap,
      groupSpendingMap,
      daysRemaining: Math.max(0, daysInMonth - currentDay),
      currentDay,
    };
  }, [currentMonthTransactions, monthlyBudget, categoryGroups, categories]);

  // Max daily spend for scaling the bar chart
  const maxDailySpend = useMemo(() => {
    let max = 500;
    Object.values(metrics.dailyMap).forEach((val) => {
      if (val > max) max = val;
    });
    return max;
  }, [metrics.dailyMap]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Monthly Reset Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-700/60 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold shadow-inner">
            <Calendar className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-extrabold text-white">
                Monthly Ledger: <span className="text-emerald-400 font-mono">{currentMonth}</span>
              </h1>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Live Cycle
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              Day {metrics.currentDay} of 30 • {metrics.daysRemaining} days remaining until monthly ledger reset
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {spreadsheetUrl && (
            <a
              href={spreadsheetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Open Sheet</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>
          )}
          <button
            onClick={onOpenAddTransactionModal}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-950/60 transition-all active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Transaction</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Spend */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Spent</span>
            <div className="w-7 h-7 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="my-2">
            <div className="text-xl sm:text-2xl font-extrabold text-white font-mono">
              {currency}{metrics.totalExpense.toLocaleString()}
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-[11px] text-slate-400">
              <span>Budget: {currency}{monthlyBudget.toLocaleString()}</span>
              <span className={`font-bold ${metrics.budgetPct > 90 ? 'text-rose-400' : 'text-emerald-400'}`}>
                ({metrics.budgetPct}%)
              </span>
            </div>
          </div>
          {/* Progress bar */}
          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                metrics.budgetPct > 90 ? 'bg-rose-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(metrics.budgetPct, 100)}%` }}
            />
          </div>
        </div>

        {/* Total Income */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Income</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="my-2">
            <div className="text-xl sm:text-2xl font-extrabold text-white font-mono">
              {currency}{metrics.totalIncome.toLocaleString()}
            </div>
            <div className="text-[11px] text-emerald-400/90 mt-1 flex items-center gap-1">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>Revenue this month</span>
            </div>
          </div>
          <div className="text-[10px] text-slate-500">Sales & client payments</div>
        </div>

        {/* Net Savings */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Net Cash Flow</span>
            <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="my-2">
            <div
              className={`text-xl sm:text-2xl font-extrabold font-mono ${
                metrics.netSavings >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {metrics.netSavings >= 0 ? '+' : ''}
              {currency}{metrics.netSavings.toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              {metrics.netSavings >= 0 ? 'Surplus / Savings' : 'Deficit / Over budget'}
            </div>
          </div>
          <div className="text-[10px] text-slate-500">Resets on 1st of month</div>
        </div>

        {/* Daily Average & Projected Spend */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Daily Burn Rate</span>
            <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="my-2">
            <div className="text-xl sm:text-2xl font-extrabold text-white font-mono">
              {currency}{Math.round(metrics.dailyAverage).toLocaleString()}
              <span className="text-xs text-slate-400 font-sans font-normal"> /day</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Projected: <span className="font-mono text-slate-200">{currency}{Math.round(metrics.projectedSpend).toLocaleString()}</span>
            </div>
          </div>
          <div className="text-[10px] text-slate-500">Based on past {metrics.currentDay} days</div>
        </div>
      </div>

      {/* DYNAMIC DAILY PROCUREMENT QUICK STRIP */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Daily Procurement Quick Log</h2>
              <p className="text-[11px] text-slate-400">
                1-tap fast logging for recurring units (Milk, Soil, Fuel, Labour, etc.)
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('sections')}
            className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
          >
            <span>View All Sections</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Dynamic section quick cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {topNavSections.map((sec, idx) => (
            <div
              key={sec.id}
              className="bg-slate-800/60 border border-slate-700/60 hover:border-emerald-500/50 rounded-xl p-3 flex items-center justify-between transition-all group"
            >
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 font-mono">
                    #{idx + 1} Nav
                  </span>
                  <span className="font-bold text-xs text-white group-hover:text-emerald-300 transition-colors">
                    {sec.name}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                  {currency}{sec.defaultUnitPrice} / {sec.unit}
                </div>
              </div>
              <button
                onClick={() => onOpenQuickLogModal(sec.id)}
                className="px-3 py-1.5 rounded-lg bg-emerald-600/30 hover:bg-emerald-600 text-emerald-300 hover:text-white text-xs font-semibold border border-emerald-500/30 transition-all flex items-center gap-1 shadow-sm"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Log</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* CATEGORY GROUPS & ESTIMATED BUDGET TRACKER */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-emerald-500 text-white flex items-center justify-center shadow-md">
              <PieChartIcon className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-white">Category Groups & Estimated Budgets</h2>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">
                  {currentMonth}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Track estimated monthly group budgets vs real-time spending
              </p>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('budgets')}
            className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 self-start sm:self-auto px-3 py-1.5 rounded-lg bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-500/30 transition-colors"
          >
            <span>Manage All Group Budgets</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Category Group Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {categoryGroups
            .filter((g) => g.type === 'expense')
            .slice(0, 6)
            .map((group) => {
              const budget = groupBudgets[group.id] || 0;
              const spent = metrics.groupSpendingMap[group.id] || 0;
              const pct = budget > 0 ? Math.round((spent / budget) * 100) : spent > 0 ? 100 : 0;
              const remaining = budget - spent;

              return (
                <div
                  key={group.id}
                  onClick={() => setActiveTab('budgets')}
                  className="bg-slate-800/50 hover:bg-slate-800/80 border border-slate-700/60 hover:border-slate-600 rounded-xl p-3.5 transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2 truncate">
                        <span
                          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: group.color }}
                        />
                        <span className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors truncate">
                          {group.name}
                        </span>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.2 rounded font-mono ${
                          pct > 100
                            ? 'bg-rose-500/20 text-rose-400'
                            : pct > 80
                            ? 'bg-amber-500/20 text-amber-400'
                            : 'bg-emerald-500/20 text-emerald-400'
                        }`}
                      >
                        {pct}%
                      </span>
                    </div>

                    <div className="flex items-baseline justify-between text-xs my-1">
                      <span className="font-mono text-white font-bold">
                        {currency}{spent.toLocaleString()}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        Budget: {currency}{budget.toLocaleString()}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden my-1.5">
                      <div
                        className={`h-full rounded-full transition-all ${
                          pct > 100
                            ? 'bg-rose-500'
                            : pct > 80
                            ? 'bg-amber-400'
                            : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min(pct, 100)}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[10px] pt-1 text-slate-400">
                    <span className={remaining < 0 ? 'text-rose-400 font-semibold' : 'text-slate-400'}>
                      {remaining < 0
                        ? `Over by ${currency}${Math.abs(remaining).toLocaleString()}`
                        : `${currency}${remaining.toLocaleString()} left`}
                    </span>
                    <span className="text-emerald-400 group-hover:underline flex items-center gap-0.5">
                      Edit limit →
                    </span>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* ANALYTICS CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Daily Spending Trend Chart */}
        <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-emerald-400" />
              <h2 className="text-sm font-bold text-white">Daily Spending Trend (Day 1 - 30)</h2>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">
              Peak: {currency}{Math.round(maxDailySpend)}
            </span>
          </div>

          {/* Bar Chart Visualization */}
          <div className="h-44 flex items-end gap-1 sm:gap-1.5 pt-4 pb-2 border-b border-slate-800">
            {Array.from({ length: 30 }, (_, i) => i + 1).map((day) => {
              const spent = metrics.dailyMap[day] || 0;
              const heightPct = maxDailySpend > 0 ? (spent / maxDailySpend) * 100 : 0;
              const isToday = day === metrics.currentDay;

              return (
                <div
                  key={day}
                  className="flex-1 flex flex-col items-center group relative h-full justify-end"
                >
                  {/* Tooltip on hover */}
                  {spent > 0 && (
                    <div className="absolute -top-7 hidden group-hover:flex bg-slate-950 text-white text-[10px] font-mono py-0.5 px-1.5 rounded border border-slate-700 pointer-events-none whitespace-nowrap z-20 shadow-lg">
                      Day {day}: {currency}{spent}
                    </div>
                  )}

                  {/* The bar */}
                  <div
                    className={`w-full rounded-t-sm transition-all duration-300 ${
                      isToday
                        ? 'bg-amber-400 shadow-sm shadow-amber-400/50'
                        : spent > 0
                        ? 'bg-emerald-500 hover:bg-emerald-400'
                        : 'bg-slate-800/40'
                    }`}
                    style={{
                      height: spent > 0 ? `${Math.max(8, heightPct)}%` : '4px',
                    }}
                  />

                  {/* Day label on bottom (show every 5 days or today) */}
                  {(day === 1 || day % 5 === 0 || isToday) && (
                    <span
                      className={`text-[9px] mt-1 font-mono ${
                        isToday ? 'text-amber-400 font-bold' : 'text-slate-500'
                      }`}
                    >
                      {day}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-3">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
                <span>Daily Spend</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-amber-400" />
                <span>Today (Day {metrics.currentDay})</span>
              </span>
            </div>
            <span className="font-mono">Google Sheet Synced</span>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <PieChartIcon className="w-4 h-4 text-emerald-400" />
              <h2 className="text-sm font-bold text-white">Category Breakdown</h2>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">
              {Object.keys(metrics.categoryMap).length} categories
            </span>
          </div>

          <div className="space-y-3 overflow-y-auto max-h-56 pr-1">
            {Object.keys(metrics.categoryMap).length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400">
                No expense entries logged for this month yet.
              </div>
            ) : (
              Object.entries(metrics.categoryMap)
                .sort((a, b) => b[1] - a[1])
                .map(([catName, amount]) => {
                  const share =
                    metrics.totalExpense > 0 ? Math.round((amount / metrics.totalExpense) * 100) : 0;
                  return (
                    <div key={catName} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-300 font-medium truncate max-w-[150px]">{catName}</span>
                        <div className="text-right font-mono">
                          <span className="text-white font-bold">{currency}{amount.toLocaleString()}</span>
                          <span className="text-slate-400 text-[10px] ml-1.5">({share}%)</span>
                        </div>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-emerald-500"
                          style={{ width: `${share}%` }}
                        />
                      </div>
                    </div>
                  );
                })
            )}
          </div>

          <button
            onClick={() => setActiveTab('transactions')}
            className="w-full mt-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors flex items-center justify-center gap-1"
          >
            <span>View Full Ledger</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* RECENT TRANSACTIONS TABLE */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-white">Recent Transactions ({currentMonth})</h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
              {currentMonthTransactions.length} total
            </span>
          </div>
          <button
            onClick={() => setActiveTab('transactions')}
            className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold"
          >
            See All Transactions →
          </button>
        </div>

        {currentMonthTransactions.length === 0 ? (
          <div className="text-center py-10 bg-slate-950/40 rounded-xl border border-dashed border-slate-800 space-y-2">
            <AlertCircle className="w-8 h-8 text-slate-500 mx-auto" />
            <p className="text-xs text-slate-400">No records found for {currentMonth}.</p>
            <button
              onClick={onOpenAddTransactionModal}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold"
            >
              Record First Entry
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-semibold pb-2">
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Description / Title</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Unit & Qty</th>
                  <th className="py-2.5 px-3">Payment</th>
                  <th className="py-2.5 px-3 text-right">Amount</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {currentMonthTransactions.slice(0, 6).map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-2.5 px-3 font-mono text-slate-400 whitespace-nowrap">
                      {tx.date}
                    </td>
                    <td className="py-2.5 px-3 font-medium text-white max-w-[200px] truncate">
                      {tx.title}
                    </td>
                    <td className="py-2.5 px-3 text-slate-300 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[11px]">
                        {tx.category}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-400 font-mono text-[11px] whitespace-nowrap">
                      {tx.quantity !== undefined ? (
                        <span className="text-amber-300/90 font-semibold">
                          {tx.quantity} {tx.unit}
                        </span>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-slate-400 whitespace-nowrap text-[11px]">
                      {tx.paymentMethod}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold whitespace-nowrap">
                      <span
                        className={
                          tx.type === 'income' ? 'text-emerald-400' : 'text-slate-100'
                        }
                      >
                        {tx.type === 'income' ? '+' : '-'}
                        {currency}{tx.amount.toLocaleString()}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onSelectTransactionToEdit(tx)}
                          className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px]"
                        >
                          Edit
                        </button>
                        {canDelete && (
                          <button
                            onClick={() => deleteTransaction(tx.id)}
                            className="px-2 py-1 rounded bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 text-[10px]"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
