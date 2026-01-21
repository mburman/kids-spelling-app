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
│   ├── practice.ts         # Paper practice with camera
│   ├── parent.ts           # Word management (PIN protected)
│   ├── storage.ts          # LocalStorage helpers
│   ├── mascot.ts           # Ollie the Owl + confetti
│   ├── styles.css          # All styles + animations
│   └── storage.test.ts     # Tests for storage module
├── package.json            # Dependencies and scripts
├── tsconfig.json           # TypeScript config
└── vite.config.ts          # Vite config
```

## Key Features

- **Letter Game**: Tap letters in order to spell words
- **Practice Mode**: Write on paper, take photo, parent verifies
- **Parent Mode**: Add/remove spelling words (PIN: 1234)
- **Local Storage**: Words saved in browser localStorage
- **Ollie the Owl**: Friendly mascot that cheers and encourages
- **Fun Animations**: Confetti, sparkles, bouncing letters

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
