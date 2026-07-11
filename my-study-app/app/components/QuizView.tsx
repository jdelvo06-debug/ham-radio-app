'use client';

import { Question, Mode, SpacedRepData } from '../types';
import QuestionFigure from './QuestionFigure';

interface QuizViewProps {
  darkMode: boolean;
  mode: Mode;
  selectedSubelement: 'ALL' | string;
  activeQuestions: Question[];
  currentQuestionIndex: number;
  selectedAnswer: string | null;
  showExplanation: boolean;
  isBookmarked: (id: string) => boolean;
  toggleBookmark: (id: string) => void;
  spacedRepData: Record<string, SpacedRepData>;
  handleAnswerClick: (option: string) => void;
  handleNextQuestion: () => void;
  isAnswerCorrect: (optionIndex: number, correctAnswer: string) => boolean;
  setAppState: (state: 'menu' | 'quiz' | 'results' | 'analytics' | 'learn' | 'lesson' | 'settings') => void;
}

export default function QuizView({
  darkMode,
  mode,
  selectedSubelement,
  activeQuestions,
  currentQuestionIndex,
  selectedAnswer,
  showExplanation,
  isBookmarked,
  toggleBookmark,
  spacedRepData,
  handleAnswerClick,
  handleNextQuestion,
  isAnswerCorrect,
  setAppState,
}: QuizViewProps) {
  const currentQuestion = activeQuestions[currentQuestionIndex];
  const progress = activeQuestions.length
    ? ((currentQuestionIndex + 1) / activeQuestions.length) * 100
    : 0;
  const currentBookmarked = isBookmarked(currentQuestion.id);

  const modeLabel =
    mode === 'exam' ? 'Practice Exam' : mode === 'bookmarks' ? 'Bookmarks' : mode === 'review' ? 'Review Mode' : 'Study Mode';

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-3 sm:p-4 bg-slate-950">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl shadow-black/50 p-5 sm:p-8">

        {/* Top bar */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <div>
              <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">
                {modeLabel}
              </span>
              <div className="text-xs text-slate-500 mt-0.5">
                {mode === 'exam'
                  ? 'Official 35-group blueprint'
                  : selectedSubelement === 'ALL'
                  ? 'All subelements'
                  : `Subelement ${selectedSubelement}`}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => toggleBookmark(currentQuestion.id)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                  currentBookmarked
                    ? 'border-amber-700 bg-amber-900/30 text-amber-400'
                    : 'border-slate-700 bg-slate-800 text-slate-500 hover:border-slate-600'
                }`}
              >
                {currentBookmarked ? '★ Bookmarked' : '☆ Bookmark'}
              </button>
              <span className="text-sm font-semibold text-slate-400 tabular-nums">
                {currentQuestionIndex + 1}<span className="text-slate-600"> / </span>{activeQuestions.length}
              </span>
            </div>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-sky-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question */}
        <h2 className="text-lg sm:text-xl font-bold text-white mb-8 leading-relaxed">
          <span className="text-sky-400 mr-2 text-sm font-mono align-top">
            [{currentQuestion.id}]
          </span>
          {currentQuestion.question}
        </h2>

        {currentQuestion.figure && (
          <QuestionFigure questionId={currentQuestion.id} figure={currentQuestion.figure} eager />
        )}

        {/* Answer options */}
        <div className="space-y-3">
          {currentQuestion.options.map((option, index) => {
            const isSelected = selectedAnswer === option;
            const isCorrect = isAnswerCorrect(index, currentQuestion.correctAnswer);

            let buttonClasses =
              'border-slate-700 hover:border-sky-600 hover:bg-slate-800 text-slate-300';
            let icon: React.ReactNode = null;

            if ((mode === 'study' || mode === 'bookmarks' || mode === 'review') && showExplanation) {
              if (isCorrect) {
                buttonClasses = 'bg-emerald-600/80 border-emerald-500 text-white ring-2 ring-emerald-500/50';
                icon = <span className="mr-2 text-xl">✓</span>;
              } else if (isSelected && !isCorrect) {
                buttonClasses = 'bg-rose-600/80 border-rose-500 text-white ring-2 ring-rose-500/50';
                icon = <span className="mr-2 text-xl">✗</span>;
              } else {
                buttonClasses = 'border-slate-800 opacity-40 text-slate-600';
              }
            } else if (isSelected) {
              buttonClasses = 'bg-sky-600 border-sky-500 text-white shadow-md shadow-sky-900/30 scale-[1.01]';
            }

            return (
              <button
                key={index}
                onClick={() => handleAnswerClick(option)}
                disabled={(mode === 'study' || mode === 'bookmarks' || mode === 'review') && showExplanation}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 font-medium flex items-center ${buttonClasses}`}
              >
                {icon}
                {option}
              </button>
            );
          })}
        </div>

        {/* Footer: explanation + actions */}
        <div className="mt-8 pt-6 border-t border-slate-800">
          {(mode === 'study' || mode === 'bookmarks' || mode === 'review') && showExplanation && (
            <div className="bg-sky-950/40 border border-sky-900/50 text-sky-200 p-4 rounded-xl mb-6">
              <p className="font-bold text-xs uppercase tracking-wide text-sky-400 mb-1">
                Explanation
              </p>
              <p className="text-sm leading-relaxed">{currentQuestion.explanation}</p>
              {mode === 'review' && (
                <div className="mt-3 pt-3 border-t border-sky-900/40">
                  <p className="text-xs text-sky-400">
                    {spacedRepData[currentQuestion.id]?.correctStreak === 3
                      ? "🎉 Mastered! This question won't appear in reviews anymore."
                      : spacedRepData[currentQuestion.id]?.correctStreak === 2
                      ? '⭐ One more correct answer to master this question!'
                      : spacedRepData[currentQuestion.id]?.correctStreak === 1
                      ? '📈 Good progress! 2 more correct answers to master.'
                      : '🔄 Keep practicing! Get it right 3 times to master.'}
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end gap-3">
            <button
              onClick={() => setAppState('menu')}
              className="px-4 py-2 text-slate-500 hover:text-rose-400 text-sm font-semibold transition-colors"
            >
              Quit
            </button>

            {(((mode === 'study' || mode === 'bookmarks' || mode === 'review') && showExplanation) ||
              (mode === 'exam' && selectedAnswer)) && (
              <button
                onClick={handleNextQuestion}
                className="px-8 py-3 bg-sky-600 hover:bg-sky-500 text-white rounded-xl font-bold shadow-lg shadow-sky-900/30 transition-all active:scale-[0.98]"
              >
                {currentQuestionIndex + 1 === activeQuestions.length
                  ? 'Finish'
                  : 'Next Question →'}
              </button>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
