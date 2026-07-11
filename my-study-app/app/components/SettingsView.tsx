'use client';

import { Badge, GlobalSubelementStats } from '../types';
import { APP_VERSION } from '../types';

interface SettingsViewProps {
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
    <main className="min-h-screen flex flex-col items-center p-4 sm:p-6 bg-slate-950">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl shadow-black/50 p-6 sm:p-8">

        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          ⚙️ Settings
        </h2>

        {/* Data & Progress */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-3">
            Data & Progress
          </h3>
          <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/50 mb-3">
            <p className="font-medium text-white mb-2">Your Progress</p>
            <div className="text-sm text-slate-400 space-y-1">
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
              className="flex-1 py-3 bg-sky-600 hover:bg-sky-500 text-white rounded-xl font-semibold transition-colors"
            >
              📤 Export
            </button>
            <label className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold transition-colors text-center cursor-pointer">
              📥 Import
              <input type="file" accept=".json" onChange={importProgress} className="hidden" />
            </label>
          </div>
          <p className="text-xs text-slate-500 mb-3">
            Backup your progress or restore from a previous export
          </p>
          <button
            onClick={() => setShowResetConfirm(true)}
            className="w-full py-3 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-semibold transition-colors"
          >
            Reset All Progress
          </button>
        </div>

        {/* Achievements */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-3">
            Achievements
          </h3>
          <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/50">
            <p className="font-medium text-white mb-3">
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
                      className={`text-center p-2 rounded-lg transition-all ${earned ? 'bg-slate-700 border border-amber-800/40' : 'bg-slate-800 opacity-40'}`}
                      title={badge.description}
                    >
                      <span className={`text-2xl ${earned ? '' : 'grayscale'}`}>{badge.icon}</span>
                      <p className={`text-xs mt-1 font-medium truncate ${earned ? 'text-slate-300' : 'text-slate-600'}`}>
                        {badge.name}
                      </p>
                    </div>
                  );
                });
              })()}
            </div>
            <p className="text-xs text-slate-500 mt-3 text-center">
              Tap a badge to see how to earn it
            </p>
          </div>
        </div>

        {/* About */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-3">
            About
          </h3>
          <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/50">
            <p className="font-bold text-lg text-white mb-1">Ham Radio Study Buddy</p>
            <p className="text-sm text-slate-400 mb-3">Version {APP_VERSION}</p>
            <div className="text-sm text-slate-400 space-y-2">
              <p>Questions sourced from the official FCC Technician Class question pool (2026-2030).</p>
              <p>This app is not affiliated with the FCC or ARRL. Use for educational purposes only.</p>
            </div>
            <button
              onClick={replayTutorial}
              className="mt-3 w-full py-2 rounded-lg text-sm font-medium bg-slate-700 hover:bg-slate-600 text-slate-300 transition-colors"
            >
              📖 Replay Tutorial
            </button>
          </div>
        </div>

        <button
          onClick={() => setAppState('menu')}
          className="w-full py-3 border border-slate-700 rounded-xl text-sm font-semibold text-slate-400 hover:text-white hover:border-slate-600 transition-colors"
        >
          Back to Home
        </button>
      </div>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-2xl max-w-sm w-full">
            <h3 className="text-xl font-bold text-white mb-2">Reset All Progress?</h3>
            <p className="text-slate-400 mb-6">
              This will permanently delete all your study stats, completed lessons, bookmarks, and spaced repetition data. This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={resetAllProgress}
                className="flex-1 py-3 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-semibold transition-colors"
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
