// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import AnalyticsView from './AnalyticsView';

afterEach(cleanup);

describe('AnalyticsView quiz launch', () => {
  it('launches a weak-area quiz with the selected subelement in one callback', () => {
    const startQuizForSubelement = vi.fn();

    render(
      <AnalyticsView
        subelements={['T1']}
        lessons={[{
          id: 'T1',
          title: 'FCC Rules',
          subtitle: 'Rules',
          icon: '📜',
          estimatedMinutes: 5,
          sections: [],
          examTip: 'Know the rules.',
          questionCount: 10,
        }]}
        globalStats={{ T1: { correct: 1, total: 5 } }}
        startQuizForSubelement={startQuizForSubelement}
        setAppState={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Study' }));

    expect(startQuizForSubelement).toHaveBeenCalledOnce();
    expect(startQuizForSubelement).toHaveBeenCalledWith('T1');
  });
});
