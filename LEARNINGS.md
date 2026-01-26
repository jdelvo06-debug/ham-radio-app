# Learnings & Gotchas

## Architecture Notes

### Monolithic page.tsx
The entire app lives in a single ~800-line `page.tsx` file. This includes:
- All state management (10+ useState hooks)
- All UI rendering (6 app states: menu, learn, lesson, quiz, results, analytics)
- All business logic (scoring, bookmarking, lesson tracking, stats)

**Why it works for now:** Simple app with limited scope. Single file = easy to understand.

**When to refactor:** If adding new modes, complex features, or tests.

### State Machine Pattern
The app uses a simple state machine via `appState`:
```
menu -> learn -> lesson -> quiz -> results -> menu
         |                   |
         v                   v
      (back)             (back to lesson)

menu -> quiz -> results -> menu
         |
         v
      analytics -> menu
```

### Learn Mode Architecture (NEW)
The Learn feature adds two new states:
- `learn`: Topic list showing all 10 lessons
- `lesson`: Individual lesson view with sections

Data flows:
1. User selects topic from list
2. `currentLesson` state populated with lesson object
3. User can "Mark Complete" (persisted to localStorage)
4. User can "Take Quiz" (starts quiz filtered to that subelement)

## localStorage Patterns

### SSR Safety
Next.js renders on server first. Always guard localStorage access:
```typescript
// CORRECT
if (typeof window !== 'undefined') {
  window.localStorage.setItem(key, value);
}

// ALSO CORRECT (used in useEffect)
useEffect(() => {
  if (typeof window === 'undefined') return;
  // localStorage access here
}, []);
```

### Persistence Strategy
- Bookmarks: Saved immediately on toggle
- Stats: Saved after each question answered
- Completed Lessons: Saved immediately on "Mark Complete"
- No debouncing needed (low frequency operations)

### Storage Keys
```typescript
const LS_BOOKMARKS_KEY = 'ham_technician_bookmarks';
const LS_GLOBAL_STATS_KEY = 'ham_technician_global_stats';
const LS_COMPLETED_LESSONS_KEY = 'ham_technician_completed_lessons';
const LS_SPACED_REP_KEY = 'ham_technician_spaced_rep';
```

## Data Model

### lessons.json Structure
```typescript
interface LessonSection {
  title: string;        // "Electrical Shock Hazards"
  content: string;      // Paragraph of explanation
  keyFacts: string[];   // 3-4 bullet points
}

interface Lesson {
  id: string;           // "T0" (matches subelement)
  title: string;        // "Safety"
  subtitle: string;     // "Electrical, Antenna & RF Hazards"
  icon: string;         // "⚡"
  estimatedMinutes: number;  // 5
  sections: LessonSection[];  // 5-6 sections
  examTip: string;      // Key takeaway
  questionCount: number; // For display
}
```

### Content Source
Lesson content was extracted from:
- PowerPoint presentations (T0-T9)
- Ham radio study guide text file
- Condensed to ~5 minute reading time per topic

### Spaced Repetition Data Structure
```typescript
interface SpacedRepData {
  questionId: string;
  correctStreak: number;      // 0-3 (3 = mastered)
  lastAnswered: number;       // timestamp
  nextReviewDate: number;     // timestamp when due
  timesAnswered: number;      // total attempts
  timesCorrect: number;       // total correct
}
```

## Spaced Repetition Implementation

### Algorithm Design
Simple streak-based system (no complex SM-2 or similar):
- **Streak 0 (wrong):** Review immediately available
- **Streak 1:** Review after 1 hour
- **Streak 2:** Review after 1 day
- **Streak 3 (mastered):** Review after 7 days, removed from active reviews

Getting a question wrong always resets streak to 0.

### Review Intervals Constant
```typescript
const REVIEW_INTERVALS: Record<number, number> = {
  0: 0,                           // immediate
  1: 1 * 60 * 60 * 1000,          // 1 hour
  2: 24 * 60 * 60 * 1000,         // 1 day
  3: 7 * 24 * 60 * 60 * 1000,     // 7 days (mastered)
};
```

### Key Helper Functions
- `updateSpacedRepetition(questionId, isCorrect)` - Updates streak and calculates next review date
- `getDueReviewQuestions(subelement?)` - Returns questions where `nextReviewDate <= now`
- `getDueReviewCount(subelement?)` - Count of due reviews (for UI badges)
- `getMasteredCount(subelement?)` - Count of questions with streak >= 3

### Integration Points
Spaced repetition data is updated in:
1. `handleAnswerClick` - For study, bookmarks, and review modes (immediate feedback)
2. `handleNextQuestion` - For exam mode (tracked but no immediate feedback)

### UI Locations
- **Main menu:** Rose/pink "Review Due" button with count badge
- **Learn section:** Per-topic "Review X due" buttons on lesson cards
- **Quiz view:** Shows mastery progress in explanation panel during review mode
- **Results screen:** Shows review-specific stats (mastered count, remaining reviews)

## Parser Quirks

### Question ID Format
IDs follow FCC format: `T` + subelement (0-9) + section (A-Z) + number (01-99)
- Example: `T0A01` = Subelement 0, Section A, Question 1
- Regex for subelement: `/^(T\d)/`

### Answer Format
`correctAnswer` is a single letter ("A", "B", "C", "D"), NOT the full text.
Mapping: options[0] = A, options[1] = B, etc.

### Explanation Generation
The Python parsers generate explanations programmatically based on keyword matching.
Not all questions have custom explanations - some get generic fallbacks.

## Port Configuration
- **Port 3005:** Development server (`npm run dev`)
- **Port 3010:** Docker container
- **Port 3000:** Reserved (Open WebUI uses it globally)

Configured in `package.json`:
```json
"dev": "next dev -p 3005"
```

## Known Bugs & Tech Debt

### Current Issues
1. **No loading state:** Questions load synchronously from JSON import
2. **No error boundaries:** Errors crash the whole app
3. **Hardcoded 35 questions:** Exam length not configurable
4. **ESLint warnings:** setState in useEffect (intentional for initial load)

### Future Considerations
1. Add tests before any major refactoring
2. Extract reusable components (QuestionCard, ProgressBar, LessonCard, etc.)
3. Consider Zustand if state gets more complex
4. Add keyboard navigation for accessibility
5. Previous/Next navigation between lessons
6. Flashcard mode for key facts

## Build & Deploy

### Static Export Works
This app can be statically exported since:
- No API routes
- No server-side data fetching
- All data bundled in JSON

### Docker Notes
Dockerfile uses multi-stage build:
1. Build stage: `npm run build`
2. Production stage: `next start`

## Testing Notes (for future)

### Good First Tests
1. `isAnswerCorrect()` - pure function, easy to test
2. `getSubelementFromId()` - pure function
3. `buildQuestionPool()` - filter logic
4. `isLessonCompleted()` - pure function
5. `markLessonCompleted()` - state + localStorage

### Integration Test Candidates
1. Starting each mode creates correct question count
2. Exam mode doesn't show explanations until finish
3. Bookmarks persist across page refresh
4. Completed lessons persist across page refresh
5. "Take Quiz" from lesson filters to correct subelement

## UI Color Scheme

### Button Colors
- **Purple:** Learn mode (📚)
- **Green/Emerald:** Study mode, completion, correct answers
- **Blue:** Practice exam, primary actions, question IDs
- **Amber/Yellow:** Bookmarks, exam tips, warnings
- **Red:** Wrong answers, failing scores
- **Slate:** Neutral, backgrounds, disabled states
