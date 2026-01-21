// Finn the Frog - Character configuration

import type { CharacterConfig } from './types';

export const frogConfig: CharacterConfig = {
  id: 'frog',
  name: 'Finn',
  displayName: 'Finn the Frog',
  messages: {
    welcome: [
      "Ribbit! Let's go!",
      "Ready to leap?",
      "Splash! Spelling time!",
      "Hey there, friend!",
    ],
    encouragement: [
      "Leap forward!",
      "You're lily-pad awesome!",
      "Hop to the next one!",
      "Keep on leaping!",
      "You've got this!",
    ],
    correct: [
      "Ribbit ribbit! Yes!",
      "Tongue-tastic!",
      "Lily-pad perfect!",
      "Ribbiting work!",
      "Splash! Amazing!",
      "Leap of genius!",
    ],
    wrong: [
      "Splash! Try again!",
      "Oops-a-ribbit!",
      "One more leap!",
      "Almost there, friend!",
    ],
    wordComplete: [
      "FROG-TASTIC!",
      "You're a spelling champion!",
      "RIBBIT RIBBIT!",
      "LEAP-ENDARY!",
      "SUPER FROG!",
    ],
    practiceStart: [
      "Time to write!",
      "Grab your pencil!",
      "Let's leap into writing!",
      "Writing is ribbiting!",
    ],
    practiceComplete: [
      "Beautiful writing!",
      "Leap-tastic job!",
      "You wrote it!",
      "Ribbiting work!",
    ],
  },
  clickMessages: [
    "Ribbit!",
    "Croak!",
    "I'm Finn!",
    "Splash!",
  ],
  idleAnimations: {
    primary: { interval: 3500, duration: 300 },   // Throat puff
    secondary: { interval: 6000, duration: 400 }, // Tongue flick
  },
};
