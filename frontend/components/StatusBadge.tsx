const TONE_MAP: Record<string, string> = {
  // in-progress
  PENDING: "text-turmeric-dark border-turmeric/50 bg-turmeric/10",
  CONFIRMED: "text-turmeric-dark border-turmeric/50 bg-turmeric/10",
  PREPARING: "text-turmeric-dark border-turmeric/50 bg-turmeric/10",
  READY: "text-turmeric-dark border-turmeric/50 bg-turmeric/10",
  // success
  DELIVERED: "text-masala border-masala/50 bg-masala/10",
  PAID: "text-masala border-masala/50 bg-masala/10",
  // failure
  CANCELLED: "text-chili border-chili/50 bg-chili/10",
  FAILED: "text-chili border-chili/50 bg-chili/10",
  // neutral
  REFUNDED: "text-ink/50 border-ink/20 bg-ink/5",
};

export function StatusBadge({ status }: { status: string }) {
  const tone = TONE_MAP[status] ?? "text-ink/50 border-ink/20 bg-ink/5";
  return (
    <span
      className={`font-mono text-[0.68rem] tracking-wide uppercase px-2 py-0.5 rounded-full border ${tone}`}
    >
      {status}
    </span>
  );
}
