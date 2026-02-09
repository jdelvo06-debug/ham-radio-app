# Ham Radio Technician Exam Study App

A modern web application to help you prepare for the FCC Amateur Radio Technician Class license exam. Built with Next.js 16 and React 19.

## Features

- **👋 Onboarding Tutorial** - First-time user walkthrough explaining app features
- **📚 Learn Mode** - Study 10 topic-based lessons before testing yourself
- **📖 Study Mode** - Practice all 411 questions with immediate feedback and explanations
- **📝 Practice Exam** - Simulate the real exam with 35 random questions and pass/fail scoring
- **🔄 Spaced Repetition** - Questions you miss automatically resurface for review until mastered
- **⭐ Bookmarks** - Save difficult questions for focused review
- **📊 Analytics & Weak Areas** - Track performance and get personalized study recommendations
- **🔥 Study Streaks** - Track consecutive study days to build habits
- **🏆 Achievements** - Earn 15 badges for milestones like questions answered, streaks, and exams passed
- **🌙 Dark Mode** - Easy-on-the-eyes dark theme for night studying
- **⚙️ Settings** - Export/import progress, reset data, achievements gallery, about info
- **Subelement Filtering** - Focus on specific topics (T0-T9)
- **Retry Missed** - After an exam, retry only the questions you got wrong
- **Persistent Progress** - Your bookmarks, stats, review data, streaks, and lesson progress are saved locally

## Screenshots

### Main Menu
The home screen displays:
- **Title:** "Technician Class - Amateur Radio License Prep"
- **Streak Display:** Shows 🔥 current streak, ⭐ best streak, 📅 total study days (appears after first study session)
- **Achievements Preview:** Shows earned badge icons (appears after earning first badge)
- **Subelement Filter:** Dropdown to focus on specific topics (T0-T9) or all questions
- **Learn Button:** Purple - study topics with guided lessons (~5 min each)
- **Study Mode Button:** Green - immediate answers & explanations
- **Practice Exam Button:** Blue - 35 questions, no hints, pass/fail
- **Bookmarks Button:** Yellow - practice only saved questions
- **Review Due Button:** Rose/Pink - spaced repetition reviews
- **Analytics Button:** View performance stats
- **Settings Button:** Dark mode, achievements, reset progress, about

### Learn Mode
The guided learning interface shows:
- Progress bar showing completed lessons (e.g., "3/10 completed")
- 10 topic cards with icons, titles, and completion status
- Quiz accuracy displayed for each topic you've practiced
- Mastered question count per topic
- "Review X due" button appears when questions need review

### Lesson View
Each lesson includes:
- 5-6 sections with detailed explanations
- "Key Facts" boxes highlighting important points
- Exam tip at the end of each lesson
- "Mark as Completed" button to track progress
- "Take Quiz" button to test on that specific topic
- Previous/Next navigation to move between lessons sequentially

### Study Mode
The quiz interface shows:
- Progress bar and question counter (e.g., "1 / 411")
- Question ID and text (e.g., "[T0B08] Which is a proper grounding method for a tower?")
- Four answer options as clickable buttons
- **After answering:** Correct answer highlighted in green with checkmark, wrong answers faded
- **Explanation panel:** Blue box explaining why the answer is correct
- Bookmark toggle to save difficult questions

### Practice Exam
Similar to Study Mode but:
- Counter shows "1 / 35" (exam length)
- No immediate feedback - just select and move to next
- Results shown only after completing all 35 questions

### Analytics Dashboard
Performance tracking screen with intelligent weak areas analysis:
- Overall accuracy percentage
- **Weak Areas (red)** - Topics below 74%, sorted weakest first with "Study" buttons
- **Strong Areas (green)** - Topics at or above 74% passing threshold
- **Need More Practice (amber)** - Topics with fewer than 5 questions answered
- Full breakdown table showing each subelement (T0-T9) with questions seen, correct, and accuracy

## Tech Stack

- **Frontend:** Next.js 16, React 19, TypeScript
- **Styling:** Tailwind CSS 4
- **Data:** Static JSON (411 FCC questions + 10 lessons)
- **Parsers:** Python 3 scripts for FCC question pool processing

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Python 3 (only needed if regenerating questions)

### Installation

```bash
# Clone the repository
git clone https://github.com/jdelvo06-debug/ham-radio-app.git
cd ham-radio-app

# Install dependencies
cd my-study-app
npm install
```

### Running the App

```bash
# Development server (http://localhost:4000)
npm run dev

# Production with PM2 (http://localhost:4000)
npm run build
pm2 start ecosystem.config.js

# Mobile build (Capacitor)
npm run build:mobile
npx cap sync
```

### PWA Install

The app is installable as a Progressive Web App. When running in production (PM2):
- **Android:** Chrome > Menu > "Add to Home Screen"
- **iPhone:** Safari > Share > "Add to Home Screen"
- Access from other devices on the same network via `http://<your-ip>:4000`

## Project Structure

```
ham-radio-app/
├── my-study-app/              # Next.js application
│   ├── app/
│   │   ├── page.tsx           # Main application component
│   │   ├── ham_radio_questions.json  # 411 parsed questions
│   │   ├── lessons.json       # 10 topic lessons
│   │   ├── layout.tsx         # Root layout
│   │   └── globals.css        # Tailwind imports
│   ├── public/                # Static assets & PWA icons
│   ├── ecosystem.config.js    # PM2 process manager config
│   └── package.json
├── *.py                       # Python parsers (6 files)
├── raw_questions.txt          # Source FCC question data
├── CLAUDE.md                  # Project documentation for AI assistants
├── LEARNINGS.md               # Development notes and gotchas
└── .claude/                   # Claude Code configuration
    ├── rules/                 # Coding guidelines
    └── blueprints/            # Task templates
```

## Study Modes Explained

### Learn Mode
- 10 topic-based lessons covering all exam content
- Each lesson takes ~5 minutes to read
- Organized sections with key facts highlighted
- Exam tips to help you remember important concepts
- Track your progress with "Mark as Completed"
- Jump directly to quiz for any topic

### Study Mode
- All questions from selected subelement (or all)
- Immediate feedback after each answer
- Shows correct answer with explanation
- Great for learning new material

### Practice Exam
- 35 randomly selected questions (same as real exam)
- No feedback until you finish
- Pass threshold: 74% (26/35 correct)
- Shows missed questions with explanations at the end
- Option to retry only missed questions

### Bookmarks Mode
- Practice only your bookmarked questions
- Same behavior as Study Mode (immediate feedback)
- Perfect for reviewing trouble spots

### Review Mode (Spaced Repetition)
- Automatically resurfaces questions you've missed or need to review
- Simple algorithm: get a question right 3 times in a row = mastered
- Wrong answers reset the streak and schedule immediate review
- Review intervals increase: immediate → 1 hour → 1 day → 7 days (mastered)
- Access from main menu (rose/pink button) or per-topic in Learn section
- Shows mastery progress during review sessions
- Mastered questions (3 correct streak) are removed from active reviews

### Settings
- **Dark Mode** - Toggle between light and dark themes (saved automatically)
- **Progress Summary** - View your total questions answered, accuracy, lessons completed, bookmarks, and mastered questions
- **Export/Import** - Backup your progress to a JSON file or restore from a previous backup
- **Achievements Gallery** - View all 15 badges with earned/locked status
- **Reset All Progress** - Clear all data and start fresh (with confirmation)
- **About** - Version info, FCC attribution, and replay tutorial option

### Study Streaks & Badges
The app includes gamification features to encourage daily studying:

**Streaks:**
- Track consecutive days of study
- See your current streak, best streak, and total study days on the main menu
- Streaks update automatically when you answer any question

**Badges (15 total):**
| Category | Badges |
|----------|--------|
| Questions | First Steps (1), Getting Started (10), Dedicated Learner (50), Century Club (100) |
| Streaks | On a Roll (3 days), Week Warrior (7), Two Week Champ (14), Monthly Master (30) |
| Lessons | Student (1 complete), Scholar (all 10) |
| Mastery | Memory Pro (1), Review Expert (10), Knowledge Keeper (50) |
| Exams | Exam Ready (pass 1), Test Veteran (pass 5) |

## Topics Covered

| Code | Topic | Description |
|------|-------|-------------|
| T0 | Safety | Electrical, Antenna & RF Hazards |
| T1 | FCC Rules | Licensing, Privileges & Regulations |
| T2 | Operating Procedures | Repeaters, Nets & Emergency Comms |
| T3 | Radio Wave Propagation | How Signals Travel |
| T4 | Amateur Radio Practices | Station Setup & Controls |
| T5 | Electrical Principles | Ohm's Law, Power & Math |
| T6 | Electronic Components | Resistors, Capacitors, Semiconductors |
| T7 | Practical Circuits | Equipment & Troubleshooting |
| T8 | Signals & Emissions | Modulation, Digital & Satellites |
| T9 | Antennas & Feed Lines | Antenna Types, Coax & Connectors |

## FCC Technician Exam Info

| Fact | Value |
|------|-------|
| Questions on exam | 35 |
| Question pool size | 411 |
| Passing score | 74% (26 correct) |
| Pool valid | 2022-2026 |
| License valid | 10 years |

## Python Parsers

The Python scripts parse FCC question pool text into structured JSON.

### Usage

```bash
# Generate questions JSON
python generate_complete_json.py > my-study-app/app/ham_radio_questions.json
```

### Output Format

```json
{
  "id": "T0A01",
  "question": "Which of the following is a safety hazard...",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correctAnswer": "B",
  "explanation": "Explanation of why B is correct..."
}
```

### Parser Files

| File | Purpose |
|------|---------|
| `generate_complete_json.py` | Primary parser with auto-generated explanations |
| `build_questions_json.py` | Alternative parsing approach |
| `final_parser.py` | Refined parsing logic |
| `parse_all_questions.py` | Batch processing |

## Data Storage

The app uses browser localStorage to persist:
- **Bookmarks** - Array of bookmarked question IDs
- **Analytics** - Per-subelement accuracy statistics
- **Completed Lessons** - Track which lessons you've finished
- **Spaced Repetition** - Review schedules and mastery progress
- **Streaks & Badges** - Study streak data and passed exam count

No account or server required - all data stays in your browser.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is open source. The FCC question pool is public domain.

## Acknowledgments

- FCC for maintaining the public question pool
- ARRL for amateur radio education resources
