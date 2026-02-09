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
- Dark Mode: Saved immediately on toggle
- No debouncing needed (low frequency operations)

### Storage Keys
```typescript
const LS_BOOKMARKS_KEY = 'ham_technician_bookmarks';
const LS_GLOBAL_STATS_KEY = 'ham_technician_global_stats';
const LS_COMPLETED_LESSONS_KEY = 'ham_technician_completed_lessons';
const LS_SPACED_REP_KEY = 'ham_technician_spaced_rep';
const LS_DARK_MODE_KEY = 'ham_technician_dark_mode';
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

## Settings Page Implementation

### Dark Mode
- State: `const [darkMode, setDarkMode] = useState(false);`
- Toggle function saves to localStorage immediately
- Applied via conditional Tailwind classes throughout all pages
- Dark palette uses `slate-900` backgrounds, `slate-800` cards, appropriate text colors

### Dark Mode Pattern
```typescript
// Background and text
className={`${darkMode ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-900'}`}

// Cards and containers
className={`${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}

// Secondary text
className={`${darkMode ? 'text-slate-400' : 'text-slate-500'}`}
```

### Reset Progress
- Clears all 4 localStorage keys (stats, bookmarks, lessons, spaced rep)
- Resets all related state to empty/default values
- Protected by confirmation modal to prevent accidents

### App Version
- Stored as constant: `const APP_VERSION = '1.1.0';`
- Displayed in Settings About section

## Data Export/Import

### Export Format
```typescript
{
  version: string;           // APP_VERSION
  exportedAt: string;        // ISO timestamp
  data: {
    globalStats: Record<string, GlobalSubelementStats>;
    bookmarks: string[];
    completedLessons: string[];
    spacedRepData: Record<string, SpacedRepData>;
    darkMode: boolean;
  }
}
```

### Export Implementation
- Creates Blob with JSON content
- Triggers download via temporary anchor element
- Filename: `ham-radio-progress-YYYY-MM-DD.json`

### Import Implementation
- Uses hidden file input with `.json` accept filter
- FileReader API to read content
- Validates `data` object exists before importing
- Updates both state and localStorage for each data type
- Shows alert on success/failure

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
- **Port 4000:** Development and production server (PM2)
- **Port 3000:** Reserved (Open WebUI uses it globally)

Configured in `package.json`:
```json
"dev": "next dev -p 4000",
"start": "next start -p 4000"
```

## Weak Areas Analysis

### Algorithm
The Analytics page categorizes topics into three groups:
- **Weak Areas:** `total >= 5 && pct < 74` - sorted by accuracy ascending
- **Strong Areas:** `total >= 5 && pct >= 74` - sorted by accuracy descending
- **Needs More Data:** `total < 5` - insufficient questions to judge

### Threshold Rationale
- 74% is the FCC passing threshold
- 5 questions minimum avoids noisy data (1/2 = 50% isn't meaningful)
- Topics are linked to lesson titles for context

### UI Pattern
Each weak area has a "Study" button that:
1. Sets `selectedSubelement` to that topic
2. Calls `startQuiz('study')` to begin practice

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
5. Flashcard mode for key facts

## Build & Deploy

### PM2 Production Server
The app runs via PM2 (`ecosystem.config.js`) on port 4000:
- `npm run build` (uses `--webpack` flag for PWA compatibility with Next.js 16 Turbopack)
- `pm2 start ecosystem.config.js`
- Auto-restarts on crash, logs to `./logs/`

### PWA Support
The app is a Progressive Web App (installable via Chrome "Add to Home Screen"):
- `@ducanh2912/next-pwa` generates the service worker
- Manifest at `public/manifest.webmanifest`
- Icons at `public/icons/` (7 sizes, .webp format)
- Service worker disabled in dev mode, active in production
- Generated files (`sw.js`, `workbox-*.js`) are gitignored

### Mobile Builds (Capacitor)
Capacitor still works via a separate build script:
- `npm run build:mobile` exports static files to `out/`
- `npx cap sync` copies to iOS/Android projects

### Next.js 16 + PWA Gotcha
`@ducanh2912/next-pwa` uses webpack plugins, but Next.js 16 defaults to Turbopack.
The build script uses `--webpack` flag to force webpack mode for PWA compatibility.

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
