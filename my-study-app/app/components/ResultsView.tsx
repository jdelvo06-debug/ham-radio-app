'use client';

import { Question, Mode, SubelementStats, SpacedRepData } from '../types';

interface ResultsViewProps {
  darkMode: boolean;
  mode: Mode;
  score: number;
  activeQuestions: Question[];
  missedQuestions: Question[];
  subelementStats: Record<string, SubelementStats>;
  spacedRepData: Record<string, SpacedRepData>;
  isBookmarked: (id: string) => boolean;
  toggleBookmark: (id: string) => void;
  getDueReviewCount: () => number;
  startRetryMissed: () => void;
  setAppState: (state: 'menu' | 'quiz' | 'results' | 'analytics' | 'learn' | 'lesson' | 'settings') => void;
}

export default function ResultsView({
  darkMode,
  mode,
  score,
  activeQuestions,
  missedQuestions,
  subelementStats,
  spacedRepData,
  isBookmarked,
  toggleBookmark,
  getDueReviewCount,
  startRetryMissed,
  setAppState,
}: ResultsViewProps) {
  const total = activeQuestions.length;
  const percentage = total > 0 ? Math.round((score / total) * 100) : 0;
  const isExam = mode === 'exam';
  const passed = isExam && percentage >= 74;

  const subStatsEntries = Object.entries(subelementStats).sort(([a], [b]) =>
    a.localeCompare(b)
  );

  const reviewMastered = mode === 'review'
    ? activeQuestions.filter(q => spacedRepData[q.id]?.correctStreak >= 3).length
    : 0;

  return (
    <main className={`min-h-screen flex flex-col items-center justify-center p-6 ${darkMode ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-900'}`}>
      <div className={`max-w-xl w-full ${darkMode ? 'bg-slate-800' : 'bg-white'} p-8 rounded-2xl shadow-xl text-center border-t-8 ${
        mode === 'review' ? 'border-rose-500' : 'border-blue-600'
      }`}>
        <h2 className="text-3xl font-bold mb-6">
          {mode === 'review'
            ? 'Review Session Complete'
            : mode === 'bookmarks'
            ? 'Bookmarks Session Complete'
            : 'Quiz Completed'}
        </h2>

        <div className="mb-6">
          <div
            className={`text-6xl font-black mb-2 ${
              isExam ? (passed ? 'text-green-600' : 'text-red-500') : mode === 'review' ? 'text-rose-500' : 'text-blue-600'
            }`}
          >
            {percentage}%
          </div>
          <p className={`text-xl ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
            You scored {score} out of {total}
          </p>
          {isExam && (
            <div
              className={`mt-4 inline-block px-4 py-1 rounded-full font-bold text-sm ${
                passed
                  ? (darkMode ? 'bg-green-900/50 text-green-400' : 'bg-green-100 text-green-800')
                  : (darkMode ? 'bg-red-900/50 text-red-400' : 'bg-red-100 text-red-800')
              }`}
            >
              {passed ? 'PASSED (>=74%)' : 'NEEDS STUDY (<74%)'}
            </div>
          )}
          {mode === 'review' && (
            <div className={`mt-4 p-4 ${darkMode ? 'bg-rose-900/30 border-rose-800' : 'bg-rose-50 border-rose-200'} rounded-xl border text-left`}>
              <p className={`text-sm ${darkMode ? 'text-rose-300' : 'text-rose-800'}`}>
                <span className="font-bold">🎯 Review Progress:</span>
              </p>
              <ul className={`text-sm ${darkMode ? 'text-rose-400' : 'text-rose-700'} mt-2 space-y-1`}>
                <li>✓ {score} correct this session</li>
                <li>🎉 {reviewMastered} questions mastered (3 correct in a row)</li>
                <li>🔄 {getDueReviewCount()} questions still need review</li>
              </ul>
              <p className={`text-xs ${darkMode ? 'text-rose-500' : 'text-rose-500'} mt-2`}>
                Questions you got wrong will reappear sooner. Get them right 3 times to master!
              </p>
            </div>
          )}
        </div>

        {isExam && subStatsEntries.length > 0 && (
          <div className={`mb-6 text-left border rounded-xl p-4 ${darkMode ? 'border-slate-700 bg-slate-700' : 'border-slate-100 bg-slate-50'}`}>
            <h3 className={`text-sm font-bold ${darkMode ? 'text-slate-300' : 'text-slate-700'} mb-2`}>
              Performance by Subelement (This Exam)
            </h3>
            <ul className="space-y-1 text-sm">
              {subStatsEntries.map(([sub, stats]) => {
                const pct =
                  stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
                return (
                  <li key={sub} className="flex justify-between items-center">
                    <span className={`font-mono ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>{sub}</span>
                    <span className={darkMode ? 'text-slate-400' : 'text-slate-600'}>
                      {stats.correct}/{stats.total} correct
                      <span
                        className={`ml-2 text-xs font-semibold ${
                          pct >= 74 ? 'text-green-600' : 'text-red-500'
                        }`}
                      >
                        ({pct}%)
                      </span>
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {isExam && missedQuestions.length > 0 && (
          <div className={`mb-6 text-left max-h-64 overflow-y-auto border rounded-xl p-4 ${darkMode ? 'border-slate-700 bg-slate-700' : 'border-slate-100 bg-slate-50'}`}>
            <h3 className={`text-sm font-bold ${darkMode ? 'text-slate-300' : 'text-slate-700'} mb-2`}>
              Review Missed Questions ({missedQuestions.length})
            </h3>
            <ul className="space-y-3 text-sm">
              {missedQuestions.map((q) => {
                const bookmarked = isBookmarked(q.id);
                return (
                  <li
                    key={q.id}
                    className={`border-b ${darkMode ? 'border-slate-600' : 'border-slate-200'} pb-2 last:border-b-0 last:pb-0`}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <p className={`font-semibold ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                        <span className={`text-xs font-mono ${darkMode ? 'text-slate-500' : 'text-slate-500'} mr-1`}>
                          [{q.id}]
                        </span>
                        {q.question}
                      </p>
                      <button
                        onClick={() => toggleBookmark(q.id)}
                        className={`text-xs px-2 py-1 rounded-full border shrink-0 ${
                          darkMode
                            ? 'border-amber-700 text-amber-400 bg-amber-900/30 hover:bg-amber-900/50'
                            : 'border-amber-300 text-amber-700 bg-amber-50 hover:bg-amber-100'
                        }`}
                      >
                        {bookmarked ? '★ Bookmarked' : '☆ Bookmark'}
                      </button>
                    </div>
                    <p className={`mt-1 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                      <span className="font-semibold">Correct answer: </span>
                      {q.correctAnswer}
                    </p>
                    <p className={`mt-1 ${darkMode ? 'text-slate-500' : 'text-slate-500'} text-xs`}>{q.explanation}</p>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {isExam && missedQuestions.length > 0 && (
          <button
            onClick={startRetryMissed}
            className={`w-full mb-4 py-3 border rounded-lg font-semibold text-sm ${
              darkMode
                ? 'border-blue-700 text-blue-400 hover:bg-blue-900/30'
                : 'border-blue-200 text-blue-700 hover:bg-blue-50'
            }`}
          >
            🔁 Retry Missed Questions Only
          </button>
        )}

        <button
          onClick={() => setAppState('menu')}
          className={`w-full py-3 rounded-lg font-bold transition ${
            darkMode ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-slate-800 hover:bg-slate-900 text-white'
          }`}
        >
          Back to Home
        </button>
      </div>
    </main>
  );
}