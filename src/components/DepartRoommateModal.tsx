import React, { useState, useMemo } from 'react';
import { X, AlertTriangle, ShieldCheck, Check, Calendar, ArrowRight } from 'lucide-react';
import { Roommate, Transaction } from '../types';
import { generateDepartureSnapshot } from '../utils/settlementCalculator';
import { formatNPR, formatDate } from '../utils/formatters';

interface DepartRoommateModalProps {
  isOpen: boolean;
  onClose: () => void;
  roommate: Roommate | null;
  transactions: Transaction[];
  roommates: Roommate[];
  onConfirmDeparture: (
    roommateId: string,
    snapshot: ReturnType<typeof generateDepartureSnapshot>
  ) => void;
}

export const DepartRoommateModal: React.FC<DepartRoommateModalProps> = ({
  isOpen,
  onClose,
  roommate,
  transactions,
  roommates,
  onConfirmDeparture,
}) => {
  const [departureDate, setDepartureDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [markAsSettled, setMarkAsSettled] = useState(false);

  const snapshot = useMemo(() => {
    if (!roommate) return null;
    const snap = generateDepartureSnapshot(roommate.id, departureDate, transactions, roommates);
    return {
      ...snap,
      settled: markAsSettled,
      settledAt: markAsSettled ? departureDate : undefined,
    };
  }, [roommate, departureDate, transactions, roommates, markAsSettled]);

  if (!isOpen || !roommate || !snapshot) return null;

  const handleConfirm = () => {
    onConfirmDeparture(roommate.id, snapshot);
    onClose();
  };

  const isOwed = snapshot.netBalanceAtDeparture > 0;
  const owes = snapshot.netBalanceAtDeparture < 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Depart Roommate & Freeze Historical Snapshot
              </h2>
              <p className="text-xs text-slate-500">
                Preserve historical settlement ledger for {roommate.name}
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
          {/* Historical Snapshot Rule Callout */}
          <div className="p-3.5 bg-indigo-50/60 border border-indigo-100 rounded-lg text-xs space-y-1">
            <div className="flex items-center gap-1.5 text-indigo-900 font-semibold">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              <span>Historical Snapshot Rule</span>
            </div>
            <p className="text-indigo-800/90 leading-relaxed">
              When {roommate.name} leaves, their total expense share and gross contributions are
              frozen as of their departure date. Past records stay permanently balanced, and future room
              expenses will only be shared by remaining active flatmates.
            </p>
          </div>

          {/* Departure Date Picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Official Departure Date
            </label>
            <div className="relative">
              <input
                type="date"
                required
                value={departureDate}
                onChange={(e) => setDepartureDate(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
              />
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">
              Joined on {formatDate(roommate.joinedAt)}. Expenses up to this date are included in their split.
            </span>
          </div>

          {/* Snapshot Summary Box */}
          <div className="border border-slate-200 rounded-lg p-4 bg-slate-50/70 space-y-2.5">
            <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-200">
              <span className="text-slate-500 font-medium">Eligible Tenancy Transactions:</span>
              <span className="font-mono font-semibold text-slate-800">
                {snapshot.eligibleTransactionsCount} items
              </span>
            </div>

            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500 font-medium">Gross Amount Paid Out-of-Pocket:</span>
              <span className="font-mono font-semibold text-slate-900 tabular-nums">
                {formatNPR(snapshot.totalGrossPaid)}
              </span>
            </div>

            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500 font-medium">Tenancy Individual Fair Share:</span>
              <span className="font-mono font-semibold text-slate-900 tabular-nums">
                {formatNPR(snapshot.individualShareAtDeparture)}
              </span>
            </div>

            <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline">
              <span className="text-xs font-bold text-slate-700">Net Exit Balance:</span>
              <span
                className={`text-base font-extrabold font-mono tabular-nums ${
                  isOwed
                    ? 'text-emerald-700'
                    : owes
                    ? 'text-rose-600'
                    : 'text-slate-700'
                }`}
              >
                {formatNPR(snapshot.netBalanceAtDeparture, { showSign: true })}
              </span>
            </div>

            <div className="text-[11px] text-slate-500 pt-1">
              {isOwed && (
                <span className="text-emerald-700 font-medium">
                  {roommate.name} paid more than their share and should receive {formatNPR(snapshot.netBalanceAtDeparture)} from room members upon departure.
                </span>
              )}
              {owes && (
                <span className="text-rose-600 font-medium">
                  {roommate.name} owes {formatNPR(Math.abs(snapshot.netBalanceAtDeparture))} to the room pool to square up.
                </span>
              )}
              {!isOwed && !owes && (
                <span className="text-slate-600 font-medium">
                  All accounts are even. No departure dues pending!
                </span>
              )}
            </div>
          </div>

          {/* Mark as settled checkbox */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="markSettledCheck"
              checked={markAsSettled}
              onChange={(e) => setMarkAsSettled(e.target.checked)}
              className="w-4 h-4 rounded text-emerald-600 border-slate-300 focus:ring-emerald-500"
            />
            <label htmlFor="markSettledCheck" className="text-xs font-medium text-slate-700 cursor-pointer">
              Mark final exit balance as settled (paid in cash or transfer upon departure)
            </label>
          </div>

          {/* Action buttons */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
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
              className="px-4 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors shadow-xs flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Freeze Snapshot & Depart</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
