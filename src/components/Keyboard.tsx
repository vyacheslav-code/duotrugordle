import type { LetterStatus } from '../game/duotrigordle';
import './Keyboard.css';

const ROWS = [
  ['й', 'ц', 'у', 'к', 'е', 'н', 'г', 'ш', 'щ', 'з', 'х'],
  ['ф', 'ы', 'в', 'а', 'п', 'р', 'о', 'л', 'д', 'ж', 'э'],
  ['я', 'ч', 'с', 'м', 'и', 'т', 'ь', 'б', 'ю'],
];

interface Props {
  statuses: Map<string, LetterStatus>;
  onLetter: (letter: string) => void;
  onBackspace: () => void;
  onEnter: () => void;
}

export function Keyboard({ statuses, onLetter, onBackspace, onEnter }: Props) {
  return (
    <div className="keyboard">
      {ROWS.map((row, i) => (
        <div className="keyboard-row" key={i}>
          {i === 2 && (
            <button className="key key-wide" onClick={onEnter}>
              Ввод
            </button>
          )}
          {row.map((letter) => {
            const status = statuses.get(letter);
            return (
              <button
                key={letter}
                className={`key ${status ?? ''}`}
                onClick={() => onLetter(letter)}
              >
                {letter}
              </button>
            );
          })}
          {i === 2 && (
            <button className="key key-wide" onClick={onBackspace}>
              ⌫
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
