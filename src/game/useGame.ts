import { useCallback, useMemo, useState } from 'react';
import {
  applyGuess,
  createGame,
  isValidWord,
  keyboardStatuses,
  MAX_GUESSES,
  seedFromString,
  WORD_LENGTH,
  type GameState,
} from './duotrigordle';

export function useGame(initialSeed: number) {
  const [game, setGame] = useState<GameState>(() => createGame(initialSeed));
  const [input, setInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  const restart = useCallback((seedInput: string) => {
    const seed = /^-?\d+$/.test(seedInput.trim())
      ? Number(seedInput.trim())
      : seedFromString(seedInput.trim());
    setGame(createGame(seed));
    setInput('');
    setError(null);
  }, []);

  const typeLetter = useCallback((letter: string) => {
    setError(null);
    setInput((prev) => (prev.length < WORD_LENGTH ? prev + letter : prev));
  }, []);

  const backspace = useCallback(() => {
    setError(null);
    setInput((prev) => prev.slice(0, -1));
  }, []);

  const submit = useCallback(() => {
    if (game.gameOver) return;
    if (input.length !== WORD_LENGTH) {
      setError('Слишком короткое слово');
      return;
    }
    if (!isValidWord(input)) {
      setError('Такого слова нет в словаре');
      return;
    }
    setGame((prev) => applyGuess(prev, input));
    setInput('');
    setError(null);
  }, [game.gameOver, input]);

  const remainingGuesses = MAX_GUESSES - game.allGuesses.length;
  const keyStatuses = useMemo(() => keyboardStatuses(game), [game]);

  return {
    game,
    input,
    error,
    remainingGuesses,
    keyStatuses,
    restart,
    typeLetter,
    backspace,
    submit,
  };
}
