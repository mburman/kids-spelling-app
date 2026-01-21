// Letter Racing game - Mario Kart style letter collection

import * as Storage from './storage';
import type { DifficultyLevel } from './storage';
import { launchConfetti } from './mascot';
import { playSound } from './sounds';
import { showCelebration } from './app';
import { speakWord } from './speech';

interface FallingLetter {
  id: number;
  letter: string;
  lane: number;
  y: number;
  speed: number;
  element: HTMLElement;
  isCorrect: boolean;
  collected: boolean;
}

// Difficulty configuration for racing game
const DIFFICULTY_CONFIG: Record<DifficultyLevel, {
  spawnInterval: number;
  baseSpeed: number;
  minDistractors: number;
  maxDistractors: number;
  collisionThreshold: number;
}> = {
  easy: { spawnInterval: 3000, baseSpeed: 0.5, minDistractors: 0, maxDistractors: 1, collisionThreshold: 70 },
  medium: { spawnInterval: 2000, baseSpeed: 0.8, minDistractors: 1, maxDistractors: 2, collisionThreshold: 60 },
  hard: { spawnInterval: 1500, baseSpeed: 1.2, minDistractors: 2, maxDistractors: 3, collisionThreshold: 50 },
};

// Game constants - dynamically calculated
function getTrackHeight(): number {
  const track = document.getElementById('racing-track');
  return track?.offsetHeight ?? 300;
}

function getPlayerY(): number {
  // Player owl is positioned at bottom: 30px in CSS, owl is ~56px tall
  // So center of owl is at trackHeight - 30 - 28 = trackHeight - 58
  return getTrackHeight() - 55;
}

// Current difficulty (loaded at game start)
let currentDifficulty: DifficultyLevel = 'medium';

// Game state
let words: string[] = [];
let currentWordIndex = 0;
let currentWord = '';
let currentLetterIndex = 0;
let score = 0;
let playerLane = 1; // 0=left, 1=center, 2=right
let fallingLetters: FallingLetter[] = [];
let gameActive = false;
let animationId: number | null = null;
let spawnIntervalId: number | null = null;
let letterIdCounter = 0;
let isOwlAnimating = false;

// Player owl animation functions
function owlHop(): void {
  const owl = document.getElementById('player-owl');
  if (!owl || isOwlAnimating) return;
  isOwlAnimating = true;
  owl.classList.add('hop');
  playSound('correctLetter');
  setTimeout(() => {
    owl?.classList.remove('hop');
    isOwlAnimating = false;
  }, 400);
}

function owlShake(): void {
  const owl = document.getElementById('player-owl');
  if (!owl) return;
  owl.classList.add('shake');
  playSound('wrongLetter');
  setTimeout(() => {
    owl?.classList.remove('shake');
  }, 300);
}

function owlCelebrate(): void {
  const owl = document.getElementById('player-owl');
  if (!owl) return;
  owl.classList.add('celebrate');
  playSound('wordComplete');
  setTimeout(() => {
    owl?.classList.remove('celebrate');
  }, 2000);
}

function owlHoot(): void {
  const owl = document.getElementById('player-owl');
  if (!owl || isOwlAnimating) return;
  isOwlAnimating = true;
  owl.classList.add('hooting');
  playSound('hoot');
  setTimeout(() => {
    owl?.classList.remove('hooting');
    isOwlAnimating = false;
  }, 600);
}

export function initRacing(): void {
  // Control buttons
  document.getElementById('move-left')?.addEventListener('click', () => {
    movePlayer(-1);
  });

  document.getElementById('move-right')?.addEventListener('click', () => {
    movePlayer(1);
  });

  // Click on owl to make it hoot
  document.getElementById('player-owl')?.addEventListener('click', (e) => {
    e.stopPropagation(); // Don't trigger lane click
    owlHoot();
  });

  // Tap on lanes to move directly there (iPad friendly)
  document.querySelectorAll('.lane').forEach((lane) => {
    lane.addEventListener('click', (e) => {
      if (!gameActive) return;
      const laneEl = e.currentTarget as HTMLElement;
      const laneNum = parseInt(laneEl.dataset.lane ?? '1', 10);
      playerLane = laneNum;
      updatePlayerPosition();
    });
  });

  // Keyboard controls for testing
  document.addEventListener('keydown', (e) => {
    if (!gameActive) return;
    if (e.key === 'ArrowLeft') movePlayer(-1);
    if (e.key === 'ArrowRight') movePlayer(1);
  });

  // Next word button
  document.getElementById('next-racing-btn')?.addEventListener('click', () => {
    nextWord();
  });

  // Hear word button
  document.getElementById('hear-racing-btn')?.addEventListener('click', () => {
    if (currentWord) {
      speakWord(currentWord);
    }
  });
}

export function startRacing(): void {
  words = shuffleArray([...Storage.getWords()]);
  currentWordIndex = 0;
  score = Storage.getScore();
  currentDifficulty = Storage.getSettings().difficulty;
  updateScoreDisplay();

  if (words.length > 0 && words[0]) {
    loadWord(words[0]);
  }
}

function loadWord(word: string): void {
  // Stop any existing game
  stopGame();

  currentWord = word.toLowerCase();
  currentLetterIndex = 0;
  playerLane = 1;
  fallingLetters = [];
  letterIdCounter = 0;

  const settings = Storage.getSettings();
  const mode = settings.wordPresentation;

  // Display target word
  const targetWordEl = document.getElementById('racing-word');
  if (targetWordEl) {
    if (mode === 'visual' || mode === 'both') {
      targetWordEl.textContent = word;
      targetWordEl.classList.remove('audio-only');
    } else {
      targetWordEl.textContent = '?'.repeat(word.length);
      targetWordEl.classList.add('audio-only');
    }
  }

  // Speak word
  if (mode === 'audio' || mode === 'both') {
    speakWord(word);
  }

  // Show/hide hear button
  const hearBtn = document.getElementById('hear-racing-btn');
  if (hearBtn) {
    if (mode === 'audio' || mode === 'both') {
      hearBtn.classList.remove('hidden');
    } else {
      hearBtn.classList.add('hidden');
    }
  }

  // Render word progress
  renderWordProgress();

  // Update player position
  updatePlayerPosition();

  // Clear track
  const track = document.getElementById('racing-track');
  if (track) {
    const letters = track.querySelectorAll('.falling-letter');
    letters.forEach(el => el.remove());
  }

  // Hide next button and message
  document.getElementById('next-racing-btn')?.classList.add('hidden');
  const raceMessage = document.getElementById('racing-message');
  if (raceMessage) {
    raceMessage.textContent = '';
  }

  // Start the game
  startGame();
}

function renderWordProgress(): void {
  const container = document.getElementById('racing-progress');
  if (!container) return;

  container.innerHTML = currentWord.split('').map((_, index) =>
    `<div class="letter-slot" data-index="${index}"></div>`
  ).join('');
}

function startGame(): void {
  gameActive = true;

  // Start spawning letters with difficulty-based interval
  const config = DIFFICULTY_CONFIG[currentDifficulty];
  spawnLetter();
  spawnIntervalId = window.setInterval(spawnLetter, config.spawnInterval);

  // Start game loop
  gameLoop();
}

function stopGame(): void {
  gameActive = false;

  if (animationId !== null) {
    cancelAnimationFrame(animationId);
    animationId = null;
  }

  if (spawnIntervalId !== null) {
    clearInterval(spawnIntervalId);
    spawnIntervalId = null;
  }
}

function gameLoop(): void {
  if (!gameActive) return;

  const config = DIFFICULTY_CONFIG[currentDifficulty];

  // Update each falling letter
  for (let i = fallingLetters.length - 1; i >= 0; i--) {
    const letter = fallingLetters[i];
    if (!letter) continue;

    letter.y += letter.speed;
    updateLetterPosition(letter);

    // Check collision with player using difficulty-based threshold
    const playerY = getPlayerY();
    if (!letter.collected && letter.y >= playerY - config.collisionThreshold && letter.y <= playerY + 30) {
      if (letter.lane === playerLane) {
        collectLetter(letter);
      }
    }

    // Remove if off screen
    if (letter.y > getTrackHeight() + 50) {
      removeLetter(letter);
    }
  }

  animationId = requestAnimationFrame(gameLoop);
}

function spawnLetter(): void {
  if (!gameActive) return;

  const track = document.getElementById('racing-track');
  if (!track) return;

  const expectedLetter = currentWord[currentLetterIndex];
  if (!expectedLetter) return;

  // Don't spawn if there's already a correct letter on screen that hasn't passed halfway
  const existingCorrect = fallingLetters.find(l => l.isCorrect && !l.collected && l.y < getTrackHeight() / 2);
  if (existingCorrect) return;

  const config = DIFFICULTY_CONFIG[currentDifficulty];

  // Shuffle lanes [0, 1, 2] to randomly assign letters
  const lanes = shuffleArray([0, 1, 2]);

  // Always spawn the correct letter in one lane
  const correctLane = lanes[0];
  createFallingLetter(track, expectedLetter, correctLane ?? 1, true);

  // Spawn distractors based on difficulty (random between min and max)
  const numDistractors = config.minDistractors + Math.floor(Math.random() * (config.maxDistractors - config.minDistractors + 1));
  for (let i = 0; i < numDistractors; i++) {
    const distractorLane = lanes[i + 1];
    if (distractorLane !== undefined) {
      const distractorLetter = getRandomDistractor(expectedLetter);
      createFallingLetter(track, distractorLetter, distractorLane, false);
    }
  }
}

function createFallingLetter(track: HTMLElement, letter: string, lane: number, isCorrect: boolean): void {
  const element = document.createElement('div');
  element.className = `falling-letter ${isCorrect ? 'correct-letter' : 'wrong-letter'}`;
  element.textContent = letter;
  element.dataset.lane = String(lane);
  track.appendChild(element);

  const config = DIFFICULTY_CONFIG[currentDifficulty];

  const fallingLetter: FallingLetter = {
    id: letterIdCounter++,
    letter,
    lane,
    y: -50,
    speed: config.baseSpeed + Math.random() * 0.3, // Small speed variation
    element,
    isCorrect,
    collected: false,
  };

  fallingLetters.push(fallingLetter);
  updateLetterPosition(fallingLetter);
}

function updateLetterPosition(letter: FallingLetter): void {
  const lanePositions = ['16.67%', '50%', '83.33%'];
  letter.element.style.top = `${letter.y}px`;
  letter.element.style.left = lanePositions[letter.lane] ?? '50%';
  letter.element.style.transform = 'translateX(-50%)';
}

function collectLetter(letter: FallingLetter): void {
  letter.collected = true;
  letter.element.classList.add('collected');

  const expectedLetter = currentWord[currentLetterIndex];

  if (letter.letter === expectedLetter) {
    // Correct letter!
    letter.element.classList.add('pop');

    // Fill in the slot
    const slots = document.querySelectorAll('#racing-progress .letter-slot');
    const currentSlot = slots[currentLetterIndex];
    if (currentSlot) {
      currentSlot.textContent = letter.letter;
      currentSlot.classList.add('filled');
    }

    currentLetterIndex++;

    // Player owl celebrates
    if (currentLetterIndex < currentWord.length) {
      owlHop();
    }

    // Check if word is complete
    if (currentLetterIndex >= currentWord.length) {
      wordComplete();
    }

    // Remove the letter
    setTimeout(() => removeLetter(letter), 200);
  } else {
    // Wrong letter
    letter.element.classList.add('shake');
    owlShake();

    // Remove after shake animation
    setTimeout(() => removeLetter(letter), 300);
  }
}

function removeLetter(letter: FallingLetter): void {
  letter.element.remove();
  fallingLetters = fallingLetters.filter(l => l.id !== letter.id);
}

function movePlayer(direction: number): void {
  if (!gameActive) return;

  const newLane = playerLane + direction;
  if (newLane >= 0 && newLane <= 2) {
    playerLane = newLane;
    updatePlayerPosition();
  }
}

function updatePlayerPosition(): void {
  const player = document.getElementById('player-owl');
  if (player) {
    player.dataset.lane = String(playerLane);
  }
}

function wordComplete(): void {
  stopGame();

  // Add score
  score = Storage.addScore(1);
  updateScoreDisplay();

  // Launch confetti
  launchConfetti();

  // Player owl celebrates
  owlCelebrate();

  // Check if more words or all complete
  const isLastWord = currentWordIndex >= words.length - 1;
  const buttonText = isLastWord ? 'Play Again' : 'Next Word';

  // Show celebration with Next Word button
  showCelebration(() => {
    nextWord();
  }, buttonText);
}

function nextWord(): void {
  currentWordIndex++;

  if (currentWordIndex >= words.length) {
    // Restart with shuffled words
    words = shuffleArray([...Storage.getWords()]);
    currentWordIndex = 0;
    const nextBtn = document.getElementById('next-racing-btn');
    if (nextBtn) {
      nextBtn.textContent = 'Next Word';
    }
  }

  const word = words[currentWordIndex];
  if (word) {
    loadWord(word);
  }
}

function updateScoreDisplay(): void {
  const scoreDisplay = document.getElementById('racing-score');
  if (scoreDisplay) {
    scoreDisplay.textContent = `Stars: ${score}`;
  }
}

function getRandomDistractor(excludeLetter: string): string {
  const alphabet = 'abcdefghijklmnopqrstuvwxyz';
  let letter: string;
  do {
    letter = alphabet[Math.floor(Math.random() * alphabet.length)] ?? 'a';
  } while (letter === excludeLetter);
  return letter;
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

// Cleanup when leaving the screen
export function stopRacing(): void {
  stopGame();
}
