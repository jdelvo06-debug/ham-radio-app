# Learnings & Gotchas

## Architecture Notes

### Monolithic page.tsx
The entire app lives in a single 703-line `page.tsx` file. This includes:
- All state management (8 useState hooks)
- All UI rendering (4 app states: menu, quiz, results, analytics)
- All business logic (scoring, bookmarking, stats tracking)

**Why it works for now:** Simple app with limited scope. Single file = easy to understand.

**When to refactor:** If adding new modes, complex features, or tests.

### State Machine Pattern
The app uses a simple state machine via `appState`:
```
menu -> quiz -> results -> menu
         |
         v
      analytics -> menu
```

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
- No debouncing needed (low frequency operations)

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

### Future Considerations
1. Add tests before any major refactoring
2. Extract reusable components (QuestionCard, ProgressBar, etc.)
3. Consider Zustand if state gets more complex
4. Add keyboard navigation for accessibility

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

### Integration Test Candidates
1. Starting each mode creates correct question count
2. Exam mode doesn't show explanations until finish
3. Bookmarks persist across page refresh
