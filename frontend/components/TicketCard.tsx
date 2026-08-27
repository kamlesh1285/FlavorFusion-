import type { ReactNode } from "react";
import Link from "next/link";

function Stamp() {
  return (
    <div className="stamp">
      <svg
        viewBox="0 0 100 100"
        className="stamp-spin absolute inset-0"
        aria-hidden="true"
      >
        <defs>
          <path
            id="stamp-circle"
            d="M 50, 50 m -37, 0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0"
          />
        </defs>
        <text fill="rgba(246,232,201,0.75)" fontSize="7.4" letterSpacing="2">
          <textPath href="#stamp-circle" startOffset="0%">
            FLAVORFUSION · FRESH DAILY ·
          </textPath>
        </text>
      </svg>
      <span className="font-display text-lg font-semibold italic text-paper">
        FF
      </span>
    </div>
  );
}

export function TicketCard({
  eyebrow,
  title,
  subtitle,
  children,
  ticketNo,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  children: ReactNode;
  ticketNo: string;
}) {
  return (
    <div className="ticket-card w-full max-w-md">
      <div className="bg-ink-soft px-7 pt-7 pb-8 flex items-center gap-4">
        <Stamp />
        <div className="min-w-0">
          <p className="field-label text-paper/60">{eyebrow}</p>
          <Link
            href="/"
            className="font-display text-2xl font-semibold italic text-paper leading-tight block"
          >
            FlavorFusion
          </Link>
          <p className="font-mono text-[0.68rem] tracking-wider text-paper/45 mt-0.5">
            TICKET NO. {ticketNo} · ADMIT ONE
          </p>
        </div>
      </div>

      <div className="ticket-perforation mx-7" />

      <div className="px-7 pt-8 pb-7">
        <h1 className="font-display text-[1.7rem] font-semibold leading-tight text-ink">
          {title}
        </h1>
        <p className="text-ink/60 text-sm mt-1.5 mb-7">{subtitle}</p>
        {children}
      </div>
    </div>
  );
}
