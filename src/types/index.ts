export type ExpenseCategory =
  | 'Rent'
  | 'Utilities'
  | 'Food'
  | 'Maintenance'
  | 'Capital/Assets'
  | 'Other';

export interface FrozenSnapshot {
  departureDate: string;
  totalGrossPaid: number;
  individualShareAtDeparture: number;
  netBalanceAtDeparture: number; // totalGrossPaid - individualShareAtDeparture
  eligibleTransactionsCount: number;
  settled: boolean;
  settledAt?: string;
}

export interface Roommate {
  id: string;
  name: string;
  status: 'active' | 'archived';
  joinedAt: string; // YYYY-MM-DD
  departedAt?: string; // YYYY-MM-DD
  phone?: string;
  roomNumber?: string;
  paymentHandle?: string; // eSewa, Khalti, or Bank account
  avatarColor: string;
  notes?: string;
  frozenSnapshot?: FrozenSnapshot;
}

export interface Transaction {
  id: string;
  description: string;
  amount: number; // in NPR
  paidBy: string; // Roommate ID
  category: ExpenseCategory;
  date: string; // YYYY-MM-DD
  notes?: string;
  isSettlement?: boolean; // If true, it's a direct debt settlement between 2 members
  settlementTo?: string; // Roommate ID if isSettlement is true
  createdAt: string;
}

export interface SettlementTransfer {
  fromId: string;
  fromName: string;
  toId: string;
  toName: string;
  amount: number;
}

export interface MemberBalanceSummary {
  roommate: Roommate;
  grossPaid: number;
  individualShare: number;
  netBalance: number; // positive = receives, negative = owes
  isFrozen?: boolean;
}

export interface MonthRecord {
  monthKey: string; // "YYYY-MM", e.g. "2026-10"
  status: 'active' | 'closed';
  closedAt?: string;
  notes?: string;
  totalExpenditureAtClose?: number;
  individualShareAtClose?: number;
  activeCountAtClose?: number;
}

