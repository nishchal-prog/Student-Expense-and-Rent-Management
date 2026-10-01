import React, { useState } from 'react';
import { X, Check, Lock, ArrowRight, ShieldCheck, Calendar, AlertCircle } from 'lucide-react';
import { formatMonthName, formatNPR, getNextMonthKey } from '../utils/formatters';
import { MemberBalanceSummary, SettlementTransfer } from '../types';

interface CloseMonthModalProps {
  isOpen: boolean;
  onClose: () => void;
  monthKey: string;
  totalExpenditure: number;
  activeCount: number;
  individualShare: number;
  summaries: MemberBalanceSummary[];
  transfers: SettlementTransfer[];
  onConfirmClose: (monthKey: string, nextMonthKey: string, notes?: string) => void;
}

export const CloseMonthModal: React.FC<CloseMonthModalProps> = ({
  isOpen,
  onClose,
  monthKey,
  totalExpenditure,
  activeCount,
  individualShare,
  summaries,
  transfers,
  onConfirmClose,
}) => {
  const [notes, setNotes] = useState('');
  const nextMonthKey = getNextMonthKey(monthKey);

  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirmClose(monthKey, nextMonthKey, notes.trim() || undefined);
    onClose();
  };

  const hasUnsettledDues = transfers.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Close & Archive {formatMonthName(monthKey)}
              </h2>
              <p className="text-xs text-slate-500">
                Freeze current ledger and roll over to a clean month.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Explanation Callout */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1.5">
            <div className="flex items-center gap-1.5 text-slate-900 font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Monthly Reset & Permanent Storage</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Closing this month archives all transactions, category totals, and settlement balances
              for <strong className="text-slate-900">{formatMonthName(monthKey)}</strong>.
              The ledger will automatically reset for <strong className="text-emerald-700">{formatMonthName(nextMonthKey)}</strong> with
              0 NPR, ready for new rent and grocery bills.
            </p>
          </div>

          {/* Month Summary Snapshot Card */}
          <div className="border border-slate-200 rounded-lg p-4 bg-white space-y-2.5">
            <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Month Being Closed:</span>
              <span className="font-bold text-slate-900">{formatMonthName(monthKey)}</span>
            </div>

            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500 font-medium">Total Month Expenditure:</span>
              <span className="font-mono font-bold text-slate-900 tabular-nums">
                {formatNPR(totalExpenditure)}
              </span>
            </div>

            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500 font-medium">Active Roommates Sharing:</span>
              <span className="font-mono font-bold text-slate-900 tabular-nums">
                {activeCount} members
              </span>
            </div>

            <div className="flex justify-between items-center text-xs pt-1 border-t border-slate-100">
              <span className="text-slate-700 font-semibold">Individual Fair Share:</span>
              <span className="font-mono font-extrabold text-emerald-700 tabular-nums text-sm">
                {formatNPR(individualShare)} / person
              </span>
            </div>
          </div>

          {/* Dues notification */}
          {hasUnsettledDues ? (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold">Unsettled transfers detected:</span> There are{' '}
                {transfers.length} remaining dues in this month. They will be archived with this
                month's record and can be viewed anytime in the archives.
              </div>
            </div>
          ) : (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>All roommate balances in this month are completely settled!</span>
            </div>
          )}

          {/* Notes (Optional) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Month Archive Memo / Notes <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. All landlord rent and WiFi bills paid"
              className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600"
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
              type="button"
              onClick={handleConfirm}
              className="px-5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-xs flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Close & Start {formatMonthName(nextMonthKey)}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
