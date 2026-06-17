import { useCallback, useMemo, useState } from 'react';
import {
  applyGuess,
  createGame,
  dailySeed,
  isValidWord,
  keyboardStatuses,
  MAX_GUESSES,
  todayDateKey,
  WORD_LENGTH,
  type GameState,
} from './duotrigordle';

export function useGame() {
  const [dateKey] = useState(todayDateKey);
  const [game, setGame] = useState<GameState>(() => createGame(dailySeed(dateKey)));
  const [input, setInput] = useState('');
  const [error, setError] = useState<string | null>(null);

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
    dateKey,
    input,
    error,
    remainingGuesses,
    keyStatuses,
    typeLetter,
    backspace,
    submit,
  };
}
