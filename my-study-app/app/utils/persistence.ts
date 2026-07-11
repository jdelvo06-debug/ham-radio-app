import type { StreakData } from '../types';

interface PersistedStreakState {
  streakData: StreakData;
  passedExams: number;
}

const EMPTY_STREAK: StreakData = {
  currentStreak: 0,
  longestStreak: 0,
  lastStudyDate: '',
  totalStudyDays: 0,
};

export const DEFAULT_STREAK_STATE: PersistedStreakState = {
  streakData: EMPTY_STREAK,
  passedExams: 0,
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isNonNegativeInteger(value: unknown): value is number {
  return Number.isInteger(value) && Number(value) >= 0;
}

export function isStreakData(value: unknown): value is StreakData {
  if (!isRecord(value)) return false;

  return (
    isNonNegativeInteger(value.currentStreak) &&
    isNonNegativeInteger(value.longestStreak) &&
    typeof value.lastStudyDate === 'string' &&
    isNonNegativeInteger(value.totalStudyDays)
  );
}

export function migrateStreakState(raw: string | null): PersistedStreakState {
  if (!raw) return DEFAULT_STREAK_STATE;

  try {
    const parsed: unknown = JSON.parse(raw);
    if (isStreakData(parsed)) {
      return { streakData: parsed, passedExams: 0 };
    }

    if (
      isRecord(parsed) &&
      isStreakData(parsed.streakData) &&
      (parsed.passedExams === undefined || isNonNegativeInteger(parsed.passedExams))
    ) {
      return {
        streakData: parsed.streakData,
        passedExams: parsed.passedExams ?? 0,
      };
    }
  } catch {}

  return DEFAULT_STREAK_STATE;
}
