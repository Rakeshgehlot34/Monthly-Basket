import React, { useState } from 'react';
import {
  PieChart,
  PlusCircle,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Edit2,
  Trash2,
  Layers,
  Sparkles,
  ChevronRight,
  FolderPlus,
  Plus,
  ArrowUpRight,
  ShieldAlert,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CategoryGroup, Category } from '../types';

interface BudgetsViewProps {
  onOpenAddTransactionModal: () => void;
}

export const BudgetsView: React.FC<BudgetsViewProps> = ({ onOpenAddTransactionModal }) => {
  const {
    currentMonth,
    currency,
    categoryGroups,
    groupBudgets,
    setGroupBudget,
    addCategoryGroup,
    updateCategoryGroup,
    deleteCategoryGroup,
    categories,
    addCategory,
    deleteCategory,
    currentMonthTransactions,
    monthlyBudget,
    setMonthlyBudget,
    canDelete,
    canEditSettings,
  } = useApp();

  // State for Add / Edit Category Group Modal
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<CategoryGroup | null>(null);
  const [groupName, setGroupName] = useState('');
  const [groupType, setGroupType] = useState<'expense' | 'income'>('expense');
  const [groupColor, setGroupColor] = useState('#06b6d4');
  const [groupDesc, setGroupDesc] = useState('');
  const [initialGroupBudget, setInitialGroupBudget] = useState('10000');

  // State for Add Category Modal
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [catName, setCatName] = useState('');
  const [catType, setCatType] = useState<'expense' | 'income'>('expense');
  const [catGroupId, setCatGroupId] = useState('');
  const [catColor, setCatColor] = useState('#10b981');
  const [catEstimatedBudget, setCatEstimatedBudget] = useState('2000');

  // Active tab inside BudgetsView: 'groups' | 'categories'
  const [subTab, setSubTab] = useState<'groups' | 'categories'>('groups');
  const [searchQuery, setSearchQuery] = useState('');

  // Editing inline budget state
  const [editingBudgetId, setEditingBudgetId] = useState<string | null>(null);
  const [inlineBudgetValue, setInlineBudgetValue] = useState<string>('');

  // Compute spending per category and per group for currentMonth
  const categorySpendingMap: Record<string, number> = {};
  currentMonthTransactions.forEach((tx) => {
    if (tx.type === 'expense') {
      categorySpendingMap[tx.category] = (categorySpendingMap[tx.category] || 0) + tx.amount;
    }
  });

  // Calculate Group Spending
  // A category belongs to a group via cat.groupId. If a transaction has a category, we find that category's groupId.
  const groupSpendingMap: Record<string, number> = {};
  const groupTxCountMap: Record<string, number> = {};

  currentMonthTransactions.forEach((tx) => {
    if (tx.type === 'expense') {
      // Find category definition
      const matchedCat = categories.find(
        (c) => c.name.toLowerCase() === tx.category.toLowerCase()
      );
      const groupId = matchedCat?.groupId || 'grp-admin-misc';
      groupSpendingMap[groupId] = (groupSpendingMap[groupId] || 0) + tx.amount;
      groupTxCountMap[groupId] = (groupTxCountMap[groupId] || 0) + 1;
    }
  });

  const totalExpense = currentMonthTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalAllocatedGroupBudgets = Object.entries(groupBudgets).reduce(
    (sum, [groupId, val]) => {
      // only count expense groups
      const grp = categoryGroups.find((g) => g.id === groupId);
      if (!grp || grp.type === 'expense') {
        return sum + (Number(val) || 0);
      }
      return sum;
    },
    0
  );

  const overallBudgetPct =
    totalAllocatedGroupBudgets > 0
      ? Math.round((totalExpense / totalAllocatedGroupBudgets) * 100)
      : 0;

  // Handlers for Group Modal
  const handleOpenAddGroup = () => {
    setEditingGroup(null);
    setGroupName('');
    setGroupType('expense');
    setGroupColor('#06b6d4');
    setGroupDesc('');
    setInitialGroupBudget('10000');
    setIsGroupModalOpen(true);
  };

  const handleOpenEditGroup = (grp: CategoryGroup) => {
    setEditingGroup(grp);
    setGroupName(grp.name);
    setGroupType(grp.type);
    setGroupColor(grp.color);
    setGroupDesc(grp.description || '');
    setInitialGroupBudget(String(groupBudgets[grp.id] || 0));
    setIsGroupModalOpen(true);
  };

  const handleSaveGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName.trim()) return;

    if (editingGroup) {
      updateCategoryGroup(editingGroup.id, {
        name: groupName.trim(),
        type: groupType,
        color: groupColor,
        description: groupDesc.trim() || undefined,
      });
      if (initialGroupBudget !== '') {
        setGroupBudget(editingGroup.id, Number(initialGroupBudget) || 0);
      }
    } else {
      addCategoryGroup({
        name: groupName.trim(),
        type: groupType,
        color: groupColor,
        description: groupDesc.trim() || undefined,
      });
      // Context will assign an ID; if user entered initial budget, it can be updated
    }
    setIsGroupModalOpen(false);
  };

  // Handlers for Category Modal
  const handleOpenAddCategory = (defaultGroupId?: string) => {
    setCatName('');
    setCatType('expense');
    setCatGroupId(defaultGroupId || categoryGroups[0]?.id || '');
    setCatColor('#10b981');
    setCatEstimatedBudget('2500');
    setIsCategoryModalOpen(true);
  };

  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) return;

    addCategory({
      name: catName.trim(),
      type: catType,
      color: catColor,
      groupId: catGroupId || undefined,
      icon: 'Tag',
      estimatedBudget: parseFloat(catEstimatedBudget) || undefined,
    });

    setIsCategoryModalOpen(false);
  };

  const handleStartEditBudget = (groupId: string, currentVal: number) => {
    setEditingBudgetId(groupId);
    setInlineBudgetValue(String(currentVal || 0));
  };

  const handleSaveInlineBudget = (groupId: string) => {
    const parsed = parseFloat(inlineBudgetValue);
    if (!isNaN(parsed) && parsed >= 0) {
      setGroupBudget(groupId, parsed);
    }
    setEditingBudgetId(null);
  };

  const filteredGroups = categoryGroups.filter(
    (g) =>
      g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (g.description && g.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredCategories = categories.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.groupId &&
        categoryGroups
          .find((g) => g.id === c.groupId)
          ?.name.toLowerCase()
          .includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/90 border border-slate-800 p-4 sm:p-5 rounded-2xl shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <PieChart className="w-4 h-4" />
            </div>
            <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              Category Groups & Estimated Budgets
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Group your expenses, set monthly spending limits, and track real-time consumption for {currentMonth}.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => handleOpenAddCategory()}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-400" />
            <span>Add Category</span>
          </button>

          <button
            onClick={handleOpenAddGroup}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-900/40 transition-colors"
          >
            <FolderPlus className="w-4 h-4" />
            <span>New Group</span>
          </button>
        </div>
      </div>

      {/* Overview Analytics Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
        {/* Total Allocated Budgets */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-sm">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Total Estimated Group Budgets
          </span>
          <div className="text-2xl font-mono font-extrabold text-white">
            {currency}{totalAllocatedGroupBudgets.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
            <span>Overall Cap: {currency}{monthlyBudget.toLocaleString()}</span>
            <span className="text-emerald-400 font-medium">
              {totalAllocatedGroupBudgets <= monthlyBudget ? 'Within Overall Budget' : 'Exceeds Cap'}
            </span>
          </div>
        </div>

        {/* Current Month Spending */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-sm">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Total Expenses Spent
          </span>
          <div className="text-2xl font-mono font-extrabold text-rose-400">
            {currency}{totalExpense.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {overallBudgetPct}% of estimated budget used ({currency}
            {Math.max(0, totalAllocatedGroupBudgets - totalExpense).toLocaleString()} remaining)
          </div>
        </div>

        {/* Health Progress Status */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Budget Health
            </span>
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-bold uppercase ${
                overallBudgetPct > 100
                  ? 'bg-rose-500/20 text-rose-400'
                  : overallBudgetPct > 80
                  ? 'bg-amber-500/20 text-amber-400'
                  : 'bg-emerald-500/20 text-emerald-400'
              }`}
            >
              {overallBudgetPct > 100
                ? 'Over Budget'
                : overallBudgetPct > 80
                ? 'Attention'
                : 'Healthy'}
            </span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2 mt-3 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                overallBudgetPct > 100
                  ? 'bg-rose-500'
                  : overallBudgetPct > 80
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(overallBudgetPct, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Tab Switcher & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 self-start">
          <button
            onClick={() => setSubTab('groups')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              subTab === 'groups'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Category Groups & Spending ({categoryGroups.length})
          </button>
          <button
            onClick={() => setSubTab('categories')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              subTab === 'categories'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All Categories ({categories.length})
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="Search group or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* SUBTAB 1: GROUPS VIEW */}
      {subTab === 'groups' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredGroups.map((group) => {
            const budget = groupBudgets[group.id] || 0;
            const spent = groupSpendingMap[group.id] || 0;
            const pct = budget > 0 ? Math.round((spent / budget) * 100) : spent > 0 ? 100 : 0;
            const remaining = budget - spent;
            const groupCats = categories.filter((c) => c.groupId === group.id);
            const isEditingThisBudget = editingBudgetId === group.id;

            return (
              <div
                key={group.id}
                className="bg-slate-900/90 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-4 sm:p-5 shadow-lg flex flex-col justify-between transition-all"
              >
                <div>
                  {/* Group Card Header */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-white shadow"
                        style={{ backgroundColor: group.color }}
                      >
                        <Layers className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-sm font-bold text-white">{group.name}</h2>
                          <span
                            className={`text-[10px] uppercase font-bold px-1.5 py-0.2 rounded ${
                              group.type === 'expense'
                                ? 'bg-rose-500/20 text-rose-400'
                                : 'bg-emerald-500/20 text-emerald-400'
                            }`}
                          >
                            {group.type}
                          </span>
                        </div>
                        {group.description && (
                          <p className="text-[11px] text-slate-400 line-clamp-1">{group.description}</p>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditGroup(group)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                        title="Edit Group"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      {canDelete && (
                        <button
                          onClick={() => deleteCategoryGroup(group.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                          title="Delete Group"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Estimated Budget vs Spent Metrics */}
                  <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 mb-3 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[11px] text-slate-400 block">Actual Spending</span>
                        <span className="text-base font-extrabold font-mono text-white">
                          {currency}{spent.toLocaleString()}
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="text-[11px] text-slate-400 block">Estimated Budget</span>
                        {isEditingThisBudget ? (
                          <div className="flex items-center gap-1 mt-0.5">
                            <span className="text-xs text-slate-400">{currency}</span>
                            <input
                              type="number"
                              value={inlineBudgetValue}
                              onChange={(e) => setInlineBudgetValue(e.target.value)}
                              className="w-20 bg-slate-800 border border-emerald-500 rounded px-1.5 py-0.5 text-xs text-white font-mono"
                              autoFocus
                            />
                            <button
                              onClick={() => handleSaveInlineBudget(group.id)}
                              className="px-2 py-0.5 rounded bg-emerald-600 text-white text-[10px] font-bold"
                            >
                              Save
                            </button>
                          </div>
                        ) : (
                          <div
                            onClick={() => handleStartEditBudget(group.id, budget)}
                            className="cursor-pointer group flex items-center justify-end gap-1 text-slate-200 hover:text-emerald-400 transition-colors"
                            title="Click to edit estimated budget"
                          >
                            <span className="text-base font-extrabold font-mono">
                              {currency}{budget.toLocaleString()}
                            </span>
                            <Edit2 className="w-3 h-3 text-slate-500 group-hover:text-emerald-400 opacity-60" />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1">
                      <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
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
                      <div className="flex items-center justify-between text-[10px] text-slate-400">
                        <span>
                          {pct}% used ({groupTxCountMap[group.id] || 0} entries)
                        </span>
                        <span
                          className={`font-semibold ${
                            remaining < 0 ? 'text-rose-400 font-bold' : 'text-slate-300'
                          }`}
                        >
                          {remaining < 0
                            ? `Over by ${currency}${Math.abs(remaining).toLocaleString()}`
                            : `${currency}${remaining.toLocaleString()} left`}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Subcategories preview */}
                  <div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5">
                      <span className="font-semibold uppercase tracking-wider">
                        Categories ({groupCats.length})
                      </span>
                      <button
                        onClick={() => handleOpenAddCategory(group.id)}
                        className="text-emerald-400 hover:underline flex items-center gap-0.5"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add Category</span>
                      </button>
                    </div>

                    <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                      {groupCats.length === 0 ? (
                        <div className="text-[11px] text-slate-500 italic py-1">
                          No categories assigned yet.
                        </div>
                      ) : (
                        groupCats.map((cat) => {
                          const catSpent = categorySpendingMap[cat.name] || 0;
                          return (
                            <div
                              key={cat.id}
                              className="flex items-center justify-between text-xs py-1 px-2 rounded-lg bg-slate-800/40 hover:bg-slate-800/70 transition-colors"
                            >
                              <div className="flex items-center gap-1.5 truncate max-w-[200px]">
                                <span
                                  className="w-2 h-2 rounded-full"
                                  style={{ backgroundColor: cat.color }}
                                />
                                <span className="text-slate-300 truncate">{cat.name}</span>
                              </div>
                              <div className="font-mono text-[11px] text-white">
                                {catSpent > 0 ? (
                                  <span className="font-semibold text-emerald-400">
                                    {currency}{catSpent.toLocaleString()}
                                  </span>
                                ) : (
                                  <span className="text-slate-500">—</span>
                                )}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer action */}
                <div className="pt-3 mt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <button
                    onClick={() => handleStartEditBudget(group.id, budget)}
                    className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
                  >
                    <span>Update Budget</span>
                  </button>
                  <button
                    onClick={() => handleOpenAddCategory(group.id)}
                    className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
                  >
                    <span>+ Add Category</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* SUBTAB 2: ALL CATEGORIES TABLE */}
      {subTab === 'categories' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white">
              Configured Categories ({filteredCategories.length})
            </h2>
            <button
              onClick={() => handleOpenAddCategory()}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold"
            >
              + Create Category
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-semibold pb-2">
                  <th className="py-2.5 px-3">Category Name</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">Assigned Group</th>
                  <th className="py-2.5 px-3 text-right">Spent in {currentMonth}</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredCategories.map((c) => {
                  const grp = categoryGroups.find((g) => g.id === c.groupId);
                  const spent = categorySpendingMap[c.name] || 0;

                  return (
                    <tr key={c.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: c.color }}
                          />
                          <span className="font-semibold text-white">{c.name}</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                            c.type === 'expense'
                              ? 'bg-rose-500/20 text-rose-400'
                              : 'bg-emerald-500/20 text-emerald-400'
                          }`}
                        >
                          {c.type}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-300">
                        {grp ? (
                          <span
                            className="px-2 py-0.5 rounded text-[11px] font-medium"
                            style={{
                              backgroundColor: `${grp.color}20`,
                              color: grp.color,
                            }}
                          >
                            {grp.name}
                          </span>
                        ) : (
                          <span className="text-slate-500">Unassigned</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-semibold text-white">
                        {spent > 0 ? `${currency}${spent.toLocaleString()}` : '—'}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        {canDelete && (
                          <button
                            onClick={() => deleteCategory(c.id)}
                            className="p-1 rounded text-slate-500 hover:text-rose-400 transition-colors"
                            title="Delete Category"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT CATEGORY GROUP */}
      {isGroupModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-5 shadow-2xl text-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <FolderPlus className="w-4 h-4 text-emerald-400" />
                {editingGroup ? 'Edit Category Group' : 'Create Category Group'}
              </h3>
              <button
                onClick={() => setIsGroupModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveGroup} className="space-y-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Group Name</label>
                <input
                  type="text"
                  placeholder="e.g. Farm Raw Supplies, Logistics & Fuel"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Type</label>
                  <select
                    value={groupType}
                    onChange={(e) => setGroupType(e.target.value as any)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="expense">Expense Group</option>
                    <option value="income">Income Group</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Theme Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={groupColor}
                      onChange={(e) => setGroupColor(e.target.value)}
                      className="w-9 h-9 rounded-lg bg-transparent cursor-pointer border border-slate-700"
                    />
                    <input
                      type="text"
                      value={groupColor}
                      onChange={(e) => setGroupColor(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-2 py-2 text-white font-mono"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Estimated Monthly Budget ({currency})
                </label>
                <input
                  type="number"
                  min="0"
                  step="100"
                  value={initialGroupBudget}
                  onChange={(e) => setInitialGroupBudget(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Describe what categories belong in this group..."
                  value={groupDesc}
                  onChange={(e) => setGroupDesc(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsGroupModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold"
                >
                  Save Group
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD CATEGORY */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-5 shadow-2xl text-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <PlusCircle className="w-4 h-4 text-emerald-400" />
                Add New Category
              </h3>
              <button
                onClick={() => setIsCategoryModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Category Name</label>
                <input
                  type="text"
                  placeholder="e.g. Grafting Tape, Sprinkler Nozzles, Cow Dung Compost"
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Type</label>
                  <select
                    value={catType}
                    onChange={(e) => setCatType(e.target.value as any)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="expense">Expense</option>
                    <option value="income">Income</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Assigned Group</label>
                  <select
                    value={catGroupId}
                    onChange={(e) => setCatGroupId(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="">-- No Group --</option>
                    {categoryGroups
                      .filter((g) => g.type === catType)
                      .map((g) => (
                        <option key={g.id} value={g.id}>
                          {g.name}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={catColor}
                      onChange={(e) => setCatColor(e.target.value)}
                      className="w-9 h-9 rounded-lg bg-transparent cursor-pointer border border-slate-700"
                    />
                    <input
                      type="text"
                      value={catColor}
                      onChange={(e) => setCatColor(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-2 py-2 text-white font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Est. Budget ({currency})
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={catEstimatedBudget}
                    onChange={(e) => setCatEstimatedBudget(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
