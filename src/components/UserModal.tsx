import React, { useState, useEffect } from 'react';
import { Participant } from '../types';
import { getRandomEmojiAvatar, AVATAR_COLORS } from '../lib/dates';
import { User, Check, ShieldCheck, X, Users, Link as LinkIcon, Lock, KeyRound, AlertCircle, ArrowLeft } from 'lucide-react';

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentParticipant: Participant | null;
  participants: Participant[];
  onSaveParticipant: (name: string, emoji: string, color: string, pinHash?: string, pinResetRequired?: boolean) => void;
  onSelectExistingParticipant: (participant: Participant) => void;
}

const EMOJI_OPTIONS = ['🌲', '🏔️', '🏕️', '🥾', '🔥', '🎒', '⛺', '🌅', '🧗‍♂️', '🐻', '🦅', '🌌', '⚡', '☕', '🧭', '🗺️'];

async function hashPin(pin: string): Promise<string> {
  const buffer = new TextEncoder().encode(pin.trim());
  const hash = await window.crypto.subtle.digest('SHA-256', buffer);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export const UserModal: React.FC<UserModalProps> = ({
  isOpen,
  onClose,
  currentParticipant,
  participants,
  onSaveParticipant,
  onSelectExistingParticipant,
}) => {
  const [mode, setMode] = useState<'create' | 'reconnect'>('create');
  const [name, setName] = useState(currentParticipant?.name || '');
  const [emoji, setEmoji] = useState(currentParticipant?.avatarEmoji || getRandomEmojiAvatar());
  const [color, setColor] = useState(currentParticipant?.avatarColor || AVATAR_COLORS[0]);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  // Selected participant for reconnection PIN challenge
  const [selectedParticipantForPin, setSelectedParticipantForPin] = useState<Participant | null>(null);
  const [reconnectPin, setReconnectPin] = useState('');

  useEffect(() => {
    if (currentParticipant) {
      setName(currentParticipant.name);
      setEmoji(currentParticipant.avatarEmoji || '🎒');
      setColor(currentParticipant.avatarColor || AVATAR_COLORS[0]);
    }
  }, [currentParticipant]);

  if (!isOpen) return null;

  const handleCreateOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Indiquez votre prénom ou surnom.');
      return;
    }

    let calculatedPinHash = currentParticipant?.pinHash;
    if (pin.trim()) {
      if (pin.trim().length < 3) {
        setError('Le code secret doit contenir au moins 3 caractères.');
        return;
      }
      calculatedPinHash = await hashPin(pin.trim());
    } else if (!currentParticipant && !pin.trim()) {
      setError('Veuillez définir un code secret pour sécuriser votre profil.');
      return;
    }

    setError('');
    onSaveParticipant(trimmed, emoji, color, calculatedPinHash, false);
    onClose();
  };

  const handleVerifyReconnectPin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedParticipantForPin) return;

    const target = selectedParticipantForPin;

    // If Admin reset PIN or no PIN set yet
    if (target.pinResetRequired || !target.pinHash) {
      if (!reconnectPin.trim() || reconnectPin.trim().length < 3) {
        setError('Veuillez définir un nouveau code secret d\'au moins 3 caractères.');
        return;
      }
      const newHash = await hashPin(reconnectPin.trim());
      const updatedTarget = {
        ...target,
        pinHash: newHash,
        pinResetRequired: false,
      };
      onSelectExistingParticipant(updatedTarget);
      setSelectedParticipantForPin(null);
      setReconnectPin('');
      setError('');
      onClose();
      return;
    }

    // Standard PIN verification
    const enteredHash = await hashPin(reconnectPin.trim());
    if (enteredHash === target.pinHash) {
      onSelectExistingParticipant(target);
      setSelectedParticipantForPin(null);
      setReconnectPin('');
      setError('');
      onClose();
    } else {
      setError('Code secret incorrect. Demandez à l\'administrateur de le réinitialiser si besoin.');
    }
  };

  const handleCopyPersonalLink = () => {
    if (!currentParticipant) return;
    const url = `${window.location.origin}${window.location.pathname}?user=${currentParticipant.id}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
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
                {currentParticipant ? 'Mon Profil' : 'Identifiez-vous'}
              </h3>
              <p className="text-xs font-bold text-slate-500">
                {currentParticipant ? 'Gérez vos paramètres' : 'Accès sécurisé au bivouac'}
              </p>
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

        {/* Toggle Mode if no participant or reconnecting */}
        {!currentParticipant && !selectedParticipantForPin && participants.length > 0 && (
          <div className="flex border-b-2 border-emerald-100 bg-emerald-50/50 p-1.5 gap-1.5">
            <button
              type="button"
              onClick={() => { setMode('create'); setError(''); }}
              className={`flex-1 py-2 text-xs font-black rounded-xl transition ${
                mode === 'create'
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'text-slate-600 hover:text-emerald-950'
              }`}
            >
              Nouveau profil
            </button>
            <button
              type="button"
              onClick={() => { setMode('reconnect'); setError(''); }}
              className={`flex-1 py-2 text-xs font-black rounded-xl transition ${
                mode === 'reconnect'
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'text-slate-600 hover:text-emerald-950'
              }`}
            >
              Retrouver mon profil ({participants.length})
            </button>
          </div>
        )}

        {/* Modal Body */}
        {selectedParticipantForPin ? (
          /* PIN Challenge Form when reconnecting */
          <form onSubmit={handleVerifyReconnectPin} className="p-6 space-y-5">
            <div className="flex items-center gap-3 bg-emerald-50 p-3.5 rounded-2xl border-2 border-emerald-100">
              <span className="w-10 h-10 rounded-full bg-white border-2 border-emerald-300 flex items-center justify-center text-xl shadow-sm shrink-0">
                {selectedParticipantForPin.avatarEmoji || '🎒'}
              </span>
              <div>
                <h4 className="text-sm font-black text-emerald-950">{selectedParticipantForPin.name}</h4>
                <p className="text-xs font-bold text-slate-500">
                  {selectedParticipantForPin.pinResetRequired 
                    ? 'Définissez votre nouveau code secret'
                    : 'Saisissez votre code secret'}
                </p>
              </div>
            </div>

            {selectedParticipantForPin.pinResetRequired && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2 text-xs font-bold text-amber-900">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>L'administrateur a réinitialisé votre code secret. Veuillez saisir un nouveau code secret ci-dessous.</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                {selectedParticipantForPin.pinResetRequired ? 'Nouveau code secret *' : 'Code secret *'}
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={reconnectPin}
                  onChange={(e) => {
                    setReconnectPin(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="Ex: 1234 ou mot secret"
                  className="w-full px-4 py-3 bg-white border-2 border-emerald-200 rounded-2xl text-slate-900 text-sm font-semibold focus:outline-none focus:border-emerald-500 shadow-sm"
                  autoFocus
                />
                <KeyRound className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2" />
              </div>
              {error && <p className="text-rose-500 text-xs mt-1.5 font-bold">{error}</p>}
            </div>

            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setSelectedParticipantForPin(null);
                  setReconnectPin('');
                  setError('');
                }}
                className="px-3.5 py-2 text-xs font-black text-slate-500 hover:text-slate-800 transition flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Retour</span>
              </button>

              <button
                type="submit"
                className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-sm rounded-2xl shadow-[0_4px_0_rgb(5,150,105)] transition cursor-pointer"
              >
                Déverrouiller et accéder ✓
              </button>
            </div>
          </form>
        ) : mode === 'reconnect' && !currentParticipant ? (
          /* Reconnect Mode: List of existing participants */
          <div className="p-6 space-y-4">
            <div className="space-y-1">
              <h4 className="text-sm font-black text-emerald-950 flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-600" />
                <span>Sélectionnez votre prénom</span>
              </h4>
              <p className="text-xs font-bold text-slate-500">
                Cliquez sur votre prénom puis saisissez votre code secret :
              </p>
            </div>

            <div className="divide-y-2 divide-emerald-100 bg-emerald-50/50 rounded-2xl border-2 border-emerald-100 max-h-60 overflow-y-auto">
              {participants.map((p) => (
                <button
                  type="button"
                  key={p.id}
                  onClick={() => {
                    setSelectedParticipantForPin(p);
                    setError('');
                  }}
                  className="w-full p-3.5 flex items-center justify-between hover:bg-emerald-100/80 transition text-left cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-9 h-9 rounded-full bg-white border-2 border-emerald-300 flex items-center justify-center text-lg shadow-sm">
                      {p.avatarEmoji || '🎒'}
                    </span>
                    <div>
                      <span className="text-sm font-black text-emerald-950 block">{p.name}</span>
                      {p.pinResetRequired && (
                        <span className="text-[10px] text-amber-700 font-bold">Code à redéfinir</span>
                      )}
                    </div>
                  </div>
                  <span className="text-xs font-bold text-emerald-700 bg-white px-2.5 py-1 rounded-full border border-emerald-200 shadow-sm flex items-center gap-1">
                    <Lock className="w-3 h-3 text-emerald-600" />
                    <span>Connexion</span>
                  </span>
                </button>
              ))}
            </div>

            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => setMode('create')}
                className="text-xs font-bold text-slate-500 hover:text-emerald-700 underline"
              >
                Nouveau membre ? Créer un profil
              </button>
            </div>
          </div>
        ) : (
          /* Create / Edit Form */
          <form onSubmit={handleCreateOrUpdate} className="p-6 space-y-5">
            
            {/* Name Field */}
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                Votre prénom ou surnom <span className="text-emerald-600">*</span>
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
            </div>

            {/* Secret PIN Field */}
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1">
                Code secret personnel <span className="text-emerald-600">*</span>
              </label>
              <p className="text-[11px] font-bold text-slate-500 mb-1.5">
                {currentParticipant 
                  ? 'Laissez vide pour conserver votre code actuel ou saisissez un nouveau code' 
                  : 'Empêche quiconque d\'usurper votre profil sur un autre appareil'}
              </p>
              <div className="relative">
                <input
                  type="password"
                  value={pin}
                  onChange={(e) => {
                    setPin(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder={currentParticipant ? 'Nouveau code (optionnel)' : 'Ex: 1234 ou mot secret'}
                  className="w-full px-4 py-3 bg-white border-2 border-emerald-200 rounded-2xl text-slate-900 text-sm font-semibold focus:outline-none focus:border-emerald-500 shadow-sm"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {error && <p className="text-rose-500 text-xs font-bold">{error}</p>}

            {/* Emoji Selection */}
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-2">
                Votre avatar / Emoji
              </label>
              <div className="grid grid-cols-8 gap-2 bg-emerald-50/60 p-3 rounded-2xl border-2 border-emerald-100 max-h-24 overflow-y-auto">
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
                Votre couleur
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

            {/* Copy Personal Magic Link (if logged in) */}
            {currentParticipant && (
              <div className="pt-1">
                <button
                  type="button"
                  onClick={handleCopyPersonalLink}
                  className="w-full py-2.5 px-3 bg-amber-50 hover:bg-amber-100 text-amber-900 border-2 border-amber-200 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <LinkIcon className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>{copiedLink ? 'Lien personnel copié !' : 'Copier mon lien de connexion direct'}</span>
                </button>
              </div>
            )}

            {/* Actions */}
            <div className="pt-3 flex items-center justify-between gap-3 border-t-2 border-slate-100">
              {participants.length > 0 && !currentParticipant && (
                <button
                  type="button"
                  onClick={() => { setMode('reconnect'); setError(''); }}
                  className="text-xs font-black text-emerald-700 hover:underline"
                >
                  Déjà membre ?
                </button>
              )}
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
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-sm rounded-2xl shadow-[0_4px_0_rgb(5,150,105)] active:shadow-none active:translate-y-1 transition-all cursor-pointer ml-auto"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{currentParticipant ? 'Enregistrer' : 'Valider mon profil'}</span>
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
