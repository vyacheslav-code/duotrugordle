import { useEffect, useMemo, useState } from 'react';
import { MiniBoard } from './components/MiniBoard';
import { Keyboard } from './components/Keyboard';
import { useGame } from './game/useGame';
import { MAX_GUESSES, WORD_LENGTH } from './game/duotrigordle';
import './App.css';

const WINDOW_SIZE = 5;

function randomSeed() {
  return Math.floor(Math.random() * 1_000_000_000);
}

function App() {
  const [seedInput, setSeedInput] = useState('');
  const {
    game,
    input,
    error,
    remainingGuesses,
    keyStatuses,
    restart,
    typeLetter,
    backspace,
    submit,
  } = useGame(randomSeed());

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        submit();
      } else if (e.key === 'Backspace') {
        backspace();
      } else {
        const k = e.key.toLowerCase();
        if (/^[а-яё]$/.test(k)) {
          typeLetter(k);
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [submit, backspace, typeLetter]);

  const orderedBoards = useMemo(() => {
    return [...game.boards].sort((a, b) => {
      if (a.solved && b.solved) {
        return (a.solvedAtGuess ?? 0) - (b.solvedAtGuess ?? 0);
      }
      if (a.solved) return -1;
      if (b.solved) return 1;
      return 0;
    });
  }, [game.boards]);

  const startRow = Math.max(
    0,
    Math.min(
      game.allGuesses.length - 1,
      MAX_GUESSES - WINDOW_SIZE,
    ),
  );

  const solvedCount = game.boards.filter((b) => b.solved).length;

  return (
    <div className="app">
      <header className="app-header">
        <h1>Дуотригордль</h1>
        <div className="status-bar">
          <span>
            Решено: {solvedCount}/{32}
          </span>
          <span>Осталось попыток: {remainingGuesses}</span>
        </div>
        <div className="seed-controls">
          <input
            className="seed-input"
            placeholder="Сид (число или слово)"
            value={seedInput}
            onChange={(e) => setSeedInput(e.target.value)}
          />
          <button
            onClick={() => {
              restart(seedInput || String(randomSeed()));
            }}
          >
            Новая игра
          </button>
        </div>
      </header>

      {game.gameOver && (
        <div className={`banner ${game.won ? 'win' : 'lose'}`}>
          {game.won
            ? `Победа! Угадано за ${game.allGuesses.length} попыток.`
            : 'Игра окончена. Не все слова разгаданы.'}
          {!game.won && (
            <div className="answers">
              {game.boards
                .filter((b) => !b.solved)
                .map((b) => b.target)
                .join(', ')}
            </div>
          )}
        </div>
      )}

      {error && <div className="error-toast">{error}</div>}

      <div className="boards-grid">
        {orderedBoards.map((board, i) => (
          <MiniBoard
            key={board.target + i}
            board={board}
            currentInput={input}
            windowSize={WINDOW_SIZE}
            startRow={
              board.solved
                ? Math.max(0, board.guesses.length - WINDOW_SIZE)
                : startRow
            }
          />
        ))}
      </div>

      <div className="current-input">
        {Array.from({ length: WORD_LENGTH }).map((_, i) => (
          <div className="current-cell" key={i}>
            {input[i] ?? ''}
          </div>
        ))}
      </div>

      <Keyboard
        statuses={keyStatuses}
        onLetter={typeLetter}
        onBackspace={backspace}
        onEnter={submit}
      />
    </div>
  );
}

export default App;
