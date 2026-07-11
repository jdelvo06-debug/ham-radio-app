export interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  figure?: string;
}

export interface SubelementStats {
  correct: number;
  total: number;
}

export interface GlobalSubelementStats {
  correct: number;
  total: number;
}

export interface LessonSection {
  title: string;
  content: string;
  keyFacts: string[];
}

export interface Lesson {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  estimatedMinutes: number;
  sections: LessonSection[];
  examTip: string;
  questionCount: number;
}

export interface LessonsFile {
  lessons: Lesson[];
}

export interface SpacedRepData {
  questionId: string;
  correctStreak: number;
  lastAnswered: number;
  nextReviewDate: number;
  timesAnswered: number;
  timesCorrect: number;
}

export type AppState = 'menu' | 'quiz' | 'results' | 'analytics' | 'learn' | 'lesson' | 'settings';
export type Mode = 'study' | 'exam' | 'bookmarks' | 'review';

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastStudyDate: string;
  totalStudyDays: number;
}

export interface BadgeCheckParams {
  totalAnswered: number;
  totalCorrect: number;
  streak: StreakData;
  completedLessons: number;
  masteredCount: number;
  passedExams: number;
}

export interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
  check: (params: BadgeCheckParams) => boolean;
}

export const LS_BOOKMARKS_KEY = 'ham_technician_bookmarks';
export const LS_GLOBAL_STATS_KEY = 'ham_technician_global_stats';
export const LS_COMPLETED_LESSONS_KEY = 'ham_technician_completed_lessons';
export const LS_SPACED_REP_KEY = 'ham_technician_spaced_rep';
export const LS_STREAK_KEY = 'ham_technician_streak';
export const LS_ONBOARDING_KEY = 'ham_technician_onboarding_complete';

export const REVIEW_INTERVALS: Record<number, number> = {
  0: 0,
  1: 1 * 60 * 60 * 1000,
  2: 24 * 60 * 60 * 1000,
  3: 7 * 24 * 60 * 60 * 1000,
};

export const ONBOARDING_SLIDES = [
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

export const APP_VERSION = '1.3.0';

export const BADGES: Badge[] = [
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
