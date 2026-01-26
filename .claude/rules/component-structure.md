# Component Structure Rules

## Current State
All UI lives in `my-study-app/app/page.tsx` (703 lines). This is intentional for now.

## When Extracting Components

### Extraction Candidates
Components worth extracting if refactoring:
- `QuestionCard` - Question display with options
- `ProgressBar` - Progress indicator
- `ModeButton` - Study/Exam/Bookmarks buttons
- `SubelementFilter` - Dropdown filter
- `ResultsBreakdown` - Per-subelement stats table
- `BookmarkButton` - Star toggle button

### File Organization
```
app/
├── components/
│   ├── quiz/
│   │   ├── QuestionCard.tsx
│   │   ├── ProgressBar.tsx
│   │   └── BookmarkButton.tsx
│   ├── menu/
│   │   ├── ModeButton.tsx
│   │   └── SubelementFilter.tsx
│   └── results/
│       └── ResultsBreakdown.tsx
├── page.tsx (orchestration only)
└── ...
```

### Component Rules
1. **Props over context** for simple data flow
2. **Collocate styles** - Tailwind classes stay with component
3. **No prop drilling > 2 levels** - Use composition instead
4. **Client Components** - All interactive components need `'use client'`

### TypeScript Patterns
```typescript
// Define props interface above component
interface QuestionCardProps {
  question: Question;
  selectedAnswer: string | null;
  showExplanation: boolean;
  onAnswerClick: (option: string) => void;
  onBookmarkToggle: () => void;
  isBookmarked: boolean;
}

// Explicit return type for complex components
export function QuestionCard(props: QuestionCardProps): JSX.Element {
  // ...
}
```

## What NOT to Extract
- State management logic (keep in page.tsx or dedicated hook)
- Business logic functions (move to utils if needed)
- One-off UI that won't be reused
