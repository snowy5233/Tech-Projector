export type SlotKind = 'lesson' | 'break';

export interface Slot {
  /** Unique id, stable across renders. */
  id: string;
  kind: SlotKind;
  /** Lesson number 1-9, undefined for breaks. */
  lesson?: number;
  /** Dutch label, e.g. "1e uur" or "Pauze". */
  label: string;
  /** Minutes since midnight. */
  start: number;
  end: number;
}

const minutes = (hhmm: string): number => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
};

export const formatSlotTime = (totalMinutes: number): string => {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
};

/** Source of truth: the printed timetable ("Lesuur / Lestijden"). */
const RAW_SLOTS: Array<[SlotKind, number | null, string, string]> = [
  ['lesson', 1, '08:30', '09:15'],
  ['lesson', 2, '09:15', '10:00'],
  ['break', null, '10:00', '10:20'],
  ['lesson', 3, '10:20', '11:05'],
  ['lesson', 4, '11:05', '11:50'],
  ['break', null, '11:50', '12:20'],
  ['lesson', 5, '12:20', '13:05'],
  ['lesson', 6, '13:05', '13:50'],
  ['break', null, '13:50', '14:05'],
  ['lesson', 7, '14:05', '14:50'],
  ['lesson', 8, '14:50', '15:35'],
  ['lesson', 9, '15:35', '16:20'],
];

export const SLOTS: Slot[] = RAW_SLOTS.map(([kind, lesson, start, end], index) => ({
  id: `${kind}-${lesson ?? index}`,
  kind,
  lesson: lesson ?? undefined,
  label: kind === 'lesson' ? `${lesson}e uur` : 'Pauze',
  start: minutes(start),
  end: minutes(end),
}));

export const LESSONS: Slot[] = SLOTS.filter((slot) => slot.kind === 'lesson');

export const SCHOOL_DAY_START = SLOTS[0].start;
export const SCHOOL_DAY_END = SLOTS[SLOTS.length - 1].end;
