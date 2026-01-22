// Bessie the Cow - Character configuration

import type { CharacterConfig } from './types';

export const cowConfig: CharacterConfig = {
  id: 'cow',
  name: 'Bessie',
  displayName: 'Bessie the Cow',
  messages: {
    welcome: [
      "Moo! Let's spell!",
      "Hi friend! Ready to graze?",
      "Yay! Bessie's here!",
      "Let's moooove into spelling!",
    ],
    encouragement: [
      "You've got this, moo!",
      "You're doing moo-velously!",
      "Keep going, little calf!",
      "Udderly fantastic!",
      "You're amazing!",
    ],
    correct: [
      "Moo-velous!",
      "Woohoo! Moo moo!",
      "So clever!",
      "That's udderly amazing!",
      "Pasture expectations!",
      "You nailed it!",
    ],
    wrong: [
      "Oops! Try again, moo!",
      "Almost! One more try!",
      "Don't have a cow, try again!",
      "So close, friend!",
    ],
    wordComplete: [
      "SUPER SPELLER!",
      "You did it! Moo moo!",
      "AMAZING!",
      "MOO-TASTIC!",
      "UDDERLY BRILLIANT!",
    ],
    practiceStart: [
      "Time to write!",
      "Grab your pencil, friend!",
      "Let's moooove into writing!",
      "Writing time! Yay!",
    ],
    practiceComplete: [
      "Beautiful!",
      "Great writing!",
      "You're a star writer!",
      "Moo-nificent!",
    ],
  },
  clickMessages: [
    "Moo!",
    "Moooo!",
    "I'm Bessie!",
    "Moo moo!",
  ],
  idleAnimations: {
    primary: { interval: 3000, duration: 300 },   // Ear flick
    secondary: { interval: 5000, duration: 600 }, // Tail swish
  },
};
