import React, { useState } from 'react';
import {
  Layers,
  Zap,
  Plus,
  Pin,
  PinOff,
  Edit2,
  Trash2,
  Calendar,
  Clock,
  History,
  TrendingUp,
  Check,
  Calculator,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { DynamicSection } from '../types';

interface DynamicSectionsViewProps {
  onOpenAddSectionModal: () => void;
  onSelectSectionToEdit: (sec: DynamicSection) => void;
  onOpenQuickLogModal: (sectionId: string) => void;
}

export const DynamicSectionsView: React.FC<DynamicSectionsViewProps> = ({
  onOpenAddSectionModal,
  onSelectSectionToEdit,
  onOpenQuickLogModal,
}) => {
  const {
    dynamicSections,
    topNavSections,
    sidebarSections,
    currentMonthTransactions,
    currentMonth,
    currency,
    togglePinSection,
    deleteDynamicSection,
    updateDynamicSection,
    quickLogSectionPurchase,
    canManageSections,
    canDelete,
  } = useApp();

  const [expandedHistoryId, setExpandedHistoryId] = useState<string | null>(null);
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [inlinePriceInput, setInlinePriceInput] = useState<string>('');

  // Quick inline log state per section card
  const [cardQuantities, setCardQuantities] = useState<Record<string, number>>({});

  const handleStartEditPrice = (sec: DynamicSection) => {
    setEditingPriceId(sec.id);
    setInlinePriceInput(String(sec.defaultUnitPrice));
  };

  const handleSavePrice = async (secId: string) => {
    const val = parseFloat(inlinePriceInput);
    if (!isNaN(val) && val >= 0) {
      await updateDynamicSection(secId, { defaultUnitPrice: val });
    }
    setEditingPriceId(null);
  };

  const handleQtyChange = (secId: string, delta: number) => {
    setCardQuantities((prev) => {
      const current = prev[secId] !== undefined ? prev[secId] : 1;
      const next = Math.max(0.1, Math.round((current + delta) * 10) / 10);
      return { ...prev, [secId]: next };
    });
  };

  const handleQuickLogCard = async (sec: DynamicSection) => {
    const qty = cardQuantities[sec.id] !== undefined ? cardQuantities[sec.id] : 1;
    await quickLogSectionPurchase(sec.id, qty, sec.defaultUnitPrice);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/90 border border-slate-800 p-4 rounded-2xl shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-white">Dynamic Daily Procurement Sections</h1>
            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono">
              {dynamicSections.length} Items Configured
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Set unit prices & quantities for daily recurring supplies. The top 2–3 items appear in the navigation bar.
          </p>
        </div>

        {canManageSections && (
          <button
            onClick={onOpenAddSectionModal}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-md shadow-emerald-950/50 transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>New Dynamic Section</span>
          </button>
        )}
      </div>

      {/* Navigation Placement Overview */}
      <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-400" />
          <span className="font-semibold text-white">Navigation Distribution:</span>
          <span className="text-emerald-400 font-mono font-bold">
            {topNavSections.length} Pinned in Top Nav (Max 3)
          </span>
          <span className="text-slate-500">•</span>
          <span className="text-slate-300 font-mono font-medium">
            {sidebarSections.length} in Sidebar Drawer
          </span>
        </div>
        <p className="text-[11px] text-slate-400">
          Click the pin icon on any card below to swap which sections appear in the top bar.
        </p>
      </div>

      {/* SECTIONS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {dynamicSections.map((sec) => {
          // Current month metrics for this section
          const sectionTxs = currentMonthTransactions.filter(
            (tx) => tx.sectionId === sec.id && tx.type === 'expense'
          );
          const totalSpent = sectionTxs.reduce((sum, tx) => sum + tx.amount, 0);
          const totalUnits = sectionTxs.reduce((sum, tx) => sum + (tx.quantity || 0), 0);
          const isExpanded = expandedHistoryId === sec.id;
          const currentCardQty = cardQuantities[sec.id] !== undefined ? cardQuantities[sec.id] : 1;
          const currentTotal = Math.round(currentCardQty * sec.defaultUnitPrice * 100) / 100;

          return (
            <div
              key={sec.id}
              className="bg-slate-900/90 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-4 shadow-lg flex flex-col justify-between transition-all"
            >
              {/* Card Top: Header & Nav Pin Status */}
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-inner"
                      style={{ backgroundColor: `${sec.color}25`, borderColor: sec.color, borderWidth: 1 }}
                    >
                      <Zap className="w-5 h-5" style={{ color: sec.color }} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="font-bold text-sm text-white">{sec.name}</h2>
                        {sec.isFavorite ? (
                          <span className="text-[10px] uppercase font-bold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            In Top Nav
                          </span>
                        ) : (
                          <span className="text-[10px] uppercase font-medium px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                            Sidebar Only
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400">Unit: {sec.unit}</p>
                    </div>
                  </div>

                  {/* Actions: Pin, Edit, Delete */}
                  <div className="flex items-center gap-1">
                    {canManageSections && (
                      <button
                        onClick={() => togglePinSection(sec.id)}
                        className={`p-1.5 rounded-lg border transition-colors ${
                          sec.isFavorite
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/30'
                            : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                        }`}
                        title={sec.isFavorite ? 'Unpin from Top Navigation' : 'Pin to Top Navigation (Max 3)'}
                      >
                        {sec.isFavorite ? <PinOff className="w-3.5 h-3.5" /> : <Pin className="w-3.5 h-3.5" />}
                      </button>
                    )}

                    {canManageSections && (
                      <button
                        onClick={() => onSelectSectionToEdit(sec)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors border border-slate-700"
                        title="Edit Section"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {canDelete && (
                      <button
                        onClick={() => deleteDynamicSection(sec.id)}
                        className="p-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 border border-rose-900/40 transition-colors"
                        title="Delete Section (Admin only)"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Unit Price Display & Inline Editor */}
                <div className="bg-slate-800/50 p-2.5 rounded-xl border border-slate-700/50 flex items-center justify-between mb-3 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Unit Price (per {sec.unit})</span>
                    {editingPriceId === sec.id ? (
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-white font-mono font-bold">{currency}</span>
                        <input
                          type="number"
                          step="any"
                          value={inlinePriceInput}
                          onChange={(e) => setInlinePriceInput(e.target.value)}
                          className="w-20 bg-slate-900 border border-emerald-500 rounded px-1.5 py-0.5 text-xs text-white font-mono font-bold"
                          autoFocus
                        />
                        <button
                          onClick={() => handleSavePrice(sec.id)}
                          className="p-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white"
                        >
                          <Check className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-base font-extrabold text-emerald-400 font-mono">
                          {currency}{sec.defaultUnitPrice}
                        </span>
                        <span className="text-slate-400 text-[11px]">/ {sec.unit}</span>
                      </div>
                    )}
                  </div>

                  {editingPriceId !== sec.id && canManageSections && (
                    <button
                      onClick={() => handleStartEditPrice(sec)}
                      className="text-[11px] text-emerald-400 hover:underline"
                    >
                      Update Price
                    </button>
                  )}
                </div>

                {/* Monthly Procurement Summary for this item */}
                <div className="grid grid-cols-2 gap-2 bg-slate-950/40 p-2.5 rounded-xl border border-slate-800 mb-3 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Total Units This Month:</span>
                    <span className="text-sm font-bold font-mono text-white">
                      {totalUnits} {sec.unit}s
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Total Spend This Month:</span>
                    <span className="text-sm font-bold font-mono text-rose-300">
                      {currency}{totalSpent.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* 1-Tap Daily Quick-Logger Stepper */}
                <div className="bg-gradient-to-r from-emerald-950/20 via-slate-800/40 to-slate-900 p-3 rounded-xl border border-emerald-500/20 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-200 flex items-center gap-1">
                      <Calculator className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Log Today&apos;s Quantity:</span>
                    </span>
                    <span className="font-mono font-bold text-emerald-300">
                      {currency}{currentTotal}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleQtyChange(sec.id, -1)}
                      className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center justify-center border border-slate-700 text-sm active:scale-95"
                    >
                      -
                    </button>
                    <div className="flex-1 text-center font-mono font-bold text-sm text-white bg-slate-900/80 py-1.5 rounded-lg border border-slate-700">
                      {currentCardQty} {sec.unit}
                    </div>
                    <button
                      onClick={() => handleQtyChange(sec.id, 1)}
                      className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center justify-center border border-slate-700 text-sm active:scale-95"
                    >
                      +
                    </button>

                    <button
                      onClick={() => handleQuickLogCard(sec)}
                      className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-950/50 flex items-center gap-1.5 transition-all"
                    >
                      <span>Log Spend</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Bottom: History Toggle */}
              <div className="pt-3 border-t border-slate-800/80 mt-3">
                <button
                  onClick={() => setExpandedHistoryId(isExpanded ? null : sec.id)}
                  className="w-full flex items-center justify-between text-xs text-slate-400 hover:text-white transition-colors"
                >
                  <span className="flex items-center gap-1.5">
                    <History className="w-3.5 h-3.5 text-slate-400" />
                    <span>Monthly Purchase History ({sectionTxs.length} entries)</span>
                  </span>
                  <span className="text-[10px] font-mono">{isExpanded ? 'Hide ▲' : 'View ▼'}</span>
                </button>

                {/* History Drawer */}
                {isExpanded && (
                  <div className="mt-2 space-y-1.5 max-h-40 overflow-y-auto pr-1">
                    {sectionTxs.length === 0 ? (
                      <div className="text-[11px] text-slate-500 text-center py-2">
                        No purchases logged for this item yet in {currentMonth}.
                      </div>
                    ) : (
                      sectionTxs.map((tx) => (
                        <div
                          key={tx.id}
                          className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800/80 text-[11px]"
                        >
                          <div>
                            <span className="font-mono text-slate-400">{tx.date}</span>
                            <span className="ml-2 font-semibold text-slate-200">
                              {tx.quantity} {tx.unit}
                            </span>
                          </div>
                          <div className="font-mono font-bold text-rose-300">
                            {currency}{tx.amount}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
