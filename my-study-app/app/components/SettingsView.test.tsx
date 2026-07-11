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
