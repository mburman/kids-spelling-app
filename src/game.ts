// Letter collection game

import * as Storage from './storage';
import { say, celebrate, launchConfetti } from './mascot';
import { showCelebration } from './app';
import { speakWord } from './speech';
import { playSound } from './sounds';

let words: string[] = [];
let currentWordIndex = 0;
let currentWord = '';
let currentLetterIndex = 0;
let score = 0;

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
  updateScoreDisplay();

  // Mascot encouragement
  say('encouragement');

  if (words.length > 0 && words[0]) {
    loadWord(words[0]);
  }
}

function loadWord(word: string): void {
  currentWord = word.toLowerCase();
  currentLetterIndex = 0;

  const settings = Storage.getSettings();
  const mode = settings.wordPresentation;

  // Display target word based on settings
  const targetWordEl = document.getElementById('target-word');
  if (targetWordEl) {
    if (mode === 'visual' || mode === 'both') {
      targetWordEl.textContent = word;
      targetWordEl.classList.remove('audio-only');
    } else {
      // Audio only - show placeholder
      targetWordEl.textContent = '?'.repeat(word.length);
      targetWordEl.classList.add('audio-only');
    }
  }

  // Speak word based on settings
  if (mode === 'audio' || mode === 'both') {
    speakWord(word);
  }

  // Show/hide hear button based on settings
  const hearBtn = document.getElementById('hear-word-btn');
  if (hearBtn) {
    if (mode === 'audio' || mode === 'both') {
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

  // Get letters from current word plus some random letters
  const wordLetters = currentWord.split('');
  const extraLetters = getRandomLetters(Math.max(8 - wordLetters.length, 4));
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

  const letter = button.dataset.letter;
  const expectedLetter = currentWord[currentLetterIndex];

  if (letter === expectedLetter) {
    // Correct letter
    button.classList.add('correct', 'used');

    // Fill in the slot
    const slots = document.querySelectorAll('.letter-slot');
    const currentSlot = slots[currentLetterIndex];
    if (currentSlot) {
      currentSlot.textContent = letter ?? '';
      currentSlot.classList.add('filled');
    }

    currentLetterIndex++;

    // Mascot celebrates correct letter
    if (currentLetterIndex < currentWord.length) {
      say('correct');
    }

    // Check if word is complete
    if (currentLetterIndex >= currentWord.length) {
      wordComplete();
    }
  } else {
    // Wrong letter
    button.classList.add('wrong');
    say('wrong');
    setTimeout(() => {
      button.classList.remove('wrong');
    }, 300);
  }
}

function wordComplete(): void {
  // Add score
  score = Storage.addScore(1);
  updateScoreDisplay();

  // Launch confetti!
  launchConfetti();

  // Mascot celebrates
  celebrate();

  // Show celebration
  showCelebration(() => {
    const nextWordBtn = document.getElementById('next-word-btn');
    const gameMessage = document.getElementById('game-message');

    // Check if more words
    if (currentWordIndex < words.length - 1) {
      nextWordBtn?.classList.remove('hidden');
      if (gameMessage) {
        gameMessage.textContent = 'Great job! Ready for the next word?';
      }
      say('encouragement');
    } else {
      // All words complete - play celebratory fanfare
      playSound('gameComplete');
      if (gameMessage) {
        gameMessage.textContent = 'Amazing! You finished all the words!';
      }
      if (nextWordBtn) {
        nextWordBtn.textContent = 'Play Again';
        nextWordBtn.classList.remove('hidden');
      }
    }
  });
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
