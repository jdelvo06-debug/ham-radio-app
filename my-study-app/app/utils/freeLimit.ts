const DAILY_COUNT_KEY = 'hamradio_daily_count';
const DAILY_DATE_KEY = 'hamradio_daily_date';
const FREE_DAILY_QUESTION_LIMIT = 25;

const getTodayKey = (): string => new Date().toISOString().split('T')[0];

const readCount = (): number => {
  if (typeof window === 'undefined') return 0;

  try {
    const stored = Number(window.localStorage.getItem(DAILY_COUNT_KEY) ?? '0');
    if (Number.isNaN(stored) || stored < 0) return 0;
    return stored;
  } catch {
    return 0;
  }
};

export const resetIfNewDay = (): void => {
  if (typeof window === 'undefined') return;

  try {
    const today = getTodayKey();
    const storedDate = window.localStorage.getItem(DAILY_DATE_KEY);

    if (storedDate !== today) {
      window.localStorage.setItem(DAILY_DATE_KEY, today);
      window.localStorage.setItem(DAILY_COUNT_KEY, '0');
    }
  } catch {}
};

export const getDailyQuestionsRemaining = (): number => {
  resetIfNewDay();
  const used = readCount();
  return Math.max(0, FREE_DAILY_QUESTION_LIMIT - used);
};

export const incrementDailyCount = (): void => {
  if (typeof window === 'undefined') return;

  resetIfNewDay();

  try {
    const next = Math.min(FREE_DAILY_QUESTION_LIMIT, readCount() + 1);
    window.localStorage.setItem(DAILY_COUNT_KEY, String(next));
    window.localStorage.setItem(DAILY_DATE_KEY, getTodayKey());
  } catch {}
};

export { FREE_DAILY_QUESTION_LIMIT };
