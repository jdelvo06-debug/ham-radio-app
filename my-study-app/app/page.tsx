'use client';

import { useEffect, useState } from 'react';
import questionsData from './ham_radio_questions.json';
import lessonsData from './lessons.json';
import {
  Question,
  SubelementStats,
  GlobalSubelementStats,
  Lesson,
  LessonsFile,
  SpacedRepData,
  AppState,
  Mode,
  StreakData,
  BadgeCheckParams,
  Badge,
  LS_BOOKMARKS_KEY,
  LS_GLOBAL_STATS_KEY,
  LS_COMPLETED_LESSONS_KEY,
  LS_SPACED_REP_KEY,
  LS_DARK_MODE_KEY,
  LS_STREAK_KEY,
  LS_ONBOARDING_KEY,
  REVIEW_INTERVALS,
  BADGES,
  APP_VERSION,
} from './types';
import MainMenu from './components/MainMenu';
import LearnView from './components/LearnView';
import LessonView from './components/LessonView';
import QuizView from './components/QuizView';
import ResultsView from './components/ResultsView';
import AnalyticsView from './components/AnalyticsView';
import SettingsView from './components/SettingsView';
import PaywallModal from './components/PaywallModal';
import { usePremium } from './hooks/usePremium';
import { getDailyQuestionsRemaining, incrementDailyCount, resetIfNewDay } from './utils/freeLimit';

export default function Home() {
  const [appState, setAppState] = useState<AppState>('menu');
  const [mode, setMode] = useState<Mode>('study');

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [activeQuestions, setActiveQuestions] = useState<Question[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  const [score, setScore] = useState(0);
  const [missedQuestions, setMissedQuestions] = useState<Question[]>([]);
  const [subelementStats, setSubelementStats] = useState<Record<string, SubelementStats>>({});

  const [globalStats, setGlobalStats] = useState<Record<string, GlobalSubelementStats>>({});

  const [selectedSubelement, setSelectedSubelement] = useState<'ALL' | string>('ALL');

  const [bookmarks, setBookmarks] = useState<string[]>([]);

  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);

  const [completedLessons, setCompletedLessons] = useState<string[]>([]);

  const [spacedRepData, setSpacedRepData] = useState<Record<string, SpacedRepData>>({});

  const [darkMode, setDarkMode] = useState(true);

  const [streakData, setStreakData] = useState<StreakData>({
    currentStreak: 0,
    longestStreak: 0,
    lastStudyDate: '',
    totalStudyDays: 0,
  });

  const [passedExams, setPassedExams] = useState(0);

  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingSlide, setOnboardingSlide] = useState(0);

  const [showPaywall, setShowPaywall] = useState(false);
  const [paywallTitle, setPaywallTitle] = useState('Unlock Ham Radio Premium');
  const [paywallMessage, setPaywallMessage] = useState('Go beyond the free tier with unlimited questions, advanced quiz modes, lessons, analytics, and bookmarks.');
  const [freeQuestionsRemaining, setFreeQuestionsRemaining] = useState(25);
  const [reviewNow, setReviewNow] = useState(0);

  const {
    isPremium,
    isPurchasing,
    isRestoring,
    productDetails,
    purchaseError,
    purchase,
    restore,
    clearPurchaseError,
  } = usePremium();

  const syncFreeQuestionCount = () => {
    resetIfNewDay();
    setFreeQuestionsRemaining(getDailyQuestionsRemaining());
  };

  const openPaywall = (
    title = 'Unlock Ham Radio Premium',
    message = 'Go beyond the free tier with unlimited questions, advanced quiz modes, lessons, analytics, and bookmarks.'
  ) => {
    clearPurchaseError();
    setPaywallTitle(title);
    setPaywallMessage(message);
    setShowPaywall(true);
  };

  const closePaywall = () => {
    clearPurchaseError();
    setShowPaywall(false);
  };

  // ---------- LOCALSTORAGE LOAD ----------
  useEffect(() => {
    if (typeof window === 'undefined') return;

    syncFreeQuestionCount();

    try {
      const savedBookmarks = window.localStorage.getItem(LS_BOOKMARKS_KEY);
      if (savedBookmarks) {
        setBookmarks(JSON.parse(savedBookmarks));
      }
    } catch {}

    try {
      const savedStats = window.localStorage.getItem(LS_GLOBAL_STATS_KEY);
      if (savedStats) {
        setGlobalStats(JSON.parse(savedStats));
      }
    } catch {}

    try {
      const savedCompletedLessons = window.localStorage.getItem(LS_COMPLETED_LESSONS_KEY);
      if (savedCompletedLessons) {
        setCompletedLessons(JSON.parse(savedCompletedLessons));
      }
    } catch {}

    try {
      const savedSpacedRep = window.localStorage.getItem(LS_SPACED_REP_KEY);
      if (savedSpacedRep) {
        setSpacedRepData(JSON.parse(savedSpacedRep));
      }
    } catch {}

    try {
      const savedDarkMode = window.localStorage.getItem(LS_DARK_MODE_KEY);
      if (savedDarkMode) {
        setDarkMode(JSON.parse(savedDarkMode));
      }
    } catch {}

    try {
      const savedStreak = window.localStorage.getItem(LS_STREAK_KEY);
      if (savedStreak) {
        const parsed = JSON.parse(savedStreak);
        setStreakData(parsed.streakData || { currentStreak: 0, longestStreak: 0, lastStudyDate: '', totalStudyDays: 0 });
        setPassedExams(parsed.passedExams || 0);
      }
    } catch {}

    try {
      const onboardingComplete = window.localStorage.getItem(LS_ONBOARDING_KEY);
      if (!onboardingComplete) {
        setShowOnboarding(true);
      }
    } catch {}
  }, []);

  useEffect(() => {
    syncFreeQuestionCount();
  }, [isPremium]);

  useEffect(() => {
    setReviewNow(Date.now());
  }, [spacedRepData]);

  // ---------- HELPERS ----------

  const getAvailableSubelements = (): string[] => {
    const set = new Set<string>();
    (questionsData as Question[]).forEach((q) => {
      const match = q.id.match(/^(T\d)/);
      if (match) set.add(match[1]);
    });
    return Array.from(set).sort();
  };

  const subelements = getAvailableSubelements();

  const lessons = (lessonsData as LessonsFile).lessons;

  const isLessonCompleted = (id: string): boolean => completedLessons.includes(id);

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

  const openLesson = (lesson: Lesson) => {
    setCurrentLesson(lesson);
    setAppState('lesson');
  };

  const openLearn = () => {
    if (!isPremium) {
      openPaywall(
        'Learn mode is a Premium feature',
        'Upgrade to Premium to unlock guided lessons, topic-by-topic learning, and full study access before you test.'
      );
      return;
    }

    setAppState('learn');
  };

  const openAnalytics = () => {
    if (!isPremium) {
      openPaywall(
        'Analytics is a Premium feature',
        'Upgrade to Premium to see your weak areas, accuracy trends, and smarter study recommendations.'
      );
      return;
    }

    setAppState('analytics');
  };

  // ---------- SPACED REPETITION HELPERS ----------

  const updateSpacedRepetition = (questionId: string, wasCorrect: boolean) => {
    setSpacedRepData((prev) => {
      const now = Date.now();
      const existing = prev[questionId];

      let newData: SpacedRepData;

      if (wasCorrect) {
        const newStreak = Math.min((existing?.correctStreak ?? 0) + 1, 3);
        const interval = REVIEW_INTERVALS[newStreak] ?? REVIEW_INTERVALS[3];
        newData = {
          questionId,
          correctStreak: newStreak,
          lastAnswered: now,
          nextReviewDate: now + interval,
          timesAnswered: (existing?.timesAnswered ?? 0) + 1,
          timesCorrect: (existing?.timesCorrect ?? 0) + 1,
        };
      } else {
        newData = {
          questionId,
          correctStreak: 0,
          lastAnswered: now,
          nextReviewDate: now,
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

  const getDueReviewQuestions = (subelement?: string, now = reviewNow): Question[] => {
    const allQuestions = questionsData as Question[];

    return allQuestions.filter((q) => {
      if (subelement && !q.id.startsWith(subelement)) return false;
      const data = spacedRepData[q.id];
      if (!data) return false;
      return data.nextReviewDate <= now && data.correctStreak < 3;
    });
  };

  const getDueReviewCount = (subelement?: string): number => {
    return getDueReviewQuestions(subelement).length;
  };

  const getMasteredCount = (subelement?: string): number => {
    const allQuestions = questionsData as Question[];
    return allQuestions.filter((q) => {
      if (subelement && !q.id.startsWith(subelement)) return false;
      const data = spacedRepData[q.id];
      return data && data.correctStreak >= 3;
    }).length;
  };

  const startReviewMode = (subelement?: string) => {
    if (!isPremium) {
      openPaywall(
        'Review mode is a Premium feature',
        'Upgrade to Premium to unlock spaced repetition, review due questions, and keep your weak spots from sneaking back in.'
      );
      return;
    }

    const dueQuestions = getDueReviewQuestions(subelement, Date.now());

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

    const shuffled = [...dueQuestions].sort(() => 0.5 - Math.random());
    const limited = shuffled.slice(0, Math.min(20, shuffled.length));
    setActiveQuestions(limited);
  };

  const toggleDarkMode = () => {
    setDarkMode((prev) => {
      const next = !prev;
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(LS_DARK_MODE_KEY, JSON.stringify(next));
        document.documentElement.classList.toggle('dark', next);
      }
      return next;
    });
  };

  const completeOnboarding = () => {
    setShowOnboarding(false);
    setOnboardingSlide(0);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(LS_ONBOARDING_KEY, 'true');
    }
  };

  const resetAllProgress = () => {
    setGlobalStats({});
    setBookmarks([]);
    setSpacedRepData({});
    setCompletedLessons([]);
    setStreakData({ currentStreak: 0, longestStreak: 0, lastStudyDate: '', totalStudyDays: 0 });
    setPassedExams(0);

    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(LS_GLOBAL_STATS_KEY);
      window.localStorage.removeItem(LS_BOOKMARKS_KEY);
      window.localStorage.removeItem(LS_SPACED_REP_KEY);
      window.localStorage.removeItem(LS_COMPLETED_LESSONS_KEY);
      window.localStorage.removeItem(LS_STREAK_KEY);
    }

    setShowResetConfirm(false);
  };

  const updateStreak = () => {
    const today = new Date().toISOString().split('T')[0];

    setStreakData((prev) => {
      if (prev.lastStudyDate === today) {
        return prev;
      }

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      let newStreak: StreakData;

      if (prev.lastStudyDate === yesterdayStr) {
        const newCurrentStreak = prev.currentStreak + 1;
        newStreak = {
          currentStreak: newCurrentStreak,
          longestStreak: Math.max(prev.longestStreak, newCurrentStreak),
          lastStudyDate: today,
          totalStudyDays: prev.totalStudyDays + 1,
        };
      } else if (prev.lastStudyDate === '') {
        newStreak = {
          currentStreak: 1,
          longestStreak: 1,
          lastStudyDate: today,
          totalStudyDays: 1,
        };
      } else {
        newStreak = {
          currentStreak: 1,
          longestStreak: prev.longestStreak,
          lastStudyDate: today,
          totalStudyDays: prev.totalStudyDays + 1,
        };
      }

      if (typeof window !== 'undefined') {
        window.localStorage.setItem(LS_STREAK_KEY, JSON.stringify({ streakData: newStreak, passedExams }));
      }

      return newStreak;
    });
  };

  const recordPassedExam = () => {
    setPassedExams((prev) => {
      const newCount = prev + 1;
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(LS_STREAK_KEY, JSON.stringify({ streakData, passedExams: newCount }));
      }
      return newCount;
    });
  };

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

  const importProgress = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const importData = JSON.parse(content);

        if (!importData.data) {
          alert('Invalid backup file format.');
          return;
        }

        const { data } = importData;

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

    event.target.value = '';
  };

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

  const getSubelementFromId = (id: string): string => {
    const match = id.match(/^(T\d)/);
    return match ? match[1] : 'UNK';
  };

  const isBookmarked = (id: string): boolean => bookmarks.includes(id);

  const handleToggleBookmark = (id: string) => {
    if (!isPremium) {
      openPaywall(
        'Bookmarks are a Premium feature',
        'Upgrade to Premium to save tricky questions, revisit them anytime, and build focused practice sets.'
      );
      return;
    }

    setBookmarks((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(LS_BOOKMARKS_KEY, JSON.stringify(next));
      }
      return next;
    });
  };

  const isAnswerCorrect = (optionIndex: number, correctAnswer: string): boolean => {
    const letters = ['A', 'B', 'C', 'D'];
    const optionLetter = letters[optionIndex] ?? '';
    return optionLetter.toUpperCase() === correctAnswer.trim().toUpperCase();
  };

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

  const buildQuestionPool = (source: 'all' | 'bookmarks'): Question[] => {
    const allQuestions = questionsData as Question[];
    const base =
      source === 'bookmarks'
        ? allQuestions.filter((q) => bookmarks.includes(q.id))
        : allQuestions;

    if (selectedSubelement === 'ALL') return base;
    return base.filter((q) => q.id.startsWith(selectedSubelement));
  };

  const startQuiz = (selectedMode: Mode) => {
    if (!isPremium && selectedMode !== 'study') {
      const featureLabel =
        selectedMode === 'exam'
          ? 'Practice exams'
          : selectedMode === 'bookmarks'
          ? 'Bookmarks mode'
          : 'Review mode';

      openPaywall(
        `${featureLabel} are Premium`,
        'The free plan includes 25 random practice questions per day in basic Study Mode. Upgrade for unlimited sessions and every study mode.'
      );
      return;
    }

    if (!isPremium && selectedMode === 'study') {
      syncFreeQuestionCount();
      if (getDailyQuestionsRemaining() <= 0) {
        openPaywall(
          'You\'ve used your 25 free questions for today',
          'Upgrade to Premium for unlimited questions, or come back tomorrow for another free set of 25 random practice questions.'
        );
        return;
      }
    }

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

  const startRetryMissed = () => {
    if (!missedQuestions.length) return;

    setMode('study');
    setAppState('quiz');
    setCurrentQuestionIndex(0);
    setScore(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setSubelementStats({});

    const filtered =
      selectedSubelement === 'ALL'
        ? missedQuestions
        : missedQuestions.filter((q) => q.id.startsWith(selectedSubelement));

    const shuffled = [...filtered].sort(() => 0.5 - Math.random());
    setActiveQuestions(shuffled);
  };

  const handleAnswerClick = (option: string) => {
    if ((mode === 'study' || mode === 'bookmarks' || mode === 'review') && showExplanation) return;

    setSelectedAnswer(option);

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
      updateSpacedRepetition(currentQ.id, wasCorrect);
      updateStreak();

      if (!isPremium && mode === 'study') {
        incrementDailyCount();
        syncFreeQuestionCount();
      }
    }
  };

  const handleNextQuestion = () => {
    if (!activeQuestions.length) return;
    const currentQ = activeQuestions[currentQuestionIndex];

    if (mode === 'exam' && selectedAnswer) {
      const optionIndex = currentQ.options.indexOf(selectedAnswer);
      const wasCorrect =
        optionIndex !== -1 && isAnswerCorrect(optionIndex, currentQ.correctAnswer);

      const sub = getSubelementFromId(currentQ.id);

      if (wasCorrect) {
        setScore((prev) => prev + 1);
      } else {
        setMissedQuestions((prev) => {
          if (prev.find((q) => q.id === currentQ.id)) return prev;
          return [...prev, currentQ];
        });
      }

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

      updateGlobalStats(currentQ, wasCorrect);
      updateSpacedRepetition(currentQ.id, wasCorrect);
      updateStreak();
    }

    const nextIndex = currentQuestionIndex + 1;

    if (!isPremium && mode === 'study' && nextIndex < activeQuestions.length && getDailyQuestionsRemaining() <= 0) {
      syncFreeQuestionCount();
      openPaywall(
        'You\'ve used your 25 free questions for today',
        'Upgrade to Premium to keep going right now with unlimited questions, or come back tomorrow for another free set.'
      );
      return;
    }

    if (nextIndex < activeQuestions.length) {
      setCurrentQuestionIndex(nextIndex);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      if (mode === 'exam') {
        const finalScore = score + (selectedAnswer ? 1 : 0);
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

  const replayTutorial = () => {
    setShowOnboarding(true);
    setOnboardingSlide(0);
    setAppState('menu');
  };

  const handlePurchase = async () => {
    const success = await purchase();
    if (success) {
      closePaywall();
    }
  };

  const handleRestore = async () => {
    const success = await restore();
    if (success) {
      closePaywall();
    }
  };

  // Pre-compute derived data for components
  const dueReviewCounts: Record<string, number> = {};
  const masteredCounts: Record<string, number> = {};
  subelements.forEach(sub => {
    dueReviewCounts[sub] = getDueReviewCount(sub);
    masteredCounts[sub] = getMasteredCount(sub);
  });

  const earnedBadges = getEarnedBadges();

  // ---------- RENDER ----------

  let content;

  if (appState === 'menu') {
    content = (
      <MainMenu
        darkMode={darkMode}
        isPremium={isPremium}
        freeQuestionsRemaining={freeQuestionsRemaining}
        streakData={streakData}
        earnedBadges={earnedBadges}
        badgesTotal={BADGES.length}
        selectedSubelement={selectedSubelement}
        setSelectedSubelement={setSelectedSubelement}
        subelements={subelements}
        questionsCount={questionsData.length}
        completedLessonsCount={completedLessons.length}
        lessonsTotal={lessons.length}
        bookmarksCount={bookmarks.length}
        dueReviewCount={getDueReviewCount()}
        masteredCount={getMasteredCount()}
        startQuiz={startQuiz}
        startReviewMode={startReviewMode}
        openLearn={openLearn}
        openAnalytics={openAnalytics}
        setAppState={setAppState}
        showOnboarding={showOnboarding}
        onboardingSlide={onboardingSlide}
        setOnboardingSlide={setOnboardingSlide}
        completeOnboarding={completeOnboarding}
      />
    );
  } else if (appState === 'analytics') {
    content = (
      <AnalyticsView
        darkMode={darkMode}
        subelements={subelements}
        lessons={lessons}
        globalStats={globalStats}
        setSelectedSubelement={setSelectedSubelement}
        startQuiz={startQuiz}
        setAppState={setAppState}
      />
    );
  } else if (appState === 'settings') {
    content = (
      <SettingsView
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
        globalStats={globalStats}
        completedLessonsCount={completedLessons.length}
        lessonsTotal={lessons.length}
        bookmarksCount={bookmarks.length}
        masteredCount={getMasteredCount()}
        earnedBadges={earnedBadges}
        badgesTotal={BADGES.length}
        exportProgress={exportProgress}
        importProgress={importProgress}
        showResetConfirm={showResetConfirm}
        setShowResetConfirm={setShowResetConfirm}
        resetAllProgress={resetAllProgress}
        setAppState={setAppState}
        replayTutorial={replayTutorial}
      />
    );
  } else if (appState === 'learn') {
    content = (
      <LearnView
        darkMode={darkMode}
        lessons={lessons}
        completedLessons={completedLessons}
        globalStats={globalStats}
        dueReviewCounts={dueReviewCounts}
        masteredCounts={masteredCounts}
        openLesson={openLesson}
        startReviewMode={startReviewMode}
        setAppState={setAppState}
      />
    );
  } else if (appState === 'lesson' && currentLesson) {
    content = (
      <LessonView
        darkMode={darkMode}
        currentLesson={currentLesson}
        completed={isLessonCompleted(currentLesson.id)}
        lessons={lessons}
        markLessonCompleted={markLessonCompleted}
        startQuizForSubelement={startQuizForSubelement}
        openLesson={openLesson}
        setAppState={setAppState}
      />
    );
  } else if (appState === 'results') {
    content = (
      <ResultsView
        darkMode={darkMode}
        mode={mode}
        score={score}
        activeQuestions={activeQuestions}
        missedQuestions={missedQuestions}
        subelementStats={subelementStats}
        spacedRepData={spacedRepData}
        isBookmarked={isBookmarked}
        toggleBookmark={handleToggleBookmark}
        getDueReviewCount={getDueReviewCount}
        startRetryMissed={startRetryMissed}
        setAppState={setAppState}
      />
    );
  } else {
    content = (
      <QuizView
        darkMode={darkMode}
        mode={mode}
        selectedSubelement={selectedSubelement}
        activeQuestions={activeQuestions}
        currentQuestionIndex={currentQuestionIndex}
        selectedAnswer={selectedAnswer}
        showExplanation={showExplanation}
        isBookmarked={isBookmarked}
        toggleBookmark={handleToggleBookmark}
        spacedRepData={spacedRepData}
        handleAnswerClick={handleAnswerClick}
        handleNextQuestion={handleNextQuestion}
        isAnswerCorrect={isAnswerCorrect}
        setAppState={setAppState}
      />
    );
  }

  return (
    <>
      {content}
      {showPaywall && (
        <PaywallModal
          darkMode={darkMode}
          title={paywallTitle}
          message={paywallMessage}
          productTitle={productDetails?.title}
          productPrice={productDetails?.priceString}
          onPurchase={handlePurchase}
          onRestore={handleRestore}
          onClose={closePaywall}
          isPurchasing={isPurchasing}
          isRestoring={isRestoring}
          error={purchaseError}
        />
      )}
    </>
  );
}
