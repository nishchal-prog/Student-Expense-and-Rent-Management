import { MemberBalanceSummary, Roommate, SettlementTransfer, Transaction } from '../types';

/**
 * Filter out direct peer-to-peer settlement transactions to get pure room expenditures
 */
export function getRoomExpenses(transactions: Transaction[]): Transaction[] {
  return transactions.filter((t) => !t.isSettlement);
}

/**
 * Calculate total room expenditure in NPR
 */
export function calculateTotalExpenditure(transactions: Transaction[]): number {
  return getRoomExpenses(transactions).reduce((acc, t) => acc + (Number(t.amount) || 0), 0);
}

/**
 * Calculate expenditure grouped by category
 */
export function calculateExpenditureByCategory(transactions: Transaction[]): Record<string, number> {
  const expenses = getRoomExpenses(transactions);
  const byCategory: Record<string, number> = {
    Rent: 0,
    Utilities: 0,
    Food: 0,
    Maintenance: 0,
    'Capital/Assets': 0,
    Other: 0,
  };

  expenses.forEach((t) => {
    const cat = t.category || 'Other';
    byCategory[cat] = (byCategory[cat] || 0) + (Number(t.amount) || 0);
  });

  return byCategory;
}

/**
 * Calculate total gross out-of-pocket amount contributed per member
 */
export function calculateGrossPaidPerMember(
  transactions: Transaction[],
  roommates: Roommate[]
): Record<string, number> {
  const expenses = getRoomExpenses(transactions);
  const paidMap: Record<string, number> = {};

  roommates.forEach((r) => {
    paidMap[r.id] = 0;
  });

  expenses.forEach((t) => {
    if (paidMap[t.paidBy] !== undefined) {
      paidMap[t.paidBy] += Number(t.amount) || 0;
    } else {
      paidMap[t.paidBy] = Number(t.amount) || 0;
    }
  });

  return paidMap;
}

/**
 * Calculates member balances adhering to the Historical Snapshot Rule:
 * - Active members split active expenses equally (Total Expenditure ÷ Active Count)
 * - If archived members exist with frozen snapshots, their balances are preserved exactly
 *   as frozen at their departure date and isolated from future expenses.
 */
export function calculateMemberBalances(
  transactions: Transaction[],
  roommates: Roommate[]
): {
  summaries: MemberBalanceSummary[];
  totalExpenditure: number;
  activeCount: number;
  individualShare: number;
} {
  const activeRoommates = roommates.filter((r) => r.status === 'active');
  const archivedRoommates = roommates.filter((r) => r.status === 'archived');
  const totalExpenditure = calculateTotalExpenditure(transactions);
  const activeCount = activeRoommates.length;

  const grossPaidMap = calculateGrossPaidPerMember(transactions, roommates);

  // If there are archived members with frozen snapshots, account for them:
  // Any expense incurred before departure was co-split; expenses after departure are only split by remaining active members.
  // Standard metric: Base equal split across active members
  const standardActiveShare = activeCount > 0 ? Math.round((totalExpenditure / activeCount) * 100) / 100 : 0;

  const summaries: MemberBalanceSummary[] = [];

  // Active roommates
  activeRoommates.forEach((roommate) => {
    const grossPaid = grossPaidMap[roommate.id] || 0;
    // Factor in any direct settlement transactions
    const settlementsPaid = transactions
      .filter((t) => t.isSettlement && t.paidBy === roommate.id)
      .reduce((sum, t) => sum + t.amount, 0);
    const settlementsReceived = transactions
      .filter((t) => t.isSettlement && t.settlementTo === roommate.id)
      .reduce((sum, t) => sum + t.amount, 0);

    // Effective gross = paid for expenses + paid in settlements - received in settlements
    const effectivePaid = grossPaid + settlementsPaid - settlementsReceived;
    const individualShare = standardActiveShare;
    const netBalance = Math.round((effectivePaid - individualShare) * 100) / 100;

    summaries.push({
      roommate,
      grossPaid,
      individualShare,
      netBalance,
      isFrozen: false,
    });
  });

  // Archived roommates with frozen snapshots
  archivedRoommates.forEach((roommate) => {
    if (roommate.frozenSnapshot) {
      const snap = roommate.frozenSnapshot;
      // Account for settlements made after freeze
      const settlementsPaid = transactions
        .filter((t) => t.isSettlement && t.paidBy === roommate.id)
        .reduce((sum, t) => sum + t.amount, 0);
      const settlementsReceived = transactions
        .filter((t) => t.isSettlement && t.settlementTo === roommate.id)
        .reduce((sum, t) => sum + t.amount, 0);

      const netBalance = snap.settled
        ? 0
        : Math.round((snap.netBalanceAtDeparture + settlementsPaid - settlementsReceived) * 100) / 100;

      summaries.push({
        roommate,
        grossPaid: snap.totalGrossPaid,
        individualShare: snap.individualShareAtDeparture,
        netBalance,
        isFrozen: true,
      });
    } else {
      // Fallback for archived roommate without snapshot
      const grossPaid = grossPaidMap[roommate.id] || 0;
      summaries.push({
        roommate,
        grossPaid,
        individualShare: 0,
        netBalance: grossPaid,
        isFrozen: true,
      });
    }
  });

  return {
    summaries,
    totalExpenditure,
    activeCount,
    individualShare: standardActiveShare,
  };
}

/**
 * Minimum Cash Flow Algorithm to find the simplest set of peer-to-peer transfers
 * e.g., "A owes B NPR 1,200", "C owes B NPR 400"
 */
export function calculateSettlementTransfers(
  summaries: MemberBalanceSummary[]
): SettlementTransfer[] {
  // Only consider members with non-zero balance
  interface PersonBalance {
    id: string;
    name: string;
    balance: number; // positive = creditor (gets money), negative = debtor (owes money)
  }

  const balances: PersonBalance[] = summaries
    .map((s) => ({
      id: s.roommate.id,
      name: s.roommate.name,
      balance: Math.round(s.netBalance),
    }))
    .filter((p) => Math.abs(p.balance) > 0.5);

  const creditors: PersonBalance[] = balances
    .filter((b) => b.balance > 0)
    .sort((a, b) => b.balance - a.balance);

  const debtors: PersonBalance[] = balances
    .filter((b) => b.balance < 0)
    .sort((a, b) => a.balance - b.balance); // most negative first

  const transfers: SettlementTransfer[] = [];

  let i = 0; // debtor index
  let j = 0; // creditor index

  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];

    const amountOwed = Math.abs(debtor.balance);
    const amountCredited = creditor.balance;

    const transferAmount = Math.min(amountOwed, amountCredited);

    if (transferAmount > 0.5) {
      transfers.push({
        fromId: debtor.id,
        fromName: debtor.name,
        toId: creditor.id,
        toName: creditor.name,
        amount: Math.round(transferAmount),
      });
    }

    debtor.balance += transferAmount;
    creditor.balance -= transferAmount;

    if (Math.abs(debtor.balance) < 0.5) {
      i++;
    }
    if (Math.abs(creditor.balance) < 0.5) {
      j++;
    }
  }

  return transfers;
}

/**
 * Generate a historical snapshot for a roommate departing on departureDate
 * - Calculates all room expenses on or before departure date
 * - Divides by active member count up to that point
 * - Freezes their gross contributions and fair share
 */
export function generateDepartureSnapshot(
  roommateId: string,
  departureDate: string,
  transactions: Transaction[],
  roommates: Roommate[]
) {
  // Eligible transactions on or before departure date
  const eligibleExpenses = getRoomExpenses(transactions).filter(
    (t) => t.date <= departureDate
  );

  const totalEligibleExpenditure = eligibleExpenses.reduce(
    (sum, t) => sum + (Number(t.amount) || 0),
    0
  );

  // Active roommates up to that time (including the departing one)
  const activeMembersAtTime = roommates.filter(
    (r) => r.joinedAt <= departureDate && (r.status === 'active' || r.id === roommateId)
  );
  const memberCount = Math.max(1, activeMembersAtTime.length);

  const individualShareAtDeparture = Math.round(
    totalEligibleExpenditure / memberCount
  );

  const totalGrossPaid = eligibleExpenses
    .filter((t) => t.paidBy === roommateId)
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  const netBalanceAtDeparture = totalGrossPaid - individualShareAtDeparture;

  return {
    departureDate,
    totalGrossPaid,
    individualShareAtDeparture,
    netBalanceAtDeparture,
    eligibleTransactionsCount: eligibleExpenses.length,
    settled: Math.abs(netBalanceAtDeparture) < 1,
  };
}
