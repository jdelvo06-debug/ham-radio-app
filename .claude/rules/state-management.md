# State Management Rules

## Current Architecture
All state managed via `useState` hooks in `page.tsx`. No external state library.

## State Categories

### Application State
```typescript
const [appState, setAppState] = useState<AppState>('menu');
const [mode, setMode] = useState<Mode>('study');
```
- Controls which UI renders
- Reset on "Back to Home"

### Session State (per quiz)
```typescript
const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
const [activeQuestions, setActiveQuestions] = useState<Question[]>([]);
const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
const [showExplanation, setShowExplanation] = useState(false);
const [score, setScore] = useState(0);
const [missedQuestions, setMissedQuestions] = useState<Question[]>([]);
const [subelementStats, setSubelementStats] = useState<Record<string, SubelementStats>>({});
```
- Reset when starting new quiz via `startQuiz()`

### Persisted State
```typescript
const [bookmarks, setBookmarks] = useState<string[]>([]);
const [globalStats, setGlobalStats] = useState<Record<string, GlobalSubelementStats>>({});
```
- Loaded from localStorage on mount
- Saved to localStorage on change

## localStorage Patterns

### Safe Access
Always check for window before accessing localStorage:
```typescript
// In useEffect (component mount)
useEffect(() => {
  if (typeof window === 'undefined') return;
  const saved = window.localStorage.getItem(KEY);
  if (saved) setState(JSON.parse(saved));
}, []);

// In event handlers (safe, but be explicit)
if (typeof window !== 'undefined') {
  window.localStorage.setItem(KEY, JSON.stringify(value));
}
```

### Storage Keys
| Key | Type | Purpose |
|-----|------|---------|
| `ham_technician_bookmarks` | `string[]` | Question IDs |
| `ham_technician_global_stats` | `Record<string, {correct, total}>` | Per-subelement accuracy |

### Save Strategy
Save immediately on state change (no debouncing):
```typescript
const toggleBookmark = (id: string) => {
  setBookmarks((prev) => {
    const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(LS_BOOKMARKS_KEY, JSON.stringify(next));
    }
    return next;
  });
};
```

## Future Considerations

### When to Add Zustand
- If state needs to be shared across many components after extraction
- If state updates become complex (reducers needed)
- If you need devtools for debugging state

### Custom Hooks
Extract if logic is reused:
```typescript
// hooks/useBookmarks.ts
export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  // ... load, toggle, save logic
  return { bookmarks, toggleBookmark, isBookmarked };
}
```
