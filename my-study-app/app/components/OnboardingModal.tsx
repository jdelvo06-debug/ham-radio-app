'use client';

import { useEffect, useRef } from 'react';
import { ONBOARDING_SLIDES } from '../types';

interface OnboardingModalProps {
  onboardingSlide: number;
  setOnboardingSlide: (slide: number) => void;
  completeOnboarding: () => void;
}

export default function OnboardingModal({
  onboardingSlide,
  setOnboardingSlide,
  completeOnboarding,
}: OnboardingModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const previouslyFocused = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;
    const firstControl = dialogRef.current?.querySelector<HTMLElement>('button:not([disabled])');
    firstControl?.focus();

    return () => previouslyFocused?.focus();
  }, []);

  const handleDialogKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      completeOnboarding();
      return;
    }

    if (event.key !== 'Tab' || !dialogRef.current) return;

    const controls = Array.from(
      dialogRef.current.querySelectorAll<HTMLElement>('button:not([disabled])'),
    );
    if (controls.length === 0) return;

    const firstControl = controls[0];
    const lastControl = controls[controls.length - 1];

    if (event.shiftKey && document.activeElement === firstControl) {
      event.preventDefault();
      lastControl.focus();
    } else if (!event.shiftKey && document.activeElement === lastControl) {
      event.preventDefault();
      firstControl.focus();
    }
  };

  const slide = ONBOARDING_SLIDES[onboardingSlide];

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="onboarding-title"
        aria-describedby="onboarding-description"
        onKeyDown={handleDialogKeyDown}
        className="bg-slate-800 rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden"
      >
        <div className="p-8 text-center">
          <span className="text-6xl mb-4 block" aria-hidden="true">{slide.icon}</span>
          <h2 id="onboarding-title" className="text-2xl font-bold mb-3 text-white">
            {slide.title}
          </h2>
          <p id="onboarding-description" className="text-slate-300 mb-4">
            {slide.description}
          </p>
          <div className="inline-block px-4 py-2 rounded-full text-sm font-medium bg-blue-900/50 text-blue-300">
            💡 {slide.highlight}
          </div>
        </div>

        <div className="flex justify-center pb-2">
          {ONBOARDING_SLIDES.map((item, idx) => (
            <button
              key={idx}
              onClick={() => setOnboardingSlide(idx)}
              aria-label={`Go to slide ${idx + 1}: ${item.title}`}
              aria-current={idx === onboardingSlide ? 'step' : undefined}
              className="w-11 h-11 inline-flex items-center justify-center rounded-full"
            >
              <span
                aria-hidden="true"
                className={`h-2 rounded-full transition-all ${
                  idx === onboardingSlide ? 'bg-blue-600 w-6' : 'bg-slate-600 w-2'
                }`}
              />
            </button>
          ))}
        </div>

        <div className="flex gap-3 p-4 bg-slate-700">
          {onboardingSlide > 0 ? (
            <button
              onClick={() => setOnboardingSlide(onboardingSlide - 1)}
              className="flex-1 py-3 rounded-xl font-semibold bg-slate-600 hover:bg-slate-500 text-white"
            >
              Back
            </button>
          ) : (
            <button
              onClick={completeOnboarding}
              className="flex-1 py-3 rounded-xl font-semibold text-slate-400 hover:text-white"
            >
              Skip
            </button>
          )}
          {onboardingSlide < ONBOARDING_SLIDES.length - 1 ? (
            <button
              onClick={() => setOnboardingSlide(onboardingSlide + 1)}
              className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold"
            >
              Next
            </button>
          ) : (
            <button
              onClick={completeOnboarding}
              className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold"
            >
              Get Started! 🚀
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
