import React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Archive,
  CheckCircle2,
  Lock,
  PlusCircle,
  FolderClock,
  Sparkles,
} from 'lucide-react';
import { formatMonthName, getPrevMonthKey, getNextMonthKey, getCurrentMonthKey } from '../utils/formatters';
import { MonthRecord } from '../types';

interface MonthBarProps {
  selectedMonth: string; // YYYY-MM
  onSelectMonth: (monthKey: string) => void;
  monthRecord?: MonthRecord;
  hasTransactionsInMonth: boolean;
  totalExpenditureInMonth: number;
  onOpenCloseMonthModal: () => void;
  onOpenArchiveModal: () => void;
  availableMonths: string[];
}

export const MonthBar: React.FC<MonthBarProps> = ({
  selectedMonth,
  onSelectMonth,
  monthRecord,
  hasTransactionsInMonth,
  totalExpenditureInMonth,
  onOpenCloseMonthModal,
  onOpenArchiveModal,
  availableMonths,
}) => {
  const currentRealMonth = getCurrentMonthKey();
  const isCurrentCalendarMonth = selectedMonth === currentRealMonth;
  const isClosed = monthRecord?.status === 'closed';

  const handlePrev = () => {
    onSelectMonth(getPrevMonthKey(selectedMonth));
  };

  const handleNext = () => {
    onSelectMonth(getNextMonthKey(selectedMonth));
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-3.5 sm:p-4 mb-6 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
      {/* Month Navigation Controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={handlePrev}
          title="Previous Month"
          className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2.5 px-2">
          <Calendar className="w-4 h-4 text-emerald-600 shrink-0" />
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-slate-900 tracking-tight">
                {formatMonthName(selectedMonth)}
              </span>

              {/* Status Badges */}
              {isClosed ? (
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded-xs flex items-center gap-1">
                  <Lock className="w-2.5 h-2.5" />
                  <span>Closed & Archived</span>
                </span>
              ) : isCurrentCalendarMonth ? (
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-xs flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Active Cycle</span>
                </span>
              ) : (
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-xs">
                  Past Ledger
                </span>
              )}
            </div>

            <span className="text-[11px] text-slate-400">
              {hasTransactionsInMonth
                ? 'Displaying monthly isolated records & splits'
                : 'Clean slate for this month · No expenses logged yet'}
            </span>
          </div>
        </div>

        <button
          onClick={handleNext}
          title="Next Month"
          className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-2 justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
        {/* View Archives Button */}
        <button
          onClick={onOpenArchiveModal}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors shadow-xs"
        >
          <FolderClock className="w-3.5 h-3.5 text-slate-500" />
          <span>Past Months ({availableMonths.length})</span>
        </button>

        {/* Close & Reset for Next Month */}
        {!isClosed ? (
          <button
            onClick={onOpenCloseMonthModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-xs"
          >
            <Lock className="w-3.5 h-3.5 text-slate-300" />
            <span>Close & Start Next Month</span>
          </button>
        ) : (
          <button
            onClick={() => onSelectMonth(getNextMonthKey(selectedMonth))}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors shadow-xs"
          >
            <PlusCircle className="w-3.5 h-3.5 text-emerald-600" />
            <span>Go to {formatMonthName(getNextMonthKey(selectedMonth))}</span>
          </button>
        )}
      </div>
    </div>
  );
};
