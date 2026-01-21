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

## Features

- **Letter Game**: Tap letters in order to spell words
- **Practice Mode**: Write on paper, take photo, parent verifies
- **Parent Mode**: Add/remove spelling words (PIN protected)
- **Local Storage**: Words saved in browser localStorage
- **Ollie the Owl**: Friendly mascot that cheers and encourages
- **Fun Animations**: Confetti, sparkles, bouncing letters

## CI/CD

This project uses GitHub Actions for continuous integration and deployment.

### Automated Pipeline

On every push/PR to `main`:
1. **Tests** - Runs the test suite with Vitest
2. **Build** - Compiles TypeScript and builds for production
3. **Deploy** - Automatically deploys to GitHub Pages (on push to `main` only)

### Setting Up GitHub Pages

1. Push the code to GitHub
2. Go to your repo → **Settings** → **Pages**
3. Under "Build and deployment", set **Source** to **GitHub Actions**

Once configured, the app will be available at:
```
https://<username>.github.io/spelling-app/
```

### Workflow Status

The CI workflow runs on:
- Push to `main` branch (tests + build + deploy)
- Pull requests to `main` branch (tests + build only)

## Tech Stack

- **TypeScript** - Type-safe JavaScript
- **Vite** - Fast build tool with hot reload
- **Vitest** - Test runner
- **GitHub Actions** - CI/CD pipeline
- **GitHub Pages** - Hosting

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
│   └── styles.css          # All styles + animations
├── .github/workflows/
│   └── ci.yml              # GitHub Actions workflow
├── package.json            # Dependencies and scripts
├── tsconfig.json           # TypeScript config
└── vite.config.ts          # Vite config
```

## Parent Mode

Default PIN: `1234`

To add or change words:
1. Click the gear icon on home screen
2. Enter PIN
3. Add words using the input field
4. Delete words with the × button
