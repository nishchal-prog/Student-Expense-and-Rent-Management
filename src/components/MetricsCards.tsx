import React from 'react';
import { Wallet, Users, Divide, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { formatNPR } from '../utils/formatters';
import { Roommate } from '../types';

interface MetricsCardsProps {
  totalExpenditure: number;
  activeRoommates: Roommate[];
  individualShare: number;
  onViewRoommates: () => void;
  onViewRegister: () => void;
  onViewSettlement: () => void;
}

export const MetricsCards: React.FC<MetricsCardsProps> = ({
  totalExpenditure,
  activeRoommates,
  individualShare,
  onViewRoommates,
  onViewRegister,
  onViewSettlement,
}) => {
  const activeCount = activeRoommates.length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
      {/* Metric 1: Total Expenditure (NPR) */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs transition-shadow hover:shadow-sm">
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Total Expenditure
          </span>
          <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
            <Wallet className="w-4 h-4" />
          </div>
        </div>

        <div className="flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-mono tabular-nums">
            {formatNPR(totalExpenditure)}
          </span>
        </div>

        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Gross room spend in ledger</span>
          <button
            onClick={onViewRegister}
            className="font-medium text-emerald-600 hover:text-emerald-700 flex items-center gap-0.5"
          >
            <span>View ledger</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Metric 2: Active Roommates */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs transition-shadow hover:shadow-sm">
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Active Roommates
          </span>
          <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
            <Users className="w-4 h-4" />
          </div>
        </div>

        <div className="flex items-baseline gap-3">
          <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-mono tabular-nums">
            {activeCount}
          </span>
          <span className="text-xs text-slate-500">
            {activeCount === 1 ? 'member sharing' : 'members sharing'}
          </span>
        </div>

        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 truncate max-w-[190px]">
            {/* Green status indicator dot next to active members */}
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-slate-600 truncate">
              {activeRoommates.map((r) => r.name).join(', ') || 'No active members'}
            </span>
          </div>

          <button
            onClick={onViewRoommates}
            className="font-medium text-blue-600 hover:text-blue-700 flex items-center gap-0.5 shrink-0"
          >
            <span>Manage</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Metric 3: Individual Share (NPR) */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs transition-shadow hover:shadow-sm">
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Individual Share
          </span>
          <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
            <Divide className="w-4 h-4" />
          </div>
        </div>

        <div className="flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-mono tabular-nums">
            {formatNPR(individualShare)}
          </span>
          <span className="text-xs text-slate-500">/ person</span>
        </div>

        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>
            {activeCount > 0
              ? `Equal 1/${activeCount} active split`
              : 'Add roommates to calculate split'}
          </span>
          <button
            onClick={onViewSettlement}
            className="font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-0.5"
          >
            <span>Check dues</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
