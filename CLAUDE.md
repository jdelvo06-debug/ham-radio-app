# Ham Radio Technician Exam Study App

## Overview
A web-based study application for the FCC Amateur Radio Technician Class license exam. Provides three study modes with progress tracking and analytics.

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
│   │   ├── page.tsx           # Main app component (703 lines, monolithic)
│   │   ├── ham_radio_questions.json  # 411 parsed questions
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

### Subelements
Questions are organized by FCC subelements (T0-T9):
- T0: Commission's Rules
- T1: Operating Procedures
- T2: Radio and Electronic Fundamentals
- T3: Station Equipment
- T4: Amateur Radio Practices
- T5: Electrical Principles
- T6: Electronic and Electrical Components
- T7: Station Equipment (continued)
- T8: Operating Procedures
- T9: Safety and Emergency

## FCC Exam Facts
- 35 questions from a pool of 411
- 74% passing score (26 correct)
- Questions rotate every 4 years
- Current pool: 2022-2026

## Key Files
| File | Purpose |
|------|---------|
| `my-study-app/app/page.tsx` | Main app logic (all UI + state) |
| `my-study-app/app/ham_radio_questions.json` | 411 parsed questions |
| `generate_complete_json.py` | Primary question parser |
| `build_questions_json.py` | Alternative parser with different approach |

## Current Limitations
- **Monolithic architecture:** All 703 lines in single `page.tsx`
- **No tests:** Zero test coverage
- **No component library:** Everything is inline Tailwind
- **Client-side only:** No server components or API routes

## localStorage Keys
- `ham_technician_bookmarks` - Array of bookmarked question IDs
- `ham_technician_global_stats` - Per-subelement accuracy stats
