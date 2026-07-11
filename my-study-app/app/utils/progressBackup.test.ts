import { describe, expect, it } from 'vitest';

import { parseProgressBackup } from './progressBackup';

describe('progress import schema validation', () => {
  it('accepts a valid partial backup', () => {
    const backup = parseProgressBackup({
      version: '1.3.0',
      data: {
        globalStats: { T1: { correct: 3, total: 5 } },
        bookmarks: ['T1A01'],
        completedLessons: ['T1'],
        darkMode: true,
        passedExams: 2,
      },
    });

    expect(backup?.data.bookmarks).toEqual(['T1A01']);
  });

  it('rejects malformed nested statistics before persistence', () => {
    expect(parseProgressBackup({ data: { globalStats: { T1: null } } })).toBeNull();
  });

  it('rejects values without a data object', () => {
    expect(parseProgressBackup({ version: '1.3.0' })).toBeNull();
  });
});
