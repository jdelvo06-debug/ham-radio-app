// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import QuizView from './QuizView';

afterEach(cleanup);

const questions = [
  {
    id: 'T1A01',
    question: 'What is the correct choice?',
    options: ['Correct choice', 'Wrong choice', 'Another choice', 'Last choice'],
    correctAnswer: 'A',
    explanation: 'The first option is correct.',
  },
  {
    id: 'T1A02',
    question: 'Second question?',
    options: ['A', 'B', 'C', 'D'],
    correctAnswer: 'B',
    explanation: 'B is correct.',
  },
];

function renderQuiz(selectedAnswer: string | null, showExplanation: boolean) {
  return render(
    <QuizView
      mode="study"
      selectedSubelement="T1"
      activeQuestions={questions}
      currentQuestionIndex={0}
      selectedAnswer={selectedAnswer}
      showExplanation={showExplanation}
      isBookmarked={() => false}
      toggleBookmark={vi.fn()}
      spacedRepData={{}}
      handleAnswerClick={vi.fn()}
      handleNextQuestion={vi.fn()}
      isAnswerCorrect={(index, answer) => ['A', 'B', 'C', 'D'][index] === answer}
      setAppState={vi.fn()}
    />,
  );
}

describe('QuizView accessibility', () => {
  it('exposes quiz progress with semantic values', () => {
    renderQuiz(null, false);

    const progress = screen.getByRole('progressbar', { name: 'Quiz progress' });
    expect(progress.getAttribute('aria-valuemin')).toBe('0');
    expect(progress.getAttribute('aria-valuemax')).toBe('2');
    expect(progress.getAttribute('aria-valuenow')).toBe('1');
    expect(progress.getAttribute('aria-valuetext')).toBe('Question 1 of 2');
  });

  it('announces correct and incorrect answer feedback', () => {
    const view = renderQuiz('Correct choice', true);
    expect(screen.getByRole('status').textContent).toContain('Correct.');

    view.rerender(
      <QuizView
        mode="study"
        selectedSubelement="T1"
        activeQuestions={questions}
        currentQuestionIndex={0}
        selectedAnswer="Wrong choice"
        showExplanation
        isBookmarked={() => false}
        toggleBookmark={vi.fn()}
        spacedRepData={{}}
        handleAnswerClick={vi.fn()}
        handleNextQuestion={vi.fn()}
        isAnswerCorrect={(index, answer) => ['A', 'B', 'C', 'D'][index] === answer}
        setAppState={vi.fn()}
      />,
    );

    expect(screen.getByRole('status').textContent).toContain('Incorrect.');
  });
});
