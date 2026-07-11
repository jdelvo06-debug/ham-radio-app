import type {
  GlobalSubelementStats,
  SpacedRepData,
  StreakData,
} from '../types';
import { isStreakData } from './persistence';

export interface ProgressBackupData {
  globalStats?: Record<string, GlobalSubelementStats>;
  bookmarks?: string[];
  completedLessons?: string[];
  spacedRepData?: Record<string, SpacedRepData>;
  darkMode?: boolean;
  streakData?: StreakData;
  passedExams?: number;
}

export interface ProgressBackup {
  version?: string;
  exportedAt?: string;
  data: ProgressBackupData;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isNonNegativeInteger(value: unknown): value is number {
  return Number.isInteger(value) && Number(value) >= 0;
}

function isStringArray(value: unknown, pattern: RegExp): value is string[] {
  return Array.isArray(value) && value.every(
    (item) => typeof item === 'string' && pattern.test(item),
  );
}

function isGlobalStats(value: unknown): value is Record<string, GlobalSubelementStats> {
  if (!isRecord(value)) return false;

  return Object.entries(value).every(([key, stats]) => (
    /^T[0-9]$/.test(key) &&
    isRecord(stats) &&
    isNonNegativeInteger(stats.correct) &&
    isNonNegativeInteger(stats.total) &&
    stats.correct <= stats.total
  ));
}

function isSpacedRepData(value: unknown): value is Record<string, SpacedRepData> {
  if (!isRecord(value)) return false;

  return Object.entries(value).every(([questionId, entry]) => (
    /^T[0-9][A-Z][0-9]{2}$/.test(questionId) &&
    isRecord(entry) &&
    entry.questionId === questionId &&
    isNonNegativeInteger(entry.correctStreak) &&
    isNonNegativeInteger(entry.lastAnswered) &&
    isNonNegativeInteger(entry.nextReviewDate) &&
    isNonNegativeInteger(entry.timesAnswered) &&
    isNonNegativeInteger(entry.timesCorrect) &&
    entry.timesCorrect <= entry.timesAnswered
  ));
}

export function parseProgressBackup(value: unknown): ProgressBackup | null {
  if (!isRecord(value) || !isRecord(value.data)) return null;
  if (value.version !== undefined && typeof value.version !== 'string') return null;
  if (value.exportedAt !== undefined && typeof value.exportedAt !== 'string') return null;

  const data = value.data;
  if (data.globalStats !== undefined && !isGlobalStats(data.globalStats)) return null;
  if (data.bookmarks !== undefined && !isStringArray(data.bookmarks, /^T[0-9][A-Z][0-9]{2}$/)) return null;
  if (data.completedLessons !== undefined && !isStringArray(data.completedLessons, /^T[0-9]$/)) return null;
  if (data.spacedRepData !== undefined && !isSpacedRepData(data.spacedRepData)) return null;
  if (data.darkMode !== undefined && typeof data.darkMode !== 'boolean') return null;
  if (data.streakData !== undefined && !isStreakData(data.streakData)) return null;
  if (data.passedExams !== undefined && !isNonNegativeInteger(data.passedExams)) return null;

  return value as unknown as ProgressBackup;
}
