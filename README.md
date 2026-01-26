# Ham Radio Technician Exam Study App

A modern web application to help you prepare for the FCC Amateur Radio Technician Class license exam. Built with Next.js 16 and React 19.

## Features

- **Study Mode** - Practice all 411 questions with immediate feedback and explanations
- **Practice Exam** - Simulate the real exam with 35 random questions and pass/fail scoring
- **Bookmarks** - Save difficult questions for focused review
- **Analytics** - Track your performance by subelement to identify weak areas
- **Subelement Filtering** - Focus on specific topics (T0-T9)
- **Retry Missed** - After an exam, retry only the questions you got wrong
- **Persistent Progress** - Your bookmarks and stats are saved locally

## Screenshots

| Menu | Study Mode | Results |
|------|------------|---------|
| Main menu with mode selection | Question with immediate feedback | Exam results with breakdown |

## Tech Stack

- **Frontend:** Next.js 16, React 19, TypeScript
- **Styling:** Tailwind CSS 4
- **Data:** Static JSON (411 FCC questions)
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
# Development server (http://localhost:3005)
npm run dev

# Production build
npm run build
npm start
```

### Docker

```bash
cd my-study-app
docker compose up
# Access at http://localhost:3010
```

## Project Structure

```
ham-radio-app/
├── my-study-app/              # Next.js application
│   ├── app/
│   │   ├── page.tsx           # Main application component
│   │   ├── ham_radio_questions.json  # 411 parsed questions
│   │   ├── layout.tsx         # Root layout
│   │   └── globals.css        # Tailwind imports
│   ├── public/                # Static assets
│   ├── dockerfile             # Docker configuration
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

## FCC Technician Exam Info

| Fact | Value |
|------|-------|
| Questions on exam | 35 |
| Question pool size | 411 |
| Passing score | 74% (26 correct) |
| Pool valid | 2022-2026 |
| License valid | 10 years |

### Subelements

| Code | Topic |
|------|-------|
| T0 | Safety |
| T1 | FCC Rules |
| T2 | Operating Procedures |
| T3 | Radio Wave Characteristics |
| T4 | Amateur Radio Practices |
| T5 | Electrical Principles |
| T6 | Electronic Components |
| T7 | Station Equipment |
| T8 | Modulation & Signals |
| T9 | Antennas & Feed Lines |

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
