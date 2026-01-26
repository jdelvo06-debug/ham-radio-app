'use client';

import { useEffect, useState } from 'react';
import questionsData from './ham_radio_questions.json';
import lessonsData from './lessons.json';

// Define the shape of a Question
interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

// For per-subelement stats (per EXAM session)
interface SubelementStats {
  correct: number;
  total: number;
}

// For global analytics (all modes, all sessions this load)
interface GlobalSubelementStats {
  correct: number;
  total: number;
}

// Define the shape of a Lesson Section
interface LessonSection {
  title: string;
  content: string;
  keyFacts: string[];
}

// Define the shape of a Lesson
interface Lesson {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  estimatedMinutes: number;
  sections: LessonSection[];
  examTip: string;
  questionCount: number;
}

// Lessons data structure
interface LessonsFile {
  lessons: Lesson[];
}

// Spaced repetition data for each question
interface SpacedRepData {
  questionId: string;
  correctStreak: number;      // consecutive correct answers (0-3)
  lastAnswered: number;       // timestamp
  nextReviewDate: number;     // timestamp when due for review
  timesAnswered: number;      // total times seen
  timesCorrect: number;       // total times correct
}

type AppState = 'menu' | 'quiz' | 'results' | 'analytics' | 'learn' | 'lesson';
type Mode = 'study' | 'exam' | 'bookmarks' | 'review';

const LS_BOOKMARKS_KEY = 'ham_technician_bookmarks';
const LS_GLOBAL_STATS_KEY = 'ham_technician_global_stats';
const LS_COMPLETED_LESSONS_KEY = 'ham_technician_completed_lessons';
const LS_SPACED_REP_KEY = 'ham_technician_spaced_rep';

// Spaced repetition intervals (in milliseconds)
// Simple system: miss = review soon, correct streak increases interval
const REVIEW_INTERVALS = {
  0: 0,                    // Just missed - review immediately available
  1: 1 * 60 * 60 * 1000,   // 1 hour after first correct
  2: 24 * 60 * 60 * 1000,  // 1 day after second correct
  3: 7 * 24 * 60 * 60 * 1000, // 7 days after third correct (mastered)
};

export default function Home() {
  // App state
  const [appState, setAppState] = useState<AppState>('menu');
  const [mode, setMode] = useState<Mode>('study');

  // Question navigation
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [activeQuestions, setActiveQuestions] = useState<Question[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  // Scoring & stats (per session)
  const [score, setScore] = useState(0);
  const [missedQuestions, setMissedQuestions] = useState<Question[]>([]);
  const [subelementStats, setSubelementStats] = useState<Record<string, SubelementStats>>({});

  // Global analytics (across all sessions, persisted)
  const [globalStats, setGlobalStats] = useState<Record<string, GlobalSubelementStats>>({});

  // Subelement filter (T0, T1, etc.)
  const [selectedSubelement, setSelectedSubelement] = useState<'ALL' | string>('ALL');

  // Bookmarked question IDs (persisted)
  const [bookmarks, setBookmarks] = useState<string[]>([]);

  // Current lesson being viewed
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);

  // Completed lessons (persisted)
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);

  // Spaced repetition data (persisted)
  const [spacedRepData, setSpacedRepData] = useState<Record<string, SpacedRepData>>({});

  // ---------- LOCALSTORAGE LOAD ----------
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const savedBookmarks = window.localStorage.getItem(LS_BOOKMARKS_KEY);
      if (savedBookmarks) {
        setBookmarks(JSON.parse(savedBookmarks));
      }
    } catch {
      // ignore parse errors
    }

    try {
      const savedStats = window.localStorage.getItem(LS_GLOBAL_STATS_KEY);
      if (savedStats) {
        setGlobalStats(JSON.parse(savedStats));
      }
    } catch {
      // ignore parse errors
    }

    try {
      const savedCompletedLessons = window.localStorage.getItem(LS_COMPLETED_LESSONS_KEY);
      if (savedCompletedLessons) {
        setCompletedLessons(JSON.parse(savedCompletedLessons));
      }
    } catch {
      // ignore parse errors
    }

    try {
      const savedSpacedRep = window.localStorage.getItem(LS_SPACED_REP_KEY);
      if (savedSpacedRep) {
        setSpacedRepData(JSON.parse(savedSpacedRep));
      }
    } catch {
      // ignore parse errors
    }
  }, []);

  // ---------- HELPERS ----------

  // Get unique subelements (T0, T1, T2...) from all questions
  const getAvailableSubelements = (): string[] => {
    const set = new Set<string>();
    (questionsData as Question[]).forEach((q) => {
      const match = q.id.match(/^(T\d)/); // e.g. T0, T1, T2
      if (match) set.add(match[1]);
    });
    return Array.from(set).sort(); // ["T0", "T1", ...]
  };

  const subelements = getAvailableSubelements();

  // Get all lessons
  const lessons = (lessonsData as LessonsFile).lessons;

  // Check if a lesson is completed
  const isLessonCompleted = (id: string): boolean => completedLessons.includes(id);

  // Mark a lesson as completed (and persist)
  const markLessonCompleted = (id: string) => {
    setCompletedLessons((prev) => {
      if (prev.includes(id)) return prev;
      const next = [...prev, id];
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(LS_COMPLETED_LESSONS_KEY, JSON.stringify(next));
      }
      return next;
    });
  };

  // Open a specific lesson
  const openLesson = (lesson: Lesson) => {
    setCurrentLesson(lesson);
    setAppState('lesson');
  };

  // ---------- SPACED REPETITION HELPERS ----------

  // Update spaced rep data after answering a question
  const updateSpacedRepetition = (questionId: string, wasCorrect: boolean) => {
    setSpacedRepData((prev) => {
      const now = Date.now();
      const existing = prev[questionId];

      let newData: SpacedRepData;

      if (wasCorrect) {
        // Correct answer: increase streak, push out next review
        const newStreak = Math.min((existing?.correctStreak ?? 0) + 1, 3);
        const interval = REVIEW_INTERVALS[newStreak as keyof typeof REVIEW_INTERVALS] ?? REVIEW_INTERVALS[3];
        newData = {
          questionId,
          correctStreak: newStreak,
          lastAnswered: now,
          nextReviewDate: now + interval,
          timesAnswered: (existing?.timesAnswered ?? 0) + 1,
          timesCorrect: (existing?.timesCorrect ?? 0) + 1,
        };
      } else {
        // Wrong answer: reset streak, review soon
        newData = {
          questionId,
          correctStreak: 0,
          lastAnswered: now,
          nextReviewDate: now, // Available for review immediately
          timesAnswered: (existing?.timesAnswered ?? 0) + 1,
          timesCorrect: existing?.timesCorrect ?? 0,
        };
      }

      const next = { ...prev, [questionId]: newData };
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(LS_SPACED_REP_KEY, JSON.stringify(next));
      }
      return next;
    });
  };

  // Get questions that are due for review (nextReviewDate <= now and not mastered)
  const getDueReviewQuestions = (subelement?: string): Question[] => {
    const now = Date.now();
    const allQuestions = questionsData as Question[];

    return allQuestions.filter((q) => {
      // Filter by subelement if specified
      if (subelement && !q.id.startsWith(subelement)) return false;

      const data = spacedRepData[q.id];
      if (!data) return false; // Never answered, not in review system

      // Include if: due for review AND not mastered (streak < 3)
      return data.nextReviewDate <= now && data.correctStreak < 3;
    });
  };

  // Get count of due reviews (for display)
  const getDueReviewCount = (subelement?: string): number => {
    return getDueReviewQuestions(subelement).length;
  };

  // Get count of mastered questions (streak = 3)
  const getMasteredCount = (subelement?: string): number => {
    const allQuestions = questionsData as Question[];
    return allQuestions.filter((q) => {
      if (subelement && !q.id.startsWith(subelement)) return false;
      const data = spacedRepData[q.id];
      return data && data.correctStreak >= 3;
    }).length;
  };

  // Start review mode
  const startReviewMode = (subelement?: string) => {
    const dueQuestions = getDueReviewQuestions(subelement);

    if (dueQuestions.length === 0) {
      alert('No questions due for review! Keep studying to add questions to review.');
      return;
    }

    setMode('review');
    setAppState('quiz');
    setCurrentQuestionIndex(0);
    setScore(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setMissedQuestions([]);
    setSubelementStats({});
    setSelectedSubelement(subelement ?? 'ALL');

    // Shuffle and limit to reasonable session size
    const shuffled = [...dueQuestions].sort(() => 0.5 - Math.random());
    const limited = shuffled.slice(0, Math.min(20, shuffled.length)); // Max 20 per session
    setActiveQuestions(limited);
  };

  // Start quiz for a specific subelement (from lesson view)
  const startQuizForSubelement = (subelement: string) => {
    setSelectedSubelement(subelement);
    setMode('study');
    setAppState('quiz');
    setCurrentQuestionIndex(0);
    setScore(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setMissedQuestions([]);
    setSubelementStats({});

    const allQuestions = questionsData as Question[];
    const pool = allQuestions.filter((q) => q.id.startsWith(subelement));

    if (!pool.length) {
      alert('No questions found for this topic.');
      setAppState('lesson');
      return;
    }

    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    setActiveQuestions(shuffled);
  };

  // Extract subelement from question ID, e.g. "T0A01" -> "T0"
  const getSubelementFromId = (id: string): string => {
    const match = id.match(/^(T\d)/);
    return match ? match[1] : 'UNK';
  };

  // Is this question bookmarked?
  const isBookmarked = (id: string): boolean => bookmarks.includes(id);

  // Toggle bookmark for a question (and persist)
  const toggleBookmark = (id: string) => {
    setBookmarks((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(LS_BOOKMARKS_KEY, JSON.stringify(next));
      }
      return next;
    });
  };

  // Map option index (0,1,2,3) -> letter (A,B,C,D) and compare to correctAnswer
  const isAnswerCorrect = (optionIndex: number, correctAnswer: string): boolean => {
    const letters = ['A', 'B', 'C', 'D'];
    const optionLetter = letters[optionIndex] ?? '';
    return optionLetter.toUpperCase() === correctAnswer.trim().toUpperCase();
  };

  // Update global analytics (all modes) and persist
  const updateGlobalStats = (question: Question, wasCorrect: boolean) => {
    const sub = getSubelementFromId(question.id);
    setGlobalStats((prev) => {
      const prevStats = prev[sub] ?? { correct: 0, total: 0 };
      const next = {
        ...prev,
        [sub]: {
          correct: prevStats.correct + (wasCorrect ? 1 : 0),
          total: prevStats.total + 1,
        },
      };
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(LS_GLOBAL_STATS_KEY, JSON.stringify(next));
      }
      return next;
    });
  };

  // Build a question pool given:
  // - base source: all questions or only bookmarks
  // - current subelement filter
  const buildQuestionPool = (source: 'all' | 'bookmarks'): Question[] => {
    const allQuestions = questionsData as Question[];
    const base =
      source === 'bookmarks'
        ? allQuestions.filter((q) => bookmarks.includes(q.id))
        : allQuestions;

    if (selectedSubelement === 'ALL') return base;
    return base.filter((q) => q.id.startsWith(selectedSubelement));
  };

  // Initialize a session based on mode and bookmarks
  const startQuiz = (selectedMode: Mode) => {
    setMode(selectedMode);
    setAppState('quiz');
    setCurrentQuestionIndex(0);
    setScore(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setMissedQuestions([]);
    setSubelementStats({});

    const source: 'all' | 'bookmarks' = selectedMode === 'bookmarks' ? 'bookmarks' : 'all';
    const pool = buildQuestionPool(source);

    if (selectedMode === 'bookmarks' && pool.length === 0) {
      alert('No bookmarked questions match this subelement filter.');
      setAppState('menu');
      return;
    }

    if (!pool.length) {
      alert('No questions match this subelement filter.');
      setAppState('menu');
      return;
    }

    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    const limit = selectedMode === 'exam' ? Math.min(35, shuffled.length) : shuffled.length;
    setActiveQuestions(shuffled.slice(0, limit));
  };

  // Start a retry session using only missed questions (Study-mode behavior)
  const startRetryMissed = () => {
    if (!missedQuestions.length) return;

    setMode('study'); // behave like study: instant feedback
    setAppState('quiz');
    setCurrentQuestionIndex(0);
    setScore(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setSubelementStats({});

    // Filter missed by subelement if desired
    const filtered =
      selectedSubelement === 'ALL'
        ? missedQuestions
        : missedQuestions.filter((q) => q.id.startsWith(selectedSubelement));

    const shuffled = [...filtered].sort(() => 0.5 - Math.random());
    setActiveQuestions(shuffled);
  };

  const handleAnswerClick = (option: string) => {
    // Study/Bookmarks/Review: don't allow changing after explanation
    if ((mode === 'study' || mode === 'bookmarks' || mode === 'review') && showExplanation) return;

    setSelectedAnswer(option);

    // Study, Bookmarks & Review modes: immediate feedback & scoring
    if (mode === 'study' || mode === 'bookmarks' || mode === 'review') {
      setShowExplanation(true);
      const currentQ = activeQuestions[currentQuestionIndex];
      const optionIndex = currentQ.options.indexOf(option);
      const wasCorrect =
        optionIndex !== -1 && isAnswerCorrect(optionIndex, currentQ.correctAnswer);

      if (wasCorrect) {
        setScore((prev) => prev + 1);
      }
      updateGlobalStats(currentQ, wasCorrect);

      // Update spaced repetition data for all modes except exam
      updateSpacedRepetition(currentQ.id, wasCorrect);
    }
  };

  const handleNextQuestion = () => {
    if (!activeQuestions.length) return;
    const currentQ = activeQuestions[currentQuestionIndex];

    // Exam mode: score and record when advancing
    if (mode === 'exam' && selectedAnswer) {
      const optionIndex = currentQ.options.indexOf(selectedAnswer);
      const wasCorrect =
        optionIndex !== -1 && isAnswerCorrect(optionIndex, currentQ.correctAnswer);

      const sub = getSubelementFromId(currentQ.id);

      if (wasCorrect) {
        setScore((prev) => prev + 1);
      } else {
        // Track missed question
        setMissedQuestions((prev) => {
          if (prev.find((q) => q.id === currentQ.id)) return prev;
          return [...prev, currentQ];
        });
      }

      // Per-exam subelement stats
      setSubelementStats((prev) => {
        const prevStats = prev[sub] ?? { correct: 0, total: 0 };
        return {
          ...prev,
          [sub]: {
            correct: prevStats.correct + (wasCorrect ? 1 : 0),
            total: prevStats.total + 1,
          },
        };
      });

      // Global analytics
      updateGlobalStats(currentQ, wasCorrect);

      // Update spaced repetition for exam mode too
      updateSpacedRepetition(currentQ.id, wasCorrect);
    }

    const nextIndex = currentQuestionIndex + 1;

    if (nextIndex < activeQuestions.length) {
      setCurrentQuestionIndex(nextIndex);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      setAppState('results');
    }
  };

  // ---------- RENDER: MENU ----------
  if (appState === 'menu') {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-100 text-slate-900">
        <div className="max-w-md w-full bg-white p-10 rounded-2xl shadow-xl text-center">
          <h1 className="text-4xl font-extrabold text-blue-700 mb-2">Technician Class</h1>
          <p className="text-slate-500 mb-8">Amateur Radio License Prep</p>

          {/* Subelement filter */}
          <div className="mb-6 text-left">
            <label className="block text-xs font-semibold text-slate-500 mb-1">
              Focus Area (Subelement)
            </label>
            <select
              value={selectedSubelement}
              onChange={(e) => setSelectedSubelement(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Subelements</option>
              {subelements.map((sub) => (
                <option key={sub} value={sub}>
                  {sub} Questions
                </option>
              ))}
            </select>
            <p className="mt-1 text-[11px] text-slate-400">
              Questions loaded: {questionsData.length} total
            </p>
          </div>
          
          <div className="space-y-3 mb-4">
            {/* Learn Button - NEW */}
            <button
              onClick={() => setAppState('learn')}
              className="w-full py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-lg shadow-md transition-transform active:scale-95"
            >
              📚 Learn
              <span className="block text-xs font-normal opacity-90 mt-1">
                Study topics before testing • {completedLessons.length}/{lessons.length} completed
              </span>
            </button>

            <button
              onClick={() => startQuiz('study')}
              className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold text-lg shadow-md transition-transform active:scale-95"
            >
              📖 Study Mode
              <span className="block text-xs font-normal opacity-90 mt-1">
                Immediate answers & explanations
              </span>
            </button>

            <button
              onClick={() => startQuiz('exam')}
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-lg shadow-md transition-transform active:scale-95"
            >
              📝 Practice Exam
              <span className="block text-xs font-normal opacity-90 mt-1">
                35 Questions • No hints • Pass/Fail
              </span>
            </button>

            <button
              onClick={() => startQuiz('bookmarks')}
              disabled={bookmarks.length === 0}
              className={`w-full py-4 rounded-xl font-bold text-lg shadow-md transition-transform active:scale-95 ${
                bookmarks.length === 0
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-amber-500 hover:bg-amber-600 text-white'
              }`}
            >
              ⭐ Bookmarks
              <span className="block text-xs font-normal opacity-90 mt-1">
                Practice only bookmarked questions
              </span>
            </button>

            {/* Review Button - Spaced Repetition */}
            <button
              onClick={() => startReviewMode()}
              disabled={getDueReviewCount() === 0}
              className={`w-full py-4 rounded-xl font-bold text-lg shadow-md transition-transform active:scale-95 ${
                getDueReviewCount() === 0
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-rose-500 hover:bg-rose-600 text-white'
              }`}
            >
              🔄 Review Due
              <span className="block text-xs font-normal opacity-90 mt-1">
                {getDueReviewCount() > 0
                  ? `${getDueReviewCount()} questions need review • ${getMasteredCount()} mastered`
                  : 'No reviews due • Study to add questions'}
              </span>
            </button>
          </div>

          <button
            onClick={() => setAppState('analytics')}
            className="w-full py-3 mt-2 border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            📊 View Analytics
          </button>

          {bookmarks.length > 0 && (
            <p className="mt-2 text-xs text-slate-400">
              {bookmarks.length} question{bookmarks.length === 1 ? '' : 's'} bookmarked
            </p>
          )}
        </div>
      </main>
    );
  }

  // ---------- RENDER: ANALYTICS ----------
  if (appState === 'analytics') {
    const entries = subelements.map((sub) => {
      const stats = globalStats[sub] ?? { correct: 0, total: 0 };
      const pct = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
      return { sub, ...stats, pct };
    });

    const overallTotal = entries.reduce((sum, e) => sum + e.total, 0);
    const overallCorrect = entries.reduce((sum, e) => sum + e.correct, 0);
    const overallPct = overallTotal > 0 ? Math.round((overallCorrect / overallTotal) * 100) : 0;

    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-100 text-slate-900">
        <div className="max-w-xl w-full bg-white p-8 rounded-2xl shadow-xl border border-slate-200">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            📊 Analytics
          </h2>
          {overallTotal === 0 ? (
            <p className="text-sm text-slate-500 mb-6">
              No data yet. Do some Study, Exams, or Bookmark sessions to build analytics.
            </p>
          ) : (
            <div className="mb-6 text-sm text-slate-700">
              <p className="font-semibold">
                Overall: {overallCorrect}/{overallTotal} correct ({overallPct}%)
              </p>
              <p className="text-xs text-slate-500">
                Includes Study, Exam, and Bookmarks sessions (persisted to this browser).
              </p>
            </div>
          )}

          <div className="border border-slate-100 rounded-xl overflow-hidden text-sm">
            <div className="grid grid-cols-4 bg-slate-50 px-3 py-2 font-semibold text-slate-600">
              <span>Sub</span>
              <span className="text-right">Seen</span>
              <span className="text-right">Correct</span>
              <span className="text-right">Accuracy</span>
            </div>
            {entries.map((e) => (
              <div
                key={e.sub}
                className="grid grid-cols-4 px-3 py-2 border-t border-slate-100 text-slate-700"
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
            className="w-full mt-6 py-3 bg-slate-800 text-white rounded-lg hover:bg-slate-900 font-bold transition"
          >
            Back to Home
          </button>
        </div>
      </main>
    );
  }

  // ---------- RENDER: LEARN (Topic List) ----------
  if (appState === 'learn') {
    const completedCount = completedLessons.length;
    const totalLessons = lessons.length;

    return (
      <main className="min-h-screen flex flex-col items-center p-6 bg-slate-100 text-slate-900">
        <div className="max-w-2xl w-full">
          {/* Header */}
          <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-200 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                📚 Learn
              </h2>
              <button
                onClick={() => setAppState('menu')}
                className="text-sm text-slate-500 hover:text-slate-700"
              >
                ← Back
              </button>
            </div>
            <p className="text-slate-600 text-sm mb-4">
              Study each topic before testing yourself. Each lesson takes about 5 minutes to read.
            </p>
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-slate-100 h-3 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full transition-all duration-300"
                  style={{ width: `${totalLessons > 0 ? (completedCount / totalLessons) * 100 : 0}%` }}
                ></div>
              </div>
              <span className="text-sm font-semibold text-slate-600">
                {completedCount}/{totalLessons} completed
              </span>
            </div>
          </div>

          {/* Lesson Cards */}
          <div className="space-y-3">
            {lessons.map((lesson) => {
              const completed = isLessonCompleted(lesson.id);
              const stats = globalStats[lesson.id] ?? { correct: 0, total: 0 };
              const accuracy = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : null;
              const dueCount = getDueReviewCount(lesson.id);
              const masteredCount = getMasteredCount(lesson.id);

              return (
                <div key={lesson.id} className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden">
                  <button
                    onClick={() => openLesson(lesson)}
                    className="w-full p-5 hover:bg-slate-50 transition-all text-left flex items-center gap-4"
                  >
                    <div className="text-3xl">{lesson.icon}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs text-blue-500 bg-blue-50 px-2 py-0.5 rounded">
                          {lesson.id}
                        </span>
                        {completed && (
                          <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                            ✓ Completed
                          </span>
                        )}
                        {accuracy !== null && (
                          <span className={`text-xs px-2 py-0.5 rounded ${
                            accuracy >= 74 ? 'text-green-600 bg-green-50' : 'text-amber-600 bg-amber-50'
                          }`}>
                            {accuracy}% accuracy
                          </span>
                        )}
                        {masteredCount > 0 && (
                          <span className="text-xs text-purple-600 bg-purple-50 px-2 py-0.5 rounded">
                            {masteredCount} mastered
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold text-slate-800 mt-1">{lesson.title}</h3>
                      <p className="text-sm text-slate-500">{lesson.subtitle}</p>
                    </div>
                    <div className="text-slate-300">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </button>
                  {/* Review button for this topic */}
                  {dueCount > 0 && (
                    <div className="px-5 pb-4 pt-0">
                      <button
                        onClick={() => startReviewMode(lesson.id)}
                        className="w-full py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg text-sm font-semibold transition border border-rose-200"
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

  // ---------- RENDER: LESSON (Single Lesson View) ----------
  if (appState === 'lesson' && currentLesson) {
    const completed = isLessonCompleted(currentLesson.id);

    return (
      <main className="min-h-screen flex flex-col items-center p-6 bg-slate-100 text-slate-900">
        <div className="max-w-2xl w-full">
          {/* Header */}
          <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-200 mb-6">
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => setAppState('learn')}
                className="text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Topics
              </button>
              <span className="text-xs text-slate-400">
                ~{currentLesson.estimatedMinutes} min read
              </span>
            </div>

            <div className="flex items-center gap-3 mb-2">
              <span className="text-4xl">{currentLesson.icon}</span>
              <div>
                <span className="font-mono text-sm text-blue-500 bg-blue-50 px-2 py-0.5 rounded">
                  {currentLesson.id}
                </span>
                {completed && (
                  <span className="ml-2 text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                    ✓ Completed
                  </span>
                )}
              </div>
            </div>
            <h1 className="text-2xl font-bold text-slate-800">{currentLesson.title}</h1>
            <p className="text-slate-500">{currentLesson.subtitle}</p>
          </div>

          {/* Lesson Sections */}
          <div className="space-y-4">
            {currentLesson.sections.map((section, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-md border border-slate-200">
                <h2 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
                  <span className="text-blue-500 text-sm font-mono bg-blue-50 px-2 py-0.5 rounded">
                    {index + 1}
                  </span>
                  {section.title}
                </h2>
                <p className="text-slate-700 leading-relaxed mb-4">{section.content}</p>

                {/* Key Facts */}
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">
                    Key Facts
                  </p>
                  <ul className="space-y-2">
                    {section.keyFacts.map((fact, factIndex) => (
                      <li key={factIndex} className="flex items-start gap-2 text-sm text-slate-700">
                        <span className="text-emerald-500 mt-0.5">✓</span>
                        {fact}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          {/* Exam Tip */}
          <div className="bg-amber-50 p-5 rounded-xl border border-amber-200 mt-4">
            <p className="text-xs font-bold text-amber-600 uppercase tracking-wide mb-1">
              💡 Exam Tip
            </p>
            <p className="text-amber-800 text-sm">{currentLesson.examTip}</p>
          </div>

          {/* Action Buttons */}
          <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200 mt-4">
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
            <p className="text-xs text-slate-400 text-center mt-3">
              Test your knowledge on {currentLesson.title} questions
            </p>
          </div>
        </div>
      </main>
    );
  }

  // ---------- RENDER: RESULTS ----------
  if (appState === 'results') {
    const total = activeQuestions.length;
    const percentage = total > 0 ? Math.round((score / total) * 100) : 0;
    const isExam = mode === 'exam';
    const passed = isExam && percentage >= 74;

    // Per-exam subelement breakdown
    const subStatsEntries = Object.entries(subelementStats).sort(([a], [b]) =>
      a.localeCompare(b)
    );

    // For review mode, calculate mastery stats
    const reviewMastered = mode === 'review'
      ? activeQuestions.filter(q => spacedRepData[q.id]?.correctStreak >= 3).length
      : 0;

    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-100 text-slate-900">
        <div className={`max-w-xl w-full bg-white p-8 rounded-2xl shadow-xl text-center border-t-8 ${
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
            <p className="text-xl text-slate-600">
              You scored {score} out of {total}
            </p>
            {isExam && (
              <div
                className={`mt-4 inline-block px-4 py-1 rounded-full font-bold text-sm ${
                  passed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}
              >
                {passed ? 'PASSED (>=74%)' : 'NEEDS STUDY (<74%)'}
              </div>
            )}
            {mode === 'review' && (
              <div className="mt-4 p-4 bg-rose-50 rounded-xl border border-rose-200 text-left">
                <p className="text-sm text-rose-800">
                  <span className="font-bold">🎯 Review Progress:</span>
                </p>
                <ul className="text-sm text-rose-700 mt-2 space-y-1">
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

          {/* Per-subelement stats (Exam Mode only) */}
          {isExam && subStatsEntries.length > 0 && (
            <div className="mb-6 text-left border border-slate-100 rounded-xl p-4 bg-slate-50">
              <h3 className="text-sm font-bold text-slate-700 mb-2">
                Performance by Subelement (This Exam)
              </h3>
              <ul className="space-y-1 text-sm">
                {subStatsEntries.map(([sub, stats]) => {
                  const pct =
                    stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
                  return (
                    <li key={sub} className="flex justify-between items-center">
                      <span className="font-mono text-slate-700">{sub}</span>
                      <span className="text-slate-600">
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

          {/* Missed questions review (Exam Mode only) */}
          {isExam && missedQuestions.length > 0 && (
            <div className="mb-6 text-left max-h-64 overflow-y-auto border border-slate-100 rounded-xl p-4 bg-slate-50">
              <h3 className="text-sm font-bold text-slate-700 mb-2">
                Review Missed Questions ({missedQuestions.length})
              </h3>
              <ul className="space-y-3 text-sm">
                {missedQuestions.map((q) => {
                  const bookmarked = isBookmarked(q.id);
                  return (
                    <li
                      key={q.id}
                      className="border-b border-slate-200 pb-2 last:border-b-0 last:pb-0"
                    >
                      <div className="flex justify-between items-start gap-2">
                        <p className="font-semibold text-slate-800">
                          <span className="text-xs font-mono text-slate-500 mr-1">
                            [{q.id}]
                          </span>
                          {q.question}
                        </p>
                        <button
                          onClick={() => toggleBookmark(q.id)}
                          className="text-xs px-2 py-1 rounded-full border border-amber-300 text-amber-700 bg-amber-50 hover:bg-amber-100 shrink-0"
                        >
                          {bookmarked ? '★ Bookmarked' : '☆ Bookmark'}
                        </button>
                      </div>
                      <p className="mt-1 text-slate-600">
                        <span className="font-semibold">Correct answer: </span>
                        {q.correctAnswer}
                      </p>
                      <p className="mt-1 text-slate-500 text-xs">{q.explanation}</p>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {/* Retry missed questions only (Exam Mode only) */}
          {isExam && missedQuestions.length > 0 && (
            <button
              onClick={startRetryMissed}
              className="w-full mb-4 py-3 border border-blue-200 text-blue-700 rounded-lg font-semibold text-sm hover:bg-blue-50"
            >
              🔁 Retry Missed Questions Only
            </button>
          )}

          <button
            onClick={() => setAppState('menu')}
            className="w-full py-3 bg-slate-800 text-white rounded-lg hover:bg-slate-900 font-bold transition"
          >
            Back to Home
          </button>
        </div>
      </main>
    );
  }

  // ---------- RENDER: QUIZ ----------
  const currentQuestion = activeQuestions[currentQuestionIndex];
  const progress = activeQuestions.length
    ? ((currentQuestionIndex + 1) / activeQuestions.length) * 100
    : 0;
  const currentBookmarked = isBookmarked(currentQuestion.id);

  const modeLabel =
    mode === 'exam' ? 'Practice Exam' : mode === 'bookmarks' ? 'Bookmarks' : mode === 'review' ? 'Review Mode' : 'Study Mode';

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-50 text-slate-900">
      <div className="max-w-2xl w-full bg-white p-6 rounded-2xl shadow-xl border border-slate-200">
        
        {/* Header with Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <div>
              <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">
                {modeLabel}
              </span>
              <div className="text-xs text-slate-400">
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
                    ? 'border-amber-400 bg-amber-50 text-amber-700'
                    : 'border-slate-200 bg-slate-50 text-slate-500'
                } hover:bg-amber-100`}
              >
                {currentBookmarked ? '★ Bookmarked' : '☆ Bookmark'}
              </button>
              <span className="text-sm font-semibold text-slate-600">
                {currentQuestionIndex + 1} / {activeQuestions.length}
              </span>
            </div>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div
              className="bg-blue-500 h-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Question Text */}
        <h2 className="text-xl font-bold mb-8 text-slate-800 leading-relaxed">
          <span className="text-blue-500 mr-2 text-sm font-mono align-top">
            [{currentQuestion.id}]
          </span>
          {currentQuestion.question}
        </h2>

        {/* Options */}
        <div className="space-y-3">
          {currentQuestion.options.map((option, index) => {
            const isSelected = selectedAnswer === option;
            const isCorrect = isAnswerCorrect(index, currentQuestion.correctAnswer);
            
            let buttonStyle =
              'border-slate-200 hover:border-blue-400 hover:bg-blue-50'; // default
            let icon = null;
            
            if ((mode === 'study' || mode === 'bookmarks' || mode === 'review') && showExplanation) {
              if (isCorrect) {
                buttonStyle =
                  'bg-green-500 border-green-600 text-white ring-2 ring-green-600';
                icon = <span className="mr-2 text-xl">✓</span>;
              } else if (isSelected && !isCorrect) {
                buttonStyle = 'bg-red-500 border-red-600 text-white ring-2 ring-red-600';
                icon = <span className="mr-2 text-xl">✗</span>;
              } else {
                buttonStyle = 'opacity-50 border-slate-100';
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

        {/* Footer Actions */}
        <div className="mt-8 pt-6 border-t border-slate-100">
          {(mode === 'study' || mode === 'bookmarks' || mode === 'review') && showExplanation && (
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 text-blue-900 mb-6">
              <p className="font-bold text-xs uppercase tracking-wide text-blue-400 mb-1">
                Explanation
              </p>
              <p>{currentQuestion.explanation}</p>
              {/* Show spaced rep status in review mode */}
              {mode === 'review' && (
                <div className="mt-3 pt-3 border-t border-blue-200">
                  <p className="text-xs text-blue-500">
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
              className="px-4 py-2 text-slate-400 hover:text-red-500 text-sm font-semibold"
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