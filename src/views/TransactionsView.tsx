import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Download,
  PlusCircle,
  FileSpreadsheet,
  ExternalLink,
  Trash2,
  Edit2,
  Calendar,
  Layers,
  ArrowUpDown,
  CheckCircle,
  Clock,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Transaction, TransactionType } from '../types';

interface TransactionsViewProps {
  onOpenAddTransactionModal: () => void;
  onSelectTransactionToEdit: (tx: Transaction) => void;
}

export const TransactionsView: React.FC<TransactionsViewProps> = ({
  onOpenAddTransactionModal,
  onSelectTransactionToEdit,
}) => {
  const {
    currentMonthTransactions,
    currentMonth,
    currency,
    deleteTransaction,
    spreadsheetUrl,
    categories,
    categoryGroups,
    canDelete,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPayment, setSelectedPayment] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  // Filter & sort transactions
  const filteredTransactions = useMemo(() => {
    return currentMonthTransactions
      .filter((tx) => {
        if (selectedType !== 'all' && tx.type !== selectedType) return false;
        if (selectedCategory !== 'all' && tx.category !== selectedCategory) return false;
        if (selectedPayment !== 'all' && tx.paymentMethod !== selectedPayment) return false;

        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = tx.title.toLowerCase().includes(q);
          const matchCat = tx.category.toLowerCase().includes(q);
          const matchNotes = tx.notes ? tx.notes.toLowerCase().includes(q) : false;
          const matchDate = tx.date.includes(q);
          return matchTitle || matchCat || matchNotes || matchDate;
        }

        return true;
      })
      .sort((a, b) => {
        const timeA = new Date(a.date).getTime();
        const timeB = new Date(b.date).getTime();
        return sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
      });
  }, [
    currentMonthTransactions,
    selectedType,
    selectedCategory,
    selectedPayment,
    searchQuery,
    sortOrder,
  ]);

  // Aggregate stats for filtered items
  const stats = useMemo(() => {
    let income = 0;
    let expense = 0;
    filteredTransactions.forEach((tx) => {
      if (tx.type === 'income') income += tx.amount;
      else expense += tx.amount;
    });
    return {
      income,
      expense,
      count: filteredTransactions.length,
      net: income - expense,
    };
  }, [filteredTransactions]);

  // Export to CSV
  const handleExportCSV = () => {
    const headers = [
      'ID',
      'Date',
      'Month',
      'Type',
      'Category',
      'Title',
      'Amount',
      'PaymentMethod',
      'Notes',
      'Unit',
      'Quantity',
      'UnitPrice',
      'CreatedBy',
      'Role',
    ];
    const rows = filteredTransactions.map((tx) => [
      tx.id,
      tx.date,
      tx.month,
      tx.type,
      `"${tx.category}"`,
      `"${tx.title}"`,
      tx.amount,
      `"${tx.paymentMethod}"`,
      `"${tx.notes || ''}"`,
      tx.unit || '',
      tx.quantity || '',
      tx.unitPrice || '',
      tx.createdBy || '',
      tx.role || '',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `SpendSync_${currentMonth}_Ledger.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/90 border border-slate-800 p-4 rounded-2xl shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-white">Monthly Transaction Ledger</h1>
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono">
              {currentMonth}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Full audit log connected to Google Sheets. All entries reset on a monthly cycle.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors"
            title="Download CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          {spreadsheetUrl && (
            <a
              href={spreadsheetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-300 text-xs font-semibold border border-emerald-800/40 transition-colors"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Google Sheet</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>
          )}

          <button
            onClick={onOpenAddTransactionModal}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-md shadow-emerald-950/50 transition-all"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Add Transaction</span>
          </button>
        </div>
      </div>

      {/* Filter Stats Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Total Filtered Entries</div>
          <div className="text-base font-bold text-white font-mono mt-0.5">{stats.count} records</div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3">
          <div className="text-[10px] text-rose-400 uppercase tracking-wider font-semibold">Filtered Spend</div>
          <div className="text-base font-bold text-rose-300 font-mono mt-0.5">
            {currency}{stats.expense.toLocaleString()}
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3">
          <div className="text-[10px] text-emerald-400 uppercase tracking-wider font-semibold">Filtered Income</div>
          <div className="text-base font-bold text-emerald-300 font-mono mt-0.5">
            {currency}{stats.income.toLocaleString()}
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Net Balance</div>
          <div
            className={`text-base font-bold font-mono mt-0.5 ${
              stats.net >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {stats.net >= 0 ? '+' : ''}
            {currency}{stats.net.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 shadow-lg space-y-3">
        <div className="flex flex-col sm:flex-row gap-2">
          {/* Search box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search description, category, vendor, or date..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-800/90 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Quick Type Filter Buttons */}
          <div className="flex items-center gap-1 bg-slate-800/60 p-1 rounded-xl border border-slate-700/50">
            {['all', 'expense', 'income'].map((t) => (
              <button
                key={t}
                onClick={() => setSelectedType(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                  selectedType === t
                    ? 'bg-emerald-500 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {t === 'all' ? 'All Types' : t}
              </button>
            ))}
          </div>
        </div>

        {/* Dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs pt-1 border-t border-slate-800/80">
          <div>
            <label className="text-[10px] text-slate-400 block mb-1">Filter Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-slate-800/80 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="all">All Categories</option>
              {categoryGroups.map((grp) => {
                const groupCats = categories.filter((c) => c.groupId === grp.id);
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
              {categories.filter((c) => !c.groupId).length > 0 && (
                <optgroup label="General / Other">
                  {categories
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
            <label className="text-[10px] text-slate-400 block mb-1">Payment Method</label>
            <select
              value={selectedPayment}
              onChange={(e) => setSelectedPayment(e.target.value)}
              className="w-full bg-slate-800/80 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="all">All Methods</option>
              <option value="UPI / GPay">UPI / Google Pay</option>
              <option value="Cash">Cash</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Credit / Debit Card">Credit / Debit Card</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] text-slate-400 block mb-1">Sort by Date</label>
            <button
              onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
              className="w-full flex items-center justify-between bg-slate-800/80 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 hover:bg-slate-700 transition-colors"
            >
              <span>{sortOrder === 'desc' ? 'Newest to Oldest' : 'Oldest to Newest'}</span>
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Transactions Ledger Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl shadow-lg overflow-hidden">
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-14 space-y-2">
            <Layers className="w-8 h-8 text-slate-600 mx-auto" />
            <p className="text-xs text-slate-400">No transactions match your search filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/60 border-b border-slate-800 text-slate-400 font-semibold">
                <tr>
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3">Type</th>
                  <th className="py-3 px-3">Title & Category</th>
                  <th className="py-3 px-3">Daily Unit & Qty</th>
                  <th className="py-3 px-3">Payment</th>
                  <th className="py-3 px-3">Author / RBAC</th>
                  <th className="py-3 px-3 text-right">Amount</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-3 font-mono text-slate-400 whitespace-nowrap">
                      {tx.date}
                    </td>

                    <td className="py-3 px-3 whitespace-nowrap">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          tx.type === 'income'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        }`}
                      >
                        {tx.type}
                      </span>
                    </td>

                    <td className="py-3 px-3 max-w-[220px]">
                      <div className="font-semibold text-white truncate">{tx.title}</div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                        <span>{tx.category}</span>
                        {tx.notes && <span className="text-slate-500 italic truncate">• {tx.notes}</span>}
                      </div>
                    </td>

                    <td className="py-3 px-3 whitespace-nowrap">
                      {tx.quantity !== undefined ? (
                        <div>
                          <div className="font-mono font-bold text-amber-300">
                            {tx.quantity} {tx.unit}
                          </div>
                          {tx.unitPrice !== undefined && (
                            <div className="text-[10px] text-slate-400 font-mono">
                              @{currency}{tx.unitPrice}/{tx.unit}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-500">-</span>
                      )}
                    </td>

                    <td className="py-3 px-3 text-slate-300 whitespace-nowrap text-[11px]">
                      {tx.paymentMethod}
                    </td>

                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="text-[11px] text-slate-400 truncate max-w-[120px]">
                        {tx.createdBy ? tx.createdBy.split('@')[0] : 'User'}
                      </div>
                      {tx.role && (
                        <div className="text-[9px] uppercase font-bold text-indigo-400 font-mono">
                          {tx.role}
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-3 text-right font-mono font-bold whitespace-nowrap">
                      <span
                        className={
                          tx.type === 'income' ? 'text-emerald-400' : 'text-slate-100'
                        }
                      >
                        {tx.type === 'income' ? '+' : '-'}
                        {currency}{tx.amount.toLocaleString()}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onSelectTransactionToEdit(tx)}
                          className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                          title="Edit transaction"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        {canDelete && (
                          <button
                            onClick={() => deleteTransaction(tx.id)}
                            className="p-1 rounded hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 transition-colors"
                            title="Delete transaction (Admin only)"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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
