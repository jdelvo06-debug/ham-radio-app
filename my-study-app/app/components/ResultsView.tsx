'use client';

import { Question, Mode, SubelementStats, SpacedRepData } from '../types';
import QuestionFigure from './QuestionFigure';

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

  const isReview = mode === 'review';

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 bg-slate-950">
      <div className={`w-full max-w-xl bg-slate-900 rounded-2xl shadow-2xl shadow-black/50 border border-slate-800 p-6 sm:p-8 text-center border-t-4 ${isReview ? 'border-t-rose-500' : 'border-t-sky-500'}`}>

        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6">
          {isReview
            ? 'Review Session Complete'
            : mode === 'bookmarks'
            ? 'Bookmarks Session Complete'
            : 'Quiz Completed'}
        </h2>

        {/* Score */}
        <div className="mb-6">
          <div className={`text-6xl font-black mb-2 ${
            isExam ? (passed ? 'text-emerald-400' : 'text-rose-400') : isReview ? 'text-rose-400' : 'text-sky-400'
          }`}>
            {percentage}%
          </div>
          <p className="text-lg text-slate-400">
            You scored {score} out of {total}
          </p>
          {isExam && (
            <div className={`mt-4 inline-block px-4 py-1.5 rounded-full font-bold text-sm ${
              passed ? 'bg-emerald-900/50 text-emerald-400' : 'bg-rose-900/50 text-rose-400'
            }`}>
              {passed ? 'PASSED (≥74%)' : 'NEEDS STUDY (<74%)'}
            </div>
          )}
          {isReview && (
            <div className="mt-4 p-4 bg-rose-950/40 border border-rose-900/50 rounded-xl text-left">
              <p className="text-sm text-rose-300">
                <span className="font-bold">🎯 Review Progress:</span>
              </p>
              <ul className="text-sm text-rose-400 mt-2 space-y-1">
                <li>✓ {score} correct this session</li>
                <li>🎉 {reviewMastered} questions mastered (3 correct in a row)</li>
                <li>🔄 {getDueReviewCount()} questions still need review</li>
              </ul>
              <p className="text-xs text-rose-500 mt-2">
                Questions you got wrong will reappear sooner. Get them right 3 times to master!
              </p>
            </div>
          )}
        </div>

        {/* Subelement breakdown */}
        {isExam && subStatsEntries.length > 0 && (
          <div className="mb-6 text-left border border-slate-800 bg-slate-800/60 rounded-xl p-4">
            <h3 className="text-sm font-bold text-slate-300 mb-2">
              Performance by Subelement (This Exam)
            </h3>
            <ul className="space-y-1 text-sm">
              {subStatsEntries.map(([sub, stats]) => {
                const pct = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
                return (
                  <li key={sub} className="flex justify-between items-center">
                    <span className="font-mono text-slate-300">{sub}</span>
                    <span className="text-slate-400">
                      {stats.correct}/{stats.total} correct
                      <span className={`ml-2 text-xs font-semibold ${pct >= 74 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        ({pct}%)
                      </span>
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {/* Missed questions */}
        {isExam && missedQuestions.length > 0 && (
          <div className="mb-6 text-left max-h-64 overflow-y-auto border border-slate-800 bg-slate-800/60 rounded-xl p-4">
            <h3 className="text-sm font-bold text-slate-300 mb-2">
              Review Missed Questions ({missedQuestions.length})
            </h3>
            <ul className="space-y-3 text-sm">
              {missedQuestions.map((q) => {
                const bookmarked = isBookmarked(q.id);
                return (
                  <li key={q.id} className="border-b border-slate-700 pb-2 last:border-b-0 last:pb-0">
                    <div className="flex justify-between items-start gap-2">
                      <p className="font-semibold text-white">
                        <span className="text-xs font-mono text-slate-500 mr-1">[{q.id}]</span>
                        {q.question}
                      </p>
                      <button
                        onClick={() => toggleBookmark(q.id)}
                        className="text-xs px-2 py-1 rounded-full border border-amber-700 text-amber-400 bg-amber-900/30 hover:bg-amber-900/50 shrink-0 transition-colors"
                      >
                        {bookmarked ? '★ Bookmarked' : '☆ Bookmark'}
                      </button>
                    </div>
                    {q.figure && (
                      <div className="mt-3">
                        <QuestionFigure questionId={q.id} figure={q.figure} />
                      </div>
                    )}
                    <p className="mt-1 text-slate-400">
                      <span className="font-semibold">Correct answer: </span>{q.correctAnswer}
                    </p>
                    <p className="mt-1 text-slate-500 text-xs">{q.explanation}</p>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {/* Retry missed */}
        {isExam && missedQuestions.length > 0 && (
          <button
            onClick={startRetryMissed}
            className="w-full mb-4 py-3 border border-sky-800 text-sky-400 hover:bg-sky-950/40 rounded-xl font-semibold text-sm transition-colors"
          >
            🔁 Retry Missed Questions Only
          </button>
        )}

        <button
          onClick={() => setAppState('menu')}
          className="w-full py-3 bg-sky-600 hover:bg-sky-500 text-white rounded-xl font-bold shadow-lg shadow-sky-900/30 transition-all active:scale-[0.98]"
        >
          Back to Home
        </button>
      </div>
    </main>
  );
}
