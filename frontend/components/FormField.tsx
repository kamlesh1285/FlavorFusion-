import type { InputHTMLAttributes } from "react";

export function FormField({
  label,
  error,
  ...inputProps
}: {
  label: string;
  error?: string;
} & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="mb-4">
      <label className="field-label block mb-1.5" htmlFor={inputProps.id}>
        {label}
      </label>
      <input className="field-input" {...inputProps} />
      {error && <p className="error-text mt-1.5">{error}</p>}
    </div>
  );
}
