import { ExpenseCategory, Roommate, Transaction } from '../types';

/**
 * Format currency in Nepalese Rupees (NPR / NRS)
 * e.g., 1250 => "NPR 1,250"
 */
export function formatNPR(amount: number, options?: { showSign?: boolean; compact?: boolean }): string {
  const isNegative = amount < 0;
  const absVal = Math.abs(amount);

  let formattedNum: string;
  if (options?.compact && absVal >= 100000) {
    formattedNum = (absVal / 100000).toFixed(2).replace(/\.00$/, '') + ' Lakh';
  } else if (options?.compact && absVal >= 1000) {
    formattedNum = (absVal / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
  } else {
    formattedNum = Math.round(absVal).toLocaleString('en-IN');
  }

  if (options?.showSign) {
    if (amount > 0) return `+NPR ${formattedNum}`;
    if (amount < 0) return `-NPR ${formattedNum}`;
    return `NPR ${formattedNum}`;
  }

  return isNegative ? `-NPR ${formattedNum}` : `NPR ${formattedNum}`;
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  try {
    const [year, month, day] = dateStr.split('-').map(Number);
    if (!year || !month || !day) return dateStr;
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

export function getCurrentMonthKey(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

export function formatMonthName(monthKey: string): string {
  if (!monthKey) return '';
  const [yearStr, monthStr] = monthKey.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  if (isNaN(year) || isNaN(month)) return monthKey;
  const date = new Date(year, month - 1, 1);
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

export function getPrevMonthKey(monthKey: string): string {
  const [yearStr, monthStr] = monthKey.split('-');
  let year = parseInt(yearStr, 10);
  let month = parseInt(monthStr, 10) - 1;
  if (month < 1) {
    month = 12;
    year -= 1;
  }
  return `${year}-${String(month).padStart(2, '0')}`;
}

export function getNextMonthKey(monthKey: string): string {
  const [yearStr, monthStr] = monthKey.split('-');
  let year = parseInt(yearStr, 10);
  let month = parseInt(monthStr, 10) + 1;
  if (month > 12) {
    month = 1;
    year += 1;
  }
  return `${year}-${String(month).padStart(2, '0')}`;
}


export const CATEGORY_COLORS: Record<ExpenseCategory, { bg: string; text: string; bar: string }> = {
  Rent: {
    bg: 'bg-indigo-50 dark:bg-indigo-950/40',
    text: 'text-indigo-700 dark:text-indigo-400',
    bar: '#6366f1',
  },
  Utilities: {
    bg: 'bg-amber-50 dark:bg-amber-950/40',
    text: 'text-amber-700 dark:text-amber-400',
    bar: '#f59e0b',
  },
  Food: {
    bg: 'bg-emerald-50 dark:bg-emerald-950/40',
    text: 'text-emerald-700 dark:text-emerald-400',
    bar: '#10b981',
  },
  Maintenance: {
    bg: 'bg-rose-50 dark:bg-rose-950/40',
    text: 'text-rose-700 dark:text-rose-400',
    bar: '#f43f5e',
  },
  'Capital/Assets': {
    bg: 'bg-violet-50 dark:bg-violet-950/40',
    text: 'text-violet-700 dark:text-violet-400',
    bar: '#8b5cf6',
  },
  Other: {
    bg: 'bg-slate-100 dark:bg-slate-800',
    text: 'text-slate-700 dark:text-slate-300',
    bar: '#64748b',
  },
};

export const ALL_CATEGORIES: ExpenseCategory[] = [
  'Rent',
  'Utilities',
  'Food',
  'Maintenance',
  'Capital/Assets',
  'Other',
];

export function downloadCSV(transactions: Transaction[], roommates: Roommate[]) {
  const roommateMap = new Map(roommates.map((r) => [r.id, r.name]));

  const headers = ['Date', 'Description', 'Category', 'Paid By', 'Amount (NPR)', 'Type', 'Notes'];
  const rows = transactions.map((t) => [
    t.date,
    `"${t.description.replace(/"/g, '""')}"`,
    t.category,
    `"${roommateMap.get(t.paidBy) || 'Unknown'}"`,
    t.amount.toString(),
    t.isSettlement ? 'Direct Settlement' : 'Room Expense',
    `"${(t.notes || '').replace(/"/g, '""')}"`,
  ]);

  const csvContent = [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `kothahisab_register_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
