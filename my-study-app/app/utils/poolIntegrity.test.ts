import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';

import questions from '../ham_radio_questions.json';

describe('official question pool integrity', () => {
  it('locks all 409 question IDs and answer keys', () => {
    const idAnswerContract = questions
      .map(({ id, correctAnswer }) => `${id}:${correctAnswer}`)
      .sort()
      .join('\n');

    expect(questions).toHaveLength(409);
    expect(new Set(questions.map(({ id }) => id)).size).toBe(409);
    expect(questions.every(({ id }) => /^T[0-9][A-Z][0-9]{2}$/.test(id))).toBe(true);
    expect(questions.every(({ correctAnswer }) => /^[A-D]$/.test(correctAnswer))).toBe(true);
    expect(createHash('sha256').update(idAnswerContract).digest('hex'))
      .toBe('ac5be60e65a504f76e0310f1ea411fbb2aed22d2e5822109bdb12219034c712f');
  });
});
