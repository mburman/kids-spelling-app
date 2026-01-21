// Practice mode - write on paper and take a photo

import * as Storage from './storage';
import { say, celebrate, launchConfetti } from './mascot';
import { showCelebration } from './app';

let words: string[] = [];
let currentWordIndex = 0;

export function initPractice(): void {
  // Camera button
  document.getElementById('camera-btn')?.addEventListener('click', () => {
    document.getElementById('camera-input')?.click();
  });

  // Camera input change
  document.getElementById('camera-input')?.addEventListener('change', (e) => {
    handlePhoto(e as Event);
  });

  // Approve button
  document.getElementById('approve-btn')?.addEventListener('click', () => {
    approveWriting();
  });

  // Retry button
  document.getElementById('retry-btn')?.addEventListener('click', () => {
    retryWriting();
  });

  // Next word button
  document.getElementById('next-practice-btn')?.addEventListener('click', () => {
    nextWord();
  });
}

export function startPractice(): void {
  words = [...Storage.getWords()];
  currentWordIndex = 0;

  // Mascot encouragement
  say('practiceStart');

  if (words.length > 0 && words[0]) {
    loadWord(words[0]);
  }

  // Reset UI
  document.getElementById('camera-btn')?.classList.remove('hidden');
  document.getElementById('photo-preview')?.classList.add('hidden');
  document.getElementById('next-practice-btn')?.classList.add('hidden');
}

function loadWord(word: string): void {
  const practiceWordEl = document.getElementById('practice-word');
  if (practiceWordEl) {
    practiceWordEl.textContent = word;
  }

  // Reset UI for new word
  document.getElementById('camera-btn')?.classList.remove('hidden');
  document.getElementById('photo-preview')?.classList.add('hidden');
  document.getElementById('next-practice-btn')?.classList.add('hidden');
}

function handlePhoto(event: Event): void {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];

  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const capturedPhoto = document.getElementById('captured-photo') as HTMLImageElement | null;
      if (capturedPhoto && e.target?.result) {
        capturedPhoto.src = e.target.result as string;
      }
      document.getElementById('photo-preview')?.classList.remove('hidden');
      document.getElementById('camera-btn')?.classList.add('hidden');
    };
    reader.readAsDataURL(file);
  }

  // Reset input so same file can be selected again
  input.value = '';
}

function approveWriting(): void {
  // Add score for completing practice
  Storage.addScore(1);

  // Launch confetti!
  launchConfetti();

  // Mascot celebrates
  celebrate();

  // Show celebration
  showCelebration(() => {
    const nextPracticeBtn = document.getElementById('next-practice-btn');

    // Check if more words
    if (currentWordIndex < words.length - 1) {
      document.getElementById('photo-preview')?.classList.add('hidden');
      nextPracticeBtn?.classList.remove('hidden');
      if (nextPracticeBtn) {
        nextPracticeBtn.textContent = 'Next Word';
      }
      say('practiceComplete');
    } else {
      document.getElementById('photo-preview')?.classList.add('hidden');
      nextPracticeBtn?.classList.remove('hidden');
      if (nextPracticeBtn) {
        nextPracticeBtn.textContent = 'Start Over';
      }
    }
  });
}

function retryWriting(): void {
  document.getElementById('photo-preview')?.classList.add('hidden');
  document.getElementById('camera-btn')?.classList.remove('hidden');
  say('encouragement');
}

function nextWord(): void {
  currentWordIndex++;

  if (currentWordIndex >= words.length) {
    // Restart
    currentWordIndex = 0;
  }

  const word = words[currentWordIndex];
  if (word) {
    loadWord(word);
  }
}
