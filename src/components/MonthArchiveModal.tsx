import React from 'react';
import { X, Calendar, Lock, ArrowRight, Download, CheckCircle2, History } from 'lucide-react';
import { formatMonthName, formatNPR, downloadCSV } from '../utils/formatters';
import { MonthRecord, Transaction, Roommate } from '../types';
import { calculateTotalExpenditure } from '../utils/settlementCalculator';

interface MonthArchiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  monthsList: string[]; // sorted list of monthKeys
  selectedMonth: string;
  onSelectMonth: (monthKey: string) => void;
  monthRecords: MonthRecord[];
  transactions: Transaction[];
  roommates: Roommate[];
}

export const MonthArchiveModal: React.FC<MonthArchiveModalProps> = ({
  isOpen,
  onClose,
  monthsList,
  selectedMonth,
  onSelectMonth,
  monthRecords,
  transactions,
  roommates,
}) => {
  if (!isOpen) return null;

  const monthRecordMap = new Map(monthRecords.map((m) => [m.monthKey, m]));

  const handleExportMonth = (monthKey: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const monthTx = transactions.filter((t) => t.date.startsWith(monthKey));
    downloadCSV(monthTx, roommates);
  };

  const handleSelectAndClose = (monthKey: string) => {
    onSelectMonth(monthKey);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Monthly Records & History Archive
              </h2>
              <p className="text-xs text-slate-500">
                All previously closed and active monthly ledgers stored in the system.
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

        {/* List of Months */}
        <div className="p-6 overflow-y-auto space-y-3">
          {monthsList.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs">
              No monthly records stored yet.
            </div>
          ) : (
            monthsList.map((monthKey) => {
              const monthTx = transactions.filter((t) => t.date.startsWith(monthKey));
              const monthSpend = calculateTotalExpenditure(monthTx);
              const record = monthRecordMap.get(monthKey);
              const isSelected = selectedMonth === monthKey;
              const isClosed = record?.status === 'closed';

              return (
                <div
                  key={monthKey}
                  onClick={() => handleSelectAndClose(monthKey)}
                  className={`border rounded-xl p-4 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-emerald-50/50 border-emerald-300 ring-1 ring-emerald-300'
                      : 'bg-white hover:bg-slate-50/80 border-slate-200'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">
                        {formatMonthName(monthKey)}
                      </span>

                      {isSelected && (
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded-xs">
                          Currently Viewing
                        </span>
                      )}

                      {isClosed ? (
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded-xs flex items-center gap-1">
                          <Lock className="w-2.5 h-2.5" />
                          <span>Archived</span>
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-xs">
                          Active
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-slate-500 flex items-center gap-3">
                      <span>{monthTx.length} transactions</span>
                      <span>·</span>
                      <span>
                        Expenditure:{' '}
                        <strong className="text-slate-700 font-mono tabular-nums">
                          {formatNPR(monthSpend)}
                        </strong>
                      </span>
                    </div>

                    {record?.notes && (
                      <p className="text-[11px] text-slate-400 italic">
                        "{record.notes}"
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={(e) => handleExportMonth(monthKey, e)}
                      title="Export CSV for this month"
                      className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors"
                    >
                      <Download className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleSelectAndClose(monthKey)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      <span>Open Ledger</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 text-xs text-slate-500 flex justify-between items-center shrink-0">
          <span>{monthsList.length} billing cycles stored in history</span>
          <button
            onClick={onClose}
            className="px-3 py-1 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
