import raw from './words.txt?raw';

export const WORDS: string[] = raw
  .split('\n')
  .map((w) => w.trim())
  .filter(Boolean);

export const WORD_SET: Set<string> = new Set(WORDS);

export const ANSWERS: string[] = WORDS;
