import React, { useState } from 'react';
import { Participant } from '../types';
import { Share2, UserCheck, Tent, Calendar, Sparkles, Check, Mountain } from 'lucide-react';

interface HeaderProps {
  currentParticipant: Participant | null;
  onOpenUserModal: () => void;
  onOpenShareModal: () => void;
  onOpenAdminModal: () => void;
  participantCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentParticipant,
  onOpenUserModal,
  onOpenShareModal,
  onOpenAdminModal,
  participantCount,
}) => {
  const [copied, setCopied] = useState(false);

  const handleQuickCopy = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <header className="bg-white border-b-4 border-emerald-500 shadow-sm relative z-20">
      <div className="max-w-6xl mx-auto px-4 py-5 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          
          {/* Brand & Main Title */}
          <div className="flex items-center gap-3.5">
            <div className="bg-emerald-500 text-white p-3 rounded-2xl shadow-lg shrink-0">
              <Tent className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-emerald-600 font-black text-xs tracking-widest uppercase mb-0.5">
                <span>Rando Bivouac • 1 Nuit / 2 Jours</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-emerald-950 flex items-center gap-2">
                <span>BIVOUAC ÉTÉ 2026</span>
              </h1>
              <p className="text-slate-600 text-xs sm:text-sm font-bold mt-0.5 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Du <strong className="text-emerald-900">28 Juillet</strong> au <strong className="text-emerald-900">30 Août 2026</strong></span>
              </p>
            </div>
          </div>

          {/* User Status */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Current user badge or create account CTA */}
            {currentParticipant ? (
              <button
                onClick={onOpenUserModal}
                className="inline-flex items-center gap-2.5 p-1.5 pr-4 bg-emerald-100 hover:bg-emerald-200 border-2 border-emerald-300 text-emerald-900 font-black text-xs sm:text-sm rounded-full transition cursor-pointer"
              >
                <span className="w-8 h-8 rounded-full bg-white border-2 border-emerald-400 flex items-center justify-center text-base shadow-sm">
                  {currentParticipant.avatarEmoji || '🎒'}
                </span>
                <div className="flex flex-col text-left">
                  <span className="leading-none text-emerald-950 font-black">{currentParticipant.name}</span>
                  <span className="text-[10px] font-bold text-emerald-700 underline mt-0.5">Pas vous ?</span>
                </div>
              </button>
            ) : (
              <button
                onClick={onOpenUserModal}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs sm:text-sm rounded-2xl shadow-[0_4px_0_rgb(217,119,6)] active:shadow-none active:translate-y-1 transition-all cursor-pointer animate-pulse"
              >
                <UserCheck className="w-4 h-4" />
                <span>Indiquer ton prénom</span>
              </button>
            )}

            {/* Participant count indicator */}
            <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-50 text-emerald-800 text-xs font-black rounded-xl border-2 border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span><strong>{participantCount}</strong> inscrit{participantCount > 1 ? 's' : ''}</span>
            </div>

            {/* Admin Access Button */}
            <button
              onClick={onOpenAdminModal}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black rounded-xl border border-slate-300 transition cursor-pointer"
              title="Accès Administrateur"
            >
              <span>Admin 🔒</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
