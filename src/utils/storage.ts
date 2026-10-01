import { Roommate, Transaction, MonthRecord } from '../types';
import { getCurrentMonthKey } from './formatters';

const STORAGE_KEYS = {
  ROOMMATES: 'kothahisab_roommates_v1',
  TRANSACTIONS: 'kothahisab_transactions_v1',
  ACTIVE_MONTH: 'kothahisab_active_month_v1',
  MONTH_RECORDS: 'kothahisab_month_records_v1',
};


// Required default state: exactly 1 member named "Nishchal"
export const DEFAULT_NISHCHAL: Roommate = {
  id: 'roommate-nishchal-1',
  name: 'Nishchal',
  status: 'active',
  joinedAt: '2026-08-01',
  phone: '+977 9841234567',
  roomNumber: 'Room 302',
  paymentHandle: 'nishchal@esewa',
  avatarColor: '#10b981', // emerald
  notes: 'Room manager & primary leaseholder',
};

export const DEFAULT_SANISH: Roommate = {
  id: 'roommate-sanish-2',
  name: 'Sanish',
  status: 'active',
  joinedAt: '2026-08-01',
  phone: '+977 9801987654',
  roomNumber: 'Room 302 (Bed A)',
  paymentHandle: 'sanish@esewa',
  avatarColor: '#3b82f6', // blue
  notes: 'Roommate',
};

// Realistic student demo dataset for easy preview
export const DEMO_ROOMMATES: Roommate[] = [
  DEFAULT_NISHCHAL,
  DEFAULT_SANISH,

  {
    id: 'roommate-bibek-3',
    name: 'Bibek Thapa',
    status: 'active',
    joinedAt: '2026-08-15',
    phone: '+977 9812345678',
    roomNumber: 'Room 302 (Bed B)',
    paymentHandle: 'bibek.fonepay',
    avatarColor: '#8b5cf6', // purple
    notes: 'Computer Science student',
  },
  {
    id: 'roommate-rohan-4',
    name: 'Rohan Shrestha',
    status: 'archived',
    joinedAt: '2026-08-01',
    departedAt: '2026-09-01',
    phone: '+977 9860112233',
    roomNumber: 'Ex-Room 302',
    avatarColor: '#64748b', // slate
    notes: 'Moved closer to university campus',
    frozenSnapshot: {
      departureDate: '2026-09-01',
      totalGrossPaid: 12500,
      individualShareAtDeparture: 13000,
      netBalanceAtDeparture: -500, // owed NPR 500
      eligibleTransactionsCount: 5,
      settled: true,
      settledAt: '2026-09-02',
    },
  },
];

export const DEMO_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-1',
    description: 'Flat Rent (September)',
    amount: 24000,
    paidBy: 'roommate-nishchal-1',
    category: 'Rent',
    date: '2026-09-01',
    notes: 'Paid via bank transfer to landlord',
    createdAt: '2026-09-01T08:00:00.000Z',
  },
  {
    id: 'tx-2',
    description: 'WorldLink Fiber Internet 200Mbps',
    amount: 1750,
    paidBy: 'roommate-aarav-2',
    category: 'Utilities',
    date: '2026-09-05',
    notes: 'Monthly renewal bill',
    createdAt: '2026-09-05T10:30:00.000Z',
  },
  {
    id: 'tx-3',
    description: 'Bhatbhateni Supermarket Groceries',
    amount: 6200,
    paidBy: 'roommate-bibek-3',
    category: 'Food',
    date: '2026-09-10',
    notes: 'Rice, lentils, cooking oil, spices',
    createdAt: '2026-09-10T14:15:00.000Z',
  },
  {
    id: 'tx-4',
    description: 'Nepal Gas LPG Cylinder refill',
    amount: 1910,
    paidBy: 'roommate-nishchal-1',
    category: 'Utilities',
    date: '2026-09-14',
    notes: 'Kitchen cooking gas',
    createdAt: '2026-09-14T09:00:00.000Z',
  },
  {
    id: 'tx-5',
    description: 'Euroguard Water Dispenser & 2 Jars',
    amount: 3200,
    paidBy: 'roommate-aarav-2',
    category: 'Capital/Assets',
    date: '2026-09-18',
    notes: 'Common asset for drinking water',
    createdAt: '2026-09-18T16:45:00.000Z',
  },
  {
    id: 'tx-6',
    description: 'Kitchen Sink Tap Plumbing & Valve',
    amount: 1100,
    paidBy: 'roommate-bibek-3',
    category: 'Maintenance',
    date: '2026-09-22',
    notes: 'Repaired leakage in bathroom & sink',
    createdAt: '2026-09-22T11:20:00.000Z',
  },
  {
    id: 'tx-7',
    description: 'Weekly Vegetables & Dairy Mess',
    amount: 2450,
    paidBy: 'roommate-nishchal-1',
    category: 'Food',
    date: '2026-09-28',
    notes: 'Fresh local veggies from Kalimati market',
    createdAt: '2026-09-28T07:45:00.000Z',
  },
];

export function loadStoredRoommates(): Roommate[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ROOMMATES);
    if (!raw) {
      // Default initial state: start with Nishchal as specified
      return [DEFAULT_NISHCHAL];
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return [DEFAULT_NISHCHAL];
  } catch (e) {
    console.error('Failed to load roommates from storage', e);
    return [DEFAULT_NISHCHAL];
  }
}

export function saveStoredRoommates(roommates: Roommate[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.ROOMMATES, JSON.stringify(roommates));
  } catch (e) {
    console.error('Failed to save roommates to storage', e);
  }
}

export function loadStoredTransactions(): Transaction[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('Failed to load transactions from storage', e);
    return [];
  }
}

export function saveStoredTransactions(transactions: Transaction[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  } catch (e) {
    console.error('Failed to save transactions to storage', e);
  }
}

export function loadStoredActiveMonth(): string {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ACTIVE_MONTH);
    if (raw && /^\d{4}-\d{2}$/.test(raw)) {
      return raw;
    }
  } catch (e) {
    console.error('Failed to load active month from storage', e);
  }
  return getCurrentMonthKey();
}

export function saveStoredActiveMonth(monthKey: string): void {
  try {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_MONTH, monthKey);
  } catch (e) {
    console.error('Failed to save active month to storage', e);
  }
}

export function loadStoredMonthRecords(): MonthRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MONTH_RECORDS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.error('Failed to load month records from storage', e);
  }
  return [];
}

export function saveStoredMonthRecords(records: MonthRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.MONTH_RECORDS, JSON.stringify(records));
  } catch (e) {
    console.error('Failed to save month records to storage', e);
  }
}

