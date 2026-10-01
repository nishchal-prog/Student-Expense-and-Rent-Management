import React, { useState } from 'react';
import {
  ArrowRight,
  CheckCircle,
  HelpCircle,
  Sparkles,
  CreditCard,
  UserCheck,
  AlertCircle,
  Clock,
  ArrowUpRight,
} from 'lucide-react';
import { MemberBalanceSummary, Roommate, SettlementTransfer, Transaction } from '../types';
import { formatNPR } from '../utils/formatters';
import { calculateSettlementTransfers } from '../utils/settlementCalculator';

interface SettlementModuleProps {
  summaries: MemberBalanceSummary[];
  totalExpenditure: number;
  activeCount: number;
  individualShare: number;
  onRecordSettlement: (fromId: string, toId: string, amount: number, note: string) => void;
  onOpenRoommateModal: () => void;
}

export const SettlementModule: React.FC<SettlementModuleProps> = ({
  summaries,
  totalExpenditure,
  activeCount,
  individualShare,
  onRecordSettlement,
  onOpenRoommateModal,
}) => {
  const [selectedTransfer, setSelectedTransfer] = useState<SettlementTransfer | null>(null);
  const [settlementNote, setSettlementNote] = useState('Settled via eSewa / Cash');

  const transfers = calculateSettlementTransfers(summaries);

  const handleConfirmTransfer = (transfer: SettlementTransfer) => {
    onRecordSettlement(transfer.fromId, transfer.toId, transfer.amount, settlementNote);
    setSelectedTransfer(null);
  };

  const activeSummaries = summaries.filter((s) => s.roommate.status === 'active');
  const archivedSummaries = summaries.filter((s) => s.roommate.status === 'archived');

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-xs">
                Real-Time Settlement Engine
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight mt-1">
              Balance splitting
            </h2>
          </div>

          <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-3 text-right shrink-0">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
              Equal Fair Share
            </span>
            <span className="text-lg font-bold font-mono text-slate-900 tabular-nums">
              {formatNPR(individualShare)}
            </span>
            <span className="text-[11px] text-slate-500 block">
              per member ({activeCount} active)
            </span>
          </div>
        </div>

        {/* Member Net Balance Cards Grid */}
        <div className="mt-5">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
            Active Members Balance Overview
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {activeSummaries.map((summary) => {
              const { roommate, grossPaid, individualShare: share, netBalance } = summary;
              const isCreditor = netBalance > 0.5;
              const isDebtor = netBalance < -0.5;
              const isEven = !isCreditor && !isDebtor;

              return (
                <div
                  key={roommate.id}
                  className={`border rounded-xl p-4 transition-all ${
                    isCreditor
                      ? 'bg-emerald-50/40 border-emerald-200'
                      : isDebtor
                      ? 'bg-amber-50/40 border-amber-200'
                      : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {/* Green active status indicator dot */}
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-100 shrink-0" />
                      <div>
                        <h4 className="font-bold text-sm text-slate-900 leading-tight">
                          {roommate.name}
                        </h4>
                        <span className="text-[11px] text-slate-500">
                          {roommate.roomNumber || 'Roommate'}
                        </span>
                      </div>
                    </div>

                    {/* Status marker */}
                    <div>
                      {isCreditor && (
                        <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-xs">
                          Gets Back
                        </span>
                      )}
                      {isDebtor && (
                        <span className="text-[11px] font-bold text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded-xs">
                          Owes Room
                        </span>
                      )}
                      {isEven && (
                        <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-xs">
                          Settled
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Net Amount */}
                  <div className="my-3 py-2 px-3 rounded-lg bg-white/80 border border-slate-100 flex items-baseline justify-between">
                    <span className="text-xs font-medium text-slate-500">Net Position:</span>
                    <span
                      className={`text-base font-extrabold font-mono tabular-nums ${
                        isCreditor
                          ? 'text-emerald-700'
                          : isDebtor
                          ? 'text-rose-600'
                          : 'text-slate-600'
                      }`}
                    >
                      {formatNPR(netBalance, { showSign: true })}
                    </span>
                  </div>

                  {/* Breakdown metrics */}
                  <div className="space-y-1 text-xs pt-1 border-t border-slate-100/80">
                    <div className="flex justify-between text-slate-500">
                      <span>Gross Paid Out-of-Pocket:</span>
                      <span className="font-mono font-medium text-slate-800 tabular-nums">
                        {formatNPR(grossPaid)}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>Equal Share of Pool:</span>
                      <span className="font-mono font-medium text-slate-800 tabular-nums">
                        {formatNPR(share)}
                      </span>
                    </div>
                  </div>

                  {/* Explicit Who Has To Give Whom Direction */}
                  {(() => {
                    const givesTo = transfers.filter((t) => t.fromId === roommate.id);
                    const receivesFrom = transfers.filter((t) => t.toId === roommate.id);

                    if (givesTo.length > 0) {
                      return (
                        <div className="mt-2.5 pt-2 border-t border-amber-200/70 text-xs">
                          {givesTo.map((t, idx) => (
                            <div key={idx} className="text-rose-700 font-semibold flex items-center justify-between">
                              <span>Has to give to {t.toName}:</span>
                              <span className="font-mono font-bold tabular-nums">{formatNPR(t.amount)}</span>
                            </div>
                          ))}
                        </div>
                      );
                    }

                    if (receivesFrom.length > 0) {
                      return (
                        <div className="mt-2.5 pt-2 border-t border-emerald-200/70 text-xs">
                          {receivesFrom.map((t, idx) => (
                            <div key={idx} className="text-emerald-800 font-semibold flex items-center justify-between">
                              <span>To receive from {t.fromName}:</span>
                              <span className="font-mono font-bold tabular-nums">{formatNPR(t.amount)}</span>
                            </div>
                          ))}
                        </div>
                      );
                    }

                    return null;
                  })()}

                  {roommate.paymentHandle && (
                    <div className="mt-2.5 pt-2 border-t border-slate-100/60 text-[11px] text-slate-400 flex items-center justify-between">
                      <span>Pay handle:</span>
                      <span className="font-mono text-slate-600 font-medium select-all">
                        {roommate.paymentHandle}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Archived Members section if any */}
        {archivedSummaries.length > 0 && (
          <div className="mt-6 pt-5 border-t border-slate-100">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Departed Roommates (Historical Snapshot)
              </span>
              <span className="text-slate-300">·</span>
              <span className="text-xs text-slate-400">Frozen at departure date</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {archivedSummaries.map((summary) => (
                <div
                  key={summary.roommate.id}
                  className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-slate-300 shrink-0" />
                    <div>
                      <div className="font-semibold text-slate-800">{summary.roommate.name}</div>
                      <div className="text-[11px] text-slate-400">
                        Departed: {summary.roommate.frozenSnapshot?.departureDate || 'Archived'}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[11px] text-slate-400 block">Frozen Net:</span>
                    <span
                      className={`font-mono font-bold tabular-nums ${
                        summary.netBalance > 0
                          ? 'text-emerald-700'
                          : summary.netBalance < 0
                          ? 'text-rose-600'
                          : 'text-slate-600'
                      }`}
                    >
                      {summary.roommate.frozenSnapshot?.settled
                        ? 'Settled at Departure'
                        : formatNPR(summary.netBalance, { showSign: true })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Direct Debt Resolution (Who Owes Whom) */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Direct Transfers
            </h3>
          </div>

          <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
            {transfers.length === 0 ? 'All Settled' : `${transfers.length} Payment Required`}
          </span>
        </div>

        {transfers.length === 0 ? (
          <div className="py-8 text-center bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
            <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-800">
              Every roommate is completely settled up!
            </p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
              Either all expenses are split equally, or out-of-pocket contributions currently match
              exact member shares.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {transfers.map((t, idx) => (
              <div
                key={`${t.fromId}-${t.toId}-${idx}`}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50 hover:bg-slate-100/70 border border-slate-200 rounded-xl transition-colors gap-3"
              >
                {/* Clear Transfer Statement */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0" />
                    <span className="text-sm text-slate-800 font-medium">
                      <strong className="text-slate-900 font-bold">{t.fromName}</strong>{' '}
                      <span className="text-rose-600 font-semibold">has to give</span>{' '}
                      <strong className="font-mono font-extrabold text-emerald-700 tabular-nums">
                        {formatNPR(t.amount)}
                      </strong>{' '}
                      <span>to</span>{' '}
                      <strong className="text-slate-900 font-bold">{t.toName}</strong>
                    </span>
                  </div>
                </div>

                {/* Amount & Settle Button */}
                <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200/60">
                  <div className="text-right">
                    <span className="text-base font-extrabold font-mono text-emerald-700 tabular-nums">
                      {formatNPR(t.amount)}
                    </span>
                  </div>

                  <button
                    onClick={() => handleConfirmTransfer(t)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-emerald-700 rounded-lg transition-colors shadow-xs"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Record Settle</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Settle Payment Modal Confirmation */}
      {selectedTransfer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md p-6">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Confirm Settle-Up Payment
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Recording this settlement logs a peer-to-peer transfer in the ledger and zeroes out this due.
            </p>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 mb-4 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Payer (Debtor):</span>
                <span className="font-semibold text-slate-800">{selectedTransfer.fromName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Receiver (Creditor):</span>
                <span className="font-semibold text-slate-800">{selectedTransfer.toName}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-slate-200 text-sm">
                <span className="font-bold text-slate-700">Settlement Amount:</span>
                <span className="font-bold font-mono text-emerald-700 tabular-nums">
                  {formatNPR(selectedTransfer.amount)}
                </span>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Settlement Remarks / Mode
              </label>
              <input
                type="text"
                value={settlementNote}
                onChange={(e) => setSettlementNote(e.target.value)}
                className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-600"
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setSelectedTransfer(null)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => handleConfirmTransfer(selectedTransfer)}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg"
              >
                Confirm Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
