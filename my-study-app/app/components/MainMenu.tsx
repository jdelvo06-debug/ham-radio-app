'use client';

import { Mode, Badge, StreakData } from '../types';
import OnboardingModal from './OnboardingModal';

interface MainMenuProps {
  isPremium: boolean;
  freeQuestionsRemaining: number;
  streakData: StreakData;
  earnedBadges: Badge[];
  badgesTotal: number;
  selectedSubelement: 'ALL' | string;
  setSelectedSubelement: (sub: 'ALL' | string) => void;
  subelements: string[];
  questionsCount: number;
  completedLessonsCount: number;
  lessonsTotal: number;
  bookmarksCount: number;
  dueReviewCount: number;
  masteredCount: number;
  startQuiz: (mode: Mode) => void;
  startReviewMode: (subelement?: string) => void;
  openLearn: () => void;
  openAnalytics: () => void;
  setAppState: (state: 'menu' | 'quiz' | 'results' | 'analytics' | 'learn' | 'lesson' | 'settings') => void;
  showOnboarding: boolean;
  onboardingSlide: number;
  setOnboardingSlide: (slide: number) => void;
  completeOnboarding: () => void;
}

function PremiumTag() {
  return (
    <span className="ml-2 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide bg-amber-400/20 text-amber-300">
      🔒 Premium
    </span>
  );
}

export default function MainMenu({
  isPremium,
  freeQuestionsRemaining,
  streakData,
  earnedBadges,
  badgesTotal,
  selectedSubelement,
  setSelectedSubelement,
  subelements,
  questionsCount,
  completedLessonsCount,
  lessonsTotal,
  bookmarksCount,
  dueReviewCount,
  masteredCount,
  startQuiz,
  startReviewMode,
  openLearn,
  openAnalytics,
  setAppState,
  showOnboarding,
  onboardingSlide,
  setOnboardingSlide,
  completeOnboarding,
}: MainMenuProps) {
  const bookmarksDisabled = isPremium && bookmarksCount === 0;
  const reviewDisabled = isPremium && dueReviewCount === 0;

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 bg-slate-950">
      <div className="w-full max-w-lg bg-slate-900 rounded-2xl shadow-2xl shadow-black/50 border border-slate-800 p-6 sm:p-10 text-center">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-sky-400 mb-2 tracking-tight">
            Ham Radio Study Buddy
          </h1>
          <p className="text-slate-400 text-sm font-medium">Technician Class Prep</p>
        </div>

        {/* Free Plan Banner */}
        {!isPremium && (
          <div className="mb-6 rounded-xl border border-sky-900/60 bg-sky-950/40 px-4 py-3 text-left">
            <p className="text-xs font-bold uppercase tracking-wide text-sky-400">
              Free Plan
            </p>
            <p className="mt-1 text-sm font-semibold text-white">
              {freeQuestionsRemaining} of 25 random practice questions left today
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Basic Study Mode is free. Everything else is Premium.
            </p>
          </div>
        )}

        {/* Streak Bar */}
        {streakData.totalStudyDays > 0 && (
          <div className="mb-6 rounded-xl bg-slate-800/80 border border-slate-700/50 p-4">
            <div className="flex items-center justify-center gap-5">
              <div className="text-center">
                <span className="text-xl">🔥</span>
                <p className="text-lg font-bold text-orange-400 mt-0.5">{streakData.currentStreak}</p>
                <p className="text-[11px] text-slate-500">Day Streak</p>
              </div>
              <div className="w-px h-10 bg-slate-700" />
              <div className="text-center">
                <span className="text-xl">⭐</span>
                <p className="text-lg font-bold text-amber-400 mt-0.5">{streakData.longestStreak}</p>
                <p className="text-[11px] text-slate-500">Best Streak</p>
              </div>
              <div className="w-px h-10 bg-slate-700" />
              <div className="text-center">
                <span className="text-xl">📅</span>
                <p className="text-lg font-bold text-sky-400 mt-0.5">{streakData.totalStudyDays}</p>
                <p className="text-[11px] text-slate-500">Total Days</p>
              </div>
            </div>
          </div>
        )}

        {/* Achievements */}
        {earnedBadges.length > 0 && (
          <div className="mb-6 rounded-xl bg-slate-800/80 border border-slate-700/50 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-400">🏆 Achievements</span>
              <span className="text-xs text-slate-500">{earnedBadges.length}/{badgesTotal}</span>
            </div>
            <div className="flex justify-center gap-1 flex-wrap">
              {earnedBadges.slice(0, 8).map((badge) => (
                <span key={badge.id} className="text-xl" title={badge.name}>
                  {badge.icon}
                </span>
              ))}
              {earnedBadges.length > 8 && (
                <span className="text-sm text-slate-500 self-center">
                  +{earnedBadges.length - 8}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Subelement Selector */}
        <div className="mb-6 text-left">
          <label className="block text-xs font-semibold text-slate-400 mb-1.5">
            Focus Area (Subelement)
          </label>
          <select
            value={selectedSubelement}
            onChange={(e) => setSelectedSubelement(e.target.value as 'ALL' | string)}
            className="w-full border border-slate-700 bg-slate-800 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/50 appearance-none cursor-pointer"
          >
            <option value="ALL">All Subelements</option>
            {subelements.map((sub) => (
              <option key={sub} value={sub}>
                {sub} Questions
              </option>
            ))}
          </select>
          <p className="mt-1.5 text-[11px] text-slate-500">
            Questions loaded: {questionsCount} total
          </p>
        </div>

        {/* Mode Buttons */}
        <div className="space-y-2.5 mb-4">
          <button
            onClick={openLearn}
            className="w-full py-4 bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-bold text-base shadow-lg shadow-violet-900/30 transition-all active:scale-[0.98]"
          >
            📚 Learn
            {!isPremium && <PremiumTag />}
            <span className="block text-xs font-normal opacity-80 mt-1">
              Study topics before testing • {completedLessonsCount}/{lessonsTotal} completed
            </span>
          </button>

          <button
            onClick={() => startQuiz('study')}
            className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-base shadow-lg shadow-emerald-900/30 transition-all active:scale-[0.98]"
          >
            📖 Study Mode
            <span className="block text-xs font-normal opacity-80 mt-1">
              {isPremium ? 'Immediate answers & explanations' : `${freeQuestionsRemaining}/25 free questions remaining today`}
            </span>
          </button>

          <button
            onClick={() => startQuiz('exam')}
            className="w-full py-4 bg-sky-600 hover:bg-sky-500 text-white rounded-xl font-bold text-base shadow-lg shadow-sky-900/30 transition-all active:scale-[0.98]"
          >
            📝 Practice Exam
            {!isPremium && <PremiumTag />}
            <span className="block text-xs font-normal opacity-80 mt-1">
              35 Questions • No hints • Pass/Fail
            </span>
          </button>

          <button
            onClick={() => startQuiz('bookmarks')}
            disabled={bookmarksDisabled}
            className={`w-full py-4 rounded-xl font-bold text-base shadow-lg transition-all active:scale-[0.98] ${
              bookmarksDisabled
                ? 'bg-slate-800 text-slate-600 cursor-not-allowed shadow-none'
                : 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-900/30'
            }`}
          >
            ⭐ Bookmarks
            {!isPremium && <PremiumTag />}
            <span className="block text-xs font-normal opacity-80 mt-1">
              Practice only bookmarked questions
            </span>
          </button>

          <button
            onClick={() => startReviewMode()}
            disabled={reviewDisabled}
            className={`w-full py-4 rounded-xl font-bold text-base shadow-lg transition-all active:scale-[0.98] ${
              reviewDisabled
                ? 'bg-slate-800 text-slate-600 cursor-not-allowed shadow-none'
                : 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-900/30'
            }`}
          >
            🔄 Review Due
            {!isPremium && <PremiumTag />}
            <span className="block text-xs font-normal opacity-80 mt-1">
              {dueReviewCount > 0
                ? `${dueReviewCount} questions need review • ${masteredCount} mastered`
                : 'No reviews due • Study to add questions'}
            </span>
          </button>
        </div>

        {/* Bottom Row */}
        <div className="flex gap-2.5 mt-3">
          <button
            onClick={openAnalytics}
            className="flex-1 py-3 border border-slate-700 rounded-lg text-sm font-semibold text-slate-400 hover:bg-slate-800 transition-colors"
          >
            📊 Analytics
            {!isPremium && <PremiumTag />}
          </button>
          <button
            onClick={() => setAppState('settings')}
            className="flex-1 py-3 border border-slate-700 rounded-lg text-sm font-semibold text-slate-400 hover:bg-slate-800 transition-colors"
          >
            ⚙️ Settings
          </button>
        </div>

        {bookmarksCount > 0 && (
          <p className="mt-3 text-xs text-slate-500">
            {bookmarksCount} question{bookmarksCount === 1 ? '' : 's'} bookmarked
          </p>
        )}
      </div>

      {showOnboarding && (
        <OnboardingModal
          onboardingSlide={onboardingSlide}
          setOnboardingSlide={setOnboardingSlide}
          completeOnboarding={completeOnboarding}
        />
      )}
    </main>
  );
}
