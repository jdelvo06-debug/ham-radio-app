'use client';

import { Badge, Lesson, GlobalSubelementStats } from '../types';
import { APP_VERSION } from '../types';

interface SettingsViewProps {
  darkMode: boolean;
  toggleDarkMode: () => void;
  globalStats: Record<string, GlobalSubelementStats>;
  completedLessonsCount: number;
  lessonsTotal: number;
  bookmarksCount: number;
  masteredCount: number;
  earnedBadges: Badge[];
  badgesTotal: number;
  exportProgress: () => void;
  importProgress: (event: React.ChangeEvent<HTMLInputElement>) => void;
  showResetConfirm: boolean;
  setShowResetConfirm: (show: boolean) => void;
  resetAllProgress: () => void;
  setAppState: (state: 'menu' | 'quiz' | 'results' | 'analytics' | 'learn' | 'lesson' | 'settings') => void;
  replayTutorial: () => void;
}

export default function SettingsView({
  darkMode,
  toggleDarkMode,
  globalStats,
  completedLessonsCount,
  lessonsTotal,
  bookmarksCount,
  masteredCount,
  earnedBadges,
  badgesTotal,
  exportProgress,
  importProgress,
  showResetConfirm,
  setShowResetConfirm,
  resetAllProgress,
  setAppState,
  replayTutorial,
}: SettingsViewProps) {
  const totalAnswered = Object.values(globalStats).reduce((sum, s) => sum + s.total, 0);
  const totalCorrect = Object.values(globalStats).reduce((sum, s) => sum + s.correct, 0);

  return (
    <main className={`min-h-screen flex flex-col items-center p-6 ${darkMode ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-900'}`}>
      <div className={`max-w-md w-full ${darkMode ? 'bg-slate-800' : 'bg-white'} p-8 rounded-2xl shadow-xl border ${darkMode ? 'border-slate-700' : 'border-slate-200'}`}>
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          ⚙️ Settings
        </h2>

        <div className="mb-6">
          <h3 className={`text-sm font-semibold ${darkMode ? 'text-slate-400' : 'text-slate-500'} uppercase tracking-wide mb-3`}>
            Appearance
          </h3>
          <div className={`flex items-center justify-between p-4 rounded-xl ${darkMode ? 'bg-slate-700' : 'bg-slate-50'}`}>
            <div>
              <p className="font-medium">Dark Mode</p>
              <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Easier on the eyes at night</p>
            </div>
            <button
              onClick={toggleDarkMode}
              className={`relative w-14 h-8 rounded-full transition-colors ${darkMode ? 'bg-blue-600' : 'bg-slate-300'}`}
            >
              <span
                className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow transition-transform ${darkMode ? 'translate-x-7' : 'translate-x-1'}`}
              />
            </button>
          </div>
        </div>

        <div className="mb-6">
          <h3 className={`text-sm font-semibold ${darkMode ? 'text-slate-400' : 'text-slate-500'} uppercase tracking-wide mb-3`}>
            Data & Progress
          </h3>
          <div className={`p-4 rounded-xl ${darkMode ? 'bg-slate-700' : 'bg-slate-50'} mb-3`}>
            <p className="font-medium mb-2">Your Progress</p>
            <div className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'} space-y-1`}>
              <p>Questions answered: {totalAnswered}</p>
              <p>Correct answers: {totalCorrect} ({totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0}%)</p>
              <p>Lessons completed: {completedLessonsCount}/{lessonsTotal}</p>
              <p>Bookmarked questions: {bookmarksCount}</p>
              <p>Mastered (spaced rep): {masteredCount}</p>
            </div>
          </div>
          <div className="flex gap-3 mb-3">
            <button
              onClick={exportProgress}
              className={`flex-1 py-3 rounded-xl font-semibold transition-colors ${darkMode ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'}`}
            >
              📤 Export
            </button>
            <label className={`flex-1 py-3 rounded-xl font-semibold transition-colors text-center cursor-pointer ${darkMode ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-emerald-500 hover:bg-emerald-600 text-white'}`}>
              📥 Import
              <input
                type="file"
                accept=".json"
                onChange={importProgress}
                className="hidden"
              />
            </label>
          </div>
          <p className={`text-xs ${darkMode ? 'text-slate-500' : 'text-slate-400'} mb-3`}>
            Backup your progress or restore from a previous export
          </p>

          <button
            onClick={() => setShowResetConfirm(true)}
            className="w-full py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold transition-colors"
          >
            Reset All Progress
          </button>
        </div>

        <div className="mb-6">
          <h3 className={`text-sm font-semibold ${darkMode ? 'text-slate-400' : 'text-slate-500'} uppercase tracking-wide mb-3`}>
            Achievements
          </h3>
          <div className={`p-4 rounded-xl ${darkMode ? 'bg-slate-700' : 'bg-slate-50'}`}>
            <p className="font-medium mb-3">
              {earnedBadges.length} of {badgesTotal} badges earned
            </p>
            <div className="grid grid-cols-3 gap-2">
              {(() => {
                const allBadges = [
                  { id: 'first_question', name: 'First Steps', icon: '🎯', description: 'Answer your first question' },
                  { id: 'ten_correct', name: 'Getting Started', icon: '✨', description: 'Get 10 questions correct' },
                  { id: 'fifty_correct', name: 'Dedicated Learner', icon: '📚', description: 'Get 50 questions correct' },
                  { id: 'hundred_correct', name: 'Century Club', icon: '💯', description: 'Get 100 questions correct' },
                  { id: 'streak_3', name: 'On a Roll', icon: '🔥', description: 'Study 3 days in a row' },
                  { id: 'streak_7', name: 'Week Warrior', icon: '⚡', description: 'Study 7 days in a row' },
                  { id: 'streak_14', name: 'Two Week Champ', icon: '🏆', description: 'Study 14 days in a row' },
                  { id: 'streak_30', name: 'Monthly Master', icon: '👑', description: 'Study 30 days in a row' },
                  { id: 'first_lesson', name: 'Student', icon: '📖', description: 'Complete your first lesson' },
                  { id: 'all_lessons', name: 'Scholar', icon: '🎓', description: 'Complete all 10 lessons' },
                  { id: 'first_mastered', name: 'Memory Pro', icon: '🧠', description: 'Master your first question' },
                  { id: 'ten_mastered', name: 'Review Expert', icon: '⭐', description: 'Master 10 questions' },
                  { id: 'fifty_mastered', name: 'Knowledge Keeper', icon: '🌟', description: 'Master 50 questions' },
                  { id: 'pass_exam', name: 'Exam Ready', icon: '✅', description: 'Pass a practice exam (74%+)' },
                  { id: 'five_exams', name: 'Test Veteran', icon: '🎖️', description: 'Pass 5 practice exams' },
                ];
                const earnedIds = new Set(earnedBadges.map(b => b.id));
                return allBadges.map((badge) => {
                  const earned = earnedIds.has(badge.id);
                  return (
                    <div
                      key={badge.id}
                      className={`text-center p-2 rounded-lg transition-all ${
                        earned
                          ? darkMode ? 'bg-slate-600' : 'bg-white border border-amber-200'
                          : darkMode ? 'bg-slate-800 opacity-40' : 'bg-slate-100 opacity-40'
                      }`}
                      title={badge.description}
                    >
                      <span className={`text-2xl ${earned ? '' : 'grayscale'}`}>{badge.icon}</span>
                      <p className={`text-xs mt-1 font-medium truncate ${earned ? '' : darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                        {badge.name}
                      </p>
                    </div>
                  );
                });
              })()}
            </div>
            <p className={`text-xs ${darkMode ? 'text-slate-500' : 'text-slate-400'} mt-3 text-center`}>
              Tap a badge to see how to earn it
            </p>
          </div>
        </div>

        <div className="mb-6">
          <h3 className={`text-sm font-semibold ${darkMode ? 'text-slate-400' : 'text-slate-500'} uppercase tracking-wide mb-3`}>
            About
          </h3>
          <div className={`p-4 rounded-xl ${darkMode ? 'bg-slate-700' : 'bg-slate-50'}`}>
            <p className="font-bold text-lg mb-1">Ham Radio Study Buddy</p>
            <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'} mb-3`}>Version {APP_VERSION}</p>
            <div className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'} space-y-2`}>
              <p>
                Questions sourced from the official FCC Technician Class question pool (2026-2030).
              </p>
              <p>
                This app is not affiliated with the FCC or ARRL. Use for educational purposes only.
              </p>
            </div>
            <button
              onClick={replayTutorial}
              className={`mt-3 w-full py-2 rounded-lg text-sm font-medium ${darkMode ? 'bg-slate-600 hover:bg-slate-500 text-slate-300' : 'bg-slate-200 hover:bg-slate-300 text-slate-600'}`}
            >
              📖 Replay Tutorial
            </button>
          </div>
        </div>

        <button
          onClick={() => setAppState('menu')}
          className={`w-full py-3 rounded-lg text-sm font-semibold ${darkMode ? 'text-slate-400 hover:text-white border-slate-600' : 'text-slate-600 hover:bg-slate-50 border-slate-200'} border`}
        >
          Back to Home
        </button>
      </div>

      {showResetConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className={`${darkMode ? 'bg-slate-800' : 'bg-white'} p-6 rounded-2xl shadow-2xl max-w-sm w-full`}>
            <h3 className="text-xl font-bold mb-2">Reset All Progress?</h3>
            <p className={`${darkMode ? 'text-slate-400' : 'text-slate-500'} mb-6`}>
              This will permanently delete all your study stats, completed lessons, bookmarks, and spaced repetition data. This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                className={`flex-1 py-3 rounded-xl font-semibold ${darkMode ? 'bg-slate-700 hover:bg-slate-600' : 'bg-slate-100 hover:bg-slate-200'}`}
              >
                Cancel
              </button>
              <button
                onClick={resetAllProgress}
                className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}