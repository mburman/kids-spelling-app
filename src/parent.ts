// Parent mode - word management with PIN protection

import * as Storage from './storage';

let isAuthenticated = false;

export function initParent(): void {
  setupEventListeners();
}

function setupEventListeners(): void {
  // PIN submission
  document.getElementById('pin-submit')?.addEventListener('click', () => {
    verifyPinInput();
  });

  document.getElementById('pin-input')?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      verifyPinInput();
    }
  });

  // Add word
  document.getElementById('add-word-btn')?.addEventListener('click', () => {
    addWordFromInput();
  });

  document.getElementById('new-word-input')?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      addWordFromInput();
    }
  });

  // Clear all
  document.getElementById('clear-all-btn')?.addEventListener('click', () => {
    if (confirm('Are you sure you want to remove all words?')) {
      Storage.clearAllWords();
      renderWordList();
    }
  });
}

export function showParent(): void {
  if (!isAuthenticated) {
    document.getElementById('pin-entry')?.classList.remove('hidden');
    document.getElementById('word-management')?.classList.add('hidden');

    const pinInput = document.getElementById('pin-input') as HTMLInputElement | null;
    if (pinInput) {
      pinInput.value = '';
      pinInput.focus();
    }

    document.getElementById('pin-error')?.classList.add('hidden');
  } else {
    showWordManagement();
  }
}

export function hideParent(): void {
  isAuthenticated = false;
  document.getElementById('pin-entry')?.classList.remove('hidden');
  document.getElementById('word-management')?.classList.add('hidden');
}

function verifyPinInput(): void {
  const pinInput = document.getElementById('pin-input') as HTMLInputElement | null;
  if (!pinInput) return;

  const pin = pinInput.value;

  if (Storage.verifyPin(pin)) {
    isAuthenticated = true;
    showWordManagement();
  } else {
    document.getElementById('pin-error')?.classList.remove('hidden');
    pinInput.value = '';
    pinInput.focus();
  }
}

function showWordManagement(): void {
  document.getElementById('pin-entry')?.classList.add('hidden');
  document.getElementById('word-management')?.classList.remove('hidden');
  renderWordList();
}

function renderWordList(): void {
  const container = document.getElementById('word-list');
  if (!container) return;

  const words = Storage.getWords();

  if (words.length === 0) {
    container.innerHTML = '<p style="color: #999; text-align: center;">No words added yet.</p>';
  } else {
    container.innerHTML = words.map(word =>
      `<div class="word-item">
        <span>${word}</span>
        <button data-word="${word}" class="remove-word-btn" title="Remove">×</button>
      </div>`
    ).join('');

    // Add click handlers for remove buttons
    container.querySelectorAll('.remove-word-btn').forEach(button => {
      button.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        const word = target.dataset.word;
        if (word) {
          removeWordHandler(word);
        }
      });
    });
  }
}

function addWordFromInput(): void {
  const input = document.getElementById('new-word-input') as HTMLInputElement | null;
  if (!input) return;

  const word = input.value.trim();

  if (word) {
    if (Storage.addWord(word)) {
      input.value = '';
      renderWordList();
    } else {
      alert('Word already exists or is invalid.');
    }
  }
  input.focus();
}

function removeWordHandler(word: string): void {
  Storage.removeWord(word);
  renderWordList();
}
