export type AvailabilityStatus = 'available' | 'unavailable';

export interface Participant {
  id: string;
  name: string;
  avatarColor: string;
  avatarEmoji?: string;
  pinHash?: string;
  pinResetRequired?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface WeekendSlot {
  id: string; // e.g. "2026-08-01_2026-08-02"
  startDate: string; // "2026-08-01"
  endDate: string; // "2026-08-02"
  title: string; // "Week-end 1 - 2 Août"
  subtitle?: string; // "Samedi & Dimanche"
  isSpecial?: boolean; // e.g. 15 Août
  specialLabel?: string;
}

export interface DateAvailability {
  id: string; // participantId_date
  participantId: string;
  participantName: string;
  avatarColor?: string;
  date: string; // "2026-07-28"
  status: AvailabilityStatus;
  updatedAt: string;
}

export interface WeekendVote {
  id: string; // participantId_weekendId
  participantId: string;
  participantName: string;
  weekendId: string;
  status: AvailabilityStatus;
  note?: string;
  updatedAt: string;
}

export interface BivouacSpot {
  id: string;
  name: string;
  region: string;
  difficulty: string;
  elevation?: string;
  driveTimeFromMontpellier?: string;
  duration: string;
  description: string;
  imageUrl?: string;
  votes: string[]; // participant IDs
}

export interface TripDetails {
  title: string;
  organizerName: string;
  description: string;
  suggestedLocations: BivouacSpot[];
  updatedAt: string;
}

