'use client';

import { Lesson } from '../types';

interface LessonViewProps {
  darkMode: boolean;
  currentLesson: Lesson;
  completed: boolean;
  lessons: Lesson[];
  markLessonCompleted: (id: string) => void;
  startQuizForSubelement: (subelement: string) => void;
  openLesson: (lesson: Lesson) => void;
  setAppState: (state: 'menu' | 'quiz' | 'results' | 'analytics' | 'learn' | 'lesson' | 'settings') => void;
}

export default function LessonView({
  currentLesson,
  completed,
  lessons,
  markLessonCompleted,
  startQuizForSubelement,
  openLesson,
  setAppState,
}: LessonViewProps) {
  const currentIndex = lessons.findIndex(l => l.id === currentLesson.id);
  const prevLesson = currentIndex > 0 ? lessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < lessons.length - 1 ? lessons[currentIndex + 1] : null;

  return (
    <main className="min-h-screen flex flex-col items-center p-4 sm:p-6 bg-slate-950">
      <div className="max-w-2xl w-full">

        {/* Header */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl shadow-black/50 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => setAppState('learn')} className="text-sm text-slate-400 hover:text-white transition-colors flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Topics
            </button>
            <span className="text-xs text-slate-500">~{currentLesson.estimatedMinutes} min read</span>
          </div>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-4xl">{currentLesson.icon}</span>
            <div>
              <span className="font-mono text-sm text-sky-400 bg-sky-950/50 px-2 py-0.5 rounded">{currentLesson.id}</span>
              {completed && <span className="ml-2 text-xs text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded">✓ Completed</span>}
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white">{currentLesson.title}</h1>
          <p className="text-slate-400">{currentLesson.subtitle}</p>
        </div>

        {/* Sections */}
        <div className="space-y-4">
          {currentLesson.sections.map((section, index) => (
            <div key={index} className="bg-slate-900 border border-slate-800 rounded-xl shadow-lg p-6">
              <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                <span className="text-sm font-mono text-sky-400 bg-sky-950/50 px-2 py-0.5 rounded">{index + 1}</span>
                {section.title}
              </h2>
              <p className="text-slate-300 leading-relaxed mb-4">{section.content}</p>
              <div className="bg-slate-800/80 border border-slate-700/50 p-4 rounded-lg">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">Key Facts</p>
                <ul className="space-y-2">
                  {section.keyFacts.map((fact, factIndex) => (
                    <li key={factIndex} className="flex items-start gap-2 text-sm text-slate-300">
                      <span className="text-emerald-400 mt-0.5 shrink-0">✓</span>
                      {fact}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* Exam tip */}
        <div className="bg-amber-950/30 border border-amber-900/40 p-5 rounded-xl mt-4">
          <p className="text-xs font-bold text-amber-400 uppercase tracking-wide mb-1">💡 Exam Tip</p>
          <p className="text-amber-300 text-sm">{currentLesson.examTip}</p>
        </div>

        {/* Actions */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-lg p-6 mt-4">
          <div className="flex flex-col sm:flex-row gap-3">
            {!completed && (
              <button
                onClick={() => markLessonCompleted(currentLesson.id)}
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition-colors"
              >
                ✓ Mark as Completed
              </button>
            )}
            <button
              onClick={() => startQuizForSubelement(currentLesson.id)}
              className="flex-1 py-3 bg-sky-600 hover:bg-sky-500 text-white rounded-xl font-bold transition-colors"
            >
              📝 Take Quiz ({currentLesson.questionCount} questions)
            </button>
          </div>
          <p className="text-xs text-slate-500 text-center mt-3">
            Test your knowledge on {currentLesson.title} questions
          </p>
        </div>

        {/* Prev/Next */}
        <div className="flex gap-3 mt-4">
          <button
            onClick={() => prevLesson && openLesson(prevLesson)}
            disabled={!prevLesson}
            className={`flex-1 py-3 px-4 rounded-xl font-semibold transition flex items-center justify-center gap-2 ${
              prevLesson ? 'bg-slate-800 hover:bg-slate-700 text-white' : 'bg-slate-900 text-slate-700 cursor-not-allowed'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-sm">{prevLesson ? `${prevLesson.id}: ${prevLesson.title}` : 'No previous'}</span>
          </button>
          <button
            onClick={() => nextLesson && openLesson(nextLesson)}
            disabled={!nextLesson}
            className={`flex-1 py-3 px-4 rounded-xl font-semibold transition flex items-center justify-center gap-2 ${
              nextLesson ? 'bg-slate-800 hover:bg-slate-700 text-white' : 'bg-slate-900 text-slate-700 cursor-not-allowed'
            }`}
          >
            <span className="text-sm">{nextLesson ? `${nextLesson.id}: ${nextLesson.title}` : 'No next'}</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </main>
  );
}
