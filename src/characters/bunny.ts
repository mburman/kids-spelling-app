// Benny the Bunny - Character configuration

import type { CharacterConfig } from './types';

export const bunnyConfig: CharacterConfig = {
  id: 'bunny',
  name: 'Benny',
  displayName: 'Benny the Bunny',
  messages: {
    welcome: [
      "Hop hop! Let's spell!",
      "Hi friend! Ready to hop?",
      "Yay! Bunny's here!",
      "Let's bounce into spelling!",
    ],
    encouragement: [
      "Hop to it!",
      "You're hopping along great!",
      "Ears up, you've got this!",
      "Keep bouncing!",
      "You're doing amazing!",
    ],
    correct: [
      "Bunny bounce! Yes!",
      "Woohoo! Hop hop!",
      "So clever!",
      "That's ear-mazing!",
      "Hippity hooray!",
      "You nailed it!",
    ],
    wrong: [
      "Oops! Try another hop!",
      "Almost! Hop again!",
      "One more bounce!",
      "So close, friend!",
    ],
    wordComplete: [
      "SUPER HOPPER!",
      "You did it! Bounce bounce!",
      "AMAZING!",
      "HOP-TASTIC!",
      "BUNNY CHAMPION!",
    ],
    practiceStart: [
      "Time to write!",
      "Grab your pencil, friend!",
      "Let's hop into writing!",
      "Writing time! Yay!",
    ],
    practiceComplete: [
      "Beautiful!",
      "Great writing!",
      "You're a star writer!",
      "Hop-perfect!",
    ],
  },
  clickMessages: [
    "Squeak!",
    "Boing!",
    "I'm Benny!",
    "Hop hop!",
  ],
  idleAnimations: {
    primary: { interval: 2500, duration: 200 },   // Nose twitch
    secondary: { interval: 4000, duration: 500 }, // Ear wiggle
  },
};
