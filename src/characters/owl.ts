// Ollie the Owl - Character configuration

import type { CharacterConfig } from './types';

export const owlConfig: CharacterConfig = {
  id: 'owl',
  name: 'Ollie',
  displayName: 'Ollie the Owl',
  messages: {
    welcome: [
      "Hi! Let's learn to spell!",
      "Ready to have fun?",
      "Yay! Spelling time!",
      "Hello, superstar!",
    ],
    encouragement: [
      "You can do it!",
      "Keep going!",
      "You're doing great!",
      "Almost there!",
      "Fantastic!",
    ],
    correct: [
      "Woohoo! Amazing!",
      "You got it!",
      "Super smart!",
      "Brilliant!",
      "High five!",
      "You're a star!",
    ],
    wrong: [
      "Try again!",
      "Oops! One more time!",
      "So close!",
      "You've got this!",
    ],
    wordComplete: [
      "WOW! You did it!",
      "AMAZING SPELLING!",
      "You're incredible!",
      "Champion speller!",
      "SO PROUD OF YOU!",
    ],
    practiceStart: [
      "Time to write!",
      "Grab your pencil!",
      "Let's practice!",
      "Writing is fun!",
    ],
    practiceComplete: [
      "Beautiful writing!",
      "Great job!",
      "You wrote it!",
      "Wonderful!",
    ],
  },
  clickMessages: [
    "Hoot!",
    "Whooo?",
    "I'm Ollie!",
    "Hoo-ray!",
  ],
  idleAnimations: {
    primary: { interval: 3000, duration: 150 },   // Blink
    secondary: { interval: 5000, duration: 600 }, // Wave wings
  },
};
