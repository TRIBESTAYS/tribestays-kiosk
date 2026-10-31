import { DeleteIcon } from './icons';

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'clear', '0', 'del'];

export function Keypad({ onPress }) {
  return (
    <div className="grid grid-cols-3 gap-2.5">
      {KEYS.map((k) => (
        <button
          key={k}
          type="button"
          aria-label={k === 'del' ? 'Delete' : k === 'clear' ? 'Clear' : k}
          onClick={() => onPress(k)}
          className={`key ${k.length > 1 ? 'key-soft' : ''}`}
        >
          {k === 'del' ? <DeleteIcon className="size-[1.6rem]" /> : k === 'clear' ? 'Clear' : k}
        </button>
      ))}
    </div>
  );
}