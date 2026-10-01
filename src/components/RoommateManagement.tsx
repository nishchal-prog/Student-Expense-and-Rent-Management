import React, { useState } from 'react';
import {
  UserPlus,
  UserX,
  Edit2,
  Calendar,
  Home,
  Phone,
  CreditCard,
  Archive,
  RotateCcw,
  CheckCircle,
  AlertCircle,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import { Roommate, Transaction } from '../types';
import { formatNPR, formatDate } from '../utils/formatters';
import { calculateGrossPaidPerMember } from '../utils/settlementCalculator';

interface RoommateManagementProps {
  roommates: Roommate[];
  transactions: Transaction[];
  onOpenAddModal: () => void;
  onEditRoommate: (roommate: Roommate) => void;
  onOpenDepartModal: (roommate: Roommate) => void;
  onReactivateRoommate: (roommateId: string) => void;
}

export const RoommateManagement: React.FC<RoommateManagementProps> = ({
  roommates,
  transactions,
  onOpenAddModal,
  onEditRoommate,
  onOpenDepartModal,
  onReactivateRoommate,
}) => {
  const [activeTab, setActiveTab] = useState<'active' | 'archived'>('active');

  const activeMembers = roommates.filter((r) => r.status === 'active');
  const archivedMembers = roommates.filter((r) => r.status === 'archived');
  const grossPaidMap = calculateGrossPaidPerMember(transactions, roommates);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Member Lifecycle
              </span>
              <span className="text-slate-300">·</span>
              <span className="text-xs font-mono text-slate-500 tabular-nums">
                {activeMembers.length} active / {roommates.length} total
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight mt-0.5">
              Roommates & Tenancy Roster
            </h2>
            <p className="text-xs text-slate-500 mt-1 max-w-xl">
              Manage current room members, register new co-tenants dynamically, and preserve frozen
              settlement snapshots when a flatmate departs.
            </p>
          </div>

          <button
            onClick={onOpenAddModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-xs shrink-0"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>+ Register New Roommate</span>
          </button>
        </div>

        {/* Tab switch between Active and Archived */}
        <div className="flex items-center gap-2 mt-6 border-b border-slate-100 pb-2">
          <button
            onClick={() => setActiveTab('active')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 ${
              activeTab === 'active'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {/* Green dot on active tab button */}
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Active Roommates ({activeMembers.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('archived')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 ${
              activeTab === 'archived'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Archive className="w-3.5 h-3.5" />
            <span>Archived / Departed ({archivedMembers.length})</span>
          </button>
        </div>
      </div>

      {/* ACTIVE MEMBERS SECTION */}
      {activeTab === 'active' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeMembers.map((member) => {
            const grossPaid = grossPaidMap[member.id] || 0;
            const isInitialNishchal = member.name === 'Nishchal';

            return (
              <div
                key={member.id}
                className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all group"
              >
                <div>
                  {/* Top card header */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-sm shadow-xs shrink-0"
                        style={{ backgroundColor: member.avatarColor }}
                      >
                        {member.name.charAt(0).toUpperCase()}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          {/* Mandatory Green status indicator dot next to active member's name */}
                          <span
                            className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-100 shrink-0"
                            title="Active Roommate"
                          />
                          <h3 className="font-bold text-slate-900 text-base leading-tight">
                            {member.name}
                          </h3>
                        </div>

                        <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                          <span>{member.roomNumber || 'Shared Flat'}</span>
                          {isInitialNishchal && (
                            <>
                              <span className="text-slate-300">·</span>
                              <span className="text-emerald-700 font-semibold text-[10px]">
                                Default Host
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => onEditRoommate(member)}
                        title="Edit details"
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Metadata items */}
                  <div className="space-y-2 py-3 border-y border-slate-100 text-xs text-slate-600">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Joined:</span>
                      </span>
                      <span className="font-medium text-slate-700">
                        {formatDate(member.joinedAt)}
                      </span>
                    </div>

                    {member.phone && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5" />
                          <span>Phone:</span>
                        </span>
                        <span className="font-medium text-slate-700">{member.phone}</span>
                      </div>
                    )}

                    {member.paymentHandle && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 flex items-center gap-1.5">
                          <CreditCard className="w-3.5 h-3.5" />
                          <span>Pay ID:</span>
                        </span>
                        <span className="font-mono font-medium text-slate-700 select-all">
                          {member.paymentHandle}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-slate-400">Total Out-of-Pocket:</span>
                      <span className="font-mono font-bold text-slate-900 tabular-nums">
                        {formatNPR(grossPaid)}
                      </span>
                    </div>
                  </div>

                  {member.notes && (
                    <p className="text-[11px] text-slate-400 italic mt-2.5 line-clamp-2">
                      "{member.notes}"
                    </p>
                  )}
                </div>

                {/* Card Action footer */}
                <div className="mt-4 pt-3 flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span>In Active Split</span>
                  </span>

                  <button
                    onClick={() => onOpenDepartModal(member)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-amber-700 hover:text-amber-800 hover:bg-amber-50 rounded-md transition-colors"
                  >
                    <UserX className="w-3.5 h-3.5" />
                    <span>Depart Flat</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ARCHIVED / DEPARTED SECTION */}
      {activeTab === 'archived' && (
        <div className="space-y-4">
          <div className="p-4 bg-slate-100/70 border border-slate-200 rounded-xl text-xs text-slate-600 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-slate-800">
                Immutable Historical Snapshot Archive
              </p>
              <p className="text-slate-500 mt-0.5 leading-relaxed">
                When a flatmate moves out, their expenses and contributions are frozen up to their
                exact departure date. These records never change, so past bills remain balanced while
                new room expenses are only shared by current active members.
              </p>
            </div>
          </div>

          {archivedMembers.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl p-8 text-center">
              <Archive className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">No departed roommates</p>
              <p className="text-xs text-slate-400 mt-1">
                When any active roommate leaves, their frozen financial snapshot will be stored here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {archivedMembers.map((member) => {
                const snap = member.frozenSnapshot;

                return (
                  <div
                    key={member.id}
                    className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs"
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-white text-xs opacity-75 shrink-0"
                          style={{ backgroundColor: member.avatarColor }}
                        >
                          {member.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-slate-300 shrink-0" />
                            <h3 className="font-bold text-slate-800 text-sm">{member.name}</h3>
                            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-xs">
                              Archived
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-400">
                            Departed: {snap?.departureDate ? formatDate(snap.departureDate) : 'Past'}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => onReactivateRoommate(member.id)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-50 rounded-md transition-colors"
                        title="Reactivate roommate if they move back"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Reactivate</span>
                      </button>
                    </div>

                    {/* Frozen Snapshot Details */}
                    {snap ? (
                      <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs space-y-1.5">
                        <div className="flex justify-between text-slate-500">
                          <span>Gross Contributed at Exit:</span>
                          <span className="font-mono font-semibold text-slate-800 tabular-nums">
                            {formatNPR(snap.totalGrossPaid)}
                          </span>
                        </div>
                        <div className="flex justify-between text-slate-500">
                          <span>Tenancy Fair Share:</span>
                          <span className="font-mono font-semibold text-slate-800 tabular-nums">
                            {formatNPR(snap.individualShareAtDeparture)}
                          </span>
                        </div>
                        <div className="flex justify-between pt-1 border-t border-slate-200">
                          <span className="font-semibold text-slate-700">Frozen Exit Net:</span>
                          <span
                            className={`font-mono font-bold tabular-nums ${
                              snap.netBalanceAtDeparture > 0
                                ? 'text-emerald-700'
                                : snap.netBalanceAtDeparture < 0
                                ? 'text-rose-600'
                                : 'text-slate-600'
                            }`}
                          >
                            {formatNPR(snap.netBalanceAtDeparture, { showSign: true })}
                          </span>
                        </div>
                        <div className="flex items-center justify-between pt-1 text-[11px]">
                          <span className="text-slate-400">Departure Settlement:</span>
                          {snap.settled ? (
                            <span className="font-semibold text-emerald-700 flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" />
                              <span>Settled upon departure</span>
                            </span>
                          ) : (
                            <span className="font-semibold text-amber-700 flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" />
                              <span>Pending room settlement</span>
                            </span>
                          )}
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 italic">No frozen snapshot recorded.</p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
