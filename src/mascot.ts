// Mascot system - supports multiple characters (Ollie, Benny, Finn)

import { playSound } from './sounds';
import { getCharacter } from './storage';
import {
  getCharacterConfig,
  getRandomMessage,
  getRandomClickMessage,
  type CharacterConfig,
  type CharacterType,
  type MessageCategory
} from './characters';

let mascotElement: HTMLElement | null = null;
let speechBubble: HTMLElement | null = null;
let mascotBody: HTMLElement | null = null;
let isAnimating = false;
let currentConfig: CharacterConfig;
let idleIntervals: number[] = [];

export function initMascot(): void {
  mascotElement = document.getElementById('mascot');
  speechBubble = document.getElementById('mascot-speech');
  mascotBody = mascotElement?.querySelector('.mascot-body') as HTMLElement | null;

  // Load selected character
  const characterType = getCharacter();
  currentConfig = getCharacterConfig(characterType);

  // Apply character class and render
  applyCharacter(characterType);

  say('welcome');
  startIdleAnimation();

  // Add click handler for character sound
  mascotElement?.addEventListener('click', characterClick);
}

export function switchCharacter(type: CharacterType): void {
  currentConfig = getCharacterConfig(type);
  applyCharacter(type);
  restartIdleAnimation();
}

function applyCharacter(type: CharacterType): void {
  if (!mascotElement || !mascotBody) return;

  // Remove existing character classes
  mascotElement.classList.remove('mascot-owl', 'mascot-bunny', 'mascot-frog');
  mascotElement.classList.add(`mascot-${type}`);

  // Render character-specific HTML
  mascotBody.innerHTML = getCharacterHTML(type);
}

function getCharacterHTML(type: CharacterType): string {
  switch (type) {
    case 'owl':
      return `
        <div class="mascot-face">
          <div class="mascot-eyes">
            <div class="mascot-eye left"></div>
            <div class="mascot-eye right"></div>
          </div>
          <div class="mascot-beak"></div>
          <div class="mascot-cheeks">
            <div class="mascot-cheek left"></div>
            <div class="mascot-cheek right"></div>
          </div>
        </div>
        <div class="mascot-wings">
          <div class="mascot-wing left"></div>
          <div class="mascot-wing right"></div>
        </div>
      `;
    case 'bunny':
      return `
        <div class="mascot-ears">
          <div class="mascot-ear left"></div>
          <div class="mascot-ear right"></div>
        </div>
        <div class="mascot-face">
          <div class="mascot-eyes">
            <div class="mascot-eye left"></div>
            <div class="mascot-eye right"></div>
          </div>
          <div class="mascot-nose"></div>
          <div class="mascot-mouth"></div>
          <div class="mascot-cheeks">
            <div class="mascot-cheek left"></div>
            <div class="mascot-cheek right"></div>
          </div>
        </div>
        <div class="mascot-paws">
          <div class="mascot-paw left"></div>
          <div class="mascot-paw right"></div>
        </div>
      `;
    case 'frog':
      return `
        <div class="mascot-face">
          <div class="mascot-eyes">
            <div class="mascot-eye left">
              <div class="mascot-pupil"></div>
            </div>
            <div class="mascot-eye right">
              <div class="mascot-pupil"></div>
            </div>
          </div>
          <div class="mascot-mouth">
            <div class="mascot-tongue"></div>
          </div>
          <div class="mascot-cheeks">
            <div class="mascot-cheek left"></div>
            <div class="mascot-cheek right"></div>
          </div>
        </div>
        <div class="mascot-throat"></div>
        <div class="mascot-legs">
          <div class="mascot-leg left"></div>
          <div class="mascot-leg right"></div>
        </div>
      `;
    default:
      return '';
  }
}

export function say(category: MessageCategory, customMessage?: string): void {
  if (!speechBubble) return;

  const message = customMessage ?? getRandomMessage(currentConfig, category);
  speechBubble.textContent = message;
  speechBubble.classList.add('pop-in');

  // Play corresponding sound effect
  if (category === 'correct') {
    playSound('correctLetter');
  } else if (category === 'wrong') {
    playSound('wrongLetter');
  }

  // Animate mascot when speaking
  hop();

  setTimeout(() => {
    speechBubble?.classList.remove('pop-in');
  }, 300);
}

export function hop(): void {
  if (isAnimating || !mascotElement) return;
  isAnimating = true;
  mascotElement.classList.add('hop');
  setTimeout(() => {
    mascotElement?.classList.remove('hop');
    isAnimating = false;
  }, 500);
}

export function characterClick(): void {
  if (!mascotElement) return;

  // Play character-specific sound
  const characterType = currentConfig.id;
  if (characterType === 'owl') {
    playSound('hoot');
  } else if (characterType === 'bunny') {
    playSound('squeak');
  } else if (characterType === 'frog') {
    playSound('ribbit');
  }

  mascotElement.classList.add('hooting');

  // Show a random click message
  const message = getRandomClickMessage(currentConfig);
  say('welcome', message);

  setTimeout(() => {
    mascotElement?.classList.remove('hooting');
  }, 600);
}

export function celebrate(): void {
  if (!mascotElement) return;
  mascotElement.classList.add('celebrate');
  playSound('wordComplete');
  say('wordComplete');
  setTimeout(() => {
    mascotElement?.classList.remove('celebrate');
  }, 2000);
}

function startIdleAnimation(): void {
  const characterType = currentConfig.id;

  // Clear any existing intervals
  clearIdleIntervals();

  // Primary idle animation (eyes/nose)
  const primaryInterval = window.setInterval(() => {
    runPrimaryIdleAnimation(characterType);
  }, currentConfig.idleAnimations.primary.interval);
  idleIntervals.push(primaryInterval);

  // Secondary idle animation (wings/ears/tongue)
  const secondaryInterval = window.setInterval(() => {
    runSecondaryIdleAnimation(characterType);
  }, currentConfig.idleAnimations.secondary.interval);
  idleIntervals.push(secondaryInterval);
}

function runPrimaryIdleAnimation(type: CharacterType): void {
  switch (type) {
    case 'owl': {
      // Blink
      const eyes = document.querySelectorAll('.mascot-owl .mascot-eye');
      eyes.forEach(eye => eye.classList.add('blink'));
      setTimeout(() => {
        eyes.forEach(eye => eye.classList.remove('blink'));
      }, currentConfig.idleAnimations.primary.duration);
      break;
    }
    case 'bunny': {
      // Nose twitch
      const nose = document.querySelector('.mascot-bunny .mascot-nose');
      nose?.classList.add('twitch');
      setTimeout(() => {
        nose?.classList.remove('twitch');
      }, currentConfig.idleAnimations.primary.duration);
      break;
    }
    case 'frog': {
      // Throat puff
      const throat = document.querySelector('.mascot-frog .mascot-throat');
      throat?.classList.add('puff');
      setTimeout(() => {
        throat?.classList.remove('puff');
      }, currentConfig.idleAnimations.primary.duration);
      break;
    }
  }
}

function runSecondaryIdleAnimation(type: CharacterType): void {
  switch (type) {
    case 'owl': {
      // Wave wings
      const wings = document.querySelectorAll('.mascot-owl .mascot-wing');
      wings.forEach(wing => wing.classList.add('wave'));
      setTimeout(() => {
        wings.forEach(wing => wing.classList.remove('wave'));
      }, currentConfig.idleAnimations.secondary.duration);
      break;
    }
    case 'bunny': {
      // Ear wiggle
      const ears = document.querySelectorAll('.mascot-bunny .mascot-ear');
      ears.forEach(ear => ear.classList.add('wiggle'));
      setTimeout(() => {
        ears.forEach(ear => ear.classList.remove('wiggle'));
      }, currentConfig.idleAnimations.secondary.duration);
      break;
    }
    case 'frog': {
      // Tongue flick
      const tongue = document.querySelector('.mascot-frog .mascot-tongue');
      tongue?.classList.add('flick');
      setTimeout(() => {
        tongue?.classList.remove('flick');
      }, currentConfig.idleAnimations.secondary.duration);
      break;
    }
  }
}

function clearIdleIntervals(): void {
  idleIntervals.forEach(interval => window.clearInterval(interval));
  idleIntervals = [];
}

function restartIdleAnimation(): void {
  clearIdleIntervals();
  startIdleAnimation();
}

export function hideMascot(): void {
  mascotElement?.classList.add('hidden');
}

export function showMascot(): void {
  mascotElement?.classList.remove('hidden');
}

export function getCurrentCharacter(): CharacterType {
  return currentConfig.id;
}

// Confetti system
const confettiColors = ['#ff6b6b', '#4ecdc4', '#ffe66d', '#95e1d3', '#f38181', '#aa96da', '#fcbad3'];

export function launchConfetti(): void {
  const container = document.getElementById('confetti-container');
  if (!container) return;

  container.innerHTML = '';

  for (let i = 0; i < 50; i++) {
    setTimeout(() => {
      createConfettiPiece(container);
    }, i * 30);
  }

  // Clean up after animation
  setTimeout(() => {
    container.innerHTML = '';
  }, 3000);
}

function createConfettiPiece(container: HTMLElement): void {
  const piece = document.createElement('div');
  piece.className = 'confetti-piece';
  piece.style.left = Math.random() * 100 + 'vw';
  piece.style.backgroundColor = confettiColors[Math.floor(Math.random() * confettiColors.length)] ?? confettiColors[0] ?? '#ff6b6b';
  piece.style.animationDuration = (Math.random() * 2 + 2) + 's';
  piece.style.animationDelay = Math.random() * 0.5 + 's';

  // Random shapes
  if (Math.random() > 0.5) {
    piece.style.borderRadius = '50%';
  } else if (Math.random() > 0.5) {
    piece.classList.add('confetti-star');
  }

  container.appendChild(piece);
}
