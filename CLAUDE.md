# Spelling App for Anna

A spelling app for 4-6 year olds built with TypeScript + Vite.

## Quick Start

```bash
npm install      # Install dependencies (first time only)
npm run dev      # Start dev server at http://localhost:6070
```

## Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build for production (outputs to `dist/`) |
| `npm run preview` | Preview production build locally |
| `npm run test` | Run tests with Vitest |

## Project Structure

```
spelling-app/
├── index.html              # Main HTML file
├── src/
│   ├── main.ts             # Entry point
│   ├── app.ts              # Navigation and main logic
│   ├── game.ts             # Letter collection game
│   ├── racing.ts           # Letter racing game
│   ├── practice.ts         # Paper practice with camera
│   ├── parent.ts           # Word management (PIN protected)
│   ├── storage.ts          # LocalStorage helpers
│   ├── mascot.ts           # Character system + confetti
│   ├── sounds.ts           # Sound effects (Web Audio API)
│   ├── speech.ts           # Text-to-speech for words
│   ├── character-select.ts # Character selection screen
│   ├── characters/         # Character configurations
│   │   ├── types.ts        # Character type definitions
│   │   ├── index.ts        # Character registry
│   │   ├── owl.ts          # Ollie the Owl config
│   │   ├── cow.ts          # Bessie the Cow config
│   │   └── frog.ts         # Finn the Frog config
│   ├── styles.css          # All styles + animations
│   └── storage.test.ts     # Tests for storage module
├── package.json            # Dependencies and scripts
├── tsconfig.json           # TypeScript config
└── vite.config.ts          # Vite config
```

## Key Features

- **Letter Game**: Tap letters in order to spell words
- **Letter Racing**: Mario Kart-style letter collection game
- **Practice Mode**: Write on paper, take photo, parent verifies
- **Parent Mode**: Add/remove spelling words (PIN: 1234)
- **Local Storage**: Words saved in browser localStorage
- **3 Playable Characters**: Ollie the Owl, Bessie the Cow, Finn the Frog
- **Character Selection**: Choose your friend from the home screen
- **Fun Animations**: Confetti, sparkles, bouncing letters, character-specific animations

## Characters

The app features 3 playable characters, each with unique sounds, animations, and messages:

| Character | Personality | Sound | Catchphrase |
|-----------|-------------|-------|-------------|
| **Ollie the Owl** (default) | Wise and encouraging | Hoot | "Hoot hoot!" |
| **Bessie the Cow** | Gentle and cheerful | Moo | "Moo moo!" |
| **Finn the Frog** | Calm and cool | Ribbit | "Ribbit!" |

To change characters:
1. Tap the character face button (bottom-left on home screen)
2. Tap a character card to preview their sound
3. Tap "Pick Me!" to confirm selection

## Default PIN

Parent mode PIN: `1234`

## Tech Stack

- **TypeScript** - Type-safe JavaScript
- **Vite** - Fast build tool with hot reload
- **Vitest** - Test runner
- No frameworks - vanilla TypeScript

## Adding/Changing Words

1. Click the gear icon on home screen
2. Enter PIN (1234)
3. Add words using the input field
4. Delete words with the × button
