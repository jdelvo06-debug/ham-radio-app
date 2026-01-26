# Question Data Rules

## File Location
```
my-study-app/app/ham_radio_questions.json
```

## Schema
```typescript
interface Question {
  id: string;           // FCC question ID (e.g., "T0A01")
  question: string;     // Full question text
  options: string[];    // Exactly 4 answer options
  correctAnswer: string; // Single letter: "A", "B", "C", or "D"
  explanation: string;  // Why the correct answer is correct
}
```

## Validation Rules
1. **id**: Must match `/^T\d[A-Z]\d{2}$/`
2. **options**: Must have exactly 4 items
3. **correctAnswer**: Must be "A", "B", "C", or "D"
4. **No duplicates**: Each id must be unique

## Subelement Organization
Questions are grouped by the first two characters of their ID:

| Prefix | Count (approx) | Topic |
|--------|---------------|-------|
| T0 | ~40 | Commission's Rules |
| T1 | ~45 | Operating Procedures |
| T2 | ~40 | Radio Fundamentals |
| T3 | ~45 | Station Equipment |
| T4 | ~40 | Amateur Practices |
| T5 | ~45 | Electrical Principles |
| T6 | ~40 | Components |
| T7 | ~45 | Station Equipment |
| T8 | ~40 | Operating Procedures |
| T9 | ~31 | Safety |

Total: 411 questions

## Answer Mapping
```typescript
const letters = ['A', 'B', 'C', 'D'];
const correctIndex = letters.indexOf(question.correctAnswer);
const correctText = question.options[correctIndex];
```

## Import Pattern
```typescript
// Direct JSON import (bundled at build time)
import questionsData from './ham_radio_questions.json';

// Cast to typed array
const questions = questionsData as Question[];
```

## Common Operations

### Filter by Subelement
```typescript
const t0Questions = questions.filter(q => q.id.startsWith('T0'));
```

### Get Random Sample
```typescript
const shuffled = [...questions].sort(() => 0.5 - Math.random());
const sample = shuffled.slice(0, 35);
```

### Check Answer
```typescript
const isCorrect = (optionIndex: number, correctAnswer: string): boolean => {
  const letters = ['A', 'B', 'C', 'D'];
  return letters[optionIndex] === correctAnswer;
};
```

## Manual Edits
If manually editing questions:
1. Keep valid JSON format
2. Maintain 4 options per question
3. Ensure correctAnswer matches an option
4. Test by running the app
