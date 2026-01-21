// Storage service for the spelling app
// Uses localStorage to persist words and settings

const STORAGE_KEYS = {
  WORDS: 'spelling_app_words',
  PIN: 'spelling_app_pin',
  SCORE: 'spelling_app_score',
} as const;

const DEFAULT_PIN = '1234';

// Word management
export function getWords(): string[] {
  const stored = localStorage.getItem(STORAGE_KEYS.WORDS);
  if (stored) {
    try {
      return JSON.parse(stored) as string[];
    } catch {
      return [];
    }
  }
  return [];
}

export function saveWords(words: string[]): void {
  localStorage.setItem(STORAGE_KEYS.WORDS, JSON.stringify(words));
}

export function addWord(word: string): boolean {
  const words = getWords();
  const cleanWord = word.trim().toLowerCase();
  if (cleanWord && !words.includes(cleanWord)) {
    words.push(cleanWord);
    saveWords(words);
    return true;
  }
  return false;
}

export function removeWord(word: string): boolean {
  const words = getWords();
  const index = words.indexOf(word.toLowerCase());
  if (index > -1) {
    words.splice(index, 1);
    saveWords(words);
    return true;
  }
  return false;
}

export function clearAllWords(): void {
  saveWords([]);
}

// PIN management
export function getPin(): string {
  return localStorage.getItem(STORAGE_KEYS.PIN) || DEFAULT_PIN;
}

export function setPin(pin: string): void {
  localStorage.setItem(STORAGE_KEYS.PIN, pin);
}

export function verifyPin(pin: string): boolean {
  return pin === getPin();
}

// Score management
export function getScore(): number {
  const stored = localStorage.getItem(STORAGE_KEYS.SCORE);
  return stored ? parseInt(stored, 10) : 0;
}

export function addScore(points: number): number {
  const current = getScore();
  const newScore = current + points;
  localStorage.setItem(STORAGE_KEYS.SCORE, newScore.toString());
  return newScore;
}

export function resetScore(): void {
  localStorage.setItem(STORAGE_KEYS.SCORE, '0');
}
