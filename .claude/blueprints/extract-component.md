# Blueprint: Extract Component from page.tsx

## When to Use
When `page.tsx` becomes too large or you need to reuse UI across modes.

## Before Starting
1. Ensure app works correctly
2. Identify clear component boundary
3. Know what props it needs

## Step-by-Step

### 1. Create Component Directory
```bash
mkdir -p my-study-app/app/components
```

### 2. Create Component File
```typescript
// app/components/QuestionCard.tsx
'use client';

import { Question } from '../types';

interface QuestionCardProps {
  question: Question;
  selectedAnswer: string | null;
  showExplanation: boolean;
  mode: 'study' | 'exam' | 'bookmarks';
  onAnswerClick: (option: string) => void;
}

export function QuestionCard({
  question,
  selectedAnswer,
  showExplanation,
  mode,
  onAnswerClick,
}: QuestionCardProps) {
  // Move relevant JSX here
  return (
    <div>
      {/* Component markup */}
    </div>
  );
}
```

### 3. Extract Types (if needed)
```typescript
// app/types.ts
export interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export type Mode = 'study' | 'exam' | 'bookmarks';
export type AppState = 'menu' | 'quiz' | 'results' | 'analytics';
```

### 4. Update page.tsx
```typescript
// Import component
import { QuestionCard } from './components/QuestionCard';

// Import types
import { Question, Mode, AppState } from './types';

// Replace inline JSX with component
<QuestionCard
  question={currentQuestion}
  selectedAnswer={selectedAnswer}
  showExplanation={showExplanation}
  mode={mode}
  onAnswerClick={handleAnswerClick}
/>
```

### 5. Move Helper Functions
If component needs helper functions, either:
- Keep in page.tsx and pass result as prop
- Move to component if used only there
- Move to utils file if shared

## Component Extraction Candidates

### QuestionCard
**Lines:** ~630-666 (options rendering)
**Props:** question, selectedAnswer, showExplanation, mode, onAnswerClick
**Complexity:** Medium (conditional styling logic)

### ProgressBar
**Lines:** ~612-617
**Props:** progress (number 0-100)
**Complexity:** Low

### BookmarkButton
**Lines:** ~597-606, ~529-532
**Props:** isBookmarked, onClick
**Complexity:** Low

### ModeButton
**Lines:** ~309-342
**Props:** onClick, label, description, icon, disabled, colorClass
**Complexity:** Low

### SubelementFilter
**Lines:** ~287-306
**Props:** value, onChange, subelements
**Complexity:** Low

## Testing After Extraction
1. `npm run dev` - no build errors
2. All modes work
3. Styling unchanged
4. State updates work
5. No TypeScript errors

## Common Issues

### Missing 'use client'
If component uses hooks or event handlers, needs `'use client'` directive.

### Prop Drilling
If passing >3 levels deep, consider:
- React Context
- Zustand store
- Composition pattern

### Circular Imports
Avoid importing page.tsx from components. Types should live separately.
