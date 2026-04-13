'use client';

import { ONBOARDING_SLIDES } from '../types';

interface OnboardingModalProps {
  darkMode: boolean;
  onboardingSlide: number;
  setOnboardingSlide: (slide: number) => void;
  completeOnboarding: () => void;
}

export default function OnboardingModal({
  darkMode,
  onboardingSlide,
  setOnboardingSlide,
  completeOnboarding,
}: OnboardingModalProps) {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
      <div className={`${darkMode ? 'bg-slate-800' : 'bg-white'} rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden`}>
        <div className="p-8 text-center">
          <span className="text-6xl mb-4 block">{ONBOARDING_SLIDES[onboardingSlide].icon}</span>
          <h2 className={`text-2xl font-bold mb-3 ${darkMode ? 'text-white' : 'text-slate-800'}`}>
            {ONBOARDING_SLIDES[onboardingSlide].title}
          </h2>
          <p className={`${darkMode ? 'text-slate-300' : 'text-slate-600'} mb-4`}>
            {ONBOARDING_SLIDES[onboardingSlide].description}
          </p>
          <div className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${darkMode ? 'bg-blue-900/50 text-blue-300' : 'bg-blue-50 text-blue-700'}`}>
            💡 {ONBOARDING_SLIDES[onboardingSlide].highlight}
          </div>
        </div>

        <div className="flex justify-center gap-2 pb-4">
          {ONBOARDING_SLIDES.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setOnboardingSlide(idx)}
              className={`w-2 h-2 rounded-full transition-all ${
                idx === onboardingSlide
                  ? 'bg-blue-600 w-6'
                  : darkMode ? 'bg-slate-600' : 'bg-slate-300'
              }`}
            />
          ))}
        </div>

        <div className={`flex gap-3 p-4 ${darkMode ? 'bg-slate-700' : 'bg-slate-50'}`}>
          {onboardingSlide > 0 ? (
            <button
              onClick={() => setOnboardingSlide(onboardingSlide - 1)}
              className={`flex-1 py-3 rounded-xl font-semibold ${darkMode ? 'bg-slate-600 hover:bg-slate-500 text-white' : 'bg-slate-200 hover:bg-slate-300 text-slate-700'}`}
            >
              Back
            </button>
          ) : (
            <button
              onClick={completeOnboarding}
              className={`flex-1 py-3 rounded-xl font-semibold ${darkMode ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-700'}`}
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