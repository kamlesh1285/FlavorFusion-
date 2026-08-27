"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { useAuth } from "@/lib/auth-context";
import { ApiError, resolveImageUrl, uploadFoodImage } from "@/lib/api";

export function ImageUploadField({
  imageUrl,
  onChange,
}: {
  imageUrl?: string;
  onChange: (url: string) => void;
}) {
  const { token } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !token) return;

    setError(null);
    setIsUploading(true);
    try {
      const result = await uploadFoodImage(token, file);
      onChange(result.url);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Couldn't upload the image.",
      );
    } finally {
      setIsUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  const preview = resolveImageUrl(imageUrl);

  return (
    <div className="flex items-center gap-3">
      <div className="w-14 h-14 rounded-lg overflow-hidden bg-paper-dim border border-ink/15 flex items-center justify-center shrink-0">
        {preview ? (
          // Served from the backend's own origin (local dev), not
          // next/image-optimizable without extra remote-pattern config.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="" className="w-full h-full object-cover" />
        ) : (
          <span className="font-mono text-[0.55rem] text-ink/30 text-center leading-tight">
            No
            <br />
            image
          </span>
        )}
      </div>
      <div>
        <label className="font-mono text-xs text-chili cursor-pointer hover:underline">
          {isUploading ? "Uploading…" : preview ? "Change photo" : "Add photo"}
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={handleFile}
            disabled={isUploading}
          />
        </label>
        {error && <p className="error-text mt-1">{error}</p>}
      </div>
    </div>
  );
}
