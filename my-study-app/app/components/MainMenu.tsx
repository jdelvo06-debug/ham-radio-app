'use client';

import { Mode, Badge, StreakData, Lesson } from '../types';
import OnboardingModal from './OnboardingModal';

interface MainMenuProps {
  darkMode: boolean;
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
  setAppState: (state: 'menu' | 'quiz' | 'results' | 'analytics' | 'learn' | 'lesson' | 'settings') => void;
  showOnboarding: boolean;
  onboardingSlide: number;
  setOnboardingSlide: (slide: number) => void;
  completeOnboarding: () => void;
}

export default function MainMenu({
  darkMode,
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
  setAppState,
  showOnboarding,
  onboardingSlide,
  setOnboardingSlide,
  completeOnboarding,
}: MainMenuProps) {
  return (
    <main className={`min-h-screen flex flex-col items-center justify-center p-6 ${darkMode ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-900'}`}>
      <div className={`max-w-md w-full ${darkMode ? 'bg-slate-800' : 'bg-white'} p-10 rounded-2xl shadow-xl text-center`}>
        <h1 className="text-4xl font-extrabold text-blue-700 mb-2">Ham Radio Study Buddy</h1>
        <p className={`${darkMode ? 'text-slate-400' : 'text-slate-500'} mb-4`}>Technician Class Prep</p>

        {streakData.totalStudyDays > 0 && (
          <div className={`mb-6 p-3 rounded-xl ${darkMode ? 'bg-slate-700' : 'bg-gradient-to-r from-orange-50 to-amber-50 border border-amber-200'}`}>
            <div className="flex items-center justify-center gap-4">
              <div className="text-center">
                <span className="text-2xl">🔥</span>
                <p className={`text-lg font-bold ${darkMode ? 'text-orange-400' : 'text-orange-600'}`}>{streakData.currentStreak}</p>
                <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Day Streak</p>
              </div>
              <div className={`w-px h-10 ${darkMode ? 'bg-slate-600' : 'bg-amber-200'}`}></div>
              <div className="text-center">
                <span className="text-2xl">⭐</span>
                <p className={`text-lg font-bold ${darkMode ? 'text-amber-400' : 'text-amber-600'}`}>{streakData.longestStreak}</p>
                <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Best Streak</p>
              </div>
              <div className={`w-px h-10 ${darkMode ? 'bg-slate-600' : 'bg-amber-200'}`}></div>
              <div className="text-center">
                <span className="text-2xl">📅</span>
                <p className={`text-lg font-bold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>{streakData.totalStudyDays}</p>
                <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Total Days</p>
              </div>
            </div>
          </div>
        )}

        {earnedBadges.length > 0 && (
          <div className={`mb-6 p-3 rounded-xl ${darkMode ? 'bg-slate-700' : 'bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200'}`}>
            <div className="flex items-center justify-between mb-2">
              <span className={`text-xs font-semibold ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                🏆 Achievements
              </span>
              <span className={`text-xs ${darkMode ? 'text-slate-500' : 'text-slate-500'}`}>
                {earnedBadges.length}/{badgesTotal}
              </span>
            </div>
            <div className="flex justify-center gap-1 flex-wrap">
              {earnedBadges.slice(0, 8).map((badge) => (
                <span key={badge.id} className="text-xl" title={badge.name}>
                  {badge.icon}
                </span>
              ))}
              {earnedBadges.length > 8 && (
                <span className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'} self-center`}>
                  +{earnedBadges.length - 8}
                </span>
              )}
            </div>
          </div>
        )}

        <div className="mb-6 text-left">
          <label className={`block text-xs font-semibold ${darkMode ? 'text-slate-400' : 'text-slate-500'} mb-1`}>
            Focus Area (Subelement)
          </label>
          <select
            value={selectedSubelement}
            onChange={(e) => setSelectedSubelement(e.target.value as 'ALL' | string)}
            className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${darkMode ? 'border-slate-600 bg-slate-700 text-white' : 'border-slate-200 bg-slate-50 text-slate-800'}`}
          >
            <option value="ALL">All Subelements</option>
            {subelements.map((sub) => (
              <option key={sub} value={sub}>
                {sub} Questions
              </option>
            ))}
          </select>
          <p className={`mt-1 text-[11px] ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
            Questions loaded: {questionsCount} total
          </p>
        </div>
        
        <div className="space-y-3 mb-4">
          <button
            onClick={() => setAppState('learn')}
            className="w-full py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-lg shadow-md transition-transform active:scale-95"
          >
            📚 Learn
            <span className="block text-xs font-normal opacity-90 mt-1">
              Study topics before testing • {completedLessonsCount}/{lessonsTotal} completed
            </span>
          </button>

          <button
            onClick={() => startQuiz('study')}
            className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold text-lg shadow-md transition-transform active:scale-95"
          >
            📖 Study Mode
            <span className="block text-xs font-normal opacity-90 mt-1">
              Immediate answers & explanations
            </span>
          </button>

          <button
            onClick={() => startQuiz('exam')}
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-lg shadow-md transition-transform active:scale-95"
          >
            📝 Practice Exam
            <span className="block text-xs font-normal opacity-90 mt-1">
              35 Questions • No hints • Pass/Fail
            </span>
          </button>

          <button
            onClick={() => startQuiz('bookmarks')}
            disabled={bookmarksCount === 0}
            className={`w-full py-4 rounded-xl font-bold text-lg shadow-md transition-transform active:scale-95 ${
              bookmarksCount === 0
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-amber-500 hover:bg-amber-600 text-white'
            }`}
          >
            ⭐ Bookmarks
            <span className="block text-xs font-normal opacity-90 mt-1">
              Practice only bookmarked questions
            </span>
          </button>

          <button
            onClick={() => startReviewMode()}
            disabled={dueReviewCount === 0}
            className={`w-full py-4 rounded-xl font-bold text-lg shadow-md transition-transform active:scale-95 ${
              dueReviewCount === 0
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-rose-500 hover:bg-rose-600 text-white'
            }`}
          >
            🔄 Review Due
            <span className="block text-xs font-normal opacity-90 mt-1">
              {dueReviewCount > 0
                ? `${dueReviewCount} questions need review • ${masteredCount} mastered`
                : 'No reviews due • Study to add questions'}
            </span>
          </button>
        </div>

        <div className="flex gap-2 mt-2">
          <button
            onClick={() => setAppState('analytics')}
            className={`flex-1 py-3 border rounded-lg text-sm font-semibold ${darkMode ? 'border-slate-600 text-slate-400 hover:bg-slate-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
          >
            📊 Analytics
          </button>
          <button
            onClick={() => setAppState('settings')}
            className={`flex-1 py-3 border rounded-lg text-sm font-semibold ${darkMode ? 'border-slate-600 text-slate-400 hover:bg-slate-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
          >
            ⚙️ Settings
          </button>
        </div>

        {bookmarksCount > 0 && (
          <p className={`mt-2 text-xs ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
            {bookmarksCount} question{bookmarksCount === 1 ? '' : 's'} bookmarked
          </p>
        )}
      </div>

      {showOnboarding && (
        <OnboardingModal
          darkMode={darkMode}
          onboardingSlide={onboardingSlide}
          setOnboardingSlide={setOnboardingSlide}
          completeOnboarding={completeOnboarding}
        />
      )}
    </main>
  );
}