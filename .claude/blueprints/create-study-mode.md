# Blueprint: Create New Study Mode

## When to Use
Adding a new quiz mode (e.g., "Speed Round", "Focused Review", "Spaced Repetition").

## Current Modes
- `study` - All questions, immediate feedback
- `exam` - 35 questions, no feedback until end
- `bookmarks` - Bookmarked questions only

## Implementation Steps

### 1. Add Mode Type
In `page.tsx`, update the Mode type:
```typescript
type Mode = 'study' | 'exam' | 'bookmarks' | 'newmode';
```

### 2. Add Menu Button
In the menu render section (around line 308), add button:
```typescript
<button
  onClick={() => startQuiz('newmode')}
  className="w-full py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-lg shadow-md transition-transform active:scale-95"
>
  🎯 New Mode
  <span className="block text-xs font-normal opacity-90 mt-1">
    Description of what this mode does
  </span>
</button>
```

### 3. Configure Question Pool
In `startQuiz()` function, add pool configuration:
```typescript
if (selectedMode === 'newmode') {
  // Configure pool: filter, limit, sort, etc.
  pool = pool.filter(q => /* your criteria */);
}
```

### 4. Configure Feedback Behavior
In `handleAnswerClick()`, add mode logic:
```typescript
if (mode === 'newmode') {
  // Define feedback behavior
  setShowExplanation(true); // or false for exam-like
}
```

### 5. Configure Scoring
In `handleNextQuestion()`, add scoring logic:
```typescript
if (mode === 'newmode' && selectedAnswer) {
  // Score and track as needed
}
```

### 6. Update Mode Label
In quiz render section:
```typescript
const modeLabel =
  mode === 'exam' ? 'Practice Exam'
  : mode === 'bookmarks' ? 'Bookmarks'
  : mode === 'newmode' ? 'New Mode'
  : 'Study Mode';
```

### 7. Update Results Display
In results render section, add mode-specific content if needed.

## Testing Checklist
- [ ] Button appears on menu
- [ ] Clicking button starts quiz
- [ ] Correct questions appear
- [ ] Feedback works as designed
- [ ] Scoring tracks correctly
- [ ] Results display appropriate data
- [ ] Analytics update correctly
- [ ] "Back to Home" works

## Example: Speed Round Mode
A timed mode with 10 questions and a countdown:
```typescript
// Add timer state
const [timeRemaining, setTimeRemaining] = useState(0);

// In startQuiz
if (selectedMode === 'speed') {
  setTimeRemaining(60); // 60 seconds
  const limit = 10;
  setActiveQuestions(shuffled.slice(0, limit));
}

// Add timer effect
useEffect(() => {
  if (mode === 'speed' && timeRemaining > 0) {
    const timer = setTimeout(() => setTimeRemaining(t => t - 1), 1000);
    return () => clearTimeout(timer);
  }
  if (mode === 'speed' && timeRemaining === 0) {
    setAppState('results');
  }
}, [mode, timeRemaining]);
```
