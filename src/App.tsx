import React, { useEffect, useState } from 'react';
import { 
  Participant, 
  WeekendVote, 
  DateAvailability, 
  TripDetails, 
  AvailabilityStatus 
} from './types';
import { 
  initAuth, 
  subscribeParticipants, 
  subscribeWeekendVotes, 
  subscribeDateAvailabilities, 
  subscribeTripDetails, 
  saveParticipantInDb, 
  deleteParticipantFromDb,
  deleteDocByIdInDb,
  resetParticipantPinInDb,
  saveWeekendVoteInDb, 
  deleteWeekendVoteInDb,
  saveDateAvailabilityInDb, 
  deleteDateAvailabilityInDb,
  saveTripDetailsInDb 
} from './lib/firebase';

import { Header } from './components/Header';
import { UserModal } from './components/UserModal';
import { HeatmapRanking } from './components/HeatmapRanking';
import { DetailedCalendar } from './components/DetailedCalendar';
import { TripDetailsTab } from './components/TripDetailsTab';
import { ShareModal } from './components/ShareModal';
import { AdminPage } from './components/AdminPage';
import { NotFoundPage } from './components/NotFoundPage';

import { Calendar, Compass, Tent } from 'lucide-react';

export default function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [currentParticipant, setCurrentParticipant] = useState<Participant | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [weekendVotes, setWeekendVotes] = useState<WeekendVote[]>([]);
  const [dateAvailabilities, setDateAvailabilities] = useState<DateAvailability[]>([]);
  const [tripDetails, setTripDetails] = useState<TripDetails | null>(null);

  const [activeTab, setActiveTab] = useState<'calendar' | 'trip'>('calendar');
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // Router listener
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
  };

  // Initialize Firebase Auth & Load stored local participant or URL user magic link
  useEffect(() => {
    const setup = async () => {
      await initAuth();

      const stored = localStorage.getItem('dispo_rando_participant');
      if (stored) {
        try {
          const parsed = JSON.parse(stored) as Participant;
          setCurrentParticipant(parsed);
        } catch (e) {
          console.error("Failed parsing stored participant:", e);
          localStorage.removeItem('dispo_rando_participant');
          setIsUserModalOpen(true);
        }
      } else {
        setIsUserModalOpen(true);
      }
    };
    setup();
  }, []);

  // Subscribe to Firestore collections (runs once)
  useEffect(() => {
    const unsubParticipants = subscribeParticipants((list) => {
      setParticipants(list);

      // Auto-clear local participant if deleted from database
      const stored = localStorage.getItem('dispo_rando_participant');
      if (stored) {
        try {
          const parsed = JSON.parse(stored) as Participant;
          if (!list.some((p) => p.id === parsed.id)) {
            setCurrentParticipant(null);
            localStorage.removeItem('dispo_rando_participant');
          }
        } catch (e) {
          // ignore
        }
      }
    });

    const unsubWeekendVotes = subscribeWeekendVotes((votes) => {
      setWeekendVotes(votes);
    });

    const unsubAvailabilities = subscribeDateAvailabilities((list) => {
      setDateAvailabilities(list);
    });

    const unsubTripDetails = subscribeTripDetails((details) => {
      setTripDetails(details);
    });

    // Handle magic link ?user= recovery
    const urlParams = new URLSearchParams(window.location.search);
    const urlUserId = urlParams.get('user') || urlParams.get('u');
    if (urlUserId) {
      // We'll check once participants load via the subscription above
      const unsubMagicLink = subscribeParticipants((list) => {
        const found = list.find((p) => p.id === urlUserId);
        if (found) {
          setCurrentParticipant(found);
          localStorage.setItem('dispo_rando_participant', JSON.stringify(found));
          window.history.replaceState({}, '', window.location.pathname);
        }
        unsubMagicLink();
      });
    }

    return () => {
      unsubParticipants();
      unsubWeekendVotes();
      unsubAvailabilities();
      unsubTripDetails();
    };
  }, []);

  const handleSelectExistingParticipant = (participant: Participant) => {
    setCurrentParticipant(participant);
    localStorage.setItem('dispo_rando_participant', JSON.stringify(participant));
    // Update pinHash/pinResetRequired if changed during reconnection
    if (participant.pinHash !== undefined) {
      saveParticipantInDb(participant);
    }
  };

  const handleSaveParticipant = async (
    name: string,
    emoji: string,
    color: string,
    pinHash?: string,
    pinResetRequired?: boolean
  ) => {
    const id = currentParticipant?.id || 'p_' + Math.random().toString(36).substr(2, 9);
    const updated: Participant = {
      id,
      name,
      avatarEmoji: emoji,
      avatarColor: color,
      pinHash: pinHash ?? currentParticipant?.pinHash ?? '',
      pinResetRequired: pinResetRequired ?? false,
      createdAt: currentParticipant?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setCurrentParticipant(updated);
    localStorage.setItem('dispo_rando_participant', JSON.stringify(updated));
    await saveParticipantInDb(updated);
  };

  const handleResetParticipantPin = async (participantId: string) => {
    await resetParticipantPinInDb(participantId);
  };

  // Vote for a weekend
  const handleVoteWeekend = async (weekendId: string, status: AvailabilityStatus | null) => {
    if (!currentParticipant) {
      setIsUserModalOpen(true);
      return;
    }

    if (status === null) {
      await deleteWeekendVoteInDb(currentParticipant.id, weekendId);
      return;
    }

    const vote: WeekendVote = {
      id: `${currentParticipant.id}_${weekendId}`,
      participantId: currentParticipant.id,
      participantName: currentParticipant.name,
      weekendId,
      status,
      updatedAt: new Date().toISOString(),
    };

    await saveWeekendVoteInDb(vote);
  };

  // Vote for a specific day
  const handleVoteDate = async (dateStr: string, status: AvailabilityStatus | null) => {
    if (!currentParticipant) {
      setIsUserModalOpen(true);
      return;
    }

    if (status === null) {
      await deleteDateAvailabilityInDb(currentParticipant.id, dateStr);
      return;
    }

    const avail: DateAvailability = {
      id: `${currentParticipant.id}_${dateStr}`,
      participantId: currentParticipant.id,
      participantName: currentParticipant.name,
      avatarColor: currentParticipant.avatarColor,
      date: dateStr,
      status,
      updatedAt: new Date().toISOString(),
    };

    await saveDateAvailabilityInDb(avail);
  };

  // Admin participant deletion
  const handleDeleteParticipant = async (participantId: string) => {
    // 1. Optimistically update local React state immediately
    setParticipants((prev) => prev.filter((p) => p.id !== participantId));
    setWeekendVotes((prev) => prev.filter((v) => v.participantId !== participantId));
    setDateAvailabilities((prev) => prev.filter((a) => a.participantId !== participantId));

    if (currentParticipant?.id === participantId) {
      setCurrentParticipant(null);
      localStorage.removeItem('dispo_rando_participant');
    }

    try {
      // 2. Perform deep Firestore document deletions
      await deleteParticipantFromDb(participantId);
      
      const pVotes = weekendVotes.filter((v) => v.participantId === participantId);
      const voteDeletions = pVotes.map((v) => deleteDocByIdInDb('weekendVotes', v.id, participantId));

      const pAvails = dateAvailabilities.filter((a) => a.participantId === participantId);
      const availDeletions = pAvails.map((a) => deleteDocByIdInDb('availabilities', a.id, participantId));

      await Promise.all([...voteDeletions, ...availDeletions]);
    } catch (err) {
      console.error("Error in handleDeleteParticipant:", err);
    }
  };

  const handleLogout = () => {
    setCurrentParticipant(null);
    localStorage.removeItem('dispo_rando_participant');
  };

  // Trip details update
  const handleSaveTripDetails = async (details: TripDetails) => {
    await saveTripDetailsInDb(details);
  };

  const cleanPath = currentPath.toLowerCase().replace(/\/$/, '') || '/';

  // Admin route
  if (cleanPath === '/admin' || cleanPath.startsWith('/admin/')) {
    return (
      <AdminPage
        participants={participants}
        weekendVotes={weekendVotes}
        dateAvailabilities={dateAvailabilities}
        onDeleteParticipant={handleDeleteParticipant}
        onResetParticipantPin={handleResetParticipantPin}
        onNavigateHome={() => navigateTo('/')}
      />
    );
  }

  // 404 route for unknown paths
  if (cleanPath !== '/' && cleanPath !== '/index.html') {
    return <NotFoundPage onNavigateHome={() => navigateTo('/')} />;
  }

  return (
    <div className="min-h-screen bg-emerald-50 text-slate-900 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      
      {/* Top Header */}
      <Header
        currentParticipant={currentParticipant}
        onOpenUserModal={() => setIsUserModalOpen(true)}
        onOpenShareModal={() => setIsShareModalOpen(true)}
        onLogout={handleLogout}
        participantCount={participants.length}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6 sm:px-6 lg:px-8 space-y-6">
        
        {/* Navigation Tabs */}
        <div className="flex items-center justify-between gap-3 bg-white p-2 rounded-3xl border-4 border-emerald-100 shadow-md">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveTab('calendar')}
              className={`px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-black transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'calendar'
                  ? 'bg-emerald-500 text-white shadow-[0_4px_0_rgb(5,150,105)]'
                  : 'text-slate-600 hover:text-emerald-900 hover:bg-emerald-100/60'
              }`}
            >
              <Calendar className="w-4 h-4 text-amber-300" />
              <span>Matrice</span>
            </button>

            <button
              onClick={() => setActiveTab('trip')}
              className={`px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-black transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'trip'
                  ? 'bg-emerald-500 text-white shadow-[0_4px_0_rgb(5,150,105)]'
                  : 'text-slate-600 hover:text-emerald-900 hover:bg-emerald-100/60'
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>Spots de Bivouac</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Detailed Calendar & Matrix + Heatmap Leaderboard */}
        {activeTab === 'calendar' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <HeatmapRanking
              weekendVotes={weekendVotes}
              dateAvailabilities={dateAvailabilities}
              participants={participants}
            />

            <DetailedCalendar
              currentParticipant={currentParticipant}
              onOpenUserModal={() => setIsUserModalOpen(true)}
              dateAvailabilities={dateAvailabilities}
              weekendVotes={weekendVotes}
              onVoteDate={handleVoteDate}
              onVoteWeekend={handleVoteWeekend}
              participants={participants}
            />
          </div>
        )}

        {/* Tab 2: Bivouac Spots */}
        {activeTab === 'trip' && (
          <div className="animate-in fade-in duration-300">
            <TripDetailsTab
              tripDetails={tripDetails}
              onSaveTripDetails={handleSaveTripDetails}
              currentParticipant={currentParticipant}
              onOpenUserModal={() => setIsUserModalOpen(true)}
            />
          </div>
        )}

      </main>

      {/* Simplified Footer */}
      <footer className="bg-emerald-900 text-emerald-100 py-6 mt-12 text-xs font-bold border-t-4 border-emerald-950">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="flex items-center gap-2">
            <Tent className="w-4 h-4 text-emerald-400" />
            <span>Dispo Rando Bivouac</span>
          </p>
          <div className="flex items-center gap-3 text-emerald-300 uppercase tracking-widest text-[11px]">
            <span>{participants.length} ami(s) inscrits</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <UserModal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        currentParticipant={currentParticipant}
        participants={participants}
        onSaveParticipant={handleSaveParticipant}
        onSelectExistingParticipant={handleSelectExistingParticipant}
        onLogout={handleLogout}
      />

      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        participantCount={participants.length}
      />

    </div>
  );
}
