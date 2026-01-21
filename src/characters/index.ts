// Character registry - exports all characters and provides lookup

import type { CharacterConfig, CharacterType, MessageCategory } from './types';
import { owlConfig } from './owl';
import { bunnyConfig } from './bunny';
import { frogConfig } from './frog';

export type { CharacterConfig, CharacterType, MessageCategory };

const characters: Record<CharacterType, CharacterConfig> = {
  owl: owlConfig,
  bunny: bunnyConfig,
  frog: frogConfig,
};

export function getCharacterConfig(type: CharacterType): CharacterConfig {
  return characters[type];
}

export function getAllCharacters(): CharacterConfig[] {
  return Object.values(characters);
}

export function getRandomMessage(config: CharacterConfig, category: MessageCategory): string {
  const categoryMessages = config.messages[category];
  return categoryMessages[Math.floor(Math.random() * categoryMessages.length)] ?? categoryMessages[0] ?? '';
}

export function getRandomClickMessage(config: CharacterConfig): string {
  const messages = config.clickMessages;
  return messages[Math.floor(Math.random() * messages.length)] ?? messages[0] ?? '';
}

export { owlConfig, bunnyConfig, frogConfig };
