import React, { useState } from 'react';
import { Participant, DateAvailability, WeekendVote, AvailabilityStatus } from '../types';
import { getAllDatesInRange, formatDateFr, WEEKENDS_LIST } from '../lib/dates';
import { Calendar, Table, Check, X } from 'lucide-react';

interface DetailedCalendarProps {
  currentParticipant: Participant | null;
  onOpenUserModal: () => void;
  dateAvailabilities: DateAvailability[];
  weekendVotes: WeekendVote[];
  onVoteDate: (dateStr: string, status: AvailabilityStatus | null) => void;
  onVoteWeekend: (weekendId: string, status: AvailabilityStatus | null) => void;
  participants: Participant[];
}

export const DetailedCalendar: React.FC<DetailedCalendarProps> = ({
  currentParticipant,
  onOpenUserModal,
  dateAvailabilities,
  weekendVotes,
  onVoteDate,
  onVoteWeekend,
  participants,
}) => {
  const [viewMode, setViewMode] = useState<'matrix' | 'calendar'>('matrix');
  const allDays = getAllDatesInRange();

  const getMyDateStatus = (dateStr: string): AvailabilityStatus | undefined => {
    if (!currentParticipant) return undefined;
    
    // Check direct day availability first
    const direct = dateAvailabilities.find(
      (a) => a.date === dateStr && a.participantId === currentParticipant.id
    );
    if (direct) return direct.status;

    // Check if part of a voted weekend
    const dayObj = allDays.find((d) => d.dateStr === dateStr);
    if (dayObj?.weekendId) {
      const wVote = weekendVotes.find(
        (v) => v.weekendId === dayObj.weekendId && v.participantId === currentParticipant.id
      );
      if (wVote) return wVote.status;
    }

    return undefined;
  };

  const handleDayClick = (dateStr: string) => {
    if (!currentParticipant) {
      onOpenUserModal();
      return;
    }
    const current = getMyDateStatus(dateStr);
    // Cycle: none -> available -> unavailable -> clear (null) -> available
    let next: AvailabilityStatus | null = null;
    if (!current) {
      next = 'available';
    } else if (current === 'available') {
      next = 'unavailable';
    } else if (current === 'unavailable') {
      next = null; // deletes vote
    }
    onVoteDate(dateStr, next);
  };

  const handleWeekendClick = (weekendId: string) => {
    if (!currentParticipant) {
      onOpenUserModal();
      return;
    }
    const myVote = weekendVotes.find(
      (v) => v.weekendId === weekendId && v.participantId === currentParticipant.id
    );
    // Cycle: none -> available -> unavailable -> clear (null)
    let next: AvailabilityStatus | null = null;
    if (!myVote?.status) {
      next = 'available';
    } else if (myVote.status === 'available') {
      next = 'unavailable';
    } else if (myVote.status === 'unavailable') {
      next = null; // deletes vote
    }
    onVoteWeekend(weekendId, next);
  };

  // Helper to get any participant's status for a given date
  const getParticipantDateStatus = (pId: string, dateStr: string): AvailabilityStatus | undefined => {
    const direct = dateAvailabilities.find((a) => a.date === dateStr && a.participantId === pId);
    if (direct) return direct.status;

    const dayObj = allDays.find((d) => d.dateStr === dateStr);
    if (dayObj?.weekendId) {
      const wVote = weekendVotes.find((v) => v.weekendId === dayObj.weekendId && v.participantId === pId);
      if (wVote) return wVote.status;
    }

    return undefined;
  };

  return (
    <div className="bg-white border-4 border-emerald-100 rounded-3xl p-6 shadow-sm space-y-6">
      
      {/* View Switcher Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-emerald-100 pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-emerald-950 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-600" />
            <span>Matrice</span>
          </h2>
          <p className="text-xs font-bold text-slate-500 mt-0.5">
            Clique sur une case pour changer : Dispo 🟢 ➔ Pas dispo 🔴 ➔ Effacer son vote
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1.5 bg-emerald-50 p-1.5 rounded-2xl border-2 border-emerald-200 shrink-0">
          <button
            onClick={() => setViewMode('matrix')}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
              viewMode === 'matrix'
                ? 'bg-emerald-500 text-white shadow-[0_3px_0_rgb(5,150,105)]'
                : 'text-slate-600 hover:text-emerald-900'
            }`}
          >
            <Table className="w-4 h-4" />
            <span>Matrice</span>
          </button>

          <button
            onClick={() => setViewMode('calendar')}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
              viewMode === 'calendar'
                ? 'bg-emerald-500 text-white shadow-[0_3px_0_rgb(5,150,105)]'
                : 'text-slate-600 hover:text-emerald-900'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Vue Mois</span>
          </button>
        </div>
      </div>

      {/* MATRIX COMPARISON VIEW */}
      {viewMode === 'matrix' && (
        <div className="overflow-x-auto rounded-2xl border-2 border-emerald-100">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b-2 border-emerald-100 bg-emerald-50 text-emerald-950">
                <th className="p-3.5 font-black sticky left-0 bg-emerald-50 z-10 w-48 border-r-2 border-emerald-100">Date / Créneau</th>
                {participants.map((p) => (
                  <th key={p.id} className="p-3 text-center min-w-28 font-black">
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-xl">{p.avatarEmoji || '🎒'}</span>
                      <span className="text-emerald-950 font-black">{p.name}</span>
                    </div>
                  </th>
                ))}
                {participants.length === 0 && (
                  <th className="p-3 text-slate-400 italic font-medium">
                    En attente de participants...
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-100">
              {/* Day by Day rows */}

              {allDays.map((d) => {
                return (
                  <tr
                    key={d.dateStr}
                    className={`hover:bg-emerald-50/40 transition ${
                      d.isWeekend ? 'bg-amber-50/40' : ''
                    }`}
                  >
                    <td className="p-2.5 sticky left-0 bg-white z-10 font-bold text-slate-800 border-r-2 border-emerald-100">
                      <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${d.isWeekend ? 'bg-amber-500' : 'bg-emerald-300'}`} />
                        <span>{formatDateFr(d.dateStr)}</span>
                      </div>
                    </td>

                    {participants.map((p) => {
                      const status = getParticipantDateStatus(p.id, d.dateStr);
                      const isMe = currentParticipant?.id === p.id;

                      return (
                        <td
                          key={p.id}
                          onClick={() => isMe && handleDayClick(d.dateStr)}
                          className={`p-2 text-center ${
                            isMe ? 'cursor-pointer hover:bg-emerald-100/80' : ''
                          }`}
                        >
                          {status === 'available' && (
                            <span className="w-7 h-7 inline-flex items-center justify-center rounded-full bg-emerald-100 text-emerald-900 border border-emerald-400 font-black">
                              <Check className="w-4 h-4 text-emerald-600" />
                            </span>
                          )}
                          {status === 'unavailable' && (
                            <span className="w-7 h-7 inline-flex items-center justify-center rounded-full bg-rose-100 text-rose-900 border border-rose-300">
                              <X className="w-4 h-4 text-rose-600" />
                            </span>
                          )}
                          {!status && (
                            <span className="text-slate-200 text-xs">•</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}

            </tbody>
          </table>
        </div>
      )}

      {/* FULL MONTH CALENDAR VIEW */}
      {viewMode === 'calendar' && (
        <div className="space-y-4">
          <p className="text-xs font-bold text-slate-600 bg-emerald-50 p-3 rounded-2xl border border-emerald-200">
            💡 Clique sur n'importe quel jour pour basculer : <span className="font-black text-emerald-700">Dispo 🟢</span> ➔ <span className="font-black text-rose-600">Pas dispo 🔴</span>
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5">
            {allDays.map((d) => {
              const myStatus = getMyDateStatus(d.dateStr);
              
              // Count all available participants on this day
              const availableCount = participants.filter(
                (p) => getParticipantDateStatus(p.id, d.dateStr) === 'available'
              ).length;

              return (
                <div
                  key={d.dateStr}
                  onClick={() => handleDayClick(d.dateStr)}
                  className={`p-3 rounded-2xl border-2 transition cursor-pointer flex flex-col justify-between h-28 relative ${
                    d.isWeekend
                      ? 'bg-amber-50/60 border-amber-300 hover:border-amber-400'
                      : 'bg-white border-emerald-100 hover:border-emerald-300'
                  } ${
                    myStatus === 'available' ? 'ring-4 ring-emerald-400 bg-emerald-50' : ''
                  } ${
                    myStatus === 'unavailable' ? 'ring-4 ring-rose-300 bg-rose-50' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-[10px] uppercase font-black text-slate-400">
                        {d.dayOfWeekName.slice(0, 3)}
                      </div>
                      <div className="text-lg font-black text-emerald-950">
                        {d.dayNum}
                      </div>
                    </div>
                    {d.isWeekend && (
                      <span className="text-[9px] font-black text-amber-900 bg-amber-200 px-1.5 py-0.5 rounded-full border border-amber-300">
                        WE
                      </span>
                    )}
                  </div>

                  {/* Available count badge */}
                  <div className="space-y-1">
                    {availableCount > 0 && (
                      <div className="text-[10px] font-black text-emerald-950 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300 flex items-center justify-between">
                        <span>{availableCount} dispo</span>
                        <span>🟢</span>
                      </div>
                    )}

                    {/* My status pill */}
                    {myStatus === 'available' && (
                      <span className="block text-[10px] font-black text-center text-white bg-emerald-500 rounded-full py-0.5 shadow-sm">
                        Moi: Dispo 🟢
                      </span>
                    )}
                    {myStatus === 'unavailable' && (
                      <span className="block text-[10px] font-black text-center text-white bg-rose-500 rounded-full py-0.5 shadow-sm">
                        Moi: Pas dispo 🔴
                      </span>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
};

