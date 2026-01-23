// Letter Racing game - Mario Kart style letter collection

import * as Storage from './storage';
import type { DifficultyLevel, CharacterType } from './storage';
import { launchConfetti } from './mascot';
import { playSound } from './sounds';
import { showCelebration } from './app';
import { speakWord } from './speech';

// Current character for the racing player
let currentCharacter: CharacterType = 'owl';

type HintLevel = 'full' | 'partial' | 'audio';

function getHintLevel(word: string): HintLevel {
  const attempts = Storage.getWordAttempts(word);
  if (attempts === 0) return 'full';      // 1st time: show full word
  if (attempts === 1) return 'partial';   // 2nd time: show first letter only
  return 'audio';                          // 3rd+ time: audio only
}

function getPartialHint(word: string): string {
  if (word.length <= 1) return word;
  return word[0] + '?'.repeat(word.length - 1);
}

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
  laneCount: number;
}> = {
  easy: { spawnInterval: 3000, baseSpeed: 1.2, minDistractors: 0, maxDistractors: 1, collisionThreshold: 70, laneCount: 2 },
  medium: { spawnInterval: 2000, baseSpeed: 1.2, minDistractors: 1, maxDistractors: 2, collisionThreshold: 60, laneCount: 3 },
  hard: { spawnInterval: 1500, baseSpeed: 1.2, minDistractors: 2, maxDistractors: 3, collisionThreshold: 50, laneCount: 5 },
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
let playerLane = 1; // starts at center
let currentLaneCount = 3; // dynamic based on difficulty
let fallingLetters: FallingLetter[] = [];
let gameActive = false;
let animationId: number | null = null;
let spawnIntervalId: number | null = null;
let letterIdCounter = 0;
let isOwlAnimating = false;
let lastRacingInteraction = Date.now();
let boredCheckInterval: number | null = null;

// Calculate lane position as percentage for a given lane index
function getLanePosition(laneIndex: number, laneCount: number): string {
  // For n lanes evenly distributed: position = (100 / (2*n)) + (i * (100/n))
  // e.g., 2 lanes: 25%, 75%
  // e.g., 3 lanes: 16.67%, 50%, 83.33%
  // e.g., 5 lanes: 10%, 30%, 50%, 70%, 90%
  const width = 100 / laneCount;
  const position = (width / 2) + (laneIndex * width);
  return `${position}%`;
}

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
  }, 450);
}

function owlShake(): void {
  const owl = document.getElementById('player-owl');
  if (!owl) return;
  owl.classList.add('shake');
  playSound('wrongLetter');
  setTimeout(() => {
    owl?.classList.remove('shake');
  }, 400);
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
  const player = document.getElementById('player-owl');
  if (!player || isOwlAnimating) return;
  isOwlAnimating = true;
  resetRacingInteraction();
  player.classList.add('hooting');

  // Play character-specific sound
  if (currentCharacter === 'owl') {
    playSound('hoot');
  } else if (currentCharacter === 'cow') {
    playSound('moo');
  } else if (currentCharacter === 'frog') {
    playSound('ribbit');
  }

  setTimeout(() => {
    player?.classList.remove('hooting');
    isOwlAnimating = false;
  }, 600);
}

// Bored/idle animation for racing character
function resetRacingInteraction(): void {
  lastRacingInteraction = Date.now();
  // Remove bored class if present
  const player = document.getElementById('player-owl');
  player?.classList.remove('bored');
}

function startBoredCheck(): void {
  if (boredCheckInterval) {
    clearInterval(boredCheckInterval);
  }
  boredCheckInterval = window.setInterval(() => {
    if (!gameActive) return;
    const idleTime = Date.now() - lastRacingInteraction;
    if (idleTime > 4000 && !isOwlAnimating) {
      playBoredAnimation();
    }
  }, 3000);
}

function stopBoredCheck(): void {
  if (boredCheckInterval) {
    clearInterval(boredCheckInterval);
    boredCheckInterval = null;
  }
}

function playBoredAnimation(): void {
  const player = document.getElementById('player-owl');
  if (!player || isOwlAnimating) return;
  player.classList.add('bored');
  setTimeout(() => {
    player?.classList.remove('bored');
  }, 2000);
}

export function initRacing(): void {
  // Click on owl to make it hoot
  document.getElementById('player-owl')?.addEventListener('click', (e) => {
    e.stopPropagation(); // Don't trigger lane click
    owlHoot();
  });

  // Tap on lanes to move directly there (iPad friendly)
  document.querySelectorAll('.lane').forEach((lane) => {
    lane.addEventListener('click', (e) => {
      if (!gameActive) return;
      resetRacingInteraction();
      const laneEl = e.currentTarget as HTMLElement;
      const laneNum = parseInt(laneEl.dataset.lane ?? '1', 10);
      if (laneNum !== playerLane) {
        playerLane = laneNum;
        updatePlayerPosition();
        playSound('laneChange');
      }
      // Hide tap icons after first lane tap
      document.getElementById('racing-track')?.classList.add('tapped');
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
  currentCharacter = Storage.getCharacter();
  updateScoreDisplay();

  // Update racing player character
  updateRacingCharacter();

  // Show tap icons only on first run of racing mode
  document.getElementById('racing-track')?.classList.remove('tapped');

  if (words.length > 0 && words[0]) {
    loadWord(words[0]);
  }
}

function updateRacingCharacter(): void {
  const player = document.getElementById('player-owl');
  if (!player) return;

  // Remove existing character classes
  player.classList.remove('racing-owl', 'racing-cow', 'racing-frog');
  player.classList.add(`racing-${currentCharacter}`);

  // Update the inner HTML based on character
  player.innerHTML = getRacingCharacterHTML(currentCharacter);
}

function getRacingCharacterHTML(character: CharacterType): string {
  switch (character) {
    case 'owl':
      return `
        <div class="racing-owl-body">
          <div class="racing-owl-face">
            <div class="racing-owl-eyes">
              <div class="racing-owl-eye left"></div>
              <div class="racing-owl-eye right"></div>
            </div>
            <div class="racing-owl-beak"></div>
          </div>
          <div class="racing-owl-wings">
            <div class="racing-owl-wing left"></div>
            <div class="racing-owl-wing right"></div>
          </div>
        </div>
      `;
    case 'cow':
      return `
        <div class="racing-cow-body">
          <div class="racing-cow-horns">
            <div class="racing-cow-horn left"></div>
            <div class="racing-cow-horn right"></div>
          </div>
          <div class="racing-cow-spots">
            <div class="racing-cow-spot spot1"></div>
            <div class="racing-cow-spot spot2"></div>
          </div>
          <div class="racing-cow-face">
            <div class="racing-cow-eyes">
              <div class="racing-cow-eye left"></div>
              <div class="racing-cow-eye right"></div>
            </div>
            <div class="racing-cow-snout">
              <div class="racing-cow-nostril"></div>
              <div class="racing-cow-nostril"></div>
            </div>
          </div>
        </div>
      `;
    case 'frog':
      return `
        <div class="racing-frog-body">
          <div class="racing-frog-eyes">
            <div class="racing-frog-eye left"></div>
            <div class="racing-frog-eye right"></div>
          </div>
          <div class="racing-frog-mouth"></div>
        </div>
      `;
    default:
      return '';
  }
}

function loadWord(word: string): void {
  // Stop any existing game
  stopGame();

  currentWord = word.toLowerCase();
  currentLetterIndex = 0;
  fallingLetters = [];
  letterIdCounter = 0;

  // Set up lanes based on difficulty
  const config = DIFFICULTY_CONFIG[currentDifficulty];
  currentLaneCount = config.laneCount;
  playerLane = Math.floor(currentLaneCount / 2); // Start at center lane

  const settings = Storage.getSettings();
  const mode = settings.wordPresentation;
  const hintLevel = getHintLevel(currentWord);

  // Display target word based on settings and hint level
  const targetWordEl = document.getElementById('racing-word');
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
  const hearBtn = document.getElementById('hear-racing-btn');
  if (hearBtn) {
    if (shouldSpeak) {
      hearBtn.classList.remove('hidden');
    } else {
      hearBtn.classList.add('hidden');
    }
  }

  // Render word progress
  renderWordProgress();

  // Create lanes dynamically based on difficulty
  setupLanes();

  // Update player position
  updatePlayerPosition();

  // Clear track of falling letters
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

function setupLanes(): void {
  const track = document.getElementById('racing-track');
  if (!track) return;

  // Remove existing lanes
  const existingLanes = track.querySelectorAll('.lane');
  existingLanes.forEach(el => el.remove());

  // Create new lanes based on current difficulty
  for (let i = 0; i < currentLaneCount; i++) {
    const lane = document.createElement('div');
    lane.className = 'lane';
    lane.dataset.lane = String(i);

    // Set lane width dynamically (flex handles positioning)
    lane.style.width = `${100 / currentLaneCount}%`;

    // Add click handler for lane
    lane.addEventListener('click', (e) => {
      if (!gameActive) return;
      resetRacingInteraction();
      const laneNum = parseInt((e.currentTarget as HTMLElement).dataset.lane ?? '0', 10);
      if (laneNum !== playerLane) {
        playerLane = laneNum;
        updatePlayerPosition();
        playSound('laneChange');
      }
      // Hide tap icons after first lane tap
      track.classList.add('tapped');
    });

    // Insert before player-owl
    const player = track.querySelector('#player-owl');
    if (player) {
      track.insertBefore(lane, player);
    } else {
      track.appendChild(lane);
    }
  }
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
  resetRacingInteraction();

  // Play start sound
  playSound('gameStart');

  // Start spawning letters with difficulty-based interval
  const config = DIFFICULTY_CONFIG[currentDifficulty];
  spawnLetter();
  spawnIntervalId = window.setInterval(spawnLetter, config.spawnInterval);

  // Start bored detection
  startBoredCheck();

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

  stopBoredCheck();
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
      // Play missed sound if this was the correct letter
      if (letter.isCorrect && !letter.collected) {
        playSound('letterMissed');
      }
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

  // Check if there are any letters on screen and if correct letter exists
  const hasAnyLetters = fallingLetters.some(l => !l.collected);
  const existingCorrect = fallingLetters.find(l =>
    l.letter === expectedLetter && !l.collected
  );

  // Pick a random lane
  const lane = Math.floor(Math.random() * currentLaneCount);

  // Spawn only ONE letter at a time
  // Never spawn correct letter first - always start with a distractor
  if (!hasAnyLetters || existingCorrect) {
    // No letters yet OR correct letter already exists - spawn a distractor
    const distractorLetter = getRandomDistractor(expectedLetter);
    createFallingLetter(track, distractorLetter, lane, false, 0);
  } else {
    // Letters exist but no correct letter - spawn the correct letter
    createFallingLetter(track, expectedLetter, lane, true, 0);
    playSound('letterSpawn');
  }
}

function createFallingLetter(track: HTMLElement, letter: string, lane: number, isCorrect: boolean, yOffset: number = 0): void {
  const element = document.createElement('div');
  element.className = `falling-letter ${isCorrect ? 'correct-letter' : 'wrong-letter'}`;
  element.textContent = letter;
  element.dataset.lane = String(lane);
  track.appendChild(element);

  // Tap on letter to move owl to that lane
  element.addEventListener('click', (e) => {
    e.stopPropagation();
    if (!gameActive) return;
    if (lane !== playerLane) {
      playerLane = lane;
      updatePlayerPosition();
      playSound('laneChange');
    }
  });

  const config = DIFFICULTY_CONFIG[currentDifficulty];

  const fallingLetter: FallingLetter = {
    id: letterIdCounter++,
    letter,
    lane,
    y: -50 + yOffset,  // Apply vertical stagger offset
    speed: config.baseSpeed,
    element,
    isCorrect,
    collected: false,
  };

  fallingLetters.push(fallingLetter);
  updateLetterPosition(fallingLetter);
}

function updateLetterPosition(letter: FallingLetter): void {
  letter.element.style.top = `${letter.y}px`;
  letter.element.style.left = getLanePosition(letter.lane, currentLaneCount);
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

    // Remove the letter after animation completes
    setTimeout(() => removeLetter(letter), 400);
  } else {
    // Wrong letter
    letter.element.classList.add('shake');
    owlShake();

    // Remove after wobble animation completes
    setTimeout(() => removeLetter(letter), 400);
  }
}

function removeLetter(letter: FallingLetter): void {
  letter.element.remove();
  fallingLetters = fallingLetters.filter(l => l.id !== letter.id);
}

function movePlayer(direction: number): void {
  if (!gameActive) return;

  const newLane = playerLane + direction;
  if (newLane >= 0 && newLane < currentLaneCount) {
    playerLane = newLane;
    updatePlayerPosition();
    playSound('laneChange');
    resetRacingInteraction();
  }
}

function updatePlayerPosition(): void {
  const player = document.getElementById('player-owl');
  if (player) {
    player.dataset.lane = String(playerLane);
    // Set position directly for dynamic lane counts
    // Center the player in the lane (player is ~56px wide)
    const position = getLanePosition(playerLane, currentLaneCount);
    player.style.left = `calc(${position} - 28px)`;
  }
}

function wordComplete(): void {
  stopGame();

  // Record successful attempt for progressive difficulty
  Storage.recordWordAttempt(currentWord, true);

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
