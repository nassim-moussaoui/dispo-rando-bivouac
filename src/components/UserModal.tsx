import React, { useState, useEffect } from 'react';
import { Participant } from '../types';
import { getRandomEmojiAvatar, AVATAR_COLORS } from '../lib/dates';
import { User, Check, ShieldCheck, X } from 'lucide-react';

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentParticipant: Participant | null;
  onSaveParticipant: (name: string, emoji: string, color: string) => void;
}

const EMOJI_OPTIONS = ['🌲', '🏔️', '🏕️', '🥾', '🔥', '🎒', '⛺', '🌅', '🧗‍♂️', '🐻', '🦅', '🌌', '⚡', '☕', '🧭', '🗺️'];

export const UserModal: React.FC<UserModalProps> = ({
  isOpen,
  onClose,
  currentParticipant,
  onSaveParticipant,
}) => {
  const [name, setName] = useState(currentParticipant?.name || '');
  const [emoji, setEmoji] = useState(currentParticipant?.avatarEmoji || getRandomEmojiAvatar());
  const [color, setColor] = useState(currentParticipant?.avatarColor || AVATAR_COLORS[0]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (currentParticipant) {
      setName(currentParticipant.name);
      setEmoji(currentParticipant.avatarEmoji || '🎒');
      setColor(currentParticipant.avatarColor || AVATAR_COLORS[0]);
    }
  }, [currentParticipant]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Stp indique au moins ton prénom ou surnom !');
      return;
    }
    setError('');
    onSaveParticipant(trimmed, emoji, color);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white border-4 border-emerald-100 rounded-3xl max-w-md w-full shadow-2xl overflow-hidden text-slate-900">
        
        {/* Modal Header */}
        <div className="bg-emerald-50 px-6 py-5 border-b-2 border-emerald-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500 rounded-2xl text-white shadow-sm">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-black text-emerald-950">
                {currentParticipant ? 'Tes informations' : 'Qui es-tu ?'}
              </h3>
              <p className="text-xs font-bold text-slate-500">Pour que tes potes te reconnaissent sur le calendrier</p>
            </div>
          </div>
          {currentParticipant && (
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-emerald-100 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          
          {/* Name Field */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
              Ton prénom ou surnom <span className="text-emerald-600">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError('');
              }}
              placeholder="Ex: Alex, Nassim, Camille..."
              className="w-full px-4 py-3 bg-white border-2 border-emerald-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 text-sm font-semibold shadow-sm"
              autoFocus
            />
            {error && <p className="text-rose-500 text-xs mt-1 font-bold">{error}</p>}
          </div>

          {/* Emoji Selection */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-2">
              Ton avatar / Emoji
            </label>
            <div className="grid grid-cols-8 gap-2 bg-emerald-50/60 p-3 rounded-2xl border-2 border-emerald-100 max-h-28 overflow-y-auto">
              {EMOJI_OPTIONS.map((item) => (
                <button
                  type="button"
                  key={item}
                  onClick={() => setEmoji(item)}
                  className={`text-xl p-2 rounded-xl transition text-center hover:bg-emerald-100 cursor-pointer ${
                    emoji === item ? 'bg-emerald-200 ring-2 ring-emerald-500 scale-110' : ''
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {/* Color Selection */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-2">
              Ta couleur
            </label>
            <div className="flex flex-wrap gap-2">
              {AVATAR_COLORS.map((col) => (
                <button
                  type="button"
                  key={col}
                  onClick={() => setColor(col)}
                  className={`w-8 h-8 rounded-full border-2 transition ${col} flex items-center justify-center cursor-pointer ${
                    color === col ? 'ring-2 ring-emerald-950 scale-110' : 'opacity-80 hover:opacity-100'
                  }`}
                >
                  {color === col && <Check className="w-4 h-4 text-white" />}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t-2 border-slate-100">
            {currentParticipant && (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-black text-slate-500 hover:text-slate-800 transition cursor-pointer"
              >
                Annuler
              </button>
            )}
            <button
              type="submit"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-sm rounded-2xl shadow-[0_4px_0_rgb(5,150,105)] active:shadow-none active:translate-y-1 transition-all cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{currentParticipant ? 'Mettre à jour' : 'Valider mon prénom'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

