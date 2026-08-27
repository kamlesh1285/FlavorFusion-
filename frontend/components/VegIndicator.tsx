export function VegIndicator({ isVeg }: { isVeg: boolean }) {
  const color = isVeg ? "var(--masala)" : "var(--chili)";
  return (
    <div
      className="w-3.5 h-3.5 border-[1.5px] flex items-center justify-center shrink-0"
      style={{ borderColor: color }}
      title={isVeg ? "Vegetarian" : "Non-vegetarian"}
      aria-label={isVeg ? "Vegetarian" : "Non-vegetarian"}
    >
      <div
        className="w-1.5 h-1.5 rounded-full"
        style={{ backgroundColor: color }}
      />
    </div>
  );
}
