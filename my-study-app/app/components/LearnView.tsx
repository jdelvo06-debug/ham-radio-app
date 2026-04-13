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
    <main className={`min-h-screen flex flex-col items-center p-6 ${darkMode ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-900'}`}>
      <div className="max-w-2xl w-full">
        <div className={`${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} p-6 rounded-2xl shadow-xl border mb-6`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              📚 Learn
            </h2>
            <button
              onClick={() => setAppState('menu')}
              className={`text-sm ${darkMode ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-700'}`}
            >
              ← Back
            </button>
          </div>
          <p className={`${darkMode ? 'text-slate-400' : 'text-slate-600'} text-sm mb-4`}>
            Study each topic before testing yourself. Each lesson takes about 5 minutes to read.
          </p>
          <div className="flex items-center gap-3">
            <div className={`flex-1 ${darkMode ? 'bg-slate-700' : 'bg-slate-100'} h-3 rounded-full overflow-hidden`}>
              <div
                className="bg-emerald-500 h-full transition-all duration-300"
                style={{ width: `${totalLessons > 0 ? (completedCount / totalLessons) * 100 : 0}%` }}
              ></div>
            </div>
            <span className={`text-sm font-semibold ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              {completedCount}/{totalLessons} completed
            </span>
          </div>
        </div>

        <div className="space-y-3">
          {lessons.map((lesson) => {
            const completed = completedLessons.includes(lesson.id);
            const stats = globalStats[lesson.id] ?? { correct: 0, total: 0 };
            const accuracy = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : null;
            const dueCount = dueReviewCounts[lesson.id] ?? 0;
            const masteredCount = masteredCounts[lesson.id] ?? 0;

            return (
              <div key={lesson.id} className={`${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} rounded-xl shadow-md border overflow-hidden`}>
                <button
                  onClick={() => openLesson(lesson)}
                  className={`w-full p-5 ${darkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-50'} transition-all text-left flex items-center gap-4`}
                >
                  <div className="text-3xl">{lesson.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`font-mono text-xs ${darkMode ? 'text-blue-400 bg-blue-900/50' : 'text-blue-500 bg-blue-50'} px-2 py-0.5 rounded`}>
                        {lesson.id}
                      </span>
                      {completed && (
                        <span className={`text-xs ${darkMode ? 'text-emerald-400 bg-emerald-900/50' : 'text-emerald-600 bg-emerald-50'} px-2 py-0.5 rounded`}>
                          ✓ Completed
                        </span>
                      )}
                      {accuracy !== null && (
                        <span className={`text-xs px-2 py-0.5 rounded ${
                          accuracy >= 74
                            ? (darkMode ? 'text-green-400 bg-green-900/50' : 'text-green-600 bg-green-50')
                            : (darkMode ? 'text-amber-400 bg-amber-900/50' : 'text-amber-600 bg-amber-50')
                        }`}>
                          {accuracy}% accuracy
                        </span>
                      )}
                      {masteredCount > 0 && (
                        <span className={`text-xs ${darkMode ? 'text-purple-400 bg-purple-900/50' : 'text-purple-600 bg-purple-50'} px-2 py-0.5 rounded`}>
                          {masteredCount} mastered
                        </span>
                      )}
                    </div>
                    <h3 className={`font-bold ${darkMode ? 'text-white' : 'text-slate-800'} mt-1`}>{lesson.title}</h3>
                    <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{lesson.subtitle}</p>
                  </div>
                  <div className={darkMode ? 'text-slate-500' : 'text-slate-300'}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>
                {dueCount > 0 && (
                  <div className="px-5 pb-4 pt-0">
                    <button
                      onClick={() => startReviewMode(lesson.id)}
                      className={`w-full py-2 ${darkMode ? 'bg-rose-900/30 hover:bg-rose-900/50 border-rose-800' : 'bg-rose-50 hover:bg-rose-100 border-rose-200'} text-rose-500 rounded-lg text-sm font-semibold transition border`}
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