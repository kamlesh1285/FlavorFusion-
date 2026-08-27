"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

export function UpiPayment({ upiLink }: { upiLink: string }) {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    QRCode.toDataURL(upiLink, { width: 220, margin: 1 })
      .then((url) => {
        if (!cancelled) setQrDataUrl(url);
      })
      .catch(() => {
        // If QR generation fails for some reason, the raw link below
        // still works — nothing further to do here.
      });
    return () => {
      cancelled = true;
    };
  }, [upiLink]);

  return (
    <div className="rounded-lg border border-ink/15 bg-paper-dim p-5 text-center">
      <p className="field-label mb-3">Scan to pay via UPI</p>

      {qrDataUrl ? (
        // eslint-disable-next-line @next/next/no-img-element -- small local data: URL, not worth next/image here
        <img
          src={qrDataUrl}
          alt="UPI payment QR code"
          className="mx-auto rounded-md border border-ink/10 bg-white p-2"
          width={180}
          height={180}
        />
      ) : (
        <div className="w-[180px] h-[180px] mx-auto rounded-md border border-ink/10 bg-white/50 animate-pulse" />
      )}

      <a
        href={upiLink}
        className="btn-primary inline-block mt-4 !py-2 !px-5 text-sm"
      >
        Open in UPI app
      </a>

      <p className="text-ink/50 text-xs mt-3 max-w-xs mx-auto">
        Scan with any UPI app (GPay, PhonePe, Paytm) on your phone, or tap
        the button above if you&apos;re on mobile. Payment status updates
        once the restaurant confirms it was received.
      </p>
    </div>
  );
}
