import React, { useState, useEffect } from 'react';
import { Participant, WeekendVote, DateAvailability } from '../types';
import { 
  ShieldCheck, 
  Lock, 
  Trash2, 
  LogOut, 
  ArrowLeft, 
  Search, 
  Users, 
  BarChart2, 
  Calendar, 
  CheckCircle2, 
  AlertCircle,
  KeyRound
} from 'lucide-react';

interface AdminPageProps {
  participants: Participant[];
  weekendVotes: WeekendVote[];
  dateAvailabilities: DateAvailability[];
  onDeleteParticipant: (participantId: string) => Promise<void>;
  onResetParticipantPin: (participantId: string) => Promise<void>;
  onNavigateHome: () => void;
}

// SHA-256 hash of the admin password
const ADMIN_HASH = 'ffaf37a6c905bbaa24360159245c5e47bad6203902a00aebb5847e4b809f85ed';

async function sha256(str: string): Promise<string> {
  const buffer = new TextEncoder().encode(str);
  const hash = await window.crypto.subtle.digest('SHA-256', buffer);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export const AdminPage: React.FC<AdminPageProps> = ({
  participants,
  weekendVotes,
  dateAvailabilities,
  onDeleteParticipant,
  onResetParticipantPin,
  onNavigateHome,
}) => {
  const [passwordInput, setPasswordInput] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('admin_session') === 'true';
  });
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [resettingPinId, setResettingPinId] = useState<string | null>(null);
  const [confirmDeleteParticipant, setConfirmDeleteParticipant] = useState<Participant | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleResetPin = async (p: Participant) => {
    setResettingPinId(p.id);
    try {
      await onResetParticipantPin(p.id);
      setToastMessage(`Le code PIN de ${p.name} a été réinitialisé.`);
    } catch (err) {
      console.error("Erreur lors de la réinitialisation du PIN:", err);
    } finally {
      setResettingPinId(null);
    }
  };

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordInput.trim()) {
      setError('Veuillez saisir votre mot de passe.');
      return;
    }

    const hashedInput = await sha256(passwordInput.trim());
    if (hashedInput === ADMIN_HASH) {
      setIsAuthenticated(true);
      sessionStorage.setItem('admin_session', 'true');
      setError('');
      setPasswordInput('');
    } else {
      setError('Mot de passe incorrect.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('admin_session');
    setPasswordInput('');
    setError('');
  };

  const executeDelete = async () => {
    if (!confirmDeleteParticipant) return;
    const p = confirmDeleteParticipant;
    setDeletingId(p.id);
    try {
      await onDeleteParticipant(p.id);
      setToastMessage(`Le participant ${p.name} a été supprimé.`);
      setConfirmDeleteParticipant(null);
    } catch (err) {
      console.error("Erreur lors de la suppression:", err);
      setError("Une erreur est survenue lors de la suppression.");
    } finally {
      setDeletingId(null);
    }
  };

  const filteredParticipants = participants.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalVotes = weekendVotes.length + dateAvailabilities.length;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {confirmDeleteParticipant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-800 border border-slate-700 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl text-slate-100">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="p-3 bg-rose-500/10 rounded-2xl border border-rose-500/20">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Confirmer la suppression</h3>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed">
              Êtes-vous sûr de vouloir supprimer le participant <strong className="text-white">{confirmDeleteParticipant.name}</strong> ? 
              Cette action supprimera également tous ses votes et disponibilités de la base de données.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setConfirmDeleteParticipant(null)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-700 transition"
              >
                Annuler
              </button>
              <button
                onClick={executeDelete}
                disabled={deletingId !== null}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                <span>{deletingId ? 'Suppression...' : 'Confirmer la suppression'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Header */}
      <header className="bg-slate-800/90 border-b border-slate-700/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onNavigateHome}
              className="p-2 bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white rounded-xl transition flex items-center gap-2 text-xs font-semibold"
              title="Retourner au site"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Retour au site</span>
            </button>
            <div className="h-5 w-px bg-slate-700 hidden sm:block" />
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <h1 className="text-base sm:text-lg font-bold text-white">Espace d'Administration</h1>
            </div>
          </div>

          {isAuthenticated && (
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-slate-700 hover:bg-rose-600/90 text-slate-300 hover:text-white text-xs font-semibold rounded-xl border border-slate-600 transition flex items-center gap-2 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Se déconnecter</span>
            </button>
          )}
        </div>
      </header>

      {/* Body Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {!isAuthenticated ? (
          /* LOGIN SCREEN */
          <div className="max-w-md mx-auto py-12 sm:py-20 animate-in fade-in duration-300">
            <div className="bg-slate-800/90 border border-slate-700/80 rounded-3xl p-8 shadow-2xl space-y-6">
              
              <div className="text-center space-y-3">
                <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
                  <KeyRound className="w-7 h-7" />
                </div>
                <h2 className="text-xl font-bold text-white">Connexion Administrateur</h2>
                <p className="text-xs text-slate-400">
                  Veuillez saisir votre mot de passe pour accéder à la gestion des utilisateurs et des données.
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wider">
                    Mot de passe
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      value={passwordInput}
                      onChange={(e) => {
                        setPasswordInput(e.target.value);
                        if (error) setError('');
                      }}
                      placeholder="Saisissez votre mot de passe"
                      className="w-full px-4 py-3.5 bg-slate-900 border border-slate-700 rounded-2xl text-slate-100 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 placeholder-slate-500"
                      autoFocus
                    />
                  </div>
                  {error && <p className="text-rose-400 text-xs mt-2 font-medium">{error}</p>}
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-2xl shadow-lg transition duration-200 cursor-pointer flex items-center justify-center gap-2"
                >
                  <Lock className="w-4 h-4" />
                  <span>Se connecter</span>
                </button>
              </form>

              <div className="pt-4 border-t border-slate-700/60 text-center">
                <button
                  onClick={onNavigateHome}
                  className="text-xs text-slate-400 hover:text-slate-200 transition font-medium"
                >
                  ← Retourner à l'application
                </button>
              </div>

            </div>
          </div>
        ) : (
          /* DASHBOARD SCREEN */
          <div className="space-y-8 animate-in fade-in duration-300">
            
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-lg flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Participants Inscrits</p>
                  <p className="text-2xl font-bold text-white mt-1">{participants.length}</p>
                </div>
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl">
                  <Users className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-lg flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total des Votes</p>
                  <p className="text-2xl font-bold text-white mt-1">{totalVotes}</p>
                </div>
                <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl">
                  <BarChart2 className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-lg flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Statut de la base</p>
                  <p className="text-sm font-bold text-emerald-400 mt-1 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Synchronisation Firebase</span>
                  </p>
                </div>
                <div className="p-3 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-xl">
                  <Calendar className="w-6 h-6" />
                </div>
              </div>
            </div>

            {/* Participants Table Container */}
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-3xl p-6 shadow-xl space-y-5">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-white">Gestion des Participants</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Recherchez ou supprimez des membres de la session active
                  </p>
                </div>

                {/* Search Bar */}
                <div className="relative min-w-[260px]">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Rechercher un membre..."
                    className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto rounded-2xl border border-slate-700/70">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] font-bold tracking-wider border-b border-slate-700">
                    <tr>
                      <th className="px-5 py-3.5">Participant</th>
                      <th className="px-5 py-3.5">Identifiant</th>
                      <th className="px-5 py-3.5 text-center">Votes actifs</th>
                      <th className="px-5 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/60 bg-slate-900/40">
                    {filteredParticipants.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-5 py-8 text-center text-slate-500 text-xs italic">
                          {searchQuery ? 'Aucun participant ne correspond à votre recherche.' : 'Aucun participant enregistré.'}
                        </td>
                      </tr>
                    ) : (
                      filteredParticipants.map((p) => {
                        const pVotesCount = weekendVotes.filter((v) => v.participantId === p.id).length 
                          + dateAvailabilities.filter((a) => a.participantId === p.id).length;

                        return (
                          <tr key={p.id} className="hover:bg-slate-800/60 transition">
                            <td className="px-5 py-3.5 font-bold text-white">
                              {p.name}
                            </td>
                            <td className="px-5 py-3.5 font-mono text-slate-400 text-[11px]">
                              {p.id}
                            </td>
                            <td className="px-5 py-3.5 text-center">
                              <span className="inline-block px-2.5 py-1 bg-slate-800 border border-slate-700 text-emerald-400 rounded-full font-bold text-[11px]">
                                {pVotesCount} vote(s)
                              </span>
                            </td>
                            <td className="px-5 py-3.5 text-right flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleResetPin(p)}
                                disabled={resettingPinId === p.id}
                                className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500 text-amber-400 hover:text-slate-950 border border-amber-500/30 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
                                title="Réinitialiser le code PIN secret de ce membre"
                              >
                                <KeyRound className="w-3.5 h-3.5" />
                                <span>{resettingPinId === p.id ? 'Reset...' : 'Reset PIN'}</span>
                              </button>

                              <button
                                onClick={() => setConfirmDeleteParticipant(p)}
                                className="px-3.5 py-1.5 bg-rose-600/10 hover:bg-rose-600 text-rose-400 hover:text-white border border-rose-500/30 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Supprimer</span>
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

            </div>

          </div>
        )}
      </main>

    </div>
  );
};
