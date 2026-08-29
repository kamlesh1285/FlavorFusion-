"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

export function UpiPayment({ upiLink }: { upiLink: string }) {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);

  // Extract VPA from upiLink query params if present
  let vpa = "7073887930@ptyes";
  let payee = "FlavorFusion Owner";
  try {
    const url = new URL(upiLink);
    vpa = url.searchParams.get("pa") || vpa;
    payee = url.searchParams.get("pn") || payee;
  } catch {
    // fallback
  }

  useEffect(() => {
    let cancelled = false;
    QRCode.toDataURL(upiLink, { width: 240, margin: 1 })
      .then((url) => {
        if (!cancelled) setQrDataUrl(url);
      })
      .catch(() => {
        // Fallback
      });
    return () => {
      cancelled = true;
    };
  }, [upiLink]);

  return (
    <div className="rounded-2xl border border-amber-500/30 bg-neutral-900 p-5 text-center text-amber-50 space-y-4 shadow-xl">
      <div>
        <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 block">Verified Merchant UPI</span>
        <h3 className="text-base font-serif font-bold text-amber-100">{payee}</h3>
        <p className="text-xs font-mono text-emerald-400 font-semibold bg-neutral-950 inline-block px-3 py-1 rounded-full border border-emerald-500/30 mt-1">
          VPA: {vpa}
        </p>
      </div>

      {qrDataUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={qrDataUrl}
          alt="UPI payment QR code"
          className="mx-auto rounded-xl border-2 border-amber-400 bg-white p-2.5 shadow-lg"
          width={190}
          height={190}
        />
      ) : (
        <div className="w-[190px] h-[190px] mx-auto rounded-xl border border-amber-500/30 bg-neutral-950 animate-pulse" />
      )}

      <div>
        <a
          href={upiLink}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-neutral-950 font-bold px-6 py-2.5 rounded-xl text-xs uppercase tracking-wider shadow-md transition-all active:scale-95"
        >
          <span>📱</span> Pay via Google Pay / PhonePe / Paytm
        </a>
      </div>

      <p className="text-neutral-400 text-[11px] max-w-xs mx-auto leading-relaxed">
        Scan the QR code with GPay, PhonePe, Paytm, or BHIM app. Once paid into <span className="text-amber-300 font-semibold">{vpa}</span>, staff will confirm your order!
      </p>
    </div>
  );
}
