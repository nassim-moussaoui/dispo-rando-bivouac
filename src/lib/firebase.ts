import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  deleteDoc,
  onSnapshot
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { Participant, DateAvailability, WeekendVote, TripDetails } from '../types';

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

export const db = firebaseConfig.firestoreDatabaseId
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

export const initAuth = async (): Promise<string | null> => {
  try {
    if (!auth.currentUser) {
      const userCred = await signInAnonymously(auth);
      return userCred.user.uid;
    }
    return auth.currentUser.uid;
  } catch (err) {
    console.warn("Firebase anonymous auth notice:", err);
    return null;
  }
};

// Collections
const COLLECTIONS = {
  PARTICIPANTS: 'participants',
  AVAILABILITIES: 'availabilities',
  WEEKEND_VOTES: 'weekendVotes',
  TRIP_DETAILS: 'tripDetails',
};

// Participant helpers
export const saveParticipantInDb = async (participant: Participant) => {
  const ref = doc(db, COLLECTIONS.PARTICIPANTS, participant.id);
  await setDoc(ref, {
    ...participant,
    updatedAt: new Date().toISOString()
  }, { merge: true });
};

export const deleteParticipantFromDb = async (participantId: string) => {
  const ref = doc(db, COLLECTIONS.PARTICIPANTS, participantId);
  await deleteDoc(ref);
};

export const deleteDocByIdInDb = async (collectionName: string, docId: string) => {
  try {
    const ref = doc(db, collectionName, docId);
    await deleteDoc(ref);
  } catch (err) {
    console.warn(`Error deleting doc ${docId} from ${collectionName}:`, err);
  }
};

export const resetParticipantPinInDb = async (participantId: string) => {
  const ref = doc(db, COLLECTIONS.PARTICIPANTS, participantId);
  await setDoc(ref, {
    pinResetRequired: true,
    pinHash: '',
    updatedAt: new Date().toISOString()
  }, { merge: true });
};

export const subscribeParticipants = (callback: (participants: Participant[]) => void) => {
  const colRef = collection(db, COLLECTIONS.PARTICIPANTS);
  return onSnapshot(colRef, (snapshot) => {
    const list: Participant[] = [];
    snapshot.forEach((doc) => {
      list.push(doc.data() as Participant);
    });
    callback(list);
  }, (err) => {
    console.error("Participants sub error:", err);
  });
};

// Weekend Votes helpers
export const saveWeekendVoteInDb = async (vote: WeekendVote) => {
  const voteId = `${vote.participantId}_${vote.weekendId}`;
  const ref = doc(db, COLLECTIONS.WEEKEND_VOTES, voteId);
  await setDoc(ref, {
    ...vote,
    id: voteId,
    updatedAt: new Date().toISOString()
  }, { merge: true });
};

export const deleteWeekendVoteInDb = async (participantId: string, weekendId: string) => {
  const voteId = `${participantId}_${weekendId}`;
  const ref = doc(db, COLLECTIONS.WEEKEND_VOTES, voteId);
  await deleteDoc(ref);
};

export const subscribeWeekendVotes = (callback: (votes: WeekendVote[]) => void) => {
  const colRef = collection(db, COLLECTIONS.WEEKEND_VOTES);
  return onSnapshot(colRef, (snapshot) => {
    const votes: WeekendVote[] = [];
    snapshot.forEach((doc) => {
      votes.push(doc.data() as WeekendVote);
    });
    callback(votes);
  }, (err) => {
    console.error("Weekend votes sub error:", err);
  });
};

// Day Availability helpers
export const saveDateAvailabilityInDb = async (availability: DateAvailability) => {
  const availId = `${availability.participantId}_${availability.date}`;
  const ref = doc(db, COLLECTIONS.AVAILABILITIES, availId);
  await setDoc(ref, {
    ...availability,
    id: availId,
    updatedAt: new Date().toISOString()
  }, { merge: true });
};

export const deleteDateAvailabilityInDb = async (participantId: string, date: string) => {
  const availId = `${participantId}_${date}`;
  const ref = doc(db, COLLECTIONS.AVAILABILITIES, availId);
  await deleteDoc(ref);
};

export const subscribeDateAvailabilities = (callback: (availabilities: DateAvailability[]) => void) => {
  const colRef = collection(db, COLLECTIONS.AVAILABILITIES);
  return onSnapshot(colRef, (snapshot) => {
    const list: DateAvailability[] = [];
    snapshot.forEach((doc) => {
      list.push(doc.data() as DateAvailability);
    });
    callback(list);
  }, (err) => {
    console.error("Date availabilities sub error:", err);
  });
};

// Trip Details helpers
export const subscribeTripDetails = (callback: (details: TripDetails | null) => void) => {
  const docRef = doc(db, COLLECTIONS.TRIP_DETAILS, 'main_trip');
  return onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
      callback(docSnap.data() as TripDetails);
    } else {
      callback(null);
    }
  }, (err) => {
    console.error("Trip details sub error:", err);
  });
};

export const saveTripDetailsInDb = async (details: TripDetails) => {
  const docRef = doc(db, COLLECTIONS.TRIP_DETAILS, 'main_trip');
  await setDoc(docRef, {
    ...details,
    updatedAt: new Date().toISOString()
  }, { merge: true });
};

