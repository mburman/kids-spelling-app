// Character selection screen logic

import { getCharacter, setCharacter, type CharacterType } from './storage';
import { playSound } from './sounds';
import { switchCharacter } from './mascot';
import { showScreen } from './app';

let selectedCharacter: CharacterType;
let characterCards: NodeListOf<Element>;
let selectButton: HTMLButtonElement | null;

export function initCharacterSelect(): void {
  characterCards = document.querySelectorAll('.character-card');
  selectButton = document.getElementById('select-character-btn') as HTMLButtonElement | null;

  // Load current character
  selectedCharacter = getCharacter();
  highlightSelectedCard();

  // Add click handlers to cards
  characterCards.forEach(card => {
    card.addEventListener('click', () => {
      const character = card.getAttribute('data-character') as CharacterType;
      previewCharacter(character);
    });
  });

  // Select button handler
  selectButton?.addEventListener('click', confirmSelection);
}

function previewCharacter(character: CharacterType): void {
  selectedCharacter = character;
  highlightSelectedCard();

  // Play character sound
  if (character === 'owl') {
    playSound('hoot');
  } else if (character === 'bunny') {
    playSound('squeak');
  } else if (character === 'frog') {
    playSound('ribbit');
  }

  // Add bounce animation to the selected card
  const card = document.querySelector(`.character-card[data-character="${character}"]`);
  card?.classList.add('bounce');
  setTimeout(() => {
    card?.classList.remove('bounce');
  }, 500);
}

function highlightSelectedCard(): void {
  characterCards.forEach(card => {
    const character = card.getAttribute('data-character');
    if (character === selectedCharacter) {
      card.classList.add('selected');
    } else {
      card.classList.remove('selected');
    }
  });
}

function confirmSelection(): void {
  // Save the selection
  setCharacter(selectedCharacter);

  // Update the mascot
  switchCharacter(selectedCharacter);

  // Update the character button icon on home screen
  updateCharacterButtonIcon(selectedCharacter);

  // Play celebration sound
  playSound('wordComplete');

  // Add celebration animation and go back to home
  selectButton?.classList.add('celebrate-btn');
  setTimeout(() => {
    selectButton?.classList.remove('celebrate-btn');
    showScreen('home');
  }, 400);
}

export function updateCharacterButtonIcon(character: CharacterType): void {
  const previewElement = document.getElementById('character-btn-preview');
  if (!previewElement) return;

  previewElement.innerHTML = getButtonPreviewHTML(character);
}

function getButtonPreviewHTML(character: CharacterType): string {
  switch (character) {
    case 'owl':
      return `
        <div class="btn-preview-owl">
          <div class="btn-owl-face">
            <div class="btn-owl-eyes">
              <div class="btn-owl-eye"></div>
              <div class="btn-owl-eye"></div>
            </div>
            <div class="btn-owl-beak"></div>
          </div>
        </div>
      `;
    case 'bunny':
      return `
        <div class="btn-preview-bunny">
          <div class="btn-bunny-ears">
            <div class="btn-bunny-ear left"></div>
            <div class="btn-bunny-ear right"></div>
          </div>
          <div class="btn-bunny-face">
            <div class="btn-bunny-eyes">
              <div class="btn-bunny-eye"></div>
              <div class="btn-bunny-eye"></div>
            </div>
            <div class="btn-bunny-nose"></div>
          </div>
        </div>
      `;
    case 'frog':
      return `
        <div class="btn-preview-frog">
          <div class="btn-frog-eyes">
            <div class="btn-frog-eye"></div>
            <div class="btn-frog-eye"></div>
          </div>
          <div class="btn-frog-mouth"></div>
        </div>
      `;
    default:
      return '';
  }
}

export function loadCharacterButtonIcon(): void {
  const character = getCharacter();
  updateCharacterButtonIcon(character);
}

export function getCharacterEmoji(character: CharacterType): string {
  const icons: Record<CharacterType, string> = {
    owl: '🦉',
    bunny: '🐰',
    frog: '🐸',
  };
  return icons[character];
}
