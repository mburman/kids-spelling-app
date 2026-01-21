// Character system type definitions

import type { CharacterType } from '../storage';

export type MessageCategory =
  | 'welcome'
  | 'encouragement'
  | 'correct'
  | 'wrong'
  | 'wordComplete'
  | 'practiceStart'
  | 'practiceComplete';

export interface CharacterMessages {
  welcome: string[];
  encouragement: string[];
  correct: string[];
  wrong: string[];
  wordComplete: string[];
  practiceStart: string[];
  practiceComplete: string[];
}

export interface CharacterConfig {
  id: CharacterType;
  name: string;
  displayName: string;
  messages: CharacterMessages;
  clickMessages: string[];
  idleAnimations: {
    primary: { interval: number; duration: number };
    secondary: { interval: number; duration: number };
  };
}

export type { CharacterType };
