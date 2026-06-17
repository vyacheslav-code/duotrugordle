import { useMemo } from 'react';
import type { BoardState } from '../game/duotrigordle';
import { letterStatusesForBoard, WORD_LENGTH } from '../game/duotrigordle';
import './MiniBoard.css';

interface Props {
  board: BoardState;
  currentInput: string;
  windowSize: number;
  startRow: number;
}

export function MiniBoard({ board, currentInput, windowSize, startRow }: Props) {
  const statuses = useMemo(() => letterStatusesForBoard(board), [board]);

  const rows = [];
  for (let r = startRow; r < startRow + windowSize; r++) {
    if (r < board.guesses.length) {
      const word = board.guesses[r];
      const rowStatuses = statuses[r];
      rows.push(
        <div className="mini-row" key={r}>
          {Array.from({ length: WORD_LENGTH }).map((_, c) => (
            <div className={`mini-cell ${rowStatuses[c]}`} key={c}>
              {word[c]}
            </div>
          ))}
        </div>,
      );
    } else if (r === board.guesses.length && !board.solved && currentInput) {
      rows.push(
        <div className="mini-row" key={r}>
          {Array.from({ length: WORD_LENGTH }).map((_, c) => (
            <div className="mini-cell filled" key={c}>
              {currentInput[c] ?? ''}
            </div>
          ))}
        </div>,
      );
    } else {
      rows.push(
        <div className="mini-row" key={r}>
          {Array.from({ length: WORD_LENGTH }).map((_, c) => (
            <div className="mini-cell" key={c} />
          ))}
        </div>,
      );
    }
  }

  return (
    <div className={`mini-board ${board.solved ? 'solved' : ''}`}>
      {rows}
    </div>
  );
}
