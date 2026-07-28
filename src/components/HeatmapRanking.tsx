import React from 'react';
import confetti from 'canvas-confetti';
import { Participant, DateAvailability, WeekendVote } from '../types';
import { WEEKENDS_LIST, getAllDatesInRange, formatDateFr } from '../lib/dates';
import { Trophy, Sparkles, Check, Users } from 'lucide-react';

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
  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  // Calculate scores for weekends based strictly on available status
  const rankedWeekends = WEEKENDS_LIST.map((w) => {
    const votes = weekendVotes.filter((v) => v.weekendId === w.id);
    const available = votes.filter((v) => v.status === 'available');
    const totalParticipants = Math.max(participants.length, 1);
    
    // Consensus percentage = available / totalParticipants * 100
    const consensusPct = Math.round((available.length / totalParticipants) * 100);

    return {
      weekend: w,
      available,
      consensusPct,
      score: available.length,
    };
  }).sort((a, b) => b.score - a.score || b.consensusPct - a.consensusPct);

  const topWeekend = rankedWeekends[0];

  return (
    <div className="bg-white border-4 border-emerald-100 rounded-3xl p-6 shadow-sm space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-emerald-100 pb-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-600 font-black text-xs uppercase tracking-widest mb-1">
            <Trophy className="w-4 h-4 text-amber-500" />
            <span>Consensus & Classement</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-emerald-950 flex items-center gap-2">
            <span>🏆 Dates avec le plus de participants</span>
          </h2>
          <p className="text-xs font-bold text-slate-500 mt-1">
            Les créneaux qui réunissent le plus grand nombre d'amis disponibles
          </p>
        </div>

        {topWeekend && topWeekend.available.length > 0 && (
          <button
            onClick={() => {
              triggerConfetti();
            }}
            className="px-4 py-2.5 bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider rounded-2xl shadow-[0_4px_0_rgb(217,119,6)] active:shadow-none active:translate-y-1 transition-all flex items-center gap-2 cursor-pointer shrink-0 self-start sm:self-auto"
          >
            <Sparkles className="w-4 h-4 text-amber-900" />
            <span>Fêter la date N°1 ! 🎉</span>
          </button>
        )}
      </div>

      {/* Leaderboard Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {rankedWeekends.slice(0, 3).map((item, idx) => {
          const isWinner = idx === 0 && item.available.length > 0;
          const labels = ['🥇 1ère Option', '🥈 2ème Option', '🥉 3ème Option'];
          const badgeColors = [
            'bg-amber-400 text-slate-950 font-black border-2 border-amber-500',
            'bg-slate-100 text-slate-800 font-black border-2 border-slate-300',
            'bg-amber-100 text-amber-900 font-black border-2 border-amber-300',
          ];

          return (
            <div
              key={item.weekend.id}
              className={`p-5 rounded-3xl border-4 relative transition-all ${
                isWinner
                  ? 'bg-amber-50/80 border-amber-400 shadow-sm'
                  : 'bg-white border-emerald-100'
              }`}
            >
              {/* Rank Badge */}
              <div className="flex items-center justify-between mb-3">
                <span
                  className={`px-3 py-1 rounded-full text-xs ${badgeColors[idx]}`}
                >
                  {labels[idx]}
                </span>
                <span className="text-xs font-mono font-black text-emerald-900 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-300">
                  {item.consensusPct}% dispo
                </span>
              </div>

              {/* Title */}
              <h3 className="text-base font-black text-emerald-950">
                {item.weekend.title}
              </h3>
              <p className="text-xs font-bold text-slate-500">{item.weekend.subtitle}</p>

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

              {/* List of names available */}
              {item.available.length > 0 ? (
                <div className="mt-4 pt-3 border-t-2 border-slate-100 flex flex-wrap gap-1.5">
                  {item.available.map((v) => (
                    <span
                      key={v.participantId}
                      className="px-2.5 py-0.5 bg-emerald-100 text-emerald-950 border border-emerald-300 rounded-full text-[11px] font-black"
                    >
                      {v.participantName}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="mt-4 pt-3 border-t-2 border-slate-100 text-[11px] text-slate-400 italic">
                  Aucun vote dispo pour l'instant
                </p>
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
};

