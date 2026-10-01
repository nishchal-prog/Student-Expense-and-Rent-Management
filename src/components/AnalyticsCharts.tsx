import React, { useState } from 'react';
import { BarChart3, PieChart, Users, TrendingUp, Info } from 'lucide-react';
import { formatNPR, CATEGORY_COLORS, ALL_CATEGORIES } from '../utils/formatters';
import { Roommate, Transaction, ExpenseCategory } from '../types';
import {
  calculateExpenditureByCategory,
  calculateGrossPaidPerMember,
  calculateTotalExpenditure,
} from '../utils/settlementCalculator';

interface AnalyticsChartsProps {
  transactions: Transaction[];
  roommates: Roommate[];
  onOpenExpenseModal: () => void;
}

export const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({
  transactions,
  roommates,
  onOpenExpenseModal,
}) => {
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [hoveredMember, setHoveredMember] = useState<string | null>(null);

  const totalExpenditure = calculateTotalExpenditure(transactions);
  const categoryData = calculateExpenditureByCategory(transactions);
  const memberGrossPaid = calculateGrossPaidPerMember(transactions, roommates);

  // Prepare Category items sorted by spend
  const categoryList = ALL_CATEGORIES.map((cat) => {
    const amount = categoryData[cat] || 0;
    const percentage = totalExpenditure > 0 ? (amount / totalExpenditure) * 100 : 0;
    return {
      category: cat,
      amount,
      percentage,
      color: CATEGORY_COLORS[cat].bar,
      textColor: CATEGORY_COLORS[cat].text,
      bgColor: CATEGORY_COLORS[cat].bg,
    };
  }).filter((item) => item.amount > 0 || totalExpenditure === 0);

  const maxCategoryAmount = Math.max(...categoryList.map((c) => c.amount), 1);

  // Prepare Member items sorted by amount contributed
  const memberList = roommates.map((m) => {
    const amount = memberGrossPaid[m.id] || 0;
    const percentage = totalExpenditure > 0 ? (amount / totalExpenditure) * 100 : 0;
    return {
      id: m.id,
      name: m.name,
      status: m.status,
      amount,
      percentage,
      avatarColor: m.avatarColor,
    };
  }).sort((a, b) => b.amount - a.amount);

  const maxMemberAmount = Math.max(...memberList.map((m) => m.amount), 1);

  const hasData = transactions.some((t) => !t.isSettlement && t.amount > 0);

  if (!hasData) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-8 text-center my-6">
        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-500">
          <BarChart3 className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-slate-900 mb-1">
          No expenditure data recorded yet
        </h3>
        <p className="text-sm text-slate-500 max-w-md mx-auto mb-4">
          Add your room's first shared expense (like Rent, WiFi, or Groceries) to generate visual
          category breakdowns and member contribution charts.
        </p>
        <button
          onClick={onOpenExpenseModal}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-xs"
        >
          Add First Expense
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 my-6">
      {/* ----------------- CHART 1: CAPITAL EXPENDITURE BY CATEGORY ----------------- */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Chart 1
                </span>
                <span className="text-slate-300">·</span>
                <span className="text-xs font-medium text-slate-500">Category Breakdown</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 tracking-tight mt-0.5">
                Capital Expenditure by Category
              </h3>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400 block">Total Catalogued</span>
              <span className="text-sm font-bold font-mono text-slate-900 tabular-nums">
                {formatNPR(totalExpenditure)}
              </span>
            </div>
          </div>

          <p className="text-xs text-slate-500 mb-6">
            Proportional breakdown of all shared room costs across rent, food, utilities, and assets.
          </p>

          {/* Bar Chart Bars */}
          <div className="space-y-4">
            {categoryList.map((item) => {
              const barWidth = Math.max(4, Math.round((item.amount / maxCategoryAmount) * 100));
              const isHovered = hoveredCategory === item.category;

              return (
                <div
                  key={item.category}
                  onMouseEnter={() => setHoveredCategory(item.category)}
                  onMouseLeave={() => setHoveredCategory(null)}
                  className={`group p-2 rounded-lg transition-all ${
                    isHovered ? 'bg-slate-50 ring-1 ring-slate-200' : ''
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-xs"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="font-semibold text-slate-800">{item.category}</span>
                      <span className="text-slate-400 font-mono tabular-nums">
                        ({item.percentage.toFixed(1)}%)
                      </span>
                    </div>

                    <div className="font-mono font-semibold text-slate-900 tabular-nums">
                      {formatNPR(item.amount)}
                    </div>
                  </div>

                  {/* Horizontal Bar track */}
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex">
                    <div
                      className="h-full rounded-full transition-all duration-500 ease-out"
                      style={{
                        width: `${barWidth}%`,
                        backgroundColor: item.color,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer info pill */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-slate-400" />
            <span>Highest expenditure:</span>
            <strong className="text-slate-700">
              {categoryList[0]?.category} ({formatNPR(categoryList[0]?.amount || 0)})
            </strong>
          </span>
          <span className="text-slate-400 font-mono tabular-nums">
            {categoryList.length} Categories Active
          </span>
        </div>
      </div>

      {/* ----------------- CHART 2: GROSS CAPITAL CONTRIBUTED PER MEMBER ----------------- */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Chart 2
                </span>
                <span className="text-slate-300">·</span>
                <span className="text-xs font-medium text-slate-500">Member Contributions</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 tracking-tight mt-0.5">
                Gross Capital Contributed per Member
              </h3>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400 block">Active Members</span>
              <span className="text-sm font-bold font-mono text-slate-900 tabular-nums">
                {roommates.filter((r) => r.status === 'active').length}
              </span>
            </div>
          </div>

          <p className="text-xs text-slate-500 mb-6">
            Gross out-of-pocket NPR cash contributed by each roommate for shared expenses.
          </p>

          {/* Member contribution bars */}
          <div className="space-y-4">
            {memberList.map((member) => {
              const barWidth =
                maxMemberAmount > 0
                  ? Math.max(4, Math.round((member.amount / maxMemberAmount) * 100))
                  : 4;
              const isHovered = hoveredMember === member.id;
              const isActive = member.status === 'active';

              return (
                <div
                  key={member.id}
                  onMouseEnter={() => setHoveredMember(member.id)}
                  onMouseLeave={() => setHoveredMember(null)}
                  className={`group p-2 rounded-lg transition-all ${
                    isHovered ? 'bg-slate-50 ring-1 ring-slate-200' : ''
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <div className="flex items-center gap-2">
                      {/* Green status indicator dot next to active members */}
                      {isActive ? (
                        <span
                          className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-100 shrink-0"
                          title="Active Roommate"
                        />
                      ) : (
                        <span
                          className="w-2.5 h-2.5 rounded-full bg-slate-300 shrink-0"
                          title="Archived Roommate"
                        />
                      )}
                      <span className="font-semibold text-slate-900">{member.name}</span>
                      {!isActive && (
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                          (Archived)
                        </span>
                      )}
                      <span className="text-slate-400 font-mono tabular-nums">
                        ({member.percentage.toFixed(1)}% of total)
                      </span>
                    </div>

                    <div className="font-mono font-semibold text-slate-900 tabular-nums">
                      {formatNPR(member.amount)}
                    </div>
                  </div>

                  {/* Horizontal Bar track */}
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ease-out ${
                        isActive ? 'bg-emerald-600' : 'bg-slate-400'
                      }`}
                      style={{
                        width: `${barWidth}%`,
                        backgroundColor: member.avatarColor || undefined,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer info pill */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-slate-400" />
            <span>Top out-of-pocket payer:</span>
            <strong className="text-slate-700">
              {memberList[0]?.name || 'None'} ({formatNPR(memberList[0]?.amount || 0)})
            </strong>
          </span>
          <span className="text-slate-400 font-mono tabular-nums">
            {roommates.length} Total Registered
          </span>
        </div>
      </div>
    </div>
  );
};
