# Blueprint: Add Tests

## Current State
No tests exist. This blueprint covers initial test setup.

## Setup Steps

### 1. Install Testing Dependencies
```bash
cd my-study-app
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
```

### 2. Configure Vitest
Create `vitest.config.ts`:
```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    globals: true,
  },
});
```

### 3. Create Setup File
Create `vitest.setup.ts`:
```typescript
import '@testing-library/jest-dom';
```

### 4. Add Test Script
In `package.json`:
```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage"
  }
}
```

## First Tests

### Unit Tests (Pure Functions)
Create `app/utils.test.ts`:
```typescript
import { describe, it, expect } from 'vitest';

// Extract these functions to utils.ts first
describe('isAnswerCorrect', () => {
  it('returns true for correct answer', () => {
    expect(isAnswerCorrect(1, 'B')).toBe(true);
  });

  it('returns false for incorrect answer', () => {
    expect(isAnswerCorrect(0, 'B')).toBe(false);
  });
});

describe('getSubelementFromId', () => {
  it('extracts T0 from T0A01', () => {
    expect(getSubelementFromId('T0A01')).toBe('T0');
  });

  it('extracts T9 from T9C12', () => {
    expect(getSubelementFromId('T9C12')).toBe('T9');
  });

  it('returns UNK for invalid id', () => {
    expect(getSubelementFromId('invalid')).toBe('UNK');
  });
});
```

### Component Tests
Create `app/components/QuestionCard.test.tsx`:
```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QuestionCard } from './QuestionCard';

const mockQuestion = {
  id: 'T0A01',
  question: 'Test question?',
  options: ['Option A', 'Option B', 'Option C', 'Option D'],
  correctAnswer: 'B',
  explanation: 'Test explanation',
};

describe('QuestionCard', () => {
  it('renders question text', () => {
    render(
      <QuestionCard
        question={mockQuestion}
        selectedAnswer={null}
        showExplanation={false}
        mode="study"
        onAnswerClick={() => {}}
      />
    );
    expect(screen.getByText('Test question?')).toBeInTheDocument();
  });

  it('calls onAnswerClick when option clicked', () => {
    const handleClick = vi.fn();
    render(
      <QuestionCard
        question={mockQuestion}
        selectedAnswer={null}
        showExplanation={false}
        mode="study"
        onAnswerClick={handleClick}
      />
    );
    fireEvent.click(screen.getByText('Option A'));
    expect(handleClick).toHaveBeenCalledWith('Option A');
  });
});
```

### Integration Tests
Create `app/page.test.tsx`:
```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Home from './page';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('Home Page', () => {
  beforeEach(() => {
    localStorageMock.getItem.mockReturnValue(null);
  });

  it('renders main menu', () => {
    render(<Home />);
    expect(screen.getByText('Technician Class')).toBeInTheDocument();
  });

  it('starts study mode when button clicked', () => {
    render(<Home />);
    fireEvent.click(screen.getByText(/Study Mode/));
    expect(screen.getByText(/Study Mode/)).toBeInTheDocument();
  });
});
```

## Running Tests
```bash
npm test              # Watch mode
npm test -- --run     # Single run
npm run test:coverage # With coverage
```

## Test File Organization
```
my-study-app/
├── app/
│   ├── page.tsx
│   ├── page.test.tsx          # Integration tests
│   ├── utils.ts               # Extract pure functions
│   ├── utils.test.ts          # Unit tests
│   └── components/
│       ├── QuestionCard.tsx
│       └── QuestionCard.test.tsx
├── vitest.config.ts
└── vitest.setup.ts
```

## Testing Priorities
1. **High Value:** Pure functions (scoring, filtering)
2. **Medium Value:** Component rendering
3. **Lower Priority:** Full user flows (complex, flaky)

## Mock Data
Create `app/__mocks__/questions.ts` for consistent test data:
```typescript
export const mockQuestions = [
  {
    id: 'T0A01',
    question: 'Test question 1?',
    options: ['A', 'B', 'C', 'D'],
    correctAnswer: 'A',
    explanation: 'Explanation 1',
  },
  // Add more as needed
];
```
