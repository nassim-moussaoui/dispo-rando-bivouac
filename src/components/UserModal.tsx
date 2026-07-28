import React, { useState, useEffect } from 'react';
import { Participant } from '../types';
import { getRandomEmojiAvatar, AVATAR_COLORS } from '../lib/dates';
import { 
  User, 
  Check, 
  ShieldCheck, 
  X, 
  Users, 
  Link as LinkIcon, 
  Lock, 
  KeyRound, 
  AlertCircle, 
  ArrowLeft,
  ArrowRight,
  Backspace,
  HelpCircle,
  LogOut
} from 'lucide-react';

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentParticipant: Participant | null;
  participants: Participant[];
  onSaveParticipant: (name: string, emoji: string, color: string, pinHash?: string, pinResetRequired?: boolean) => void;
  onSelectExistingParticipant: (participant: Participant) => void;
  onLogout?: () => void;
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
  onLogout,
}) => {
  const [mode, setMode] = useState<'create' | 'reconnect'>('create');
  const [createStep, setCreateStep] = useState<1 | 2>(1); // 1: Info, 2: 6-Digit PIN
  
  // Step 1 fields
  const [name, setName] = useState(currentParticipant?.name || '');
  const [emoji, setEmoji] = useState(currentParticipant?.avatarEmoji || getRandomEmojiAvatar());
  const [color, setColor] = useState(currentParticipant?.avatarColor || AVATAR_COLORS[0]);
  
  // Step 2 PIN field (6 digits)
  const [pinDigits, setPinDigits] = useState<string>('');
  
  const [error, setError] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  // Selected participant for reconnection PIN challenge
  const [selectedParticipantForPin, setSelectedParticipantForPin] = useState<Participant | null>(null);
  const [reconnectPinDigits, setReconnectPinDigits] = useState<string>('');
  const [showForgotPinHelp, setShowForgotPinHelp] = useState(false);

  useEffect(() => {
    if (currentParticipant) {
      setName(currentParticipant.name);
      setEmoji(currentParticipant.avatarEmoji || '🎒');
      setColor(currentParticipant.avatarColor || AVATAR_COLORS[0]);
    }
  }, [currentParticipant]);

  if (!isOpen) return null;

  // Keypad press handler for creation
  const handleKeypadPress = (val: string) => {
    setError('');
    if (val === 'backspace') {
      setPinDigits((prev) => prev.slice(0, -1));
    } else if (pinDigits.length < 6) {
      setPinDigits((prev) => prev + val);
    }
  };

  // Keypad press handler for reconnection
  const handleReconnectKeypadPress = (val: string) => {
    setError('');
    if (val === 'backspace') {
      setReconnectPinDigits((prev) => prev.slice(0, -1));
    } else if (reconnectPinDigits.length < 6) {
      setReconnectPinDigits((prev) => prev + val);
    }
  };

  const handleNextStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Veuillez indiquer votre prénom ou surnom.');
      return;
    }
    setError('');
    if (currentParticipant) {
      // Editing existing connected participant: directly save if no PIN change needed
      onSaveParticipant(trimmed, emoji, color, currentParticipant.pinHash);
      onClose();
    } else {
      // New profile: move to Step 2 PIN creation
      setCreateStep(2);
    }
  };

  const handleCompleteCreation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pinDigits.length !== 6) {
      setError('Le code PIN doit comporter exactement 6 chiffres.');
      return;
    }

    const calculatedPinHash = await hashPin(pinDigits);
    setError('');
    onSaveParticipant(name.trim(), emoji, color, calculatedPinHash, false);
    setPinDigits('');
    setCreateStep(1);
    onClose();
  };

  const handleVerifyReconnectPin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedParticipantForPin) return;

    const target = selectedParticipantForPin;

    if (reconnectPinDigits.length !== 6 && !target.pinResetRequired && target.pinHash) {
      setError('Saisissez le code PIN à 6 chiffres.');
      return;
    }

    // If Admin reset PIN or no PIN set yet
    if (target.pinResetRequired || !target.pinHash) {
      if (reconnectPinDigits.length !== 6) {
        setError('Définissez un nouveau code PIN à 6 chiffres.');
        return;
      }
      const newHash = await hashPin(reconnectPinDigits);
      const updatedTarget = {
        ...target,
        pinHash: newHash,
        pinResetRequired: false,
      };
      onSelectExistingParticipant(updatedTarget);
      setSelectedParticipantForPin(null);
      setReconnectPinDigits('');
      setError('');
      onClose();
      return;
    }

    // Standard PIN verification
    const enteredHash = await hashPin(reconnectPinDigits);
    if (enteredHash === target.pinHash) {
      onSelectExistingParticipant(target);
      setSelectedParticipantForPin(null);
      setReconnectPinDigits('');
      setError('');
      onClose();
    } else {
      setError('Code PIN incorrect. Réessayez ou cliquez sur "Code oublié ?".');
    }
  };

  const handleCopyPersonalLink = () => {
    if (!currentParticipant) return;
    const url = `${window.location.origin}${window.location.pathname}?user=${currentParticipant.id}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // Render Keypad Component
  const renderNumpad = (onPress: (val: string) => void) => (
    <div className="grid grid-cols-3 gap-2.5 max-w-xs mx-auto pt-2">
      {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
        <button
          type="button"
          key={digit}
          onClick={() => onPress(digit)}
          className="h-12 bg-slate-100 hover:bg-emerald-500 hover:text-white text-slate-900 font-black text-xl rounded-2xl border-2 border-slate-200 hover:border-emerald-600 transition shadow-sm active:scale-95 cursor-pointer flex items-center justify-center"
        >
          {digit}
        </button>
      ))}
      <div />
      <button
        type="button"
        onClick={() => onPress('0')}
        className="h-12 bg-slate-100 hover:bg-emerald-500 hover:text-white text-slate-900 font-black text-xl rounded-2xl border-2 border-slate-200 hover:border-emerald-600 transition shadow-sm active:scale-95 cursor-pointer flex items-center justify-center"
      >
        0
      </button>
      <button
        type="button"
        onClick={() => onPress('backspace')}
        className="h-12 bg-slate-200 hover:bg-rose-500 hover:text-white text-slate-700 font-black text-sm rounded-2xl border-2 border-slate-300 hover:border-rose-600 transition shadow-sm active:scale-95 cursor-pointer flex items-center justify-center"
        title="Effacer"
      >
        ⌫
      </button>
    </div>
  );

  // Render 6-digit Slot Indicators
  const renderPinSlots = (pinString: string) => (
    <div className="flex items-center justify-center gap-2.5 py-3">
      {[0, 1, 2, 3, 4, 5].map((idx) => {
        const isFilled = idx < pinString.length;
        return (
          <div
            key={idx}
            className={`w-10 h-12 rounded-2xl border-3 flex items-center justify-center text-xl font-black transition-all ${
              isFilled
                ? 'bg-emerald-500 text-white border-emerald-600 shadow-md scale-105'
                : 'bg-emerald-50/50 border-emerald-200 text-slate-300'
            }`}
          >
            {isFilled ? '●' : '○'}
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white border-4 border-emerald-100 rounded-3xl max-w-md w-full shadow-2xl overflow-hidden text-slate-900 relative">
        
        {/* Modal Header */}
        <div className="bg-emerald-50 px-6 py-4 border-b-2 border-emerald-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500 rounded-2xl text-white shadow-sm">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-emerald-950">
                {currentParticipant ? 'Mon Profil' : 'Identifiez-vous'}
              </h3>
              <p className="text-[11px] font-bold text-slate-500">
                {currentParticipant ? 'Gérez vos paramètres' : 'Accès sécurisé au bivouac'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {currentParticipant && onLogout && (
              <button
                type="button"
                onClick={() => {
                  onLogout();
                  onClose();
                }}
                className="px-3 py-1.5 bg-rose-100 hover:bg-rose-200 text-rose-800 text-xs font-black rounded-xl transition flex items-center gap-1 cursor-pointer"
                title="Se déconnecter de ce profil"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Déconnexion</span>
              </button>
            )}
            {currentParticipant && (
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-emerald-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Toggle Mode if no participant or reconnecting */}
        {!currentParticipant && !selectedParticipantForPin && participants.length > 0 && (
          <div className="flex border-b-2 border-emerald-100 bg-emerald-50/50 p-1.5 gap-1.5">
            <button
              type="button"
              onClick={() => { setMode('create'); setCreateStep(1); setError(''); }}
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

        {/* Forgot PIN Dialog */}
        {showForgotPinHelp && (
          <div className="p-6 space-y-4 animate-in fade-in duration-200">
            <div className="p-4 bg-amber-50 border-2 border-amber-200 rounded-2xl space-y-2">
              <div className="flex items-center gap-2 text-amber-900 font-black text-sm">
                <HelpCircle className="w-5 h-5 text-amber-600" />
                <span>Code PIN oublié ?</span>
              </div>
              <p className="text-xs font-bold text-slate-700 leading-relaxed">
                Pas de panique ! Demandez simplement à l'administrateur du groupe de réinitialiser votre code PIN depuis la page d'administration (<strong>/admin</strong>).
              </p>
              <p className="text-[11px] font-semibold text-slate-500">
                Une fois réinitialisé, vous pourrez choisir un nouveau code PIN à 6 chiffres en 1 clic.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowForgotPinHelp(false)}
              className="w-full py-3 bg-emerald-500 text-white font-black text-xs rounded-2xl shadow-sm cursor-pointer"
            >
              J'ai compris
            </button>
          </div>
        )}

        {/* Modal Body */}
        {!showForgotPinHelp && (
          <>
            {selectedParticipantForPin ? (
              /* PIN Challenge Form when reconnecting */
              <form onSubmit={handleVerifyReconnectPin} className="p-6 space-y-4">
                <div className="flex items-center gap-3 bg-emerald-50 p-3.5 rounded-2xl border-2 border-emerald-100">
                  <span className="w-10 h-10 rounded-full bg-white border-2 border-emerald-300 flex items-center justify-center text-xl shadow-sm shrink-0">
                    {selectedParticipantForPin.avatarEmoji || '🎒'}
                  </span>
                  <div>
                    <h4 className="text-sm font-black text-emerald-950">{selectedParticipantForPin.name}</h4>
                    <p className="text-xs font-bold text-slate-500">
                      {selectedParticipantForPin.pinResetRequired 
                        ? 'Définissez votre nouveau code PIN (6 chiffres)'
                        : 'Entrez votre code PIN à 6 chiffres'}
                    </p>
                  </div>
                </div>

                {selectedParticipantForPin.pinResetRequired && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2 text-xs font-bold text-amber-900">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>Code réinitialisé par l'admin. Veuillez saisir votre nouveau PIN ci-dessous.</span>
                  </div>
                )}

                {/* 6 Digit Slots */}
                {renderPinSlots(reconnectPinDigits)}

                {error && <p className="text-rose-500 text-xs font-bold text-center">{error}</p>}

                {/* Numpad */}
                {renderNumpad(handleReconnectKeypadPress)}

                <div className="flex items-center justify-between gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedParticipantForPin(null);
                      setReconnectPinDigits('');
                      setError('');
                    }}
                    className="px-3.5 py-2 text-xs font-black text-slate-500 hover:text-slate-800 transition flex items-center gap-1"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Retour</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowForgotPinHelp(true)}
                    className="text-xs font-black text-emerald-700 hover:underline"
                  >
                    Code oublié ?
                  </button>

                  <button
                    type="submit"
                    disabled={reconnectPinDigits.length !== 6 && !selectedParticipantForPin.pinResetRequired}
                    className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-black text-xs rounded-xl shadow-[0_3px_0_rgb(5,150,105)] transition cursor-pointer"
                  >
                    Déverrouiller ✓
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
                    Cliquez sur votre profil puis saisissez votre code PIN à 6 chiffres :
                  </p>
                </div>

                <div className="divide-y-2 divide-emerald-100 bg-emerald-50/50 rounded-2xl border-2 border-emerald-100 max-h-60 overflow-y-auto">
                  {participants.map((p) => (
                    <button
                      type="button"
                      key={p.id}
                      onClick={() => {
                        setSelectedParticipantForPin(p);
                        setReconnectPinDigits('');
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
                            <span className="text-[10px] text-amber-700 font-bold">PIN à redéfinir</span>
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
            ) : createStep === 1 ? (
              /* Step 1: Profile Creation (Name, Emoji, Color) */
              <form onSubmit={handleNextStep1} className="p-6 space-y-5">
                
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
                  {error && <p className="text-rose-500 text-xs mt-1 font-bold">{error}</p>}
                </div>

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
                  {currentParticipant ? (
                    <button
                      type="submit"
                      className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-sm rounded-2xl shadow-[0_4px_0_rgb(5,150,105)] transition cursor-pointer ml-auto"
                    >
                      Enregistrer les modifications
                    </button>
                  ) : (
                    <button
                      type="submit"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-sm rounded-2xl shadow-[0_4px_0_rgb(5,150,105)] transition cursor-pointer ml-auto"
                    >
                      <span>Suivant</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>

              </form>
            ) : (
              /* Step 2: 6-Digit PIN Creation with Numpad */
              <form onSubmit={handleCompleteCreation} className="p-6 space-y-4">
                <div className="text-center space-y-1">
                  <div className="w-10 h-10 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center mx-auto border-2 border-emerald-200">
                    <KeyRound className="w-5 h-5" />
                  </div>
                  <h4 className="text-base font-black text-emerald-950">Créez votre Code PIN (6 chiffres)</h4>
                  <p className="text-xs font-bold text-slate-500">
                    Obligatoire pour sécuriser votre profil <strong>{name}</strong>
                  </p>
                </div>

                {/* 6 Digit Slots */}
                {renderPinSlots(pinDigits)}

                {error && <p className="text-rose-500 text-xs font-bold text-center">{error}</p>}

                {/* Numpad */}
                {renderNumpad(handleKeypadPress)}

                <div className="flex items-center justify-between gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => { setCreateStep(1); setError(''); }}
                    className="px-3.5 py-2 text-xs font-black text-slate-500 hover:text-slate-800 transition flex items-center gap-1"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Retour</span>
                  </button>

                  <button
                    type="submit"
                    disabled={pinDigits.length !== 6}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-black text-xs rounded-2xl shadow-[0_4px_0_rgb(5,150,105)] transition cursor-pointer"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Valider et créer mon profil</span>
                  </button>
                </div>
              </form>
            )}
          </>
        )}

      </div>
    </div>
  );
};
