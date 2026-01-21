// Ollie the Owl - Friendly mascot for the spelling app

import { playSound } from './sounds';

type MessageCategory =
  | 'welcome'
  | 'encouragement'
  | 'correct'
  | 'wrong'
  | 'wordComplete'
  | 'practiceStart'
  | 'practiceComplete';

const messages: Record<MessageCategory, string[]> = {
  welcome: [
    "Hi! Let's learn to spell!",
    "Ready to have fun?",
    "Yay! Spelling time!",
    "Hello, superstar!"
  ],
  encouragement: [
    "You can do it!",
    "Keep going!",
    "You're doing great!",
    "Almost there!",
    "Fantastic!"
  ],
  correct: [
    "Woohoo! Amazing!",
    "You got it!",
    "Super smart!",
    "Brilliant!",
    "High five!",
    "You're a star!"
  ],
  wrong: [
    "Try again!",
    "Oops! One more time!",
    "So close!",
    "You've got this!"
  ],
  wordComplete: [
    "WOW! You did it!",
    "AMAZING SPELLING!",
    "You're incredible!",
    "Champion speller!",
    "SO PROUD OF YOU!"
  ],
  practiceStart: [
    "Time to write!",
    "Grab your pencil!",
    "Let's practice!",
    "Writing is fun!"
  ],
  practiceComplete: [
    "Beautiful writing!",
    "Great job!",
    "You wrote it!",
    "Wonderful!"
  ]
};

let mascotElement: HTMLElement | null = null;
let speechBubble: HTMLElement | null = null;
let isAnimating = false;

function getRandomMessage(category: MessageCategory): string {
  const categoryMessages = messages[category];
  return categoryMessages[Math.floor(Math.random() * categoryMessages.length)] ?? categoryMessages[0] ?? '';
}

export function initMascot(): void {
  mascotElement = document.getElementById('mascot');
  speechBubble = document.getElementById('mascot-speech');
  say('welcome');
  startIdleAnimation();

  // Add click handler for hooting
  mascotElement?.addEventListener('click', hoot);
}

export function say(category: MessageCategory, customMessage?: string): void {
  if (!speechBubble) return;

  const message = customMessage ?? getRandomMessage(category);
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

const hootMessages = [
  "Hoot!",
  "Whooo?",
  "I'm Ollie!",
  "Hoo-ray!",
];

export function hoot(): void {
  if (!mascotElement) return;

  playSound('hoot');
  mascotElement.classList.add('hooting');

  // Show a random hoot message
  const message = hootMessages[Math.floor(Math.random() * hootMessages.length)] ?? hootMessages[0] ?? '';
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
  // Blink occasionally
  setInterval(() => {
    const eyes = document.querySelectorAll('.mascot-eye');
    eyes.forEach(eye => eye.classList.add('blink'));
    setTimeout(() => {
      eyes.forEach(eye => eye.classList.remove('blink'));
    }, 150);
  }, 3000);

  // Wave wings occasionally
  setInterval(() => {
    const wings = document.querySelectorAll('.mascot-wing');
    wings.forEach(wing => wing.classList.add('wave'));
    setTimeout(() => {
      wings.forEach(wing => wing.classList.remove('wave'));
    }, 600);
  }, 5000);
}

export function hideMascot(): void {
  mascotElement?.classList.add('hidden');
}

export function showMascot(): void {
  mascotElement?.classList.remove('hidden');
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
