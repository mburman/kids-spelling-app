// Storage service for the spelling app
// Uses localStorage to persist words and settings

const STORAGE_KEYS = {
  WORDS: 'spelling_app_words',
  PIN: 'spelling_app_pin',
  SCORE: 'spelling_app_score',
  SETTINGS: 'spelling_app_settings',
} as const;

export type WordPresentationMode = 'both' | 'visual' | 'audio';
export type VoiceType = 'female-uk' | 'male-uk';
export type DifficultyLevel = 'easy' | 'medium' | 'hard';
export type CharacterType = 'owl' | 'bunny' | 'frog';

interface AppSettings {
  wordPresentation: WordPresentationMode;
  voice: VoiceType;
  soundsEnabled: boolean;
  difficulty: DifficultyLevel;
  selectedCharacter: CharacterType;
}

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

// Settings management
const DEFAULT_SETTINGS: AppSettings = {
  wordPresentation: 'both',
  voice: 'female-uk',
  soundsEnabled: true,
  difficulty: 'medium',
  selectedCharacter: 'owl',
};

export function getSettings(): AppSettings {
  const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS);
  if (stored) {
    try {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
    } catch {
      return DEFAULT_SETTINGS;
    }
  }
  return DEFAULT_SETTINGS;
}

export function setWordPresentation(mode: WordPresentationMode): void {
  const settings = getSettings();
  settings.wordPresentation = mode;
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
}

export function setVoice(voice: VoiceType): void {
  const settings = getSettings();
  settings.voice = voice;
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
}

export function setSoundsEnabled(enabled: boolean): void {
  const settings = getSettings();
  settings.soundsEnabled = enabled;
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
}

export function setDifficulty(difficulty: DifficultyLevel): void {
  const settings = getSettings();
  settings.difficulty = difficulty;
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
}

export function getCharacter(): CharacterType {
  return getSettings().selectedCharacter;
}

export function setCharacter(character: CharacterType): void {
  const settings = getSettings();
  settings.selectedCharacter = character;
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
}
