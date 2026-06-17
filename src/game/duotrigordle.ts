import { ANSWERS, WORD_SET } from '../data/wordList';

export const NUM_BOARDS = 32;
export const WORD_LENGTH = 5;
export const MAX_GUESSES = 37;

export type LetterStatus = 'correct' | 'present' | 'absent';

function mulberry32(seed: number) {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function seedFromString(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (Math.imul(31, hash) + input.charCodeAt(i)) | 0;
  }
  return hash;
}

export function todayDateKey(): string {
  return new Date().toISOString().slice(0, 10);
}

export function dailySeed(dateKey: string = todayDateKey()): number {
  return seedFromString(`duotrigordle-${dateKey}`);
}

export function pickTargets(seed: number): string[] {
  const rng = mulberry32(seed);
  const pool = [...ANSWERS];
  const chosen: string[] = [];
  while (chosen.length < NUM_BOARDS && pool.length > 0) {
    const idx = Math.floor(rng() * pool.length);
    chosen.push(pool[idx]);
    pool.splice(idx, 1);
  }
  return chosen;
}

export function isValidWord(word: string): boolean {
  return WORD_SET.has(word.toLowerCase());
}

export function scoreGuess(guess: string, target: string): LetterStatus[] {
  const result: LetterStatus[] = new Array(WORD_LENGTH).fill('absent');
  const targetLetters = target.split('');
  const used = new Array(WORD_LENGTH).fill(false);

  for (let i = 0; i < WORD_LENGTH; i++) {
    if (guess[i] === targetLetters[i]) {
      result[i] = 'correct';
      used[i] = true;
    }
  }

  for (let i = 0; i < WORD_LENGTH; i++) {
    if (result[i] === 'correct') continue;
    const letter = guess[i];
    const matchIdx = targetLetters.findIndex(
      (l, j) => l === letter && !used[j],
    );
    if (matchIdx !== -1) {
      result[i] = 'present';
      used[matchIdx] = true;
    }
  }

  return result;
}

export interface BoardState {
  target: string;
  guesses: string[];
  solved: boolean;
  solvedAtGuess: number | null;
}

export interface GameState {
  seed: number;
  boards: BoardState[];
  allGuesses: string[];
  gameOver: boolean;
  won: boolean;
}

export function createGame(seed: number): GameState {
  const targets = pickTargets(seed);
  return {
    seed,
    boards: targets.map((target) => ({
      target,
      guesses: [],
      solved: false,
      solvedAtGuess: null,
    })),
    allGuesses: [],
    gameOver: false,
    won: false,
  };
}

export function applyGuess(state: GameState, guess: string): GameState {
  if (state.gameOver) return state;
  const normalized = guess.toLowerCase();
  const guessNumber = state.allGuesses.length + 1;

  const boards = state.boards.map((board) => {
    if (board.solved) return board;
    const guesses = [...board.guesses, normalized];
    const solved = normalized === board.target;
    return {
      ...board,
      guesses,
      solved,
      solvedAtGuess: solved ? guessNumber : null,
    };
  });

  const allGuesses = [...state.allGuesses, normalized];
  const won = boards.every((b) => b.solved);
  const gameOver = won || allGuesses.length >= MAX_GUESSES;

  return { ...state, boards, allGuesses, won, gameOver };
}

export function letterStatusesForBoard(board: BoardState): LetterStatus[][] {
  return board.guesses.map((g) => scoreGuess(g, board.target));
}

export function keyboardStatuses(state: GameState): Map<string, LetterStatus> {
  const map = new Map<string, LetterStatus>();
  const rank: Record<LetterStatus, number> = { absent: 0, present: 1, correct: 2 };

  for (const board of state.boards) {
    for (const guess of board.guesses) {
      const statuses = scoreGuess(guess, board.target);
      for (let i = 0; i < WORD_LENGTH; i++) {
        const letter = guess[i];
        const status = statuses[i];
        const existing = map.get(letter);
        if (!existing || rank[status] > rank[existing]) {
          map.set(letter, status);
        }
      }
    }
  }
  return map;
}
