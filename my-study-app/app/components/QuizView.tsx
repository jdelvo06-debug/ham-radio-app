'use client';

import { Question, Mode, SpacedRepData } from '../types';

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
    <main className={`min-h-screen flex flex-col items-center justify-center p-4 ${darkMode ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-900'}`}>
      <div className={`max-w-2xl w-full ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} p-6 rounded-2xl shadow-xl border`}>

        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <div>
              <span className={`text-sm font-bold ${darkMode ? 'text-slate-500' : 'text-slate-400'} uppercase tracking-wider`}>
                {modeLabel}
              </span>
              <div className={`text-xs ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                {selectedSubelement === 'ALL'
                  ? 'All subelements'
                  : `Subelement ${selectedSubelement}`}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => toggleBookmark(currentQuestion.id)}
                className={`text-xs px-3 py-1 rounded-full border ${
                  currentBookmarked
                    ? (darkMode ? 'border-amber-700 bg-amber-900/30 text-amber-400' : 'border-amber-400 bg-amber-50 text-amber-700')
                    : (darkMode ? 'border-slate-600 bg-slate-700 text-slate-400' : 'border-slate-200 bg-slate-50 text-slate-500')
                } ${darkMode ? 'hover:bg-amber-900/50' : 'hover:bg-amber-100'}`}
              >
                {currentBookmarked ? '★ Bookmarked' : '☆ Bookmark'}
              </button>
              <span className={`text-sm font-semibold ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                {currentQuestionIndex + 1} / {activeQuestions.length}
              </span>
            </div>
          </div>
          <div className={`w-full ${darkMode ? 'bg-slate-700' : 'bg-slate-100'} h-2 rounded-full overflow-hidden`}>
            <div
              className="bg-blue-500 h-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        <h2 className={`text-xl font-bold mb-8 ${darkMode ? 'text-white' : 'text-slate-800'} leading-relaxed`}>
          <span className="text-blue-500 mr-2 text-sm font-mono align-top">
            [{currentQuestion.id}]
          </span>
          {currentQuestion.question}
        </h2>

        <div className="space-y-3">
          {currentQuestion.options.map((option, index) => {
            const isSelected = selectedAnswer === option;
            const isCorrect = isAnswerCorrect(index, currentQuestion.correctAnswer);

            let buttonStyle = darkMode
              ? 'border-slate-600 hover:border-blue-500 hover:bg-slate-700'
              : 'border-slate-200 hover:border-blue-400 hover:bg-blue-50';
            let icon: React.ReactNode = null;

            if ((mode === 'study' || mode === 'bookmarks' || mode === 'review') && showExplanation) {
              if (isCorrect) {
                buttonStyle =
                  'bg-green-500 border-green-600 text-white ring-2 ring-green-600';
                icon = <span className="mr-2 text-xl">✓</span>;
              } else if (isSelected && !isCorrect) {
                buttonStyle = 'bg-red-500 border-red-600 text-white ring-2 ring-red-600';
                icon = <span className="mr-2 text-xl">✗</span>;
              } else {
                buttonStyle = darkMode ? 'opacity-50 border-slate-700' : 'opacity-50 border-slate-100';
              }
            } else if (isSelected) {
              buttonStyle =
                'bg-blue-600 border-blue-600 text-white shadow-md transform scale-[1.01]';
            }

            return (
              <button
                key={index}
                onClick={() => handleAnswerClick(option)}
                disabled={(mode === 'study' || mode === 'bookmarks' || mode === 'review') && showExplanation}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 font-medium flex items-center ${buttonStyle}`}
              >
                {icon}
                {option}
              </button>
            );
          })}
        </div>

        <div className={`mt-8 pt-6 border-t ${darkMode ? 'border-slate-700' : 'border-slate-100'}`}>
          {(mode === 'study' || mode === 'bookmarks' || mode === 'review') && showExplanation && (
            <div className={`${darkMode ? 'bg-blue-900/30 border-blue-800 text-blue-200' : 'bg-blue-50 border-blue-100 text-blue-900'} p-4 rounded-lg border mb-6`}>
              <p className={`font-bold text-xs uppercase tracking-wide ${darkMode ? 'text-blue-400' : 'text-blue-400'} mb-1`}>
                Explanation
              </p>
              <p>{currentQuestion.explanation}</p>
              {mode === 'review' && (
                <div className={`mt-3 pt-3 border-t ${darkMode ? 'border-blue-700' : 'border-blue-200'}`}>
                  <p className={`text-xs ${darkMode ? 'text-blue-400' : 'text-blue-500'}`}>
                    {spacedRepData[currentQuestion.id]?.correctStreak === 3
                      ? '🎉 Mastered! This question won\'t appear in reviews anymore.'
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
              className={`px-4 py-2 ${darkMode ? 'text-slate-500 hover:text-red-400' : 'text-slate-400 hover:text-red-500'} text-sm font-semibold`}
            >
              Quit
            </button>

            {(((mode === 'study' || mode === 'bookmarks' || mode === 'review') && showExplanation) ||
              (mode === 'exam' && selectedAnswer)) && (
              <button
                onClick={handleNextQuestion}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold shadow-lg transition-transform active:scale-95"
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