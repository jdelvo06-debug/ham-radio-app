// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import MainMenu from './MainMenu';

afterEach(cleanup);

function renderMenu() {
  const startQuiz = vi.fn();
  const openLearn = vi.fn();
  const openAnalytics = vi.fn();
  const setAppState = vi.fn();

  render(
    <MainMenu
      isPremium
      freeQuestionsRemaining={25}
      streakData={{ currentStreak: 0, longestStreak: 0, lastStudyDate: '', totalStudyDays: 0 }}
      earnedBadges={[]}
      badgesTotal={15}
      selectedSubelement="ALL"
      setSelectedSubelement={vi.fn()}
      subelements={['T0', 'T1']}
      questionsCount={409}
      completedLessonsCount={0}
      lessonsTotal={10}
      bookmarksCount={1}
      dueReviewCount={1}
      masteredCount={0}
      startQuiz={startQuiz}
      startReviewMode={vi.fn()}
      openLearn={openLearn}
      openAnalytics={openAnalytics}
      setAppState={setAppState}
      showOnboarding={false}
      onboardingSlide={0}
      setOnboardingSlide={vi.fn()}
      completeOnboarding={vi.fn()}
    />,
  );

  return { startQuiz, openLearn, openAnalytics, setAppState };
}

describe('primary navigation', () => {
  it('routes the main menu actions to their owning handlers', () => {
    const handlers = renderMenu();

    fireEvent.click(screen.getByRole('button', { name: /Learn/ }));
    fireEvent.click(screen.getByRole('button', { name: /Study Mode/ }));
    fireEvent.click(screen.getByRole('button', { name: /Practice Exam/ }));
    fireEvent.click(screen.getByRole('button', { name: /Analytics/ }));
    fireEvent.click(screen.getByRole('button', { name: /Settings/ }));

    expect(handlers.openLearn).toHaveBeenCalledOnce();
    expect(handlers.startQuiz).toHaveBeenNthCalledWith(1, 'study');
    expect(handlers.startQuiz).toHaveBeenNthCalledWith(2, 'exam');
    expect(handlers.openAnalytics).toHaveBeenCalledOnce();
    expect(handlers.setAppState).toHaveBeenCalledWith('settings');
  });
});
