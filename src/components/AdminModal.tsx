import React, { useState } from 'react';
import { Participant, WeekendVote, DateAvailability } from '../types';
import { ShieldCheck, Lock, Trash2, X, LogOut } from 'lucide-react';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  participants: Participant[];
  weekendVotes: WeekendVote[];
  dateAvailabilities: DateAvailability[];
  onDeleteParticipant: (participantId: string) => Promise<void>;
}

// SHA-256 hash of the admin password - stored only as hash
const ADMIN_HASH = 'ffaf37a6c905bbaa24360159245c5e47bad6203902a00aebb5847e4b809f85ed';

async function sha256(str: string): Promise<string> {
  const buffer = new TextEncoder().encode(str);
  const hash = await window.crypto.subtle.digest('SHA-256', buffer);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export const AdminModal: React.FC<AdminModalProps> = ({
  isOpen,
  onClose,
  participants,
  weekendVotes,
  dateAvailabilities,
  onDeleteParticipant,
}) => {
  const [passwordInput, setPasswordInput] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordInput.trim()) {
      setError('Veuillez entrer le mot de passe.');
      return;
    }

    const hashedInput = await sha256(passwordInput.trim());
    if (hashedInput === ADMIN_HASH) {
      setIsAuthenticated(true);
      setError('');
      setPasswordInput('');
    } else {
      setError('Mot de passe administrateur incorrect.');
    }
  };

  const handleConfirmDelete = async (participantId: string) => {
    setDeletingId(participantId);
    try {
      await onDeleteParticipant(participantId);
    } catch (err) {
      console.error("Failed to delete participant:", err);
    } finally {
      setDeletingId(null);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setPasswordInput('');
    setError('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white border-4 border-slate-900 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden text-slate-900 relative">
        
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-400 text-slate-950 rounded-2xl shadow-sm">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-black text-white">Espace Administrateur</h3>
              <p className="text-xs text-slate-300 font-medium">Gestion et modération sécurisée du groupe</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAuthenticated && (
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl flex items-center gap-1.5 transition cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Déconnexion</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6">
          {!isAuthenticated ? (
            /* Login Form */
            <form onSubmit={handleLogin} className="space-y-4 max-w-sm mx-auto py-6">
              <div className="text-center space-y-2 mb-6">
                <div className="w-14 h-14 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto border-2 border-emerald-300">
                  <ShieldCheck className="w-7 h-7" />
                </div>
                <h4 className="text-lg font-black text-slate-900">Accès Administrateur</h4>
                <p className="text-xs font-bold text-slate-500">Saisissez le mot de passe secret administrateur</p>
              </div>

              <div>
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => {
                    setPasswordInput(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="Mot de passe admin..."
                  className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-2xl text-slate-900 text-sm font-semibold focus:outline-none focus:border-emerald-500 shadow-sm"
                  autoFocus
                />
                {error && <p className="text-rose-600 text-xs mt-1.5 font-bold">{error}</p>}
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-sm rounded-2xl shadow-[0_4px_0_rgb(5,150,105)] active:shadow-none active:translate-y-1 transition-all cursor-pointer"
              >
                Déverrouiller l'Administration 🔓
              </button>
            </form>
          ) : (
            /* Admin Dashboard */
            <div className="space-y-6">
              
              {/* Stats Bar */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-emerald-50 p-4 rounded-2xl border-2 border-emerald-200">
                  <div className="text-xs font-black uppercase text-emerald-800 tracking-wider">Membres inscrits</div>
                  <div className="text-2xl font-black text-emerald-950 mt-1">{participants.length}</div>
                </div>

                <div className="bg-amber-50 p-4 rounded-2xl border-2 border-amber-200">
                  <div className="text-xs font-black uppercase text-amber-800 tracking-wider">Votes enregistrés</div>
                  <div className="text-2xl font-black text-amber-950 mt-1">
                    {weekendVotes.length + dateAvailabilities.length}
                  </div>
                </div>
              </div>

              {/* Members List */}
              <div className="space-y-3">
                <h4 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center justify-between">
                  <span>Liste des Membres ({participants.length})</span>
                  <span className="text-xs font-bold text-slate-400 lowercase">contrôle admin</span>
                </h4>

                {participants.length === 0 ? (
                  <p className="text-xs font-bold text-slate-400 italic py-4 text-center">Aucun membre inscrit pour le moment.</p>
                ) : (
                  <div className="divide-y-2 divide-slate-100 bg-slate-50/50 rounded-2xl border-2 border-slate-200 max-h-80 overflow-y-auto">
                    {participants.map((p) => {
                      const pVotesCount = weekendVotes.filter((v) => v.participantId === p.id).length 
                        + dateAvailabilities.filter((a) => a.participantId === p.id).length;

                      return (
                        <div key={p.id} className="p-4 flex items-center justify-between gap-3 hover:bg-white transition">
                          <div className="flex items-center gap-3">
                            <span className="w-10 h-10 rounded-full bg-white border-2 border-slate-200 flex items-center justify-center text-xl shadow-sm shrink-0">
                              {p.avatarEmoji || '🎒'}
                            </span>
                            <div>
                              <div className="text-sm font-black text-slate-900">{p.name}</div>
                              <div className="text-xs font-bold text-slate-500">
                                {pVotesCount} vote(s) en base
                              </div>
                            </div>
                          </div>

                          <button
                            onClick={() => {
                              if (window.confirm(`Voulez-vous vraiment supprimer "${p.name}" et tous ses votes ?`)) {
                                handleConfirmDelete(p.id);
                              }
                            }}
                            disabled={deletingId === p.id}
                            className="px-3.5 py-2 bg-rose-500 hover:bg-rose-600 text-white font-black text-xs rounded-xl shadow-sm active:translate-y-0.5 transition cursor-pointer flex items-center gap-1.5 shrink-0"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>{deletingId === p.id ? 'Suppression...' : 'Supprimer'}</span>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>
          )}
        </div>

      </div>
    </div>
  );
};
