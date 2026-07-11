// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import OnboardingModal from './OnboardingModal';

afterEach(cleanup);

describe('OnboardingModal accessibility', () => {
  it('is a named modal dialog with named slide controls', () => {
    render(
      <OnboardingModal
        onboardingSlide={0}
        setOnboardingSlide={vi.fn()}
        completeOnboarding={vi.fn()}
      />,
    );

    expect(screen.getByRole('dialog', { name: 'Welcome to Study Buddy!' }).getAttribute('aria-modal')).toBe('true');
    expect(screen.getByRole('button', { name: 'Go to slide 1: Welcome to Study Buddy!' }).getAttribute('aria-current')).toBe('step');
    expect(screen.getByRole('button', { name: 'Go to slide 2: Learn, Then Practice' }).getAttribute('aria-current')).toBeNull();
  });

  it('traps focus and closes with Escape', async () => {
    const user = userEvent.setup();
    const completeOnboarding = vi.fn();

    render(
      <OnboardingModal
        onboardingSlide={0}
        setOnboardingSlide={vi.fn()}
        completeOnboarding={completeOnboarding}
      />,
    );

    const firstControl = screen.getByRole('button', { name: 'Go to slide 1: Welcome to Study Buddy!' });
    const lastControl = screen.getByRole('button', { name: 'Next' });

    expect(document.activeElement).toBe(firstControl);
    lastControl.focus();
    await user.tab();
    expect(document.activeElement).toBe(firstControl);

    fireEvent.keyDown(firstControl, { key: 'Escape' });
    expect(completeOnboarding).toHaveBeenCalledOnce();
  });
});
