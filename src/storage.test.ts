// Tests for storage module
import { describe, it, expect, beforeEach } from 'vitest';
import {
  getWords,
  addWord,
  removeWord,
  clearAllWords,
  getPin,
  setPin,
  verifyPin,
  getScore,
  addScore,
  resetScore,
} from './storage';

describe('Storage - Words', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('getWords returns empty array initially', () => {
    expect(getWords()).toEqual([]);
  });

  it('addWord adds a word successfully', () => {
    const result = addWord('apple');
    expect(result).toBe(true);
    expect(getWords()).toEqual(['apple']);
  });

  it('addWord converts to lowercase', () => {
    addWord('BANANA');
    expect(getWords()).toEqual(['banana']);
  });

  it('addWord trims whitespace', () => {
    addWord('  orange  ');
    expect(getWords()).toEqual(['orange']);
  });

  it('addWord rejects duplicates', () => {
    addWord('cat');
    const result = addWord('cat');
    expect(result).toBe(false);
    expect(getWords().length).toBe(1);
  });

  it('addWord rejects empty strings', () => {
    const result = addWord('   ');
    expect(result).toBe(false);
    expect(getWords()).toEqual([]);
  });

  it('removeWord removes a word', () => {
    addWord('dog');
    addWord('cat');
    removeWord('dog');
    expect(getWords()).toEqual(['cat']);
  });

  it('removeWord returns false for non-existent word', () => {
    addWord('fish');
    const result = removeWord('bird');
    expect(result).toBe(false);
  });

  it('clearAllWords removes all words', () => {
    addWord('one');
    addWord('two');
    addWord('three');
    clearAllWords();
    expect(getWords()).toEqual([]);
  });

  it('saveWords and getWords work with multiple words', () => {
    addWord('red');
    addWord('blue');
    addWord('green');
    const words = getWords();
    expect(words.length).toBe(3);
    expect(words).toContain('red');
    expect(words).toContain('blue');
    expect(words).toContain('green');
  });
});

describe('Storage - PIN', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('getPin returns default PIN initially', () => {
    expect(getPin()).toBe('1234');
  });

  it('verifyPin returns true for correct PIN', () => {
    expect(verifyPin('1234')).toBe(true);
  });

  it('verifyPin returns false for wrong PIN', () => {
    expect(verifyPin('0000')).toBe(false);
  });

  it('setPin changes the PIN', () => {
    setPin('9999');
    expect(verifyPin('9999')).toBe(true);
    expect(verifyPin('1234')).toBe(false);
  });
});

describe('Storage - Score', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('getScore returns 0 initially', () => {
    expect(getScore()).toBe(0);
  });

  it('addScore increases score', () => {
    addScore(5);
    expect(getScore()).toBe(5);
  });

  it('addScore accumulates', () => {
    addScore(3);
    addScore(2);
    expect(getScore()).toBe(5);
  });

  it('resetScore sets score to 0', () => {
    addScore(10);
    resetScore();
    expect(getScore()).toBe(0);
  });
});
