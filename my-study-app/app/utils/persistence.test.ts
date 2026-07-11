import { describe, expect, it } from 'vitest';

import { DEFAULT_STREAK_STATE, migrateStreakState } from './persistence';

const legacyStreak = {
  currentStreak: 3,
  longestStreak: 5,
  lastStudyDate: '2026-07-10',
  totalStudyDays: 8,
};

describe('persistence migrations', () => {
  it('migrates a legacy unwrapped streak record', () => {
    expect(migrateStreakState(JSON.stringify(legacyStreak))).toEqual({
      streakData: legacyStreak,
      passedExams: 0,
    });
  });

  it('preserves the current wrapped streak record', () => {
    expect(migrateStreakState(JSON.stringify({ streakData: legacyStreak, passedExams: 2 })))
      .toEqual({ streakData: legacyStreak, passedExams: 2 });
  });

  it('falls back safely for corrupt persisted data', () => {
    expect(migrateStreakState('{bad json')).toEqual(DEFAULT_STREAK_STATE);
  });
});
