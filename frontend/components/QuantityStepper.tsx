export function QuantityStepper({
  quantity,
  onChange,
  disabled,
}: {
  quantity: number;
  onChange: (next: number) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center border border-ink/15 rounded-full overflow-hidden">
      <button
        type="button"
        onClick={() => onChange(quantity - 1)}
        disabled={disabled}
        aria-label="Decrease quantity"
        className="w-7 h-7 flex items-center justify-center text-ink/70 hover:bg-paper-dim disabled:opacity-40 font-mono"
      >
        −
      </button>
      <span className="w-7 text-center font-mono text-sm text-ink">
        {quantity}
      </span>
      <button
        type="button"
        onClick={() => onChange(quantity + 1)}
        disabled={disabled}
        aria-label="Increase quantity"
        className="w-7 h-7 flex items-center justify-center text-ink/70 hover:bg-paper-dim disabled:opacity-40 font-mono"
      >
        +
      </button>
    </div>
  );
}
