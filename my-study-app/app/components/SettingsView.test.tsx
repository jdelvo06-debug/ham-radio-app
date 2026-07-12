// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import SettingsView from './SettingsView';

afterEach(cleanup);

describe('SettingsView appearance settings', () => {
  it('does not offer an incomplete theme toggle', () => {
    render(
      <SettingsView
        globalStats={{}}
        completedLessonsCount={0}
        lessonsTotal={10}
        bookmarksCount={0}
        masteredCount={0}
        earnedBadges={[]}
        badgesTotal={15}
        exportProgress={vi.fn()}
        importProgress={vi.fn()}
        showResetConfirm={false}
        setShowResetConfirm={vi.fn()}
        resetAllProgress={vi.fn()}
        setAppState={vi.fn()}
        replayTutorial={vi.fn()}
      />,
    );

    expect(screen.queryByRole('button', { name: /dark mode|theme/i })).toBeNull();
    expect(screen.queryByText('Appearance')).toBeNull();
  });
});

describe('SettingsView privacy disclosure', () => {
  it('makes the local-only privacy model and policy easy to find', () => {
    render(
      <SettingsView
        globalStats={{}}
        completedLessonsCount={0}
        lessonsTotal={10}
        bookmarksCount={0}
        masteredCount={0}
        earnedBadges={[]}
        badgesTotal={15}
        exportProgress={vi.fn()}
        importProgress={vi.fn()}
        showResetConfirm={false}
        setShowResetConfirm={vi.fn()}
        resetAllProgress={vi.fn()}
        setAppState={vi.fn()}
        replayTutorial={vi.fn()}
      />,
    );

    expect(screen.getByRole('heading', { name: 'Privacy' })).toBeTruthy();
    expect(screen.getByText(/stored only on this device/i)).toBeTruthy();
    expect(screen.getByText(/no account is required/i)).toBeTruthy();
    expect(screen.getByText(/does not track you or use third-party analytics/i)).toBeTruthy();
    expect(
      screen.getByRole('link', { name: 'Read the Privacy Policy' }).getAttribute('href'),
    ).toBe('https://jdelvo06-debug.github.io/ham-radio-app/privacy/');
  });
});
