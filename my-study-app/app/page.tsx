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

type AppState = 'menu' | 'quiz' | 'results' | 'analytics' | 'learn' | 'lesson' | 'settings';
type Mode = 'study' | 'exam' | 'bookmarks' | 'review';

const LS_BOOKMARKS_KEY = 'ham_technician_bookmarks';
const LS_GLOBAL_STATS_KEY = 'ham_technician_global_stats';
const LS_COMPLETED_LESSONS_KEY = 'ham_technician_completed_lessons';
const LS_SPACED_REP_KEY = 'ham_technician_spaced_rep';
const LS_DARK_MODE_KEY = 'ham_technician_dark_mode';
const LS_STREAK_KEY = 'ham_technician_streak';
const LS_ONBOARDING_KEY = 'ham_technician_onboarding_complete';

// Onboarding slide data
const ONBOARDING_SLIDES = [
  {
    icon: '📻',
    title: 'Welcome to Study Buddy!',
    description: 'Your complete study guide for the FCC Technician Class license exam. Let\'s get you on the air!',
    highlight: 'Pass the 35-question exam with 74% to earn your license',
  },
  {
    icon: '📚',
    title: 'Learn, Then Practice',
    description: 'Start with the Learn section to study each topic, then test yourself with Study Mode or Practice Exams.',
    highlight: '10 lessons covering all exam topics',
  },
  {
    icon: '🔄',
    title: 'Smart Review System',
    description: 'Questions you miss come back automatically through spaced repetition. Get them right 3 times to master them.',
    highlight: 'Bookmark tricky questions for extra practice',
  },
  {
    icon: '🏆',
    title: 'Track Your Progress',
    description: 'Build study streaks, earn badges, and watch your weak areas improve. You\'ve got this!',
    highlight: 'Study daily to maintain your streak',
  },
];

const APP_VERSION = '1.3.0';

// Streak data structure
interface StreakData {
  currentStreak: number;      // Current consecutive days
  longestStreak: number;      // Best streak ever
  lastStudyDate: string;      // YYYY-MM-DD format
  totalStudyDays: number;     // Total days studied
}

// Badge definitions
interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
  check: (stats: BadgeCheckParams) => boolean;
}

interface BadgeCheckParams {
  totalAnswered: number;
  totalCorrect: number;
  streak: StreakData;
  completedLessons: number;
  masteredCount: number;
  passedExams: number;
}

// Spaced repetition intervals (in milliseconds)
// Simple system: miss = review soon, correct streak increases interval
const REVIEW_INTERVALS = {
  0: 0,                    // Just missed - review immediately available
  1: 1 * 60 * 60 * 1000,   // 1 hour after first correct
  2: 24 * 60 * 60 * 1000,  // 1 day after second correct
  3: 7 * 24 * 60 * 60 * 1000, // 7 days after third correct (mastered)
};

// Badge definitions
const BADGES: Badge[] = [
  { id: 'first_question', name: 'First Steps', icon: '🎯', description: 'Answer your first question', check: (p) => p.totalAnswered >= 1 },
  { id: 'ten_correct', name: 'Getting Started', icon: '✨', description: 'Get 10 questions correct', check: (p) => p.totalCorrect >= 10 },
  { id: 'fifty_correct', name: 'Dedicated Learner', icon: '📚', description: 'Get 50 questions correct', check: (p) => p.totalCorrect >= 50 },
  { id: 'hundred_correct', name: 'Century Club', icon: '💯', description: 'Get 100 questions correct', check: (p) => p.totalCorrect >= 100 },
  { id: 'streak_3', name: 'On a Roll', icon: '🔥', description: 'Study 3 days in a row', check: (p) => p.streak.currentStreak >= 3 },
  { id: 'streak_7', name: 'Week Warrior', icon: '⚡', description: 'Study 7 days in a row', check: (p) => p.streak.longestStreak >= 7 },
  { id: 'streak_14', name: 'Two Week Champ', icon: '🏆', description: 'Study 14 days in a row', check: (p) => p.streak.longestStreak >= 14 },
  { id: 'streak_30', name: 'Monthly Master', icon: '👑', description: 'Study 30 days in a row', check: (p) => p.streak.longestStreak >= 30 },
  { id: 'first_lesson', name: 'Student', icon: '📖', description: 'Complete your first lesson', check: (p) => p.completedLessons >= 1 },
  { id: 'all_lessons', name: 'Scholar', icon: '🎓', description: 'Complete all 10 lessons', check: (p) => p.completedLessons >= 10 },
  { id: 'first_mastered', name: 'Memory Pro', icon: '🧠', description: 'Master your first question', check: (p) => p.masteredCount >= 1 },
  { id: 'ten_mastered', name: 'Review Expert', icon: '⭐', description: 'Master 10 questions', check: (p) => p.masteredCount >= 10 },
  { id: 'fifty_mastered', name: 'Knowledge Keeper', icon: '🌟', description: 'Master 50 questions', check: (p) => p.masteredCount >= 50 },
  { id: 'pass_exam', name: 'Exam Ready', icon: '✅', description: 'Pass a practice exam (74%+)', check: (p) => p.passedExams >= 1 },
  { id: 'five_exams', name: 'Test Veteran', icon: '🎖️', description: 'Pass 5 practice exams', check: (p) => p.passedExams >= 5 },
];

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

  // Dark mode (persisted)
  const [darkMode, setDarkMode] = useState(false);

  // Study streak data (persisted)
  const [streakData, setStreakData] = useState<StreakData>({
    currentStreak: 0,
    longestStreak: 0,
    lastStudyDate: '',
    totalStudyDays: 0,
  });

  // Passed exams count (persisted as part of streak data)
  const [passedExams, setPassedExams] = useState(0);

  // Settings confirmation dialog
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Onboarding state
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingSlide, setOnboardingSlide] = useState(0);

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

    try {
      const savedDarkMode = window.localStorage.getItem(LS_DARK_MODE_KEY);
      if (savedDarkMode) {
        setDarkMode(JSON.parse(savedDarkMode));
      }
    } catch {
      // ignore parse errors
    }

    try {
      const savedStreak = window.localStorage.getItem(LS_STREAK_KEY);
      if (savedStreak) {
        const parsed = JSON.parse(savedStreak);
        setStreakData(parsed.streakData || { currentStreak: 0, longestStreak: 0, lastStudyDate: '', totalStudyDays: 0 });
        setPassedExams(parsed.passedExams || 0);
      }
    } catch {
      // ignore parse errors
    }

    // Check if onboarding has been completed
    try {
      const onboardingComplete = window.localStorage.getItem(LS_ONBOARDING_KEY);
      if (!onboardingComplete) {
        setShowOnboarding(true);
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

  // Toggle dark mode and persist
  const toggleDarkMode = () => {
    setDarkMode((prev) => {
      const next = !prev;
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(LS_DARK_MODE_KEY, JSON.stringify(next));
      }
      return next;
    });
  };

  // Complete onboarding and persist
  const completeOnboarding = () => {
    setShowOnboarding(false);
    setOnboardingSlide(0);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(LS_ONBOARDING_KEY, 'true');
    }
  };

  // Reset all progress (stats, bookmarks, spaced rep, completed lessons, streaks)
  const resetAllProgress = () => {
    // Clear state
    setGlobalStats({});
    setBookmarks([]);
    setSpacedRepData({});
    setCompletedLessons([]);
    setStreakData({ currentStreak: 0, longestStreak: 0, lastStudyDate: '', totalStudyDays: 0 });
    setPassedExams(0);

    // Clear localStorage
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(LS_GLOBAL_STATS_KEY);
      window.localStorage.removeItem(LS_BOOKMARKS_KEY);
      window.localStorage.removeItem(LS_SPACED_REP_KEY);
      window.localStorage.removeItem(LS_COMPLETED_LESSONS_KEY);
      window.localStorage.removeItem(LS_STREAK_KEY);
    }

    setShowResetConfirm(false);
  };

  // Update study streak (call when user answers a question)
  const updateStreak = () => {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    setStreakData((prev) => {
      // Already studied today
      if (prev.lastStudyDate === today) {
        return prev;
      }

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      let newStreak: StreakData;

      if (prev.lastStudyDate === yesterdayStr) {
        // Continuing streak
        const newCurrentStreak = prev.currentStreak + 1;
        newStreak = {
          currentStreak: newCurrentStreak,
          longestStreak: Math.max(prev.longestStreak, newCurrentStreak),
          lastStudyDate: today,
          totalStudyDays: prev.totalStudyDays + 1,
        };
      } else if (prev.lastStudyDate === '') {
        // First day ever
        newStreak = {
          currentStreak: 1,
          longestStreak: 1,
          lastStudyDate: today,
          totalStudyDays: 1,
        };
      } else {
        // Streak broken, start over
        newStreak = {
          currentStreak: 1,
          longestStreak: prev.longestStreak,
          lastStudyDate: today,
          totalStudyDays: prev.totalStudyDays + 1,
        };
      }

      // Persist
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(LS_STREAK_KEY, JSON.stringify({ streakData: newStreak, passedExams }));
      }

      return newStreak;
    });
  };

  // Record a passed exam
  const recordPassedExam = () => {
    setPassedExams((prev) => {
      const newCount = prev + 1;
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(LS_STREAK_KEY, JSON.stringify({ streakData, passedExams: newCount }));
      }
      return newCount;
    });
  };

  // Get earned badges
  const getEarnedBadges = (): Badge[] => {
    const totalAnswered = Object.values(globalStats).reduce((sum, s) => sum + s.total, 0);
    const totalCorrect = Object.values(globalStats).reduce((sum, s) => sum + s.correct, 0);
    const params: BadgeCheckParams = {
      totalAnswered,
      totalCorrect,
      streak: streakData,
      completedLessons: completedLessons.length,
      masteredCount: getMasteredCount(),
      passedExams,
    };
    return BADGES.filter(badge => badge.check(params));
  };

  // Export all progress data as JSON file download
  const exportProgress = () => {
    const exportData = {
      version: APP_VERSION,
      exportedAt: new Date().toISOString(),
      data: {
        globalStats,
        bookmarks,
        completedLessons,
        spacedRepData,
        darkMode,
        streakData,
        passedExams,
      },
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ham-radio-progress-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Import progress data from JSON file
  const importProgress = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const importData = JSON.parse(content);

        // Validate structure
        if (!importData.data) {
          alert('Invalid backup file format.');
          return;
        }

        const { data } = importData;

        // Import each data type if present
        if (data.globalStats) {
          setGlobalStats(data.globalStats);
          window.localStorage.setItem(LS_GLOBAL_STATS_KEY, JSON.stringify(data.globalStats));
        }
        if (data.bookmarks) {
          setBookmarks(data.bookmarks);
          window.localStorage.setItem(LS_BOOKMARKS_KEY, JSON.stringify(data.bookmarks));
        }
        if (data.completedLessons) {
          setCompletedLessons(data.completedLessons);
          window.localStorage.setItem(LS_COMPLETED_LESSONS_KEY, JSON.stringify(data.completedLessons));
        }
        if (data.spacedRepData) {
          setSpacedRepData(data.spacedRepData);
          window.localStorage.setItem(LS_SPACED_REP_KEY, JSON.stringify(data.spacedRepData));
        }
        if (typeof data.darkMode === 'boolean') {
          setDarkMode(data.darkMode);
          window.localStorage.setItem(LS_DARK_MODE_KEY, JSON.stringify(data.darkMode));
        }
        if (data.streakData) {
          setStreakData(data.streakData);
          const importedPassedExams = data.passedExams || 0;
          setPassedExams(importedPassedExams);
          window.localStorage.setItem(LS_STREAK_KEY, JSON.stringify({ streakData: data.streakData, passedExams: importedPassedExams }));
        }

        alert('Progress imported successfully!');
      } catch {
        alert('Failed to import progress. Please check the file format.');
      }
    };
    reader.readAsText(file);

    // Reset the input so the same file can be selected again
    event.target.value = '';
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

      // Update study streak
      updateStreak();
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

      // Update study streak for exam mode
      updateStreak();
    }

    const nextIndex = currentQuestionIndex + 1;

    if (nextIndex < activeQuestions.length) {
      setCurrentQuestionIndex(nextIndex);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      // Check if passed exam (74%+) and record it
      if (mode === 'exam') {
        const finalScore = score + (selectedAnswer ? 1 : 0); // Include current answer if correct
        const currentQ = activeQuestions[currentQuestionIndex];
        const optionIndex = currentQ.options.indexOf(selectedAnswer || '');
        const lastCorrect = optionIndex !== -1 && isAnswerCorrect(optionIndex, currentQ.correctAnswer);
        const adjustedScore = lastCorrect ? finalScore : score;
        const percentage = Math.round((adjustedScore / activeQuestions.length) * 100);
        if (percentage >= 74) {
          recordPassedExam();
        }
      }
      setAppState('results');
    }
  };

  // ---------- RENDER: MENU ----------
  if (appState === 'menu') {
    return (
      <main className={`min-h-screen flex flex-col items-center justify-center p-6 ${darkMode ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-900'}`}>
        <div className={`max-w-md w-full ${darkMode ? 'bg-slate-800' : 'bg-white'} p-10 rounded-2xl shadow-xl text-center`}>
          <h1 className="text-4xl font-extrabold text-blue-700 mb-2">Ham Radio Study Buddy</h1>
          <p className={`${darkMode ? 'text-slate-400' : 'text-slate-500'} mb-4`}>Technician Class Prep</p>

          {/* Streak Display */}
          {streakData.totalStudyDays > 0 && (
            <div className={`mb-6 p-3 rounded-xl ${darkMode ? 'bg-slate-700' : 'bg-gradient-to-r from-orange-50 to-amber-50 border border-amber-200'}`}>
              <div className="flex items-center justify-center gap-4">
                <div className="text-center">
                  <span className="text-2xl">🔥</span>
                  <p className={`text-lg font-bold ${darkMode ? 'text-orange-400' : 'text-orange-600'}`}>{streakData.currentStreak}</p>
                  <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Day Streak</p>
                </div>
                <div className={`w-px h-10 ${darkMode ? 'bg-slate-600' : 'bg-amber-200'}`}></div>
                <div className="text-center">
                  <span className="text-2xl">⭐</span>
                  <p className={`text-lg font-bold ${darkMode ? 'text-amber-400' : 'text-amber-600'}`}>{streakData.longestStreak}</p>
                  <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Best Streak</p>
                </div>
                <div className={`w-px h-10 ${darkMode ? 'bg-slate-600' : 'bg-amber-200'}`}></div>
                <div className="text-center">
                  <span className="text-2xl">📅</span>
                  <p className={`text-lg font-bold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>{streakData.totalStudyDays}</p>
                  <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Total Days</p>
                </div>
              </div>
            </div>
          )}

          {/* Badges Summary */}
          {getEarnedBadges().length > 0 && (
            <div className={`mb-6 p-3 rounded-xl ${darkMode ? 'bg-slate-700' : 'bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200'}`}>
              <div className="flex items-center justify-between mb-2">
                <span className={`text-xs font-semibold ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  🏆 Achievements
                </span>
                <span className={`text-xs ${darkMode ? 'text-slate-500' : 'text-slate-500'}`}>
                  {getEarnedBadges().length}/{BADGES.length}
                </span>
              </div>
              <div className="flex justify-center gap-1 flex-wrap">
                {getEarnedBadges().slice(0, 8).map((badge) => (
                  <span key={badge.id} className="text-xl" title={badge.name}>
                    {badge.icon}
                  </span>
                ))}
                {getEarnedBadges().length > 8 && (
                  <span className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'} self-center`}>
                    +{getEarnedBadges().length - 8}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Subelement filter */}
          <div className="mb-6 text-left">
            <label className={`block text-xs font-semibold ${darkMode ? 'text-slate-400' : 'text-slate-500'} mb-1`}>
              Focus Area (Subelement)
            </label>
            <select
              value={selectedSubelement}
              onChange={(e) => setSelectedSubelement(e.target.value)}
              className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${darkMode ? 'border-slate-600 bg-slate-700 text-white' : 'border-slate-200 bg-slate-50 text-slate-800'}`}
            >
              <option value="ALL">All Subelements</option>
              {subelements.map((sub) => (
                <option key={sub} value={sub}>
                  {sub} Questions
                </option>
              ))}
            </select>
            <p className={`mt-1 text-[11px] ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
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

          <div className="flex gap-2 mt-2">
            <button
              onClick={() => setAppState('analytics')}
              className={`flex-1 py-3 border rounded-lg text-sm font-semibold ${darkMode ? 'border-slate-600 text-slate-400 hover:bg-slate-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
            >
              📊 Analytics
            </button>
            <button
              onClick={() => setAppState('settings')}
              className={`flex-1 py-3 border rounded-lg text-sm font-semibold ${darkMode ? 'border-slate-600 text-slate-400 hover:bg-slate-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
            >
              ⚙️ Settings
            </button>
          </div>

          {bookmarks.length > 0 && (
            <p className={`mt-2 text-xs ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
              {bookmarks.length} question{bookmarks.length === 1 ? '' : 's'} bookmarked
            </p>
          )}
        </div>

        {/* Onboarding Modal */}
        {showOnboarding && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
            <div className={`${darkMode ? 'bg-slate-800' : 'bg-white'} rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden`}>
              {/* Slide Content */}
              <div className="p-8 text-center">
                <span className="text-6xl mb-4 block">{ONBOARDING_SLIDES[onboardingSlide].icon}</span>
                <h2 className={`text-2xl font-bold mb-3 ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                  {ONBOARDING_SLIDES[onboardingSlide].title}
                </h2>
                <p className={`${darkMode ? 'text-slate-300' : 'text-slate-600'} mb-4`}>
                  {ONBOARDING_SLIDES[onboardingSlide].description}
                </p>
                <div className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${darkMode ? 'bg-blue-900/50 text-blue-300' : 'bg-blue-50 text-blue-700'}`}>
                  💡 {ONBOARDING_SLIDES[onboardingSlide].highlight}
                </div>
              </div>

              {/* Progress Dots */}
              <div className="flex justify-center gap-2 pb-4">
                {ONBOARDING_SLIDES.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setOnboardingSlide(idx)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      idx === onboardingSlide
                        ? 'bg-blue-600 w-6'
                        : darkMode ? 'bg-slate-600' : 'bg-slate-300'
                    }`}
                  />
                ))}
              </div>

              {/* Navigation Buttons */}
              <div className={`flex gap-3 p-4 ${darkMode ? 'bg-slate-700' : 'bg-slate-50'}`}>
                {onboardingSlide > 0 ? (
                  <button
                    onClick={() => setOnboardingSlide((prev) => prev - 1)}
                    className={`flex-1 py-3 rounded-xl font-semibold ${darkMode ? 'bg-slate-600 hover:bg-slate-500 text-white' : 'bg-slate-200 hover:bg-slate-300 text-slate-700'}`}
                  >
                    Back
                  </button>
                ) : (
                  <button
                    onClick={completeOnboarding}
                    className={`flex-1 py-3 rounded-xl font-semibold ${darkMode ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    Skip
                  </button>
                )}
                {onboardingSlide < ONBOARDING_SLIDES.length - 1 ? (
                  <button
                    onClick={() => setOnboardingSlide((prev) => prev + 1)}
                    className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    onClick={completeOnboarding}
                    className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold"
                  >
                    Get Started! 🚀
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    );
  }

  // ---------- RENDER: ANALYTICS ----------
  if (appState === 'analytics') {
    // Get lesson titles for display
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

    // Weak areas: topics with data but below 74%, sorted by accuracy (lowest first)
    const weakAreas = entries
      .filter(e => e.total >= 5 && e.pct < 74)
      .sort((a, b) => a.pct - b.pct);

    // Strong areas: topics with data and at or above 74%, sorted by accuracy (highest first)
    const strongAreas = entries
      .filter(e => e.total >= 5 && e.pct >= 74)
      .sort((a, b) => b.pct - a.pct);

    // Topics that need more practice (less than 5 questions answered)
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
              {/* Overall Stats */}
              <div className={`mb-6 text-sm ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                <p className="font-semibold">
                  Overall: {overallCorrect}/{overallTotal} correct ({overallPct}%)
                </p>
                <p className={`text-xs ${darkMode ? 'text-slate-500' : 'text-slate-500'}`}>
                  Includes Study, Exam, and Bookmarks sessions (persisted to this browser).
                </p>
              </div>

              {/* Weak Areas Section */}
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

              {/* Strong Areas Section */}
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

              {/* Needs More Data Section */}
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

          {/* Full Breakdown Table */}
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

  // ---------- RENDER: SETTINGS ----------
  if (appState === 'settings') {
    // Calculate some stats for display
    const totalAnswered = Object.values(globalStats).reduce((sum, s) => sum + s.total, 0);
    const totalCorrect = Object.values(globalStats).reduce((sum, s) => sum + s.correct, 0);

    return (
      <main className={`min-h-screen flex flex-col items-center p-6 ${darkMode ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-900'}`}>
        <div className={`max-w-md w-full ${darkMode ? 'bg-slate-800' : 'bg-white'} p-8 rounded-2xl shadow-xl border ${darkMode ? 'border-slate-700' : 'border-slate-200'}`}>
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            ⚙️ Settings
          </h2>

          {/* Appearance Section */}
          <div className="mb-6">
            <h3 className={`text-sm font-semibold ${darkMode ? 'text-slate-400' : 'text-slate-500'} uppercase tracking-wide mb-3`}>
              Appearance
            </h3>
            <div className={`flex items-center justify-between p-4 rounded-xl ${darkMode ? 'bg-slate-700' : 'bg-slate-50'}`}>
              <div>
                <p className="font-medium">Dark Mode</p>
                <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Easier on the eyes at night</p>
              </div>
              <button
                onClick={toggleDarkMode}
                className={`relative w-14 h-8 rounded-full transition-colors ${darkMode ? 'bg-blue-600' : 'bg-slate-300'}`}
              >
                <span
                  className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow transition-transform ${darkMode ? 'translate-x-7' : 'translate-x-1'}`}
                />
              </button>
            </div>
          </div>

          {/* Data Section */}
          <div className="mb-6">
            <h3 className={`text-sm font-semibold ${darkMode ? 'text-slate-400' : 'text-slate-500'} uppercase tracking-wide mb-3`}>
              Data & Progress
            </h3>
            <div className={`p-4 rounded-xl ${darkMode ? 'bg-slate-700' : 'bg-slate-50'} mb-3`}>
              <p className="font-medium mb-2">Your Progress</p>
              <div className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'} space-y-1`}>
                <p>Questions answered: {totalAnswered}</p>
                <p>Correct answers: {totalCorrect} ({totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0}%)</p>
                <p>Lessons completed: {completedLessons.length}/{lessons.length}</p>
                <p>Bookmarked questions: {bookmarks.length}</p>
                <p>Mastered (spaced rep): {getMasteredCount()}</p>
              </div>
            </div>
            {/* Export/Import Buttons */}
            <div className="flex gap-3 mb-3">
              <button
                onClick={exportProgress}
                className={`flex-1 py-3 rounded-xl font-semibold transition-colors ${darkMode ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'}`}
              >
                📤 Export
              </button>
              <label className={`flex-1 py-3 rounded-xl font-semibold transition-colors text-center cursor-pointer ${darkMode ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-emerald-500 hover:bg-emerald-600 text-white'}`}>
                📥 Import
                <input
                  type="file"
                  accept=".json"
                  onChange={importProgress}
                  className="hidden"
                />
              </label>
            </div>
            <p className={`text-xs ${darkMode ? 'text-slate-500' : 'text-slate-400'} mb-3`}>
              Backup your progress or restore from a previous export
            </p>

            <button
              onClick={() => setShowResetConfirm(true)}
              className="w-full py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold transition-colors"
            >
              Reset All Progress
            </button>
          </div>

          {/* Achievements Section */}
          <div className="mb-6">
            <h3 className={`text-sm font-semibold ${darkMode ? 'text-slate-400' : 'text-slate-500'} uppercase tracking-wide mb-3`}>
              Achievements
            </h3>
            <div className={`p-4 rounded-xl ${darkMode ? 'bg-slate-700' : 'bg-slate-50'}`}>
              <p className="font-medium mb-3">
                {getEarnedBadges().length} of {BADGES.length} badges earned
              </p>
              <div className="grid grid-cols-3 gap-2">
                {BADGES.map((badge) => {
                  const earned = getEarnedBadges().some(b => b.id === badge.id);
                  return (
                    <div
                      key={badge.id}
                      className={`text-center p-2 rounded-lg transition-all ${
                        earned
                          ? darkMode ? 'bg-slate-600' : 'bg-white border border-amber-200'
                          : darkMode ? 'bg-slate-800 opacity-40' : 'bg-slate-100 opacity-40'
                      }`}
                      title={badge.description}
                    >
                      <span className={`text-2xl ${earned ? '' : 'grayscale'}`}>{badge.icon}</span>
                      <p className={`text-xs mt-1 font-medium truncate ${earned ? '' : darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                        {badge.name}
                      </p>
                    </div>
                  );
                })}
              </div>
              <p className={`text-xs ${darkMode ? 'text-slate-500' : 'text-slate-400'} mt-3 text-center`}>
                Tap a badge to see how to earn it
              </p>
            </div>
          </div>

          {/* About Section */}
          <div className="mb-6">
            <h3 className={`text-sm font-semibold ${darkMode ? 'text-slate-400' : 'text-slate-500'} uppercase tracking-wide mb-3`}>
              About
            </h3>
            <div className={`p-4 rounded-xl ${darkMode ? 'bg-slate-700' : 'bg-slate-50'}`}>
              <p className="font-bold text-lg mb-1">Ham Radio Study Buddy</p>
              <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'} mb-3`}>Version {APP_VERSION}</p>
              <div className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'} space-y-2`}>
                <p>
                  Questions sourced from the official FCC Technician Class question pool (2022-2026).
                </p>
                <p>
                  This app is not affiliated with the FCC or ARRL. Use for educational purposes only.
                </p>
              </div>
              <button
                onClick={() => {
                  setShowOnboarding(true);
                  setOnboardingSlide(0);
                  setAppState('menu');
                }}
                className={`mt-3 w-full py-2 rounded-lg text-sm font-medium ${darkMode ? 'bg-slate-600 hover:bg-slate-500 text-slate-300' : 'bg-slate-200 hover:bg-slate-300 text-slate-600'}`}
              >
                📖 Replay Tutorial
              </button>
            </div>
          </div>

          <button
            onClick={() => setAppState('menu')}
            className={`w-full py-3 rounded-lg text-sm font-semibold ${darkMode ? 'text-slate-400 hover:text-white border-slate-600' : 'text-slate-600 hover:bg-slate-50 border-slate-200'} border`}
          >
            Back to Home
          </button>
        </div>

        {/* Reset Confirmation Dialog */}
        {showResetConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className={`${darkMode ? 'bg-slate-800' : 'bg-white'} p-6 rounded-2xl shadow-2xl max-w-sm w-full`}>
              <h3 className="text-xl font-bold mb-2">Reset All Progress?</h3>
              <p className={`${darkMode ? 'text-slate-400' : 'text-slate-500'} mb-6`}>
                This will permanently delete all your study stats, completed lessons, bookmarks, and spaced repetition data. This cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className={`flex-1 py-3 rounded-xl font-semibold ${darkMode ? 'bg-slate-700 hover:bg-slate-600' : 'bg-slate-100 hover:bg-slate-200'}`}
                >
                  Cancel
                </button>
                <button
                  onClick={resetAllProgress}
                  className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    );
  }

  // ---------- RENDER: LEARN (Topic List) ----------
  if (appState === 'learn') {
    const completedCount = completedLessons.length;
    const totalLessons = lessons.length;

    return (
      <main className={`min-h-screen flex flex-col items-center p-6 ${darkMode ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-900'}`}>
        <div className="max-w-2xl w-full">
          {/* Header */}
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

          {/* Lesson Cards */}
          <div className="space-y-3">
            {lessons.map((lesson) => {
              const completed = isLessonCompleted(lesson.id);
              const stats = globalStats[lesson.id] ?? { correct: 0, total: 0 };
              const accuracy = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : null;
              const dueCount = getDueReviewCount(lesson.id);
              const masteredCount = getMasteredCount(lesson.id);

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
                  {/* Review button for this topic */}
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

  // ---------- RENDER: LESSON (Single Lesson View) ----------
  if (appState === 'lesson' && currentLesson) {
    const completed = isLessonCompleted(currentLesson.id);

    return (
      <main className={`min-h-screen flex flex-col items-center p-6 ${darkMode ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-900'}`}>
        <div className="max-w-2xl w-full">
          {/* Header */}
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

          {/* Lesson Sections */}
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

                {/* Key Facts */}
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

          {/* Exam Tip */}
          <div className={`${darkMode ? 'bg-amber-900/30 border-amber-800' : 'bg-amber-50 border-amber-200'} p-5 rounded-xl border mt-4`}>
            <p className={`text-xs font-bold ${darkMode ? 'text-amber-400' : 'text-amber-600'} uppercase tracking-wide mb-1`}>
              💡 Exam Tip
            </p>
            <p className={`${darkMode ? 'text-amber-300' : 'text-amber-800'} text-sm`}>{currentLesson.examTip}</p>
          </div>

          {/* Action Buttons */}
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

          {/* Previous/Next Lesson Navigation */}
          {(() => {
            const currentIndex = lessons.findIndex(l => l.id === currentLesson.id);
            const prevLesson = currentIndex > 0 ? lessons[currentIndex - 1] : null;
            const nextLesson = currentIndex < lessons.length - 1 ? lessons[currentIndex + 1] : null;

            return (
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
            );
          })()}
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
      <main className={`min-h-screen flex flex-col items-center justify-center p-6 ${darkMode ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-900'}`}>
        <div className={`max-w-xl w-full ${darkMode ? 'bg-slate-800' : 'bg-white'} p-8 rounded-2xl shadow-xl text-center border-t-8 ${
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
            <p className={`text-xl ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              You scored {score} out of {total}
            </p>
            {isExam && (
              <div
                className={`mt-4 inline-block px-4 py-1 rounded-full font-bold text-sm ${
                  passed
                    ? (darkMode ? 'bg-green-900/50 text-green-400' : 'bg-green-100 text-green-800')
                    : (darkMode ? 'bg-red-900/50 text-red-400' : 'bg-red-100 text-red-800')
                }`}
              >
                {passed ? 'PASSED (>=74%)' : 'NEEDS STUDY (<74%)'}
              </div>
            )}
            {mode === 'review' && (
              <div className={`mt-4 p-4 ${darkMode ? 'bg-rose-900/30 border-rose-800' : 'bg-rose-50 border-rose-200'} rounded-xl border text-left`}>
                <p className={`text-sm ${darkMode ? 'text-rose-300' : 'text-rose-800'}`}>
                  <span className="font-bold">🎯 Review Progress:</span>
                </p>
                <ul className={`text-sm ${darkMode ? 'text-rose-400' : 'text-rose-700'} mt-2 space-y-1`}>
                  <li>✓ {score} correct this session</li>
                  <li>🎉 {reviewMastered} questions mastered (3 correct in a row)</li>
                  <li>🔄 {getDueReviewCount()} questions still need review</li>
                </ul>
                <p className={`text-xs ${darkMode ? 'text-rose-500' : 'text-rose-500'} mt-2`}>
                  Questions you got wrong will reappear sooner. Get them right 3 times to master!
                </p>
              </div>
            )}
          </div>

          {/* Per-subelement stats (Exam Mode only) */}
          {isExam && subStatsEntries.length > 0 && (
            <div className={`mb-6 text-left border rounded-xl p-4 ${darkMode ? 'border-slate-700 bg-slate-700' : 'border-slate-100 bg-slate-50'}`}>
              <h3 className={`text-sm font-bold ${darkMode ? 'text-slate-300' : 'text-slate-700'} mb-2`}>
                Performance by Subelement (This Exam)
              </h3>
              <ul className="space-y-1 text-sm">
                {subStatsEntries.map(([sub, stats]) => {
                  const pct =
                    stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
                  return (
                    <li key={sub} className="flex justify-between items-center">
                      <span className={`font-mono ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>{sub}</span>
                      <span className={darkMode ? 'text-slate-400' : 'text-slate-600'}>
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
            <div className={`mb-6 text-left max-h-64 overflow-y-auto border rounded-xl p-4 ${darkMode ? 'border-slate-700 bg-slate-700' : 'border-slate-100 bg-slate-50'}`}>
              <h3 className={`text-sm font-bold ${darkMode ? 'text-slate-300' : 'text-slate-700'} mb-2`}>
                Review Missed Questions ({missedQuestions.length})
              </h3>
              <ul className="space-y-3 text-sm">
                {missedQuestions.map((q) => {
                  const bookmarked = isBookmarked(q.id);
                  return (
                    <li
                      key={q.id}
                      className={`border-b ${darkMode ? 'border-slate-600' : 'border-slate-200'} pb-2 last:border-b-0 last:pb-0`}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <p className={`font-semibold ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                          <span className={`text-xs font-mono ${darkMode ? 'text-slate-500' : 'text-slate-500'} mr-1`}>
                            [{q.id}]
                          </span>
                          {q.question}
                        </p>
                        <button
                          onClick={() => toggleBookmark(q.id)}
                          className={`text-xs px-2 py-1 rounded-full border shrink-0 ${
                            darkMode
                              ? 'border-amber-700 text-amber-400 bg-amber-900/30 hover:bg-amber-900/50'
                              : 'border-amber-300 text-amber-700 bg-amber-50 hover:bg-amber-100'
                          }`}
                        >
                          {bookmarked ? '★ Bookmarked' : '☆ Bookmark'}
                        </button>
                      </div>
                      <p className={`mt-1 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                        <span className="font-semibold">Correct answer: </span>
                        {q.correctAnswer}
                      </p>
                      <p className={`mt-1 ${darkMode ? 'text-slate-500' : 'text-slate-500'} text-xs`}>{q.explanation}</p>
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
              className={`w-full mb-4 py-3 border rounded-lg font-semibold text-sm ${
                darkMode
                  ? 'border-blue-700 text-blue-400 hover:bg-blue-900/30'
                  : 'border-blue-200 text-blue-700 hover:bg-blue-50'
              }`}
            >
              🔁 Retry Missed Questions Only
            </button>
          )}

          <button
            onClick={() => setAppState('menu')}
            className={`w-full py-3 rounded-lg font-bold transition ${
              darkMode ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-slate-800 hover:bg-slate-900 text-white'
            }`}
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
    <main className={`min-h-screen flex flex-col items-center justify-center p-4 ${darkMode ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-900'}`}>
      <div className={`max-w-2xl w-full ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} p-6 rounded-2xl shadow-xl border`}>

        {/* Header with Progress Bar */}
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

        {/* Question Text */}
        <h2 className={`text-xl font-bold mb-8 ${darkMode ? 'text-white' : 'text-slate-800'} leading-relaxed`}>
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

            let buttonStyle = darkMode
              ? 'border-slate-600 hover:border-blue-500 hover:bg-slate-700'
              : 'border-slate-200 hover:border-blue-400 hover:bg-blue-50'; // default
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

        {/* Footer Actions */}
        <div className={`mt-8 pt-6 border-t ${darkMode ? 'border-slate-700' : 'border-slate-100'}`}>
          {(mode === 'study' || mode === 'bookmarks' || mode === 'review') && showExplanation && (
            <div className={`${darkMode ? 'bg-blue-900/30 border-blue-800 text-blue-200' : 'bg-blue-50 border-blue-100 text-blue-900'} p-4 rounded-lg border mb-6`}>
              <p className={`font-bold text-xs uppercase tracking-wide ${darkMode ? 'text-blue-400' : 'text-blue-400'} mb-1`}>
                Explanation
              </p>
              <p>{currentQuestion.explanation}</p>
              {/* Show spaced rep status in review mode */}
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