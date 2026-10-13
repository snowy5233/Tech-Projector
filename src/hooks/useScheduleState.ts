import { useMemo } from 'react';
import { SCHOOL_DAY_END, SCHOOL_DAY_START, SLOTS, type Slot } from '../data/schedule';
import { clamp, minutesOfDay } from '../lib/time';

export type SchedulePhase = 'before' | 'lesson' | 'break' | 'after' | 'weekend';

export type SlotStatus = 'done' | 'active' | 'upcoming';

export interface ScheduleState {
  phase: SchedulePhase;
  /** Slot the clock is currently inside (lesson or break). */
  currentSlot: Slot | null;
  /** Next timetable item after the current one (les or pauze). */
  nextSlot: Slot | null;
  /** Next lesson that will start today, if any. */
  nextLesson: Slot | null;
  /** Seconds until the current slot ends. */
  secondsUntilChange: number;
  /** 0..1 progress through the current slot. */
  slotProgress: number;
  /** 0..1 progress through the whole school day. */
  dayProgress: number;
  statusOf: (slot: Slot) => SlotStatus;
  /** 0..1 how far this row is filled (done = 1, future = 0, active = elapsed). */
  fillOf: (slot: Slot) => number;
}

export const useScheduleState = (now: Date): ScheduleState =>
  useMemo(() => {
    const nowMinutes = minutesOfDay(now);
    const weekday = now.getDay();
    const isWeekend = weekday === 0 || weekday === 6;

    const currentSlot =
      SLOTS.find((slot) => nowMinutes >= slot.start && nowMinutes < slot.end) ?? null;
    const currentIndex = currentSlot
      ? SLOTS.findIndex((slot) => slot.id === currentSlot.id)
      : -1;
    const nextSlot =
      currentIndex >= 0
        ? (SLOTS[currentIndex + 1] ?? null)
        : (SLOTS.find((slot) => slot.start > nowMinutes) ?? null);
    const nextLesson =
      SLOTS.find((slot) => slot.kind === 'lesson' && slot.start > nowMinutes) ?? null;

    let phase: SchedulePhase;
    if (isWeekend) phase = 'weekend';
    else if (currentSlot) phase = currentSlot.kind === 'break' ? 'break' : 'lesson';
    else if (nowMinutes < SCHOOL_DAY_START) phase = 'before';
    else phase = 'after';

    const target = currentSlot?.end ?? nextSlot?.start ?? SCHOOL_DAY_END;
    const secondsUntilChange = Math.max(0, (target - nowMinutes) * 60);

    const slotProgress = currentSlot
      ? clamp((nowMinutes - currentSlot.start) / (currentSlot.end - currentSlot.start), 0, 1)
      : 0;

    const dayProgress = clamp(
      (nowMinutes - SCHOOL_DAY_START) / (SCHOOL_DAY_END - SCHOOL_DAY_START),
      0,
      1,
    );

    const statusOf = (slot: Slot): SlotStatus => {
      if (nowMinutes >= slot.end) return 'done';
      if (nowMinutes >= slot.start && nowMinutes < slot.end) return 'active';
      return 'upcoming';
    };

    const fillOf = (slot: Slot): number => {
      if (nowMinutes >= slot.end) return 1;
      if (nowMinutes <= slot.start) return 0;
      return clamp((nowMinutes - slot.start) / (slot.end - slot.start), 0, 1);
    };

    return {
      phase,
      currentSlot,
      nextSlot,
      nextLesson,
      secondsUntilChange,
      slotProgress,
      dayProgress,
      statusOf,
      fillOf,
    };
  }, [now]);
