// Text-to-speech utility for pronouncing spelling words

import { getSettings, VoiceType } from './storage';

function findBritishVoice(voiceType: VoiceType): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices();
  const isFemale = voiceType === 'female-uk';

  // Priority list of British voice names to look for
  const femaleNames = ['google uk english female', 'kate', 'serena', 'martha'];
  const maleNames = ['google uk english male', 'daniel', 'arthur', 'oliver'];
  const preferredNames = isFemale ? femaleNames : maleNames;

  // First try to find a voice by preferred name
  for (const name of preferredNames) {
    const voice = voices.find(v => v.name.toLowerCase().includes(name));
    if (voice) return voice;
  }

  // Fall back to any en-GB voice
  const gbVoices = voices.filter(v => v.lang === 'en-GB');
  if (gbVoices.length > 0) {
    // Try to match gender by common patterns
    const genderMatch = gbVoices.find(v => {
      const nameLower = v.name.toLowerCase();
      if (isFemale) {
        return nameLower.includes('female') || nameLower.includes('woman');
      } else {
        return nameLower.includes('male') || nameLower.includes('man');
      }
    });
    if (genderMatch) return genderMatch;
    return gbVoices[0] ?? null;
  }

  return null;
}

export function speakWord(word: string): void {
  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  const settings = getSettings();
  const utterance = new SpeechSynthesisUtterance(word);
  utterance.rate = 0.8; // Slower for kids
  utterance.pitch = 1.0;
  utterance.volume = 1.0;
  utterance.lang = 'en-GB';

  // Try to set the preferred voice
  const voice = findBritishVoice(settings.voice);
  if (voice) {
    utterance.voice = voice;
  }

  window.speechSynthesis.speak(utterance);
}

export function speakPhrase(phrase: string): void {
  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  const settings = getSettings();
  const utterance = new SpeechSynthesisUtterance(phrase);
  utterance.rate = 1.0;   // Normal speed for phrases
  utterance.pitch = 1.1;  // Slightly higher pitch for enthusiasm
  utterance.volume = 0.9;
  utterance.lang = 'en-GB';

  // Try to set the preferred voice
  const voice = findBritishVoice(settings.voice);
  if (voice) {
    utterance.voice = voice;
  }

  window.speechSynthesis.speak(utterance);
}

// Preload voices (needed for some browsers)
if (typeof window !== 'undefined' && window.speechSynthesis) {
  window.speechSynthesis.getVoices();
  window.speechSynthesis.onvoiceschanged = () => {
    window.speechSynthesis.getVoices();
  };
}
