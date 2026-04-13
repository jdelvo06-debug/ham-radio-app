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
  darkMode,
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
    <main className={`min-h-screen flex flex-col items-center p-6 ${darkMode ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-900'}`}>
      <div className="max-w-2xl w-full">
        <div className={`${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} p-6 rounded-2xl shadow-xl border mb-6`}>
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setAppState('learn')}
              className={`text-sm ${darkMode ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-700'} flex items-center gap-1`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Topics
            </button>
            <span className={`text-xs ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
              ~{currentLesson.estimatedMinutes} min read
            </span>
          </div>

          <div className="flex items-center gap-3 mb-2">
            <span className="text-4xl">{currentLesson.icon}</span>
            <div>
              <span className={`font-mono text-sm ${darkMode ? 'text-blue-400 bg-blue-900/50' : 'text-blue-500 bg-blue-50'} px-2 py-0.5 rounded`}>
                {currentLesson.id}
              </span>
              {completed && (
                <span className={`ml-2 text-xs ${darkMode ? 'text-emerald-400 bg-emerald-900/50' : 'text-emerald-600 bg-emerald-50'} px-2 py-0.5 rounded`}>
                  ✓ Completed
                </span>
              )}
            </div>
          </div>
          <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-slate-800'}`}>{currentLesson.title}</h1>
          <p className={darkMode ? 'text-slate-400' : 'text-slate-500'}>{currentLesson.subtitle}</p>
        </div>

        <div className="space-y-4">
          {currentLesson.sections.map((section, index) => (
            <div key={index} className={`${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} p-6 rounded-xl shadow-md border`}>
              <h2 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-slate-800'} mb-3 flex items-center gap-2`}>
                <span className={`text-sm font-mono ${darkMode ? 'text-blue-400 bg-blue-900/50' : 'text-blue-500 bg-blue-50'} px-2 py-0.5 rounded`}>
                  {index + 1}
                </span>
                {section.title}
              </h2>
              <p className={`${darkMode ? 'text-slate-300' : 'text-slate-700'} leading-relaxed mb-4`}>{section.content}</p>

              <div className={`${darkMode ? 'bg-slate-700 border-slate-600' : 'bg-slate-50 border-slate-100'} p-4 rounded-lg border`}>
                <p className={`text-xs font-bold ${darkMode ? 'text-slate-400' : 'text-slate-500'} uppercase tracking-wide mb-2`}>
                  Key Facts
                </p>
                <ul className="space-y-2">
                  {section.keyFacts.map((fact, factIndex) => (
                    <li key={factIndex} className={`flex items-start gap-2 text-sm ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                      <span className="text-emerald-500 mt-0.5">✓</span>
                      {fact}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        <div className={`${darkMode ? 'bg-amber-900/30 border-amber-800' : 'bg-amber-50 border-amber-200'} p-5 rounded-xl border mt-4`}>
          <p className={`text-xs font-bold ${darkMode ? 'text-amber-400' : 'text-amber-600'} uppercase tracking-wide mb-1`}>
            💡 Exam Tip
          </p>
          <p className={`${darkMode ? 'text-amber-300' : 'text-amber-800'} text-sm`}>{currentLesson.examTip}</p>
        </div>

        <div className={`${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} p-6 rounded-xl shadow-md border mt-4`}>
          <div className="flex flex-col sm:flex-row gap-3">
            {!completed && (
              <button
                onClick={() => markLessonCompleted(currentLesson.id)}
                className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-bold transition"
              >
                ✓ Mark as Completed
              </button>
            )}
            <button
              onClick={() => startQuizForSubelement(currentLesson.id)}
              className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition"
            >
              📝 Take Quiz ({currentLesson.questionCount} questions)
            </button>
          </div>
          <p className={`text-xs ${darkMode ? 'text-slate-500' : 'text-slate-400'} text-center mt-3`}>
            Test your knowledge on {currentLesson.title} questions
          </p>
        </div>

        <div className={`flex gap-3 mt-4`}>
          <button
            onClick={() => prevLesson && openLesson(prevLesson)}
            disabled={!prevLesson}
            className={`flex-1 py-3 px-4 rounded-xl font-semibold transition flex items-center justify-center gap-2 ${
              prevLesson
                ? (darkMode ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-700')
                : (darkMode ? 'bg-slate-800 text-slate-600 cursor-not-allowed' : 'bg-slate-50 text-slate-300 cursor-not-allowed')
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-sm">
              {prevLesson ? `${prevLesson.id}: ${prevLesson.title}` : 'No previous'}
            </span>
          </button>
          <button
            onClick={() => nextLesson && openLesson(nextLesson)}
            disabled={!nextLesson}
            className={`flex-1 py-3 px-4 rounded-xl font-semibold transition flex items-center justify-center gap-2 ${
              nextLesson
                ? (darkMode ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-700')
                : (darkMode ? 'bg-slate-800 text-slate-600 cursor-not-allowed' : 'bg-slate-50 text-slate-300 cursor-not-allowed')
            }`}
          >
            <span className="text-sm">
              {nextLesson ? `${nextLesson.id}: ${nextLesson.title}` : 'No next'}
            </span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </main>
  );
}