import type { Question } from '../types';

export const OFFICIAL_TECHNICIAN_GROUPS = [
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
] as const;

function shuffle<T>(items: T[], random: () => number): T[] {
  for (let index = items.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [items[index], items[swapIndex]] = [items[swapIndex], items[index]];
  }
  return items;
}

export function selectOfficialExamQuestions(
  questions: Question[],
  random: () => number = Math.random,
): Question[] {
  const questionsByGroup = new Map<string, Question[]>();
  questions.forEach((question) => {
    const group = question.id.slice(0, 3);
    const existing = questionsByGroup.get(group) ?? [];
    existing.push(question);
    questionsByGroup.set(group, existing);
  });

  const missingGroups = OFFICIAL_TECHNICIAN_GROUPS.filter(
    (group) => !questionsByGroup.get(group)?.length,
  );
  if (missingGroups.length > 0 || questionsByGroup.size !== OFFICIAL_TECHNICIAN_GROUPS.length) {
    throw new Error(
      `Question pool must contain all 35 official groups; missing: ${missingGroups.join(', ') || 'none'}`,
    );
  }

  const exam = OFFICIAL_TECHNICIAN_GROUPS.map((group) => {
    const groupQuestions = questionsByGroup.get(group)!;
    return groupQuestions[Math.floor(random() * groupQuestions.length)];
  });
  return shuffle(exam, random);
}
