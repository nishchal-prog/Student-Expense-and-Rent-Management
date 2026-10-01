import React from 'react';
import { PlusCircle, UserPlus, FileSpreadsheet, RefreshCw } from 'lucide-react';

interface NavbarProps {
  currentTab: 'overview' | 'register' | 'settlement' | 'roommates';
  onSelectTab: (tab: 'overview' | 'register' | 'settlement' | 'roommates') => void;
  onOpenExpenseModal: () => void;
  onOpenRoommateModal: () => void;
  onLoadDemoData: () => void;
  hasTransactions: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  onOpenExpenseModal,
  onOpenRoommateModal,
  onLoadDemoData,
  hasTransactions,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Zone 1: Single text element wordmark as specified in design constitution */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => onSelectTab('overview')}
              className="text-left font-bold text-xl tracking-tight text-slate-900 hover:text-emerald-700 transition-colors focus:outline-none"
            >
              KothaHisab
            </button>
          </div>

          {/* Zone 2: 4 clean text navigation links */}
          <nav className="hidden md:flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => onSelectTab('overview')}
              className={`px-3 py-1.5 text-sm font-medium transition-colors rounded-md whitespace-nowrap ${
                currentTab === 'overview'
                  ? 'bg-slate-100 text-slate-900 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Overview & Analytics
            </button>
            <button
              onClick={() => onSelectTab('register')}
              className={`px-3 py-1.5 text-sm font-medium transition-colors rounded-md whitespace-nowrap ${
                currentTab === 'register'
                  ? 'bg-slate-100 text-slate-900 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Expense Register
            </button>
            <button
              onClick={() => onSelectTab('settlement')}
              className={`px-3 py-1.5 text-sm font-medium transition-colors rounded-md whitespace-nowrap ${
                currentTab === 'settlement'
                  ? 'bg-slate-100 text-slate-900 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Settlement & Dues
            </button>
            <button
              onClick={() => onSelectTab('roommates')}
              className={`px-3 py-1.5 text-sm font-medium transition-colors rounded-md whitespace-nowrap ${
                currentTab === 'roommates'
                  ? 'bg-slate-100 text-slate-900 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Roommates
            </button>
          </nav>

          {/* Zone 3: 1-2 primary actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {!hasTransactions && (
              <button
                onClick={onLoadDemoData}
                title="Load sample student room transactions"
                className="hidden lg:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Load Sample Data</span>
              </button>
            )}

            <button
              onClick={onOpenRoommateModal}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors whitespace-nowrap shadow-xs"
            >
              <UserPlus className="w-3.5 h-3.5 text-slate-600" />
              <span className="hidden sm:inline">Add</span> Roommate
            </button>

            <button
              onClick={onOpenExpenseModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors whitespace-nowrap shadow-xs"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Record Expense</span>
            </button>
          </div>
        </div>

        {/* Mobile secondary navigation */}
        <div className="flex md:hidden overflow-x-auto py-2 border-t border-slate-100 gap-1 scrollbar-none">
          <button
            onClick={() => onSelectTab('overview')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap ${
              currentTab === 'overview' ? 'bg-slate-900 text-white' : 'text-slate-600'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => onSelectTab('register')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap ${
              currentTab === 'register' ? 'bg-slate-900 text-white' : 'text-slate-600'
            }`}
          >
            Register
          </button>
          <button
            onClick={() => onSelectTab('settlement')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap ${
              currentTab === 'settlement' ? 'bg-slate-900 text-white' : 'text-slate-600'
            }`}
          >
            Settlement
          </button>
          <button
            onClick={() => onSelectTab('roommates')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap ${
              currentTab === 'roommates' ? 'bg-slate-900 text-white' : 'text-slate-600'
            }`}
          >
            Roommates
          </button>
        </div>
      </div>
    </header>
  );
};
