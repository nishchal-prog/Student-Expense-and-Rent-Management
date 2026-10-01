import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  ArrowUpDown,
  Download,
  Trash2,
  Edit2,
  Calendar,
  Tag,
  User,
  PlusCircle,
  FileSpreadsheet,
} from 'lucide-react';
import { Transaction, Roommate, ExpenseCategory } from '../types';
import { formatNPR, formatDate, formatMonthName, CATEGORY_COLORS, ALL_CATEGORIES, downloadCSV } from '../utils/formatters';

interface TransactionRegisterProps {
  transactions: Transaction[]; // monthly transactions
  allTransactions?: Transaction[]; // all stored historical transactions
  roommates: Roommate[];
  selectedMonth?: string;
  onOpenExpenseModal: () => void;
  onEditTransaction: (transaction: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
}

type SortField = 'date' | 'amount' | 'description';
type SortOrder = 'desc' | 'asc';

export const TransactionRegister: React.FC<TransactionRegisterProps> = ({
  transactions,
  allTransactions,
  roommates,
  selectedMonth,
  onOpenExpenseModal,
  onEditTransaction,
  onDeleteTransaction,
}) => {
  const [viewScope, setViewScope] = useState<'month' | 'all'>('month');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPayer, setSelectedPayer] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const baseTransactions = viewScope === 'all' && allTransactions ? allTransactions : transactions;

  const roommateMap = useMemo(() => {
    return new Map(roommates.map((r) => [r.id, r]));
  }, [roommates]);

  // Filter and sort transactions
  const filteredTransactions = useMemo(() => {
    return baseTransactions

      .filter((t) => {
        // Search query
        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          const payerName = (roommateMap.get(t.paidBy)?.name || '').toLowerCase();
          const desc = t.description.toLowerCase();
          const notes = (t.notes || '').toLowerCase();
          if (!desc.includes(q) && !payerName.includes(q) && !notes.includes(q)) {
            return false;
          }
        }

        // Category filter
        if (selectedCategory !== 'all') {
          if (t.category !== selectedCategory) return false;
        }

        // Payer filter
        if (selectedPayer !== 'all') {
          if (t.paidBy !== selectedPayer) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortField === 'date') {
          return sortOrder === 'desc'
            ? b.date.localeCompare(a.date)
            : a.date.localeCompare(b.date);
        }
        if (sortField === 'amount') {
          return sortOrder === 'desc' ? b.amount - a.amount : a.amount - b.amount;
        }
        if (sortField === 'description') {
          return sortOrder === 'desc'
            ? b.description.localeCompare(a.description)
            : a.description.localeCompare(b.description);
        }
        return 0;
      });
  }, [baseTransactions, searchQuery, selectedCategory, selectedPayer, sortField, sortOrder, roommateMap]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const handleExport = () => {
    downloadCSV(baseTransactions, roommates);
  };

  const totalFilteredAmount = filteredTransactions
    .filter((t) => !t.isSettlement)
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
      {/* Table Header Controls */}
      <div className="p-4 sm:p-5 border-b border-slate-200 bg-white">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Shared Expense Register
              </h2>

              {selectedMonth && (
                <div className="flex items-center gap-1 p-0.5 bg-slate-100 rounded-lg text-xs">
                  <button
                    onClick={() => setViewScope('month')}
                    className={`px-2.5 py-1 font-medium rounded-md transition-colors ${
                      viewScope === 'month'
                        ? 'bg-white text-slate-900 shadow-xs font-semibold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {formatMonthName(selectedMonth)}
                  </button>
                  <button
                    onClick={() => setViewScope('all')}
                    className={`px-2.5 py-1 font-medium rounded-md transition-colors ${
                      viewScope === 'all'
                        ? 'bg-white text-slate-900 shadow-xs font-semibold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    All Stored Records
                  </button>
                </div>
              )}

              <span className="text-slate-300">·</span>
              <span className="text-xs font-mono text-slate-500 tabular-nums">
                {filteredTransactions.length} entries
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Audited tabular ledger of all room purchases, bills, and settled balances in NPR.
            </p>
          </div>


          <div className="flex items-center gap-2.5">
            <button
              onClick={handleExport}
              disabled={transactions.length === 0}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors shadow-xs"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={onOpenExpenseModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-xs"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>+ Record Expense</span>
            </button>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
          {/* Search */}
          <div className="sm:col-span-5 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search description, payer, remarks..."
              className="w-full pl-9 pr-3.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-colors"
            />
          </div>

          {/* Category Filter */}
          <div className="sm:col-span-4 flex items-center gap-1.5">
            <span className="text-xs text-slate-400 shrink-0">Category:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:bg-white focus:border-emerald-600 transition-colors"
            >
              <option value="all">All Categories</option>
              {ALL_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Payer Filter */}
          <div className="sm:col-span-3 flex items-center gap-1.5">
            <span className="text-xs text-slate-400 shrink-0">Payer:</span>
            <select
              value={selectedPayer}
              onChange={(e) => setSelectedPayer(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:bg-white focus:border-emerald-600 transition-colors"
            >
              <option value="all">All Roommates</option>
              {roommates.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} {r.status === 'archived' ? '(Past)' : ''}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Register Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/75 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <th
                onClick={() => toggleSort('description')}
                className="py-3 px-4 cursor-pointer hover:text-slate-900 transition-colors select-none"
              >
                <div className="flex items-center gap-1">
                  <span>Description</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>

              <th
                onClick={() => toggleSort('amount')}
                className="py-3 px-4 text-right cursor-pointer hover:text-slate-900 transition-colors select-none"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Amount (NPR)</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>

              <th className="py-3 px-4">Paid By</th>
              <th className="py-3 px-4">Category</th>

              <th
                onClick={() => toggleSort('date')}
                className="py-3 px-4 cursor-pointer hover:text-slate-900 transition-colors select-none"
              >
                <div className="flex items-center gap-1">
                  <span>Date</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>

              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 text-xs">
            {filteredTransactions.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-500">
                  <div className="max-w-xs mx-auto">
                    <p className="font-semibold text-slate-700 mb-1">No matching transactions</p>
                    <p className="text-xs text-slate-400 mb-3">
                      Try adjusting your search filters or record a new transaction.
                    </p>
                    <button
                      onClick={onOpenExpenseModal}
                      className="px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-md transition-colors"
                    >
                      + Add New Expense
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              filteredTransactions.map((tx) => {
                const payer = roommateMap.get(tx.paidBy);
                const isSettlement = tx.isSettlement;
                const catColor = CATEGORY_COLORS[tx.category] || CATEGORY_COLORS.Other;

                return (
                  <tr
                    key={tx.id}
                    className="hover:bg-slate-50/80 transition-colors group"
                  >
                    {/* Description */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">
                        {tx.description}
                      </div>
                      {tx.notes && (
                        <div className="text-[11px] text-slate-400 truncate max-w-xs">
                          {tx.notes}
                        </div>
                      )}
                      {isSettlement && (
                        <span className="text-[10px] text-indigo-600 font-medium">
                          Peer-to-peer settlement transfer
                        </span>
                      )}
                    </td>

                    {/* Amount (NPR) */}
                    <td className="py-3.5 px-4 text-right font-mono font-bold tabular-nums text-slate-900 text-sm">
                      {formatNPR(tx.amount)}
                    </td>

                    {/* Paid By */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        {payer?.status === 'active' ? (
                          <span
                            className="w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-emerald-100 shrink-0"
                            title="Active Member"
                          />
                        ) : (
                          <span
                            className="w-2 h-2 rounded-full bg-slate-300 shrink-0"
                            title="Archived Member"
                          />
                        )}
                        <span className="font-medium text-slate-800">
                          {payer?.name || 'Unknown Member'}
                        </span>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        <span
                          className="w-2 h-2 rounded-xs shrink-0"
                          style={{ backgroundColor: catColor.bar }}
                        />
                        <span className="font-medium text-slate-700">{tx.category}</span>
                      </div>
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-4 text-slate-600 font-mono text-xs tabular-nums">
                      {formatDate(tx.date)}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => onEditTransaction(tx)}
                          title="Edit transaction"
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (
                              window.confirm(
                                `Are you sure you want to delete "${tx.description}" (${formatNPR(
                                  tx.amount
                                )})?`
                              )
                            ) {
                              onDeleteTransaction(tx.id);
                            }
                          }}
                          title="Delete transaction"
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Table Footer with Filtered Subtotal */}
      <div className="p-3.5 sm:px-6 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
        <div className="flex items-center gap-2">
          <span>Showing {filteredTransactions.length} items</span>
          {selectedCategory !== 'all' && (
            <span className="text-slate-400">· Filtered by: {selectedCategory}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-slate-600 font-medium">Filtered Subtotal:</span>
          <span className="font-mono font-bold text-slate-900 tabular-nums text-sm">
            {formatNPR(totalFilteredAmount)}
          </span>
        </div>
      </div>
    </div>
  );
};
