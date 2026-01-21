// Practice mode - write on paper and take a photo

import * as Storage from './storage';
import { say, celebrate, launchConfetti } from './mascot';
import { showCelebration } from './app';
import { speakWord } from './speech';

let words: string[] = [];
let currentWordIndex = 0;

let currentWord = '';

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

  // Hear word again button
  document.getElementById('hear-practice-btn')?.addEventListener('click', () => {
    if (currentWord) {
      speakWord(currentWord);
    }
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
  currentWord = word.toLowerCase();

  const settings = Storage.getSettings();
  const mode = settings.wordPresentation;

  // Display word based on settings
  const practiceWordEl = document.getElementById('practice-word');
  if (practiceWordEl) {
    if (mode === 'visual' || mode === 'both') {
      practiceWordEl.textContent = word;
      practiceWordEl.classList.remove('audio-only');
    } else {
      // Audio only - show placeholder
      practiceWordEl.textContent = '?'.repeat(word.length);
      practiceWordEl.classList.add('audio-only');
    }
  }

  // Speak word based on settings
  if (mode === 'audio' || mode === 'both') {
    speakWord(word);
  }

  // Show/hide hear button based on settings
  const hearBtn = document.getElementById('hear-practice-btn');
  if (hearBtn) {
    if (mode === 'audio' || mode === 'both') {
      hearBtn.classList.remove('hidden');
    } else {
      hearBtn.classList.add('hidden');
    }
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

  // Check if more words or all complete
  const isLastWord = currentWordIndex >= words.length - 1;
  const buttonText = isLastWord ? 'Start Over' : 'Next Word';

  // Show celebration with Next Word button
  showCelebration(() => {
    document.getElementById('photo-preview')?.classList.add('hidden');
    say('practiceComplete');
    nextWord();
  }, buttonText);
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
