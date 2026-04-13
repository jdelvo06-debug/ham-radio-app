'use client';

import { Lesson, GlobalSubelementStats } from '../types';

interface AnalyticsViewProps {
  darkMode: boolean;
  subelements: string[];
  lessons: Lesson[];
  globalStats: Record<string, GlobalSubelementStats>;
  setSelectedSubelement: (sub: 'ALL' | string) => void;
  startQuiz: (mode: 'study' | 'exam' | 'bookmarks' | 'review') => void;
  setAppState: (state: 'menu' | 'quiz' | 'results' | 'analytics' | 'learn' | 'lesson' | 'settings') => void;
}

export default function AnalyticsView({
  darkMode,
  subelements,
  lessons,
  globalStats,
  setSelectedSubelement,
  startQuiz,
  setAppState,
}: AnalyticsViewProps) {
  const getLessonTitle = (sub: string): string => {
    const lesson = lessons.find(l => l.id === sub);
    return lesson ? lesson.title : sub;
  };

  const entries = subelements.map((sub) => {
    const stats = globalStats[sub] ?? { correct: 0, total: 0 };
    const pct = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
    return { sub, ...stats, pct, title: getLessonTitle(sub) };
  });

  const overallTotal = entries.reduce((sum, e) => sum + e.total, 0);
  const overallCorrect = entries.reduce((sum, e) => sum + e.correct, 0);
  const overallPct = overallTotal > 0 ? Math.round((overallCorrect / overallTotal) * 100) : 0;

  const weakAreas = entries
    .filter(e => e.total >= 5 && e.pct < 74)
    .sort((a, b) => a.pct - b.pct);

  const strongAreas = entries
    .filter(e => e.total >= 5 && e.pct >= 74)
    .sort((a, b) => b.pct - a.pct);

  const needsMoreData = entries.filter(e => e.total < 5);

  return (
    <main className={`min-h-screen flex flex-col items-center p-6 ${darkMode ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-900'}`}>
      <div className={`max-w-xl w-full ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} p-8 rounded-2xl shadow-xl border`}>
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          📊 Analytics
        </h2>
        {overallTotal === 0 ? (
          <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'} mb-6`}>
            No data yet. Do some Study, Exams, or Bookmark sessions to build analytics.
          </p>
        ) : (
          <>
            <div className={`mb-6 text-sm ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
              <p className="font-semibold">
                Overall: {overallCorrect}/{overallTotal} correct ({overallPct}%)
              </p>
              <p className={`text-xs ${darkMode ? 'text-slate-500' : 'text-slate-500'}`}>
                Includes Study, Exam, and Bookmarks sessions (persisted to this browser).
              </p>
            </div>

            {weakAreas.length > 0 && (
              <div className={`mb-6 p-4 rounded-xl ${darkMode ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200'} border`}>
                <h3 className={`text-sm font-bold ${darkMode ? 'text-red-400' : 'text-red-700'} mb-3 flex items-center gap-2`}>
                  ⚠️ Weak Areas - Focus Here
                </h3>
                <div className="space-y-2">
                  {weakAreas.map((e) => (
                    <div key={e.sub} className="flex items-center justify-between">
                      <div className="flex-1">
                        <span className={`font-mono text-xs ${darkMode ? 'text-red-400' : 'text-red-600'} mr-2`}>{e.sub}</span>
                        <span className={`text-sm ${darkMode ? 'text-red-300' : 'text-red-800'}`}>{e.title}</span>
                        <span className={`ml-2 text-xs font-bold ${darkMode ? 'text-red-400' : 'text-red-600'}`}>({e.pct}%)</span>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedSubelement(e.sub);
                          startQuiz('study');
                        }}
                        className={`text-xs px-3 py-1 rounded-full font-semibold ${darkMode ? 'bg-red-800 text-red-200 hover:bg-red-700' : 'bg-red-100 text-red-700 hover:bg-red-200'}`}
                      >
                        Study
                      </button>
                    </div>
                  ))}
                </div>
                <p className={`text-xs ${darkMode ? 'text-red-400' : 'text-red-600'} mt-3`}>
                  These topics are below the 74% passing threshold. Focus your study time here!
                </p>
              </div>
            )}

            {strongAreas.length > 0 && (
              <div className={`mb-6 p-4 rounded-xl ${darkMode ? 'bg-green-900/20 border-green-800' : 'bg-green-50 border-green-200'} border`}>
                <h3 className={`text-sm font-bold ${darkMode ? 'text-green-400' : 'text-green-700'} mb-3 flex items-center gap-2`}>
                  ✓ Strong Areas
                </h3>
                <div className="space-y-1">
                  {strongAreas.map((e) => (
                    <div key={e.sub} className="flex items-center">
                      <span className={`font-mono text-xs ${darkMode ? 'text-green-400' : 'text-green-600'} mr-2`}>{e.sub}</span>
                      <span className={`text-sm ${darkMode ? 'text-green-300' : 'text-green-800'}`}>{e.title}</span>
                      <span className={`ml-2 text-xs font-bold ${darkMode ? 'text-green-400' : 'text-green-600'}`}>({e.pct}%)</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {needsMoreData.length > 0 && (
              <div className={`mb-6 p-4 rounded-xl ${darkMode ? 'bg-amber-900/20 border-amber-800' : 'bg-amber-50 border-amber-200'} border`}>
                <h3 className={`text-sm font-bold ${darkMode ? 'text-amber-400' : 'text-amber-700'} mb-3 flex items-center gap-2`}>
                  📝 Need More Practice
                </h3>
                <p className={`text-xs ${darkMode ? 'text-amber-400' : 'text-amber-600'} mb-2`}>
                  Answer at least 5 questions in these topics to get accuracy insights:
                </p>
                <div className="flex flex-wrap gap-2">
                  {needsMoreData.map((e) => (
                    <button
                      key={e.sub}
                      onClick={() => {
                        setSelectedSubelement(e.sub);
                        startQuiz('study');
                      }}
                      className={`text-xs px-3 py-1 rounded-full font-semibold ${darkMode ? 'bg-amber-800 text-amber-200 hover:bg-amber-700' : 'bg-amber-100 text-amber-700 hover:bg-amber-200'}`}
                    >
                      {e.sub} - {e.title} ({e.total}/5)
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        <h3 className={`text-sm font-bold ${darkMode ? 'text-slate-400' : 'text-slate-600'} mb-2 mt-4`}>
          Full Breakdown
        </h3>
        <div className={`border ${darkMode ? 'border-slate-700' : 'border-slate-100'} rounded-xl overflow-hidden text-sm`}>
          <div className={`grid grid-cols-4 ${darkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-50 text-slate-600'} px-3 py-2 font-semibold`}>
            <span>Sub</span>
            <span className="text-right">Seen</span>
            <span className="text-right">Correct</span>
            <span className="text-right">Accuracy</span>
          </div>
          {entries.map((e) => (
            <div
              key={e.sub}
              className={`grid grid-cols-4 px-3 py-2 border-t ${darkMode ? 'border-slate-700 text-slate-300' : 'border-slate-100 text-slate-700'}`}
            >
              <span className="font-mono">{e.sub}</span>
              <span className="text-right">{e.total}</span>
              <span className="text-right">{e.correct}</span>
              <span
                className={`text-right font-semibold ${
                  e.total === 0
                    ? 'text-slate-400'
                    : e.pct >= 74
                    ? 'text-green-600'
                    : 'text-red-500'
                }`}
              >
                {e.total === 0 ? '-' : `${e.pct}%`}
              </span>
            </div>
          ))}
        </div>

        <button
          onClick={() => setAppState('menu')}
          className={`w-full mt-6 py-3 rounded-lg font-bold transition ${darkMode ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-slate-800 hover:bg-slate-900 text-white'}`}
        >
          Back to Home
        </button>
      </div>
    </main>
  );
}