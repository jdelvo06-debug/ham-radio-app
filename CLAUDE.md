# Ham Radio Technician Exam Study App

## Overview
A web-based study application for the FCC Amateur Radio Technician Class license exam. Provides guided learning with topic-based lessons, multiple study modes, progress tracking, and analytics.

## Tech Stack
- **Framework:** Next.js 16.0.10 with App Router
- **UI:** React 19.2.1 + TypeScript
- **Styling:** Tailwind CSS 4
- **Data Parsing:** Python 3 scripts for FCC question pool processing

## Project Structure
```
ham-radio-app/
├── my-study-app/              # Next.js application
│   ├── app/
│   │   ├── page.tsx           # Main app component (~1200 lines, monolithic)
│   │   ├── ham_radio_questions.json  # 411 parsed questions
│   │   ├── lessons.json       # 10 topic lessons with detailed content
│   │   ├── layout.tsx         # Root layout
│   │   └── globals.css        # Tailwind imports
│   ├── public/                # Static assets
│   └── package.json
├── *.py                       # Python parsers (6 files)
├── raw_questions.txt          # Source FCC question data
└── .claude/                   # Claude Code configuration
    ├── rules/                 # Coding rules
    └── blueprints/            # Task templates
```

## Development

### Local Development
```bash
cd my-study-app
npm run dev    # Starts on port 3005
```

### Docker
```bash
cd my-study-app
docker compose up    # Starts on port 3010
```

### Key URLs
- Development: http://localhost:3005
- Docker: http://localhost:3010

## Application Modes

### Learn Mode (NEW)
- 10 topic-based lessons (T0-T9)
- Each lesson has 5-6 sections with detailed content
- Key facts highlighted for each section
- Exam tips at end of each lesson
- "Mark as Completed" tracking
- Direct "Take Quiz" button to test on that topic
- Progress bar showing completion status

### Study Mode
- All questions (or filtered by subelement)
- Immediate feedback after each answer
- Shows explanations
- Tracks accuracy

### Exam Mode
- 35 random questions (simulates real exam)
- No immediate feedback
- Pass threshold: 74% (26/35 correct)
- Shows missed questions at end
- "Retry Missed" feature

### Bookmarks Mode
- Practice only bookmarked questions
- Study-mode behavior (immediate feedback)
- Persisted to localStorage

### Review Mode (Spaced Repetition)
- Automatically resurfaces questions you've missed or need to review
- Simple algorithm: get a question right 3 times in a row = mastered
- Wrong answers reset the streak and make questions appear sooner
- Review intervals increase with each correct answer (immediate → 1 hour → 1 day → 7 days)
- Shows due count on main menu and per-topic in Learn section
- Displays mastery progress during review sessions
- Questions mastered (3 correct streak) no longer appear in reviews

## Data Model

### Question Interface
```typescript
interface Question {
  id: string;           // "T0A01", "T1B02", etc.
  question: string;     // Question text
  options: string[];    // 4 answer options
  correctAnswer: string; // "A", "B", "C", or "D"
  explanation: string;  // Why the answer is correct
}
```

### Lesson Interface
```typescript
interface LessonSection {
  title: string;        // Section heading
  content: string;      // Explanatory text
  keyFacts: string[];   // Bullet points of key facts
}

interface Lesson {
  id: string;           // "T0", "T1", etc.
  title: string;        // "Safety", "FCC Rules", etc.
  subtitle: string;     // Brief description
  icon: string;         // Emoji icon
  estimatedMinutes: number;  // Reading time (~5 min each)
  sections: LessonSection[];  // 5-6 sections per lesson
  examTip: string;      // Key exam tip
  questionCount: number; // Questions in this topic
}
```

### Spaced Repetition Interface
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

### Streak Interface
```typescript
interface StreakData {
  currentStreak: number;      // Current consecutive days
  longestStreak: number;      // Best streak ever
  lastStudyDate: string;      // YYYY-MM-DD format
  totalStudyDays: number;     // Total days studied
}
```

### Subelements
Questions and lessons are organized by FCC subelements (T0-T9):
- T0: Safety (Electrical, Antenna & RF Hazards)
- T1: FCC Rules (Licensing, Privileges & Regulations)
- T2: Operating Procedures (Repeaters, Nets & Emergency Comms)
- T3: Radio Wave Propagation (How Signals Travel)
- T4: Amateur Radio Practices (Station Setup & Controls)
- T5: Electrical Principles (Ohm's Law, Power & Math)
- T6: Electronic Components (Resistors, Capacitors, Semiconductors)
- T7: Practical Circuits (Equipment & Troubleshooting)
- T8: Signals & Emissions (Modulation, Digital & Satellites)
- T9: Antennas & Feed Lines (Antenna Types, Coax & Connectors)

## FCC Exam Facts
- 35 questions from a pool of 411
- 74% passing score (26 correct)
- Questions rotate every 4 years
- Current pool: 2022-2026

## Key Files
| File | Purpose |
|------|---------|
| `my-study-app/app/page.tsx` | Main app logic (~1900 lines, all UI + state) |
| `my-study-app/app/ham_radio_questions.json` | 411 parsed questions |
| `my-study-app/app/lessons.json` | 10 detailed topic lessons |
| `generate_complete_json.py` | Primary question parser |
| `build_questions_json.py` | Alternative parser with different approach |

## App States
The app uses a state machine pattern with these states:
- `menu` - Main menu with mode selection
- `learn` - Topic list view (10 lessons)
- `lesson` - Individual lesson view with sections
- `quiz` - Question display and answering
- `results` - Score and performance breakdown
- `analytics` - Global statistics dashboard
- `settings` - App settings (dark mode, reset progress, about)

## localStorage Keys
- `ham_technician_bookmarks` - Array of bookmarked question IDs
- `ham_technician_global_stats` - Per-subelement accuracy stats
- `ham_technician_completed_lessons` - Array of completed lesson IDs
- `ham_technician_spaced_rep` - Spaced repetition data per question
- `ham_technician_dark_mode` - Dark mode preference (boolean)
- `ham_technician_streak` - Study streak and passed exams data

## Spaced Repetition Algorithm
Simple system based on correct answer streaks:
- **Streak 0 (wrong):** Review immediately available
- **Streak 1:** Review after 1 hour
- **Streak 2:** Review after 1 day
- **Streak 3 (mastered):** Review after 7 days, removed from active reviews

Getting a question wrong resets the streak to 0.

## Settings Page
The app includes a Settings page with:
- **Dark Mode toggle** - Switches between light and dark themes (persisted)
- **Progress Summary** - Shows questions answered, accuracy, lessons completed, bookmarks, mastered count
- **Export/Import** - Backup and restore all progress as JSON file
- **Achievements Gallery** - Grid display of all 15 badges with earned/locked status
- **Reset All Progress** - Clears all data with confirmation dialog
- **About Section** - Version number, FCC attribution, disclaimer

## Study Streaks & Badges
Gamification features to encourage daily study:

### Streak Tracking
- **Current Streak** - Consecutive days of study
- **Longest Streak** - Personal best streak ever achieved
- **Total Study Days** - Lifetime count of days studied
- Streak updates when user answers any question
- Displayed prominently on main menu

### Badge System
15 achievements across multiple categories:
- **Questions**: First Steps (1), Getting Started (10), Dedicated Learner (50), Century Club (100)
- **Streaks**: On a Roll (3 days), Week Warrior (7), Two Week Champ (14), Monthly Master (30)
- **Lessons**: Student (1 complete), Scholar (all 10 complete)
- **Mastery**: Memory Pro (1), Review Expert (10), Knowledge Keeper (50)
- **Exams**: Exam Ready (pass 1), Test Veteran (pass 5)

Badge progress shown on main menu and full gallery in Settings.

## Dark Mode
All pages support dark mode:
- Toggle available in Settings
- Preference saved to localStorage
- Consistent slate-900 dark backgrounds
- All UI elements styled for both modes

## Current Limitations
- **Monolithic architecture:** All ~1900 lines in single `page.tsx`
- **No tests:** Zero test coverage
- **No component library:** Everything is inline Tailwind
- **Client-side only:** No server components or API routes

## Analytics & Weak Areas
The Analytics page includes intelligent weak areas analysis:
- **Weak Areas (red)** - Topics below 74% passing threshold, sorted weakest first
- **Strong Areas (green)** - Topics at or above 74%, sorted strongest first
- **Need More Practice (amber)** - Topics with <5 questions answered
- Requires 5+ questions per topic for meaningful accuracy insights
- Quick "Study" buttons to jump directly to weak topics

## Lesson Navigation
Each lesson view includes Previous/Next buttons at the bottom:
- Shows adjacent lesson titles (e.g., "T0: Safety" ← → "T2: Operating Procedures")
- Disabled when at first/last lesson
- Allows sequential reading without returning to topic list

## Future Enhancement Ideas
- Flashcard mode for key facts
- Study streaks tracking
- Push notifications for review reminders
- Mobile app (App Store)
