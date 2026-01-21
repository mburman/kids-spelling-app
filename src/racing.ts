// Letter Racing game - Mario Kart style letter collection

import * as Storage from './storage';
import { say, celebrate, launchConfetti, hop } from './mascot';
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

// Game constants
const TRACK_HEIGHT = 400;
const PLAYER_Y = TRACK_HEIGHT - 70;
const LETTER_SPAWN_INTERVAL = 1200;
const BASE_SPEED = 2;
const COLLISION_THRESHOLD = 50;

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

export function initRacing(): void {
  // Control buttons
  document.getElementById('move-left')?.addEventListener('click', () => {
    movePlayer(-1);
  });

  document.getElementById('move-right')?.addEventListener('click', () => {
    movePlayer(1);
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
  updateScoreDisplay();

  say('encouragement');

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

  // Start spawning letters
  spawnLetter();
  spawnIntervalId = window.setInterval(spawnLetter, LETTER_SPAWN_INTERVAL);

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

  // Update each falling letter
  for (let i = fallingLetters.length - 1; i >= 0; i--) {
    const letter = fallingLetters[i];
    if (!letter) continue;

    letter.y += letter.speed;
    updateLetterPosition(letter);

    // Check collision with player
    if (!letter.collected && letter.y >= PLAYER_Y - COLLISION_THRESHOLD && letter.y <= PLAYER_Y + 30) {
      if (letter.lane === playerLane) {
        collectLetter(letter);
      }
    }

    // Remove if off screen
    if (letter.y > TRACK_HEIGHT + 50) {
      removeLetter(letter);
    }
  }

  animationId = requestAnimationFrame(gameLoop);
}

function spawnLetter(): void {
  if (!gameActive) return;

  const track = document.getElementById('racing-track');
  if (!track) return;

  // Decide what letter to spawn
  const expectedLetter = currentWord[currentLetterIndex];
  if (!expectedLetter) return;

  // 60% chance to spawn the correct letter, 40% chance for a distractor
  const isCorrect = Math.random() < 0.6;
  const letter = isCorrect ? expectedLetter : getRandomDistractor(expectedLetter);

  // Random lane
  const lane = Math.floor(Math.random() * 3);

  // Create the element
  const element = document.createElement('div');
  element.className = `falling-letter ${isCorrect ? 'correct-letter' : 'wrong-letter'}`;
  element.textContent = letter;
  element.dataset.lane = String(lane);
  track.appendChild(element);

  const fallingLetter: FallingLetter = {
    id: letterIdCounter++,
    letter,
    lane,
    y: -50,
    speed: BASE_SPEED + Math.random() * 1,
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

    // Mascot celebrates
    if (currentLetterIndex < currentWord.length) {
      say('correct');
      hop();
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
    say('wrong');

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

  // Mascot celebrates
  celebrate();

  // Show celebration
  showCelebration(() => {
    const nextBtn = document.getElementById('next-racing-btn');
    const raceMessage = document.getElementById('racing-message');

    if (currentWordIndex < words.length - 1) {
      nextBtn?.classList.remove('hidden');
      if (raceMessage) {
        raceMessage.textContent = 'Great job! Ready for the next word?';
      }
      say('encouragement');
    } else {
      if (raceMessage) {
        raceMessage.textContent = 'Amazing! You finished all the words!';
      }
      if (nextBtn) {
        nextBtn.textContent = 'Play Again';
        nextBtn.classList.remove('hidden');
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
