import { describe, expect, it } from 'vitest';

import type { Question } from '../types';
import { selectOfficialExamQuestions } from './examBlueprint.ts';

function question(id: string): Question {
  return {
    id,
    question: id,
    options: ['A', 'B', 'C', 'D'],
    correctAnswer: 'A',
    explanation: id,
  };
}

describe('official exam composition', () => {
it('selects exactly one question from every official group', () => {
  const groups = [
    'T1A', 'T1B', 'T1C', 'T1D', 'T1E', 'T1F',
    'T2A', 'T2B', 'T2C',
    'T3A', 'T3B', 'T3C',
    'T4A', 'T4B',
    'T5A', 'T5B', 'T5C', 'T5D',
    'T6A', 'T6B', 'T6C', 'T6D',
    'T7A', 'T7B', 'T7C', 'T7D',
    'T8A', 'T8B', 'T8C', 'T8D',
    'T9A', 'T9B',
    'T0A', 'T0B', 'T0C',
  ];
  const pool = groups.flatMap((group) => [question(`${group}01`), question(`${group}02`)]);

  const exam = selectOfficialExamQuestions(pool, () => 0);

  expect(exam).toHaveLength(35);
  expect(new Set(exam.map((item) => item.id.slice(0, 3)))).toEqual(new Set(groups));
});

it('rejects an incomplete official group set', () => {
  expect(() => selectOfficialExamQuestions([question('T1A01')], () => 0))
    .toThrow(/35 official groups/);
});
});
