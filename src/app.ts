// Main app logic and navigation

import * as Storage from './storage';
import { initMascot, initHomeMascot, updateHomeMascot } from './mascot';
import { initParent, showParent, hideParent } from './parent';
import { initGame, startGame } from './game';
import { initPractice, startPractice } from './practice';
import { initRacing, startRacing, stopRacing } from './racing';
import { initSounds } from './sounds';
import { initCharacterSelect, loadCharacterButtonIcon } from './character-select';

type ScreenName = 'home' | 'game' | 'practice' | 'parent' | 'racing' | 'character';

const screens: Record<ScreenName, HTMLElement | null> = {
  home: null,
  game: null,
  practice: null,
  parent: null,
  racing: null,
  character: null,
};

let currentScreen: ScreenName = 'home';

export function initApp(): void {
  screens.home = document.getElementById('home-screen');
  screens.game = document.getElementById('game-screen');
  screens.practice = document.getElementById('practice-screen');
  screens.parent = document.getElementById('parent-screen');
  screens.racing = document.getElementById('racing-screen');
  screens.character = document.getElementById('character-screen');

  setupNavigation();
  updateWordPreview();
  showScreen('home');

  // Initialize other modules
  initMascot();
  initHomeMascot();
  initParent();
  initGame();
  initPractice();
  initRacing();
  initCharacterSelect();

  // Load character button icon
  loadCharacterButtonIcon();

  // Initialize sound system on first click (required for AudioContext)
  document.addEventListener('click', () => {
    initSounds();
  }, { once: true });
}

function setupNavigation(): void {
  // Home screen buttons
  document.getElementById('play-btn')?.addEventListener('click', () => {
    if (Storage.getWords().length === 0) {
      alert('No words to practice! Ask a parent to add some words first.');
      return;
    }
    showScreen('game');
    startGame();
  });

  document.getElementById('practice-btn')?.addEventListener('click', () => {
    if (Storage.getWords().length === 0) {
      alert('No words to practice! Ask a parent to add some words first.');
      return;
    }
    showScreen('practice');
    startPractice();
  });

  document.getElementById('racing-btn')?.addEventListener('click', () => {
    if (Storage.getWords().length === 0) {
      alert('No words to practice! Ask a parent to add some words first.');
      return;
    }
    showScreen('racing');
    startRacing();
  });

  document.getElementById('settings-btn')?.addEventListener('click', () => {
    showScreen('parent');
    showParent();
  });

  document.getElementById('character-btn')?.addEventListener('click', () => {
    showScreen('character');
  });

  // Back buttons
  document.getElementById('game-home-btn')?.addEventListener('click', () => {
    showScreen('home');
  });

  document.getElementById('practice-home-btn')?.addEventListener('click', () => {
    showScreen('home');
  });

  document.getElementById('racing-home-btn')?.addEventListener('click', () => {
    stopRacing();
    showScreen('home');
  });

  document.getElementById('parent-home-btn')?.addEventListener('click', () => {
    hideParent();
    showScreen('home');
  });

  document.getElementById('character-home-btn')?.addEventListener('click', () => {
    showScreen('home');
  });
}

export function showScreen(screenName: ScreenName): void {
  // Hide all screens
  Object.values(screens).forEach(screen => {
    screen?.classList.remove('active');
  });

  // Show requested screen
  const screen = screens[screenName];
  if (screen) {
    screen.classList.add('active');
    currentScreen = screenName;
  }

  // Update word preview and mascot when returning to home
  if (screenName === 'home') {
    updateWordPreview();
    updateScore();
    updateHomeMascot();
  }

  // Only show mascot on game screen (letter game)
  const mascot = document.getElementById('mascot');
  if (mascot) {
    if (screenName === 'game') {
      mascot.classList.remove('hidden');
    } else {
      mascot.classList.add('hidden');
    }
  }
}

export function updateWordPreview(): void {
  const container = document.getElementById('word-list-preview');
  if (!container) return;

  const words = Storage.getWords();
  const settingsBtn = document.getElementById('settings-btn');

  if (words.length === 0) {
    container.innerHTML = '<span class="no-words">No words yet. Add some in Settings!</span>';
    settingsBtn?.classList.add('needs-attention');
  } else {
    container.innerHTML = words.map(word =>
      `<span class="word-chip">${word}</span>`
    ).join('');
    settingsBtn?.classList.remove('needs-attention');
  }
}

function updateScore(): void {
  const scoreDisplay = document.getElementById('game-score');
  if (scoreDisplay) {
    scoreDisplay.textContent = `Stars: ${Storage.getScore()}`;
  }
}

export function showCelebration(callback?: () => void, buttonText: string = 'Next Word'): void {
  const celebration = document.getElementById('celebration');
  const nextBtn = document.getElementById('celebration-next-btn');
  if (!celebration || !nextBtn) return;

  nextBtn.textContent = buttonText;
  celebration.classList.remove('hidden');

  const handleClick = () => {
    celebration.classList.add('hidden');
    nextBtn.removeEventListener('click', handleClick);
    if (callback) callback();
  };

  nextBtn.addEventListener('click', handleClick);
}

export function getCurrentScreen(): ScreenName {
  return currentScreen;
}
