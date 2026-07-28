import { WeekendSlot } from '../types';

export const START_DATE_STR = '2026-07-28';
export const END_DATE_STR = '2026-08-30';

export const WEEKENDS_LIST: WeekendSlot[] = [
  {
    id: '2026-08-01_2026-08-02',
    startDate: '2026-08-01',
    endDate: '2026-08-02',
    title: 'W-E 1 - 2 Août',
    subtitle: 'Samedi 1er & Dimanche 2 Août',
  },
  {
    id: '2026-08-08_2026-08-09',
    startDate: '2026-08-08',
    endDate: '2026-08-09',
    title: 'W-E 8 - 9 Août',
    subtitle: 'Samedi 8 & Dimanche 9 Août',
  },
  {
    id: '2026-08-15_2026-08-16',
    startDate: '2026-08-15',
    endDate: '2026-08-16',
    title: 'W-E 15 - 16 Août',
    subtitle: 'Samedi 15 & Dimanche 16 Août',
    isSpecial: true,
    specialLabel: '🎉 W-E du 15 Août (Férié)',
  },
  {
    id: '2026-08-22_2026-08-23',
    startDate: '2026-08-22',
    endDate: '2026-08-23',
    title: 'W-E 22 - 23 Août',
    subtitle: 'Samedi 22 & Dimanche 23 Août',
  },
  {
    id: '2026-08-29_2026-08-30',
    startDate: '2026-08-29',
    endDate: '2026-08-30',
    title: 'W-E 29 - 30 Août',
    subtitle: 'Samedi 29 & Dimanche 30 Août',
  },
];

export interface DayInfo {
  dateStr: string; // YYYY-MM-DD
  dayNum: number;
  monthName: string;
  dayOfWeekName: string;
  isWeekend: boolean;
  weekendId?: string;
}

export function getAllDatesInRange(): DayInfo[] {
  const dates: DayInfo[] = [];
  const start = new Date(2026, 6, 28); // Month is 0-indexed (6 = July)
  const end = new Date(2026, 7, 30); // 7 = August

  const daysFr = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
  const monthsFr = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

  const cur = new Date(start);
  while (cur <= end) {
    const year = cur.getFullYear();
    const month = String(cur.getMonth() + 1).padStart(2, '0');
    const day = String(cur.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    
    const dayOfWeek = cur.getDay(); // 0 = Dimanche, 6 = Samedi
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    // find matching weekend slot
    let weekendId: string | undefined = undefined;
    for (const w of WEEKENDS_LIST) {
      if (dateStr === w.startDate || dateStr === w.endDate) {
        weekendId = w.id;
        break;
      }
    }

    dates.push({
      dateStr,
      dayNum: cur.getDate(),
      monthName: monthsFr[cur.getMonth()],
      dayOfWeekName: daysFr[dayOfWeek],
      isWeekend,
      weekendId
    });

    cur.setDate(cur.getDate() + 1);
  }

  return dates;
}

export function formatDateFr(dateStr: string, short = false): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const dateObj = new Date(y, m - 1, d);
  const daysShort = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
  const daysLong = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
  const monthsShort = ['Janv.', 'Févr.', 'Mars', 'Avr.', 'Mai', 'Juin', 'Juil.', 'Août', 'Sept.', 'Oct.', 'Nov.', 'Déc.'];

  const dayName = short ? daysShort[dateObj.getDay()] : daysLong[dateObj.getDay()];
  const monthName = monthsShort[dateObj.getMonth()];

  return `${dayName} ${d} ${monthName}`;
}

export function getRandomEmojiAvatar(): string {
  const emojis = ['🌲', '🏔️', '🏕️', '🥾', '🔥', '🎒', '⛺', '🌅', '🧗‍♂️', '🐻', '🦅', '🌌'];
  return emojis[Math.floor(Math.random() * emojis.length)];
}

export const AVATAR_COLORS = [
  'bg-emerald-600 border-emerald-400 text-emerald-100',
  'bg-amber-600 border-amber-400 text-amber-100',
  'bg-sky-600 border-sky-400 text-sky-100',
  'bg-indigo-600 border-indigo-400 text-indigo-100',
  'bg-rose-600 border-rose-400 text-rose-100',
  'bg-teal-600 border-teal-400 text-teal-100',
  'bg-orange-600 border-orange-400 text-orange-100',
  'bg-purple-600 border-purple-400 text-purple-100',
];
