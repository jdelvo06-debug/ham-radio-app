'use client';

import { Lesson, GlobalSubelementStats } from '../types';

interface AnalyticsViewProps {
  subelements: string[];
  lessons: Lesson[];
  globalStats: Record<string, GlobalSubelementStats>;
  startQuizForSubelement: (subelement: string) => void;
  setAppState: (state: 'menu' | 'quiz' | 'results' | 'analytics' | 'learn' | 'lesson' | 'settings') => void;
}

export default function AnalyticsView({
  subelements,
  lessons,
  globalStats,
  startQuizForSubelement,
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

  const weakAreas = entries.filter(e => e.total >= 5 && e.pct < 74).sort((a, b) => a.pct - b.pct);
  const strongAreas = entries.filter(e => e.total >= 5 && e.pct >= 74).sort((a, b) => b.pct - a.pct);
  const needsMoreData = entries.filter(e => e.total < 5);

  return (
    <main className="min-h-screen flex flex-col items-center p-4 sm:p-6 bg-slate-950">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl shadow-black/50 p-6 sm:p-8">
        <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">📊 Analytics</h2>

        {overallTotal === 0 ? (
          <p className="text-sm text-slate-400 mb-6">
            No data yet. Do some Study, Exams, or Bookmark sessions to build analytics.
          </p>
        ) : (
          <>
            <div className="mb-6 text-sm text-slate-300">
              <p className="font-semibold">Overall: {overallCorrect}/{overallTotal} correct ({overallPct}%)</p>
              <p className="text-xs text-slate-500">Includes Study, Exam, and Bookmarks sessions (persisted to this browser).</p>
            </div>

            {weakAreas.length > 0 && (
              <div className="mb-6 p-4 rounded-xl bg-rose-950/30 border border-rose-900/50">
                <h3 className="text-sm font-bold text-rose-400 mb-3 flex items-center gap-2">⚠️ Weak Areas - Focus Here</h3>
                <div className="space-y-2">
                  {weakAreas.map((e) => (
                    <div key={e.sub} className="flex items-center justify-between">
                      <div className="flex-1">
                        <span className="font-mono text-xs text-rose-400 mr-2">{e.sub}</span>
                        <span className="text-sm text-rose-300">{e.title}</span>
                        <span className="ml-2 text-xs font-bold text-rose-400">({e.pct}%)</span>
                      </div>
                      <button
                        onClick={() => startQuizForSubelement(e.sub)}
                        className="text-xs px-3 py-1 rounded-full font-semibold bg-rose-900/60 text-rose-300 hover:bg-rose-800 transition-colors"
                      >
                        Study
                      </button>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-rose-400 mt-3">These topics are below the 74% passing threshold. Focus your study time here!</p>
              </div>
            )}

            {strongAreas.length > 0 && (
              <div className="mb-6 p-4 rounded-xl bg-emerald-950/30 border border-emerald-900/50">
                <h3 className="text-sm font-bold text-emerald-400 mb-3 flex items-center gap-2">✓ Strong Areas</h3>
                <div className="space-y-1">
                  {strongAreas.map((e) => (
                    <div key={e.sub} className="flex items-center">
                      <span className="font-mono text-xs text-emerald-400 mr-2">{e.sub}</span>
                      <span className="text-sm text-emerald-300">{e.title}</span>
                      <span className="ml-2 text-xs font-bold text-emerald-400">({e.pct}%)</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {needsMoreData.length > 0 && (
              <div className="mb-6 p-4 rounded-xl bg-amber-950/30 border border-amber-900/50">
                <h3 className="text-sm font-bold text-amber-400 mb-3 flex items-center gap-2">📝 Need More Practice</h3>
                <p className="text-xs text-amber-400 mb-2">Answer at least 5 questions in these topics to get accuracy insights:</p>
                <div className="flex flex-wrap gap-2">
                  {needsMoreData.map((e) => (
                    <button
                      key={e.sub}
                      onClick={() => startQuizForSubelement(e.sub)}
                      className="text-xs px-3 py-1 rounded-full font-semibold bg-amber-900/60 text-amber-300 hover:bg-amber-800 transition-colors"
                    >
                      {e.sub} - {e.title} ({e.total}/5)
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        <h3 className="text-sm font-bold text-slate-400 mb-2 mt-4">Full Breakdown</h3>
        <div className="border border-slate-800 rounded-xl overflow-hidden text-sm">
          <div className="grid grid-cols-4 bg-slate-800 text-slate-400 px-3 py-2 font-semibold">
            <span>Sub</span><span className="text-right">Seen</span><span className="text-right">Correct</span><span className="text-right">Accuracy</span>
          </div>
          {entries.map((e) => (
            <div key={e.sub} className="grid grid-cols-4 px-3 py-2 border-t border-slate-800 text-slate-300">
              <span className="font-mono">{e.sub}</span>
              <span className="text-right">{e.total}</span>
              <span className="text-right">{e.correct}</span>
              <span className={`text-right font-semibold ${e.total === 0 ? 'text-slate-600' : e.pct >= 74 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {e.total === 0 ? '-' : `${e.pct}%`}
              </span>
            </div>
          ))}
        </div>

        <button
          onClick={() => setAppState('menu')}
          className="w-full mt-6 py-3 bg-sky-600 hover:bg-sky-500 text-white rounded-xl font-bold shadow-lg shadow-sky-900/30 transition-all active:scale-[0.98]"
        >
          Back to Home
        </button>
      </div>
    </main>
  );
}
