'use client';

import { Lesson, GlobalSubelementStats } from '../types';

interface LearnViewProps {
  darkMode: boolean;
  lessons: Lesson[];
  completedLessons: string[];
  globalStats: Record<string, GlobalSubelementStats>;
  dueReviewCounts: Record<string, number>;
  masteredCounts: Record<string, number>;
  openLesson: (lesson: Lesson) => void;
  startReviewMode: (subelement?: string) => void;
  setAppState: (state: 'menu' | 'quiz' | 'results' | 'analytics' | 'learn' | 'lesson' | 'settings') => void;
}

export default function LearnView({
  darkMode,
  lessons,
  completedLessons,
  globalStats,
  dueReviewCounts,
  masteredCounts,
  openLesson,
  startReviewMode,
  setAppState,
}: LearnViewProps) {
  const completedCount = completedLessons.length;
  const totalLessons = lessons.length;

  return (
    <main className="min-h-screen flex flex-col items-center p-4 sm:p-6 bg-slate-950">
      <div className="max-w-2xl w-full">
        {/* Header card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl shadow-black/50 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">📚 Learn</h2>
            <button onClick={() => setAppState('menu')} className="text-sm text-slate-400 hover:text-white transition-colors">
              ← Back
            </button>
          </div>
          <p className="text-slate-400 text-sm mb-4">
            Study each topic before testing yourself. Each lesson takes about 5 minutes to read.
          </p>
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-slate-800 h-3 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full transition-all duration-300 rounded-full"
                style={{ width: `${totalLessons > 0 ? (completedCount / totalLessons) * 100 : 0}%` }}
              />
            </div>
            <span className="text-sm font-semibold text-slate-400">{completedCount}/{totalLessons} completed</span>
          </div>
        </div>

        {/* Lesson cards */}
        <div className="space-y-3">
          {lessons.map((lesson) => {
            const completed = completedLessons.includes(lesson.id);
            const stats = globalStats[lesson.id] ?? { correct: 0, total: 0 };
            const accuracy = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : null;
            const dueCount = dueReviewCounts[lesson.id] ?? 0;
            const masteredCount = masteredCounts[lesson.id] ?? 0;

            return (
              <div key={lesson.id} className="bg-slate-900 border border-slate-800 rounded-xl shadow-lg overflow-hidden">
                <button
                  onClick={() => openLesson(lesson)}
                  className="w-full p-5 hover:bg-slate-800/60 transition-all text-left flex items-center gap-4"
                >
                  <div className="text-3xl">{lesson.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs text-sky-400 bg-sky-950/50 px-2 py-0.5 rounded">
                        {lesson.id}
                      </span>
                      {completed && (
                        <span className="text-xs text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded">✓ Completed</span>
                      )}
                      {accuracy !== null && (
                        <span className={`text-xs px-2 py-0.5 rounded ${accuracy >= 74 ? 'text-emerald-400 bg-emerald-950/50' : 'text-amber-400 bg-amber-950/50'}`}>
                          {accuracy}% accuracy
                        </span>
                      )}
                      {masteredCount > 0 && (
                        <span className="text-xs text-violet-400 bg-violet-950/50 px-2 py-0.5 rounded">{masteredCount} mastered</span>
                      )}
                    </div>
                    <h3 className="font-bold text-white mt-1">{lesson.title}</h3>
                    <p className="text-sm text-slate-400">{lesson.subtitle}</p>
                  </div>
                  <div className="text-slate-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>
                {dueCount > 0 && (
                  <div className="px-5 pb-4 pt-0">
                    <button
                      onClick={() => startReviewMode(lesson.id)}
                      className="w-full py-2 bg-rose-950/40 hover:bg-rose-900/50 border border-rose-900/50 text-rose-400 rounded-lg text-sm font-semibold transition"
                    >
                      🔄 Review {dueCount} due question{dueCount !== 1 ? 's' : ''}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
