/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Navbar } from './components/Navbar';
import { MonthBar } from './components/MonthBar';
import { MetricsCards } from './components/MetricsCards';
import { AnalyticsCharts } from './components/AnalyticsCharts';
import { TransactionRegister } from './components/TransactionRegister';
import { SettlementModule } from './components/SettlementModule';
import { RoommateManagement } from './components/RoommateManagement';
import { TransactionFormModal } from './components/TransactionFormModal';
import { AddRoommateModal } from './components/AddRoommateModal';
import { DepartRoommateModal } from './components/DepartRoommateModal';
import { CloseMonthModal } from './components/CloseMonthModal';
import { MonthArchiveModal } from './components/MonthArchiveModal';
import { Roommate, Transaction, MonthRecord } from './types';
import {
  loadStoredRoommates,
  saveStoredRoommates,
  loadStoredTransactions,
  saveStoredTransactions,
  loadStoredActiveMonth,
  saveStoredActiveMonth,
  loadStoredMonthRecords,
  saveStoredMonthRecords,
  DEMO_ROOMMATES,
  DEMO_TRANSACTIONS,
  DEFAULT_NISHCHAL,
  DEFAULT_SANISH,
} from './utils/storage';
import {
  calculateMemberBalances,
  calculateSettlementTransfers,
  generateDepartureSnapshot,
} from './utils/settlementCalculator';
import { formatNPR, getCurrentMonthKey } from './utils/formatters';
import { PlusCircle, RotateCcw, Sparkles } from 'lucide-react';

export default function App() {
  // Navigation State
  const [currentTab, setCurrentTab] = useState<'overview' | 'register' | 'settlement' | 'roommates'>('overview');

  // Core Data State
  const [roommates, setRoommates] = useState<Roommate[]>(() => loadStoredRoommates());
  const [transactions, setTransactions] = useState<Transaction[]>(() => loadStoredTransactions());

  // Monthly Lifecycle & Archive State
  const [selectedMonth, setSelectedMonth] = useState<string>(() => loadStoredActiveMonth());
  const [monthRecords, setMonthRecords] = useState<MonthRecord[]>(() => loadStoredMonthRecords());

  // Modal States
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const [isRoommateModalOpen, setIsRoommateModalOpen] = useState(false);
  const [editingRoommate, setEditingRoommate] = useState<Roommate | null>(null);

  const [departingRoommate, setDepartingRoommate] = useState<Roommate | null>(null);
  const [isCloseMonthModalOpen, setIsCloseMonthModalOpen] = useState(false);
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    saveStoredRoommates(roommates);
  }, [roommates]);

  useEffect(() => {
    saveStoredTransactions(transactions);
  }, [transactions]);

  useEffect(() => {
    saveStoredActiveMonth(selectedMonth);
  }, [selectedMonth]);

  useEffect(() => {
    saveStoredMonthRecords(monthRecords);
  }, [monthRecords]);

  // Available Months collection
  const availableMonths = useMemo(() => {
    const set = new Set<string>();
    set.add(getCurrentMonthKey());
    set.add(selectedMonth);
    transactions.forEach((t) => {
      if (t.date && t.date.length >= 7) {
        set.add(t.date.slice(0, 7));
      }
    });
    monthRecords.forEach((m) => set.add(m.monthKey));
    return Array.from(set).sort().reverse();
  }, [transactions, monthRecords, selectedMonth]);

  // Current Month's Isolated Transactions
  const currentMonthTransactions = useMemo(() => {
    return transactions.filter((t) => t.date.startsWith(selectedMonth));
  }, [transactions, selectedMonth]);

  // Derived Financial Balances and Metrics for the Selected Month
  const { summaries, totalExpenditure, activeCount, individualShare } = useMemo(() => {
    return calculateMemberBalances(currentMonthTransactions, roommates);
  }, [currentMonthTransactions, roommates]);

  const activeRoommates = useMemo(() => {
    return roommates.filter((r) => r.status === 'active');
  }, [roommates]);

  const monthRecord = useMemo(() => {
    return monthRecords.find((m) => m.monthKey === selectedMonth);
  }, [monthRecords, selectedMonth]);

  const transfers = useMemo(() => {
    return calculateSettlementTransfers(summaries);
  }, [summaries]);

  // Handler: Save or Update Transaction
  const handleSaveTransaction = (
    txData: Omit<Transaction, 'id' | 'createdAt'>,
    existingId?: string
  ) => {
    if (existingId) {
      setTransactions((prev) =>
        prev.map((t) =>
          t.id === existingId
            ? { ...t, ...txData }
            : t
        )
      );
    } else {
      const newTx: Transaction = {
        ...txData,
        id: `tx-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        createdAt: new Date().toISOString(),
      };
      setTransactions((prev) => [newTx, ...prev]);

      // If added transaction is in a different month than currently selected, offer or update selectedMonth
      const txMonth = txData.date.slice(0, 7);
      if (txMonth !== selectedMonth) {
        setSelectedMonth(txMonth);
      }
    }
    setEditingTransaction(null);
  };

  // Handler: Delete Transaction
  const handleDeleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  // Handler: Save or Update Roommate
  const handleSaveRoommate = (
    data: Omit<Roommate, 'id' | 'status'>,
    existingId?: string
  ) => {
    if (existingId) {
      setRoommates((prev) =>
        prev.map((r) =>
          r.id === existingId
            ? { ...r, ...data }
            : r
        )
      );
    } else {
      const newRoommate: Roommate = {
        ...data,
        id: `roommate-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        status: 'active',
      };
      setRoommates((prev) => [...prev, newRoommate]);
    }
    setEditingRoommate(null);
  };

  // Handler: Depart Roommate with Historical Snapshot
  const handleConfirmDeparture = (
    roommateId: string,
    snapshot: ReturnType<typeof generateDepartureSnapshot>
  ) => {
    setRoommates((prev) =>
      prev.map((r) => {
        if (r.id === roommateId) {
          return {
            ...r,
            status: 'archived',
            departedAt: snapshot.departureDate,
            frozenSnapshot: snapshot,
          };
        }
        return r;
      })
    );
    setDepartingRoommate(null);
  };

  // Handler: Reactivate Roommate
  const handleReactivateRoommate = (roommateId: string) => {
    setRoommates((prev) =>
      prev.map((r) => {
        if (r.id === roommateId) {
          return {
            ...r,
            status: 'active',
            departedAt: undefined,
          };
        }
        return r;
      })
    );
  };

  // Handler: Direct Peer-to-Peer Settlement Payment
  const handleRecordSettlement = (
    fromId: string,
    toId: string,
    amount: number,
    note: string
  ) => {
    const fromName = roommates.find((r) => r.id === fromId)?.name || 'Member';
    const toName = roommates.find((r) => r.id === toId)?.name || 'Member';

    // Settlement date defaults to selectedMonth or today
    const today = new Date().toISOString().slice(0, 10);
    const date = today.startsWith(selectedMonth) ? today : `${selectedMonth}-01`;

    const settlementTx: Transaction = {
      id: `settle-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      description: `Settlement: ${fromName} paid ${toName}`,
      amount,
      paidBy: fromId,
      category: 'Other',
      date,
      isSettlement: true,
      settlementTo: toId,
      notes: note || 'Direct peer-to-peer settlement',
      createdAt: new Date().toISOString(),
    };

    setTransactions((prev) => [settlementTx, ...prev]);
  };

  // Handler: Close Current Month & Roll over to Next Month
  const handleConfirmCloseMonth = (
    monthKeyToClose: string,
    nextMonthKey: string,
    notes?: string
  ) => {
    const newRecord: MonthRecord = {
      monthKey: monthKeyToClose,
      status: 'closed',
      closedAt: new Date().toISOString(),
      notes,
      totalExpenditureAtClose: totalExpenditure,
      individualShareAtClose: individualShare,
      activeCountAtClose: activeCount,
    };

    setMonthRecords((prev) => {
      const filtered = prev.filter((m) => m.monthKey !== monthKeyToClose);
      return [newRecord, ...filtered];
    });

    // Advance to next month: this resets the current ledger view to 0 NPR clean slate!
    setSelectedMonth(nextMonthKey);
  };

  // Quick Demo Seed
  const handleLoadDemoData = () => {
    setRoommates(DEMO_ROOMMATES);
    setTransactions(DEMO_TRANSACTIONS);
    // Demo transactions are in 2026-09
    setSelectedMonth('2026-09');
  };

  // Quick 1-Click Simulation: Sanish buys item worth NPR 300 (split with Nishchal)
  const handleLoadSanishExample = () => {
    setRoommates([DEFAULT_NISHCHAL, DEFAULT_SANISH]);
    const today = new Date().toISOString().slice(0, 10);
    const date = today.startsWith(selectedMonth) ? today : `${selectedMonth}-01`;
    const exampleTx: Transaction = {
      id: `tx-sanish-item-300-${Date.now()}`,
      description: 'Room Item Purchase',
      amount: 300,
      paidBy: DEFAULT_SANISH.id,
      category: 'Food',
      date,
      notes: 'Sanish bought item worth NPR 300 (split equally with Nishchal: 150 each)',
      createdAt: new Date().toISOString(),
    };
    setTransactions([exampleTx]);
    setCurrentTab('settlement');
  };

  // Reset to default Nishchal state
  const handleResetToDefault = () => {
    if (
      window.confirm(
        'Reset ledger to initial state with 1 default member ("Nishchal")? This clears all demo expenses.'
      )
    ) {
      setRoommates([DEFAULT_NISHCHAL]);
      setTransactions([]);
      setMonthRecords([]);
      setSelectedMonth(getCurrentMonthKey());
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Bar adhering to 3-zone contract */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenExpenseModal={() => {
          setEditingTransaction(null);
          setIsExpenseModalOpen(true);
        }}
        onOpenRoommateModal={() => {
          setEditingRoommate(null);
          setIsRoommateModalOpen(true);
        }}
        onLoadDemoData={handleLoadDemoData}
        hasTransactions={transactions.length > 0}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Welcome Kicker & Room Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 gap-4 border-b border-slate-200/80 mb-5">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <span>Student Flat & Rent Management</span>
              <span className="text-slate-300">·</span>
              <span className="font-mono text-emerald-700">Kathmandu, Nepal (NPR)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              Room Expense & Shared Rent Ledger
            </h1>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
            <button
              onClick={handleLoadSanishExample}
              title="Simulate: Sanish buys item worth NPR 300, Nishchal has to give NPR 150"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-900 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 rounded-lg transition-colors shadow-xs"
            >
              <span>⚡ Sanish (NPR 300) Example</span>
            </button>

            {transactions.length === 0 ? (
              <button
                onClick={handleLoadDemoData}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 rounded-lg transition-colors shadow-xs"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>Load Student Flat Demo</span>
              </button>
            ) : (
              <button
                onClick={handleResetToDefault}
                title="Reset to default initial state (1 member: Nishchal)"
                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs text-slate-500 hover:text-slate-700 hover:bg-slate-200/60 rounded-md transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset to Default</span>
              </button>
            )}
          </div>
        </div>

        {/* ---------------- MONTH BAR CONTROLLER ---------------- */}
        <MonthBar
          selectedMonth={selectedMonth}
          onSelectMonth={setSelectedMonth}
          monthRecord={monthRecord}
          hasTransactionsInMonth={currentMonthTransactions.length > 0}
          totalExpenditureInMonth={totalExpenditure}
          onOpenCloseMonthModal={() => setIsCloseMonthModalOpen(true)}
          onOpenArchiveModal={() => setIsArchiveModalOpen(true)}
          availableMonths={availableMonths}
        />

        {/* ---------------- TAB 1: OVERVIEW & ANALYTICS ---------------- */}
        {currentTab === 'overview' && (
          <div className="space-y-6">
            {/* Real-time 3-Card Metrics (Total Expenditure, Active Roommates, Individual Share) for Selected Month */}
            <MetricsCards
              totalExpenditure={totalExpenditure}
              activeRoommates={activeRoommates}
              individualShare={individualShare}
              onViewRoommates={() => setCurrentTab('roommates')}
              onViewRegister={() => setCurrentTab('register')}
              onViewSettlement={() => setCurrentTab('settlement')}
            />

            {/* Visual Analytics Dashboard (Chart 1 & Chart 2) */}
            <AnalyticsCharts
              transactions={currentMonthTransactions}
              roommates={roommates}
              onOpenExpenseModal={() => {
                setEditingTransaction(null);
                setIsExpenseModalOpen(true);
              }}
            />

            {/* Balance Splitting & Direct Transfers for Selected Month */}
            <SettlementModule
              summaries={summaries}
              totalExpenditure={totalExpenditure}
              activeCount={activeCount}
              individualShare={individualShare}
              onRecordSettlement={handleRecordSettlement}
              onOpenRoommateModal={() => setIsRoommateModalOpen(true)}
            />
          </div>
        )}

        {/* ---------------- TAB 2: REGISTER ---------------- */}
        {currentTab === 'register' && (
          <div className="space-y-6">
            <TransactionRegister
              transactions={currentMonthTransactions}
              allTransactions={transactions}
              roommates={roommates}
              selectedMonth={selectedMonth}
              onOpenExpenseModal={() => {
                setEditingTransaction(null);
                setIsExpenseModalOpen(true);
              }}
              onEditTransaction={(tx) => {
                setEditingTransaction(tx);
                setIsExpenseModalOpen(true);
              }}
              onDeleteTransaction={handleDeleteTransaction}
            />
          </div>
        )}

        {/* ---------------- TAB 3: SETTLEMENT & DUES ---------------- */}
        {currentTab === 'settlement' && (
          <div className="space-y-6">
            <SettlementModule
              summaries={summaries}
              totalExpenditure={totalExpenditure}
              activeCount={activeCount}
              individualShare={individualShare}
              onRecordSettlement={handleRecordSettlement}
              onOpenRoommateModal={() => setIsRoommateModalOpen(true)}
            />
          </div>
        )}

        {/* ---------------- TAB 4: ROOMMATES & LIFECYCLE ---------------- */}
        {currentTab === 'roommates' && (
          <div className="space-y-6">
            <RoommateManagement
              roommates={roommates}
              transactions={currentMonthTransactions}
              onOpenAddModal={() => {
                setEditingRoommate(null);
                setIsRoommateModalOpen(true);
              }}
              onEditRoommate={(r) => {
                setEditingRoommate(r);
                setIsRoommateModalOpen(true);
              }}
              onOpenDepartModal={(r) => setDepartingRoommate(r)}
              onReactivateRoommate={handleReactivateRoommate}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-4 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">KothaHisab</span>
            <span>·</span>
            <span>Student Room & Shared-Rent Manager</span>
          </div>
          <div className="flex items-center gap-3">
            <span>Currency: NPR (Nepalese Rupee)</span>
            <span>·</span>
            <span>Monthly isolated cycles & permanent storage</span>
          </div>
        </div>
      </footer>

      {/* Transaction Entry Form Modal */}
      <TransactionFormModal
        isOpen={isExpenseModalOpen}
        onClose={() => {
          setIsExpenseModalOpen(false);
          setEditingTransaction(null);
        }}
        onSave={handleSaveTransaction}
        roommates={roommates}
        initialData={editingTransaction}
        selectedMonth={selectedMonth}
      />

      {/* Add / Edit Roommate Modal */}
      <AddRoommateModal
        isOpen={isRoommateModalOpen}
        onClose={() => {
          setIsRoommateModalOpen(false);
          setEditingRoommate(null);
        }}
        onSave={handleSaveRoommate}
        initialData={editingRoommate}
      />

      {/* Depart Roommate Historical Snapshot Modal */}
      <DepartRoommateModal
        isOpen={!!departingRoommate}
        onClose={() => setDepartingRoommate(null)}
        roommate={departingRoommate}
        transactions={transactions}
        roommates={roommates}
        onConfirmDeparture={handleConfirmDeparture}
      />

      {/* Close Month Modal */}
      <CloseMonthModal
        isOpen={isCloseMonthModalOpen}
        onClose={() => setIsCloseMonthModalOpen(false)}
        monthKey={selectedMonth}
        totalExpenditure={totalExpenditure}
        activeCount={activeCount}
        individualShare={individualShare}
        summaries={summaries}
        transfers={transfers}
        onConfirmClose={handleConfirmCloseMonth}
      />

      {/* Past Months History Archive Modal */}
      <MonthArchiveModal
        isOpen={isArchiveModalOpen}
        onClose={() => setIsArchiveModalOpen(false)}
        monthsList={availableMonths}
        selectedMonth={selectedMonth}
        onSelectMonth={setSelectedMonth}
        monthRecords={monthRecords}
        transactions={transactions}
        roommates={roommates}
      />
    </div>
  );
}
