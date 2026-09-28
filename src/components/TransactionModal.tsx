import React, { useState, useEffect } from 'react';
import { X, Plus, Receipt, DollarSign, Calendar, Layers, Check } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Transaction, TransactionType, PaymentMethod } from '../types';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTransaction?: Transaction | null;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  initialTransaction,
}) => {
  const {
    categories,
    categoryGroups,
    dynamicSections,
    currency,
    addTransaction,
    updateTransaction,
    currentMonth,
    role,
  } = useApp();

  const [type, setType] = useState<TransactionType>('expense');
  const [category, setCategory] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI / GPay');
  const [notes, setNotes] = useState<string>('');

  // Linked dynamic section (optional)
  const [linkedSectionId, setLinkedSectionId] = useState<string>('');
  const [quantity, setQuantity] = useState<string>('1');
  const [unitPrice, setUnitPrice] = useState<string>('');

  useEffect(() => {
    if (initialTransaction) {
      setType(initialTransaction.type);
      setCategory(initialTransaction.category);
      setTitle(initialTransaction.title);
      setAmount(String(initialTransaction.amount));
      setDate(initialTransaction.date);
      setPaymentMethod(initialTransaction.paymentMethod);
      setNotes(initialTransaction.notes || '');
      setLinkedSectionId(initialTransaction.sectionId || '');
      setQuantity(initialTransaction.quantity ? String(initialTransaction.quantity) : '1');
      setUnitPrice(initialTransaction.unitPrice ? String(initialTransaction.unitPrice) : '');
    } else {
      setType('expense');
      setCategory(categories.find((c) => c.type === 'expense')?.name || '');
      setTitle('');
      setAmount('');
      setDate(new Date().toISOString().slice(0, 10));
      setPaymentMethod('UPI / GPay');
      setNotes('');
      setLinkedSectionId('');
      setQuantity('1');
      setUnitPrice('');
    }
  }, [initialTransaction, isOpen, categories]);

  if (!isOpen) return null;

  // Handle dynamic section selection
  const handleSectionSelect = (secId: string) => {
    setLinkedSectionId(secId);
    if (!secId) return;

    const sec = dynamicSections.find((s) => s.id === secId);
    if (sec) {
      setType('expense');
      setCategory(sec.name);
      setTitle(`${sec.name} Procurement`);
      setUnitPrice(String(sec.defaultUnitPrice));
      const q = parseFloat(quantity) || 1;
      setAmount(String(Math.round(q * sec.defaultUnitPrice * 100) / 100));
    }
  };

  const handleQuantityChange = (qVal: string) => {
    setQuantity(qVal);
    const q = parseFloat(qVal);
    const u = parseFloat(unitPrice);
    if (!isNaN(q) && !isNaN(u) && linkedSectionId) {
      setAmount(String(Math.round(q * u * 100) / 100));
    }
  };

  const handleUnitPriceChange = (uVal: string) => {
    setUnitPrice(uVal);
    const q = parseFloat(quantity);
    const u = parseFloat(uVal);
    if (!isNaN(q) && !isNaN(u) && linkedSectionId) {
      setAmount(String(Math.round(q * u * 100) / 100));
    }
  };

  const filteredCategories = categories.filter((c) => c.type === type);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      alert('Please enter a valid amount.');
      return;
    }

    const txMonth = date.slice(0, 7) || currentMonth;
    const selectedSec = linkedSectionId ? dynamicSections.find((s) => s.id === linkedSectionId) : null;

    if (initialTransaction) {
      await updateTransaction(initialTransaction.id, {
        type,
        category: category || 'Miscellaneous',
        title: title || `${category || 'Item'} entry`,
        amount: parsedAmount,
        date,
        month: txMonth,
        paymentMethod,
        notes: notes.trim() || undefined,
        sectionId: linkedSectionId || undefined,
        unit: selectedSec?.unit || initialTransaction.unit,
        quantity: linkedSectionId ? parseFloat(quantity) || undefined : undefined,
        unitPrice: linkedSectionId ? parseFloat(unitPrice) || undefined : undefined,
      });
    } else {
      await addTransaction({
        type,
        category: category || 'Miscellaneous',
        title: title || `${category || 'Item'} entry`,
        amount: parsedAmount,
        date,
        month: txMonth,
        paymentMethod,
        notes: notes.trim() || undefined,
        sectionId: linkedSectionId || undefined,
        unit: selectedSec?.unit,
        quantity: linkedSectionId ? parseFloat(quantity) || undefined : undefined,
        unitPrice: linkedSectionId ? parseFloat(unitPrice) || undefined : undefined,
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <Receipt className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">
                {initialTransaction ? 'Edit Transaction' : 'Record New Transaction'}
              </h3>
              <p className="text-[11px] text-slate-400">
                Synchronized with your Google Spreadsheet
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 flex-1 text-xs">
          {/* Type Toggle (Expense vs Income) */}
          <div className="grid grid-cols-2 gap-2 bg-slate-950/60 p-1 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => {
                setType('expense');
                if (type !== 'expense') {
                  setCategory(categories.find((c) => c.type === 'expense')?.name || '');
                }
              }}
              className={`py-2 rounded-lg font-bold text-center transition-all ${
                type === 'expense'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Expense (Money Out)
            </button>
            <button
              type="button"
              disabled={role === 'staff'}
              onClick={() => {
                setType('income');
                setLinkedSectionId('');
                if (type !== 'income') {
                  setCategory(categories.find((c) => c.type === 'income')?.name || '');
                }
              }}
              className={`py-2 rounded-lg font-bold text-center transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                type === 'income'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title={role === 'staff' ? 'Staff can only log daily procurement expenses' : ''}
            >
              Income (Money In)
            </button>
          </div>

          {/* Dynamic Section Link (Optional for unit calculations) */}
          {type === 'expense' && (
            <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-700/50 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-amber-400" />
                  Dynamic Procurement Section (Optional)
                </span>
                {linkedSectionId && (
                  <button
                    type="button"
                    onClick={() => handleSectionSelect('')}
                    className="text-[10px] text-rose-400 hover:underline"
                  >
                    Clear Section Link
                  </button>
                )}
              </div>
              <select
                value={linkedSectionId}
                onChange={(e) => handleSectionSelect(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                <option value="">-- General Expense (No unit quantity) --</option>
                {dynamicSections.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.unit} @ {currency}{s.defaultUnitPrice})
                  </option>
                ))}
              </select>

              {linkedSectionId && (
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">
                      Quantity (
                      {dynamicSections.find((s) => s.id === linkedSectionId)?.unit || 'units'}
                      )
                    </label>
                    <input
                      type="number"
                      step="any"
                      min="0.1"
                      value={quantity}
                      onChange={(e) => handleQuantityChange(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">
                      Unit Price ({currency})
                    </label>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      value={unitPrice}
                      onChange={(e) => handleUnitPriceChange(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Amount Input */}
          <div>
            <label className="block font-semibold text-slate-300 mb-1">
              Amount ({currency}) <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-slate-400 font-bold">{currency}</span>
              <input
                type="number"
                step="any"
                min="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-8 pr-3 py-2 text-base text-white font-mono font-bold focus:outline-none focus:border-emerald-500"
                required
              />
            </div>
          </div>

          {/* Category & Title */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                {categoryGroups
                  .filter((g) => g.type === type)
                  .map((grp) => {
                    const groupCats = filteredCategories.filter((c) => c.groupId === grp.id);
                    if (groupCats.length === 0) return null;
                    return (
                      <optgroup key={grp.id} label={`📁 ${grp.name}`}>
                        {groupCats.map((c) => (
                          <option key={c.id} value={c.name}>
                            {c.name}
                          </option>
                        ))}
                      </optgroup>
                    );
                  })}
                {filteredCategories.filter((c) => !c.groupId).length > 0 && (
                  <optgroup label="General / Other">
                    {filteredCategories
                      .filter((c) => !c.groupId)
                      .map((c) => (
                        <option key={c.id} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                  </optgroup>
                )}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Title / Description</label>
              <input
                type="text"
                placeholder="e.g. Milk delivery, Fertilizer, Client payment"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                required
              />
            </div>
          </div>

          {/* Date & Payment Method */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                <option value="UPI / GPay">UPI / Google Pay / PhonePe</option>
                <option value="Cash">Cash</option>
                <option value="Bank Transfer">Bank Transfer / NEFT</option>
                <option value="Credit / Debit Card">Credit / Debit Card</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block font-semibold text-slate-300 mb-1">Notes / Bill No.</label>
            <textarea
              rows={2}
              placeholder="Optional notes, receipt number, vendor contact..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-950/50 flex items-center justify-center gap-2 transition-all"
            >
              <Check className="w-4 h-4" />
              <span>{initialTransaction ? 'Save Changes' : 'Record Transaction'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
