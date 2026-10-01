import React, { useState, useEffect } from 'react';
import { X, Check, Calendar, Tag, User, DollarSign, FileText } from 'lucide-react';
import { Roommate, ExpenseCategory, Transaction } from '../types';
import { ALL_CATEGORIES } from '../utils/formatters';

interface TransactionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (transactionData: Omit<Transaction, 'id' | 'createdAt'>, existingId?: string) => void;
  roommates: Roommate[];
  initialData?: Transaction | null;
  selectedMonth?: string;
}

export const TransactionFormModal: React.FC<TransactionFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  roommates,
  initialData,
  selectedMonth,
}) => {
  const activeRoommates = roommates.filter((r) => r.status === 'active');

  const getDefaultDate = () => {
    const today = new Date().toISOString().slice(0, 10);
    if (!selectedMonth) return today;
    if (today.startsWith(selectedMonth)) return today;
    return `${selectedMonth}-01`;
  };

  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [paidBy, setPaidBy] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('Food');
  const [date, setDate] = useState(getDefaultDate);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    if (initialData) {
      setDescription(initialData.description);
      setAmount(initialData.amount.toString());
      setPaidBy(initialData.paidBy);
      setCategory(initialData.category);
      setDate(initialData.date);
      setNotes(initialData.notes || '');
    } else {
      // Default to first active roommate (e.g. Nishchal)
      setDescription('');
      setAmount('');
      setPaidBy(activeRoommates[0]?.id || '');
      setCategory('Food');
      setDate(getDefaultDate());
      setNotes('');
    }
    setError(null);
  }, [initialData, isOpen, roommates, selectedMonth]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanDesc = description.trim();
    const numAmount = parseFloat(amount);

    if (!cleanDesc) {
      setError('Please provide a description (e.g. WiFi Bill, Groceries).');
      return;
    }

    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid positive amount in NPR.');
      return;
    }

    if (!paidBy) {
      setError('Please select who paid for this expense.');
      return;
    }

    onSave(
      {
        description: cleanDesc,
        amount: Math.round(numAmount),
        paidBy,
        category,
        date,
        notes: notes.trim() || undefined,
      },
      initialData?.id
    );

    onClose();
  };

  const setPreset = (desc: string, cat: ExpenseCategory, approxAmount?: number) => {
    setDescription(desc);
    setCategory(cat);
    if (approxAmount && !amount) {
      setAmount(approxAmount.toString());
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              {initialData ? 'Edit Transaction' : 'Record New Room Expense'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Add out-of-pocket costs to be catalogued and split across active members.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Presets for student rooms */}
        {!initialData && (
          <div className="px-6 pt-3 pb-1 bg-slate-50/70 border-b border-slate-100">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-1.5">
              Quick Suggestions
            </span>
            <div className="flex flex-wrap gap-1.5 pb-2">
              <button
                type="button"
                onClick={() => setPreset('Room Rent', 'Rent', 24000)}
                className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-md hover:border-slate-300 hover:bg-slate-50 transition-colors"
              >
                🏠 Rent
              </button>
              <button
                type="button"
                onClick={() => setPreset('WiFi Internet Bill', 'Utilities', 1750)}
                className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-md hover:border-slate-300 hover:bg-slate-50 transition-colors"
              >
                📶 WiFi Bill
              </button>
              <button
                type="button"
                onClick={() => setPreset('Weekly Groceries', 'Food', 2500)}
                className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-md hover:border-slate-300 hover:bg-slate-50 transition-colors"
              >
                🛒 Groceries
              </button>
              <button
                type="button"
                onClick={() => setPreset('LPG Gas Refill', 'Utilities', 1910)}
                className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-md hover:border-slate-300 hover:bg-slate-50 transition-colors"
              >
                🔥 Gas Cylinder
              </button>
              <button
                type="button"
                onClick={() => setPreset('Drinking Water Jar', 'Food', 120)}
                className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-md hover:border-slate-300 hover:bg-slate-50 transition-colors"
              >
                💧 Water Jar
              </button>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700">
              {error}
            </div>
          )}

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Description <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. WiFi Bill, Groceries, Kitchen Induction"
                className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Amount (NPR) */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Amount (NPR / NRS) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-xs font-semibold text-slate-400 pointer-events-none">
                  NPR
                </span>
                <input
                  type="number"
                  step="any"
                  min="1"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="1250"
                  className="w-full pl-12 pr-3.5 py-2 text-sm font-mono font-medium tabular-nums bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-colors"
                />
              </div>
            </div>

            {/* Paid By (Dropdown) */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Paid By <span className="text-rose-500">*</span>
              </label>
              <select
                value={paidBy}
                onChange={(e) => setPaidBy(e.target.value)}
                required
                className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-colors"
              >
                {activeRoommates.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} (Active)
                  </option>
                ))}
                {/* Include archived roommates if editing an old transaction */}
                {roommates
                  .filter((r) => r.status === 'archived')
                  .map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} (Archived)
                    </option>
                  ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Category (Dropdown) */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Category <span className="text-rose-500">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-colors"
              >
                {ALL_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Transaction Date
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-colors"
              />
            </div>
          </div>

          {/* Notes (Optional) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Notes / Receipt Remarks <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Paid via eSewa / Cash with shopkeeper"
              className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-colors"
            />
          </div>

          {/* Action buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-xs flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{initialData ? 'Update Transaction' : 'Save to Register'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
