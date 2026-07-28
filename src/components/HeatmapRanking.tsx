import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Participant, DateAvailability, WeekendVote } from '../types';
import { WEEKENDS_LIST, getAllDatesInRange, formatDateFr } from '../lib/dates';
import { Trophy, Sparkles, Check, Calendar, Table } from 'lucide-react';

interface HeatmapRankingProps {
  weekendVotes: WeekendVote[];
  dateAvailabilities: DateAvailability[];
  participants: Participant[];
  onSelectWeekend?: (weekendId: string) => void;
}

export const HeatmapRanking: React.FC<HeatmapRankingProps> = ({
  weekendVotes,
  dateAvailabilities,
  participants,
}) => {
  const [rankType, setRankType] = useState<'weekends' | 'days'>('weekends');
  const allDays = getAllDatesInRange();

  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  const totalParticipants = Math.max(participants.length, 1);

  // Helper: check if participant is available for a given single date
  const getAvailableParticipantsForDate = (dateStr: string): Participant[] => {
    const dayObj = allDays.find((d) => d.dateStr === dateStr);

    return participants.filter((p) => {
      // 1. Direct day availability vote
      const direct = dateAvailabilities.find(
        (a) => a.date === dateStr && a.participantId === p.id
      );
      if (direct) {
        return direct.status === 'available';
      }

      // 2. Fallback to weekend vote if date is part of a weekend
      if (dayObj?.weekendId) {
        const wVote = weekendVotes.find(
          (v) => v.weekendId === dayObj.weekendId && v.participantId === p.id
        );
        if (wVote) {
          return wVote.status === 'available';
        }
      }

      return false;
    });
  };

  // Helper: check if participant is available for a weekend
  const getAvailableParticipantsForWeekend = (weekendId: string, startDate: string, endDate: string): Participant[] => {
    return participants.filter((p) => {
      // 1. Direct weekend vote
      const wVote = weekendVotes.find(
        (v) => v.weekendId === weekendId && v.participantId === p.id
      );
      if (wVote && wVote.status === 'available') {
        return true;
      }

      // 2. Day availability votes (if either Saturday or Sunday is marked available by user)
      const sat = dateAvailabilities.find((a) => a.date === startDate && a.participantId === p.id);
      const sun = dateAvailabilities.find((a) => a.date === endDate && a.participantId === p.id);

      const isSatOk = sat?.status === 'available';
      const isSunOk = sun?.status === 'available';
      const isSatNo = sat?.status === 'unavailable';
      const isSunNo = sun?.status === 'unavailable';

      if ((isSatOk || isSunOk) && !isSatNo && !isSunNo) {
        return true;
      }

      return false;
    });
  };

  // Rank Weekends
  const rankedWeekends = WEEKENDS_LIST.map((w) => {
    const available = getAvailableParticipantsForWeekend(w.id, w.startDate, w.endDate);
    const consensusPct = Math.round((available.length / totalParticipants) * 100);

    return {
      id: w.id,
      title: w.title,
      subtitle: w.subtitle,
      available,
      consensusPct,
      score: available.length,
    };
  }).sort((a, b) => b.score - a.score || b.consensusPct - a.consensusPct);

  // Rank Single Days (only days that have at least 1 vote or all days)
  const rankedDays = allDays.map((d) => {
    const available = getAvailableParticipantsForDate(d.dateStr);
    const consensusPct = Math.round((available.length / totalParticipants) * 100);

    return {
      id: d.dateStr,
      title: formatDateFr(d.dateStr),
      subtitle: `${d.dayOfWeekName} ${d.dayNum} ${d.monthName}`,
      available,
      consensusPct,
      score: available.length,
    };
  }).sort((a, b) => b.score - a.score || b.consensusPct - a.consensusPct);

  const activeRankingList = rankType === 'weekends' ? rankedWeekends : rankedDays.slice(0, 5);
  const topOption = activeRankingList[0];

  return (
    <div className="bg-white border-4 border-emerald-100 rounded-3xl p-6 shadow-sm space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-emerald-100 pb-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-600 font-black text-xs uppercase tracking-widest mb-1">
            <Trophy className="w-4 h-4 text-amber-500" />
            <span>Consensus & Classement en direct</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-emerald-950 flex items-center gap-2">
            <span>🏆 Meilleures options de dates</span>
          </h2>
          <p className="text-xs font-bold text-slate-500 mt-0.5">
            Calculé automatiquement d'après tous les votes et la matrice de disponibilité
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Toggle Type */}
          <div className="flex items-center gap-1 bg-emerald-50 p-1 rounded-2xl border-2 border-emerald-200">
            <button
              type="button"
              onClick={() => setRankType('weekends')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition ${
                rankType === 'weekends'
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'text-slate-600 hover:text-emerald-950'
              }`}
            >
              Par Week-end
            </button>
            <button
              type="button"
              onClick={() => setRankType('days')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition ${
                rankType === 'days'
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'text-slate-600 hover:text-emerald-950'
              }`}
            >
              Par Jour
            </button>
          </div>

          {topOption && topOption.available.length > 0 && (
            <button
              type="button"
              onClick={triggerConfetti}
              className="px-3.5 py-2 bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider rounded-2xl shadow-[0_3px_0_rgb(217,119,6)] active:shadow-none active:translate-y-1 transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <Sparkles className="w-4 h-4 text-amber-900" />
              <span>Fêter N°1 ! 🎉</span>
            </button>
          )}
        </div>
      </div>

      {/* Leaderboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {activeRankingList.slice(0, 3).map((item, idx) => {
          const isWinner = idx === 0 && item.available.length > 0;
          const rankLabels = ['🥇 1ère Option', '🥈 2ème Option', '🥉 3ème Option'];
          const badgeColors = [
            'bg-amber-400 text-slate-950 font-black border-2 border-amber-500',
            'bg-slate-100 text-slate-800 font-black border-2 border-slate-300',
            'bg-amber-100 text-amber-900 font-black border-2 border-amber-300',
          ];

          return (
            <div
              key={item.id}
              className={`p-5 rounded-3xl border-4 relative transition-all ${
                isWinner
                  ? 'bg-amber-50/90 border-amber-400 shadow-md scale-[1.02]'
                  : 'bg-white border-emerald-100'
              }`}
            >
              {/* Rank Badge */}
              <div className="flex items-center justify-between mb-3">
                <span className={`px-3 py-1 rounded-full text-xs ${badgeColors[idx]}`}>
                  {rankLabels[idx]}
                </span>
                <span className="text-xs font-mono font-black text-emerald-900 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-300">
                  {item.consensusPct}% dispo
                </span>
              </div>

              {/* Title */}
              <h3 className="text-base font-black text-emerald-950">
                {item.title}
              </h3>
              <p className="text-xs font-bold text-slate-500">{item.subtitle}</p>

              {/* Progress Bar */}
              <div className="mt-4 space-y-1.5">
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                  <div
                    className="bg-emerald-500 h-full transition-all duration-500"
                    style={{ width: `${Math.min(item.consensusPct, 100)}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-xs pt-1 font-black">
                  <span className="text-emerald-950 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    {item.available.length} dispo(s)
                  </span>
                  <span className="text-slate-400 font-normal text-[11px]">
                    sur {participants.length || 1} participant(s)
                  </span>
                </div>
              </div>

              {/* Available Participants List */}
              {item.available.length > 0 ? (
                <div className="mt-4 pt-3 border-t-2 border-slate-100 flex flex-wrap gap-1.5">
                  {item.available.map((p) => (
                    <span
                      key={p.id}
                      className="px-2.5 py-1 bg-emerald-100 text-emerald-950 border border-emerald-300 rounded-full text-[11px] font-black flex items-center gap-1.5 shadow-sm"
                    >
                      <span className="text-xs">{p.avatarEmoji || '🎒'}</span>
                      <span>{p.name}</span>
                    </span>
                  ))}
                </div>
              ) : (
                <p className="mt-4 pt-3 border-t-2 border-slate-100 text-[11px] text-slate-400 italic">
                  Aucun membre disponible pour le moment
                </p>
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
};
