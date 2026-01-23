// Letter collection game

import * as Storage from './storage';
import type { DifficultyLevel } from './storage';

type HintLevel = 'full' | 'partial' | 'audio';
import { say, celebrate, launchConfetti, setThinking, setExcited, resetInteractionTimer } from './mascot';
import { showCelebration } from './app';
import { speakWord } from './speech';
import { playSound } from './sounds';

// Difficulty configuration
const DIFFICULTY_CONFIG: Record<DifficultyLevel, {
  minDistractors: number;
  maxDistractors: number;
  correctClass: string;
}> = {
  easy: { minDistractors: 2, maxDistractors: 4, correctClass: 'correct-easy' },
  medium: { minDistractors: 4, maxDistractors: 8, correctClass: 'correct-medium' },
  hard: { minDistractors: 6, maxDistractors: 12, correctClass: 'correct-hard' },
};

let words: string[] = [];
let currentWordIndex = 0;
let currentWord = '';
let currentLetterIndex = 0;
let score = 0;
let currentDifficulty: DifficultyLevel = 'medium';
let correctStreak = 0;

export function initGame(): void {
  document.getElementById('next-word-btn')?.addEventListener('click', () => {
    nextWord();
  });

  // Hear word again button
  document.getElementById('hear-word-btn')?.addEventListener('click', () => {
    if (currentWord) {
      speakWord(currentWord);
    }
  });
}

export function startGame(): void {
  words = shuffleArray([...Storage.getWords()]);
  currentWordIndex = 0;
  score = Storage.getScore();
  currentDifficulty = Storage.getSettings().difficulty;
  updateScoreDisplay();

  // Mascot encouragement
  say('encouragement');

  if (words.length > 0 && words[0]) {
    loadWord(words[0]);
  }
}

function getHintLevel(word: string): HintLevel {
  const attempts = Storage.getWordAttempts(word);
  if (attempts === 0) return 'full';      // 1st time: show full word
  if (attempts === 1) return 'partial';   // 2nd time: show first letter only
  return 'audio';                          // 3rd+ time: audio only
}

function getPartialHint(word: string): string {
  // Show first letter + question marks for rest
  if (word.length <= 1) return word;
  return word[0] + '?'.repeat(word.length - 1);
}

function loadWord(word: string): void {
  currentWord = word.toLowerCase();
  currentLetterIndex = 0;
  correctStreak = 0;

  // Mascot looks thoughtful when new word is shown
  setThinking(true);

  const settings = Storage.getSettings();
  const mode = settings.wordPresentation;
  const hintLevel = getHintLevel(currentWord);

  // Display target word based on settings and hint level
  const targetWordEl = document.getElementById('target-word');
  if (targetWordEl) {
    if (mode === 'audio') {
      // User explicitly chose audio-only mode - always hide
      targetWordEl.textContent = '?'.repeat(word.length);
      targetWordEl.classList.add('audio-only');
    } else if (hintLevel === 'full') {
      // First attempt: show full word
      targetWordEl.textContent = word;
      targetWordEl.classList.remove('audio-only');
    } else if (hintLevel === 'partial') {
      // Second attempt: show first letter + question marks
      targetWordEl.textContent = getPartialHint(word);
      targetWordEl.classList.remove('audio-only');
    } else {
      // Third+ attempt: audio only (progressive difficulty)
      targetWordEl.textContent = '?'.repeat(word.length);
      targetWordEl.classList.add('audio-only');
    }
  }

  // Speak word for audio/both modes OR when hint level requires it
  const shouldSpeak = mode === 'audio' || mode === 'both' || hintLevel === 'audio' || hintLevel === 'partial';
  if (shouldSpeak) {
    speakWord(word);
  }

  // Show hear button when audio is needed
  const hearBtn = document.getElementById('hear-word-btn');
  if (hearBtn) {
    if (shouldSpeak) {
      hearBtn.classList.remove('hidden');
    } else {
      hearBtn.classList.add('hidden');
    }
  }

  // Create letter slots
  renderWordProgress();

  // Create letter buttons
  renderLetterGrid();

  // Hide next button and message
  document.getElementById('next-word-btn')?.classList.add('hidden');
  const gameMessage = document.getElementById('game-message');
  if (gameMessage) {
    gameMessage.textContent = '';
  }
}

function renderWordProgress(): void {
  const container = document.getElementById('word-progress');
  if (!container) return;

  container.innerHTML = currentWord.split('').map((_, index) =>
    `<div class="letter-slot" data-index="${index}"></div>`
  ).join('');
}

function renderLetterGrid(): void {
  const container = document.getElementById('letter-grid');
  if (!container) return;

  // Get letters from current word plus random distractor letters based on difficulty
  const wordLetters = currentWord.split('');
  const config = DIFFICULTY_CONFIG[currentDifficulty];
  const distractorCount = config.minDistractors + Math.floor(Math.random() * (config.maxDistractors - config.minDistractors + 1));
  const extraLetters = getRandomLetters(distractorCount);
  const allLetters = shuffleArray([...wordLetters, ...extraLetters]);

  container.innerHTML = allLetters.map((letter, index) =>
    `<button class="letter-button" data-letter="${letter}" data-index="${index}">${letter}</button>`
  ).join('');

  // Add click handlers
  container.querySelectorAll('.letter-button').forEach(button => {
    button.addEventListener('click', (e) => {
      handleLetterClick(e.target as HTMLElement);
    });
  });
}

function handleLetterClick(button: HTMLElement): void {
  if (button.classList.contains('used')) return;

  resetInteractionTimer();
  setThinking(false); // Stop thinking once player starts clicking

  const letter = button.dataset.letter;
  const expectedLetter = currentWord[currentLetterIndex];

  if (letter === expectedLetter) {
    // Correct letter - use difficulty-specific feedback class
    const config = DIFFICULTY_CONFIG[currentDifficulty];
    button.classList.add(config.correctClass, 'used');

    // Fill in the slot
    const slots = document.querySelectorAll('.letter-slot');
    const currentSlot = slots[currentLetterIndex];
    if (currentSlot) {
      currentSlot.textContent = letter ?? '';
      currentSlot.classList.add('filled');
    }

    currentLetterIndex++;
    correctStreak++;

    // Get excited on a streak of 3+ correct letters!
    if (correctStreak >= 3) {
      setExcited(true);
    }

    // Mascot celebrates correct letter
    if (currentLetterIndex < currentWord.length) {
      say('correct');
    }

    // Check if word is complete
    if (currentLetterIndex >= currentWord.length) {
      wordComplete();
    }
  } else {
    // Wrong letter - reset streak
    correctStreak = 0;
    button.classList.add('wrong');
    say('wrong');
    setTimeout(() => {
      button.classList.remove('wrong');
    }, 300);
  }
}

function wordComplete(): void {
  // Record successful attempt for progressive difficulty
  Storage.recordWordAttempt(currentWord, true);

  // Add score
  score = Storage.addScore(1);
  updateScoreDisplay();

  // Launch confetti!
  launchConfetti();

  // Mascot celebrates
  celebrate();

  // Check if more words or all complete
  const isLastWord = currentWordIndex >= words.length - 1;
  const buttonText = isLastWord ? 'Play Again' : 'Next Word';

  if (isLastWord) {
    playSound('gameComplete');
  }

  // Show celebration with Next Word button
  showCelebration(() => {
    say('encouragement');
    nextWord();
  }, buttonText);
}

function nextWord(): void {
  currentWordIndex++;

  if (currentWordIndex >= words.length) {
    // Restart with shuffled words
    words = shuffleArray([...Storage.getWords()]);
    currentWordIndex = 0;
    const nextWordBtn = document.getElementById('next-word-btn');
    if (nextWordBtn) {
      nextWordBtn.textContent = 'Next Word';
    }
  }

  const word = words[currentWordIndex];
  if (word) {
    loadWord(word);
  }
}

function updateScoreDisplay(): void {
  const scoreDisplay = document.getElementById('game-score');
  if (scoreDisplay) {
    scoreDisplay.textContent = `Stars: ${score}`;
  }
}

function getRandomLetters(count: number): string[] {
  const alphabet = 'abcdefghijklmnopqrstuvwxyz';
  const letters: string[] = [];
  for (let i = 0; i < count; i++) {
    letters.push(alphabet[Math.floor(Math.random() * alphabet.length)] ?? 'a');
  }
  return letters;
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = shuffled[i];
    shuffled[i] = shuffled[j] as T;
    shuffled[j] = temp as T;
  }
  return shuffled;
}
