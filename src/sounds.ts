// Sound effects module using Web Audio API
// Generates cheerful, kid-friendly sounds programmatically

import { getSettings } from './storage';

// Singleton AudioContext (created on first user interaction)
let audioContext: AudioContext | null = null;

// Pre-loaded audio elements for sound files
let hootAudio: HTMLAudioElement | null = null;
let mooAudio: HTMLAudioElement | null = null;
let ribbitAudio: HTMLAudioElement | null = null;

export type SoundName =
  | 'correctLetter'
  | 'wrongLetter'
  | 'wordComplete'
  | 'gameComplete'
  | 'practiceApproved'
  | 'hoot'
  | 'moo'
  | 'ribbit'
  | 'laneChange'
  | 'letterSpawn'
  | 'gameStart'
  | 'letterMissed';

// Initialize audio context (must be called after user gesture)
export function initSounds(): void {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  }

  // Get the base URL for assets (handles GitHub Pages subdirectory deployment)
  const base = import.meta.env.BASE_URL || '/';

  // Preload owl hoot audio
  if (!hootAudio) {
    hootAudio = new Audio(`${base}owl-hoot.mp3`);
    hootAudio.volume = 0.5;
  }

  // Preload cow moo audio
  if (!mooAudio) {
    mooAudio = new Audio(`${base}cow-moo.mp3`);
    mooAudio.volume = 0.5;
  }

  // Preload frog ribbit audio
  if (!ribbitAudio) {
    ribbitAudio = new Audio(`${base}frog-ribbit.mp3`);
    ribbitAudio.volume = 0.5;
  }
}

// Check if sounds are enabled in settings
function isSoundEnabled(): boolean {
  return getSettings().soundsEnabled;
}

// Helper: Create a simple tone
function playTone(
  frequency: number,
  duration: number,
  type: OscillatorType = 'sine',
  volume: number = 0.3,
  startTime: number = 0
): void {
  if (!audioContext) return;

  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime + startTime);

  // Envelope for smooth attack/decay
  gainNode.gain.setValueAtTime(0, audioContext.currentTime + startTime);
  gainNode.gain.linearRampToValueAtTime(volume, audioContext.currentTime + startTime + 0.02);
  gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + startTime + duration);

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.start(audioContext.currentTime + startTime);
  oscillator.stop(audioContext.currentTime + startTime + duration);
}

// Correct letter: Rising two-note chime (C5 -> E5)
function playCorrectLetter(): void {
  playTone(523.25, 0.15, 'sine', 0.25, 0);      // C5
  playTone(659.25, 0.2, 'sine', 0.3, 0.08);     // E5
}

// Wrong letter: Gentle descending tone (not harsh!)
function playWrongLetter(): void {
  if (!audioContext) return;

  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(330, audioContext.currentTime);       // E4
  oscillator.frequency.linearRampToValueAtTime(262, audioContext.currentTime + 0.15); // down to C4

  gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.2);

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.start();
  oscillator.stop(audioContext.currentTime + 0.2);
}

// Word complete: Triumphant ascending arpeggio
function playWordComplete(): void {
  // C5 -> E5 -> G5 -> C6 arpeggio
  playTone(523.25, 0.2, 'sine', 0.25, 0);       // C5
  playTone(659.25, 0.2, 'sine', 0.28, 0.1);     // E5
  playTone(783.99, 0.2, 'sine', 0.3, 0.2);      // G5
  playTone(1046.50, 0.4, 'triangle', 0.35, 0.3); // C6 (longer, brighter)
}

// Game complete: Full celebration jingle
function playGameComplete(): void {
  // Extended fanfare
  playTone(523.25, 0.15, 'sine', 0.25, 0);      // C5
  playTone(659.25, 0.15, 'sine', 0.25, 0.1);    // E5
  playTone(783.99, 0.15, 'sine', 0.28, 0.2);    // G5
  playTone(1046.50, 0.3, 'sine', 0.3, 0.3);     // C6
  playTone(1318.51, 0.5, 'triangle', 0.35, 0.5); // E6 (sparkle finish)
}

// Owl hoot: Actual owl hoot sound
function playHoot(): void {
  if (hootAudio) {
    hootAudio.currentTime = 0;
    hootAudio.play().catch(() => {
      // Fallback to synthesized tone if audio fails
      playTone(320, 0.3, 'sine', 0.35, 0);
    });
  } else {
    // Fallback to synthesized tone
    playTone(320, 0.3, 'sine', 0.35, 0);
  }
}

// Cow moo: Deep, friendly moo sound
function playMoo(): void {
  if (mooAudio) {
    mooAudio.currentTime = 0;
    mooAudio.play().catch(() => {
      // Fallback to synthesized moo if audio fails
      playSynthesizedMoo();
    });
  } else {
    // Fallback to synthesized moo
    playSynthesizedMoo();
  }
}

// Synthesized moo fallback - low frequency with vibrato
function playSynthesizedMoo(): void {
  if (!audioContext) return;

  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  const lfo = audioContext.createOscillator();
  const lfoGain = audioContext.createGain();

  // Main oscillator - low frequency for moo sound
  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(150, audioContext.currentTime);
  oscillator.frequency.linearRampToValueAtTime(120, audioContext.currentTime + 0.2);
  oscillator.frequency.linearRampToValueAtTime(100, audioContext.currentTime + 0.5);

  // LFO for gentle vibrato
  lfo.type = 'sine';
  lfo.frequency.setValueAtTime(5, audioContext.currentTime);
  lfoGain.gain.setValueAtTime(8, audioContext.currentTime);

  // Volume envelope - slow attack, sustain, decay
  gainNode.gain.setValueAtTime(0, audioContext.currentTime);
  gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.1);
  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime + 0.35);
  gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.6);

  // Connect LFO to main oscillator frequency
  lfo.connect(lfoGain);
  lfoGain.connect(oscillator.frequency);

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  lfo.start(audioContext.currentTime);
  oscillator.start(audioContext.currentTime);
  lfo.stop(audioContext.currentTime + 0.6);
  oscillator.stop(audioContext.currentTime + 0.6);
}

// Frog ribbit: Actual ribbit sound
function playRibbit(): void {
  if (ribbitAudio) {
    ribbitAudio.currentTime = 0;
    ribbitAudio.play().catch(() => {
      // Fallback to synthesized ribbit if audio fails
      playSynthesizedRibbit();
    });
  } else {
    // Fallback to synthesized ribbit
    playSynthesizedRibbit();
  }
}

// Synthesized ribbit fallback - low frequency croaking sound
function playSynthesizedRibbit(): void {
  if (!audioContext) return;

  // Create a croaky "ribbit" sound with frequency modulation
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  const lfo = audioContext.createOscillator();
  const lfoGain = audioContext.createGain();

  // Main oscillator - low frequency for frog-like sound
  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(180, audioContext.currentTime);
  oscillator.frequency.linearRampToValueAtTime(120, audioContext.currentTime + 0.15);
  oscillator.frequency.setValueAtTime(180, audioContext.currentTime + 0.18);
  oscillator.frequency.linearRampToValueAtTime(100, audioContext.currentTime + 0.35);

  // LFO for wobble effect
  lfo.type = 'sine';
  lfo.frequency.setValueAtTime(25, audioContext.currentTime);
  lfoGain.gain.setValueAtTime(30, audioContext.currentTime);

  // Volume envelope
  gainNode.gain.setValueAtTime(0, audioContext.currentTime);
  gainNode.gain.linearRampToValueAtTime(0.35, audioContext.currentTime + 0.03);
  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime + 0.15);
  gainNode.gain.linearRampToValueAtTime(0.35, audioContext.currentTime + 0.18);
  gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.4);

  // Connect LFO to main oscillator frequency
  lfo.connect(lfoGain);
  lfoGain.connect(oscillator.frequency);

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  lfo.start(audioContext.currentTime);
  oscillator.start(audioContext.currentTime);
  lfo.stop(audioContext.currentTime + 0.4);
  oscillator.stop(audioContext.currentTime + 0.4);
}

// Lane change: Soft tick sound
function playLaneChange(): void {
  playTone(600, 0.04, 'sine', 0.08, 0);  // Very short, quiet tick
}

// Letter spawn: Soft pop sound
function playLetterSpawn(): void {
  playTone(880, 0.08, 'sine', 0.12, 0);  // Quick high note
}

// Game start: Ready-set-go style ascending tones
function playGameStart(): void {
  playTone(392, 0.2, 'sine', 0.2, 0);      // G4
  playTone(392, 0.2, 'sine', 0.2, 0.3);    // G4
  playTone(523.25, 0.4, 'triangle', 0.3, 0.6); // C5 (go!)
}

// Letter missed: Gentle "oops" sound (not harsh)
function playLetterMissed(): void {
  if (!audioContext) return;

  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
  oscillator.frequency.linearRampToValueAtTime(330, audioContext.currentTime + 0.15);

  gainNode.gain.setValueAtTime(0.12, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.2);

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.start();
  oscillator.stop(audioContext.currentTime + 0.2);
}

// Master play function with settings check
export function playSound(name: SoundName): void {
  if (!isSoundEnabled()) return;

  // Ensure context exists and is running
  if (!audioContext) {
    initSounds();
  }

  if (audioContext?.state === 'suspended') {
    audioContext.resume();
  }

  // Dispatch to specific sound generator
  switch (name) {
    case 'correctLetter':
      playCorrectLetter();
      break;
    case 'wrongLetter':
      playWrongLetter();
      break;
    case 'wordComplete':
    case 'practiceApproved':
      playWordComplete();
      break;
    case 'gameComplete':
      playGameComplete();
      break;
    case 'hoot':
      playHoot();
      break;
    case 'moo':
      playMoo();
      break;
    case 'ribbit':
      playRibbit();
      break;
    case 'laneChange':
      playLaneChange();
      break;
    case 'letterSpawn':
      playLetterSpawn();
      break;
    case 'gameStart':
      playGameStart();
      break;
    case 'letterMissed':
      playLetterMissed();
      break;
  }
}
