"use client";

import Link from "next/link";

export default function TermsCheckbox({
  checked,
  onChange,
  error
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  error?: boolean;
}) {
  return (
    <div>
      <label className="flex items-start gap-3 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="mt-1 w-[18px] h-[18px] accent-[var(--gold-dark)] flex-shrink-0"
        />
        <span className="text-[0.88rem] text-ink">
          I have read and agree to Masfira Maison&apos;s{" "}
          <Link href="/terms" target="_blank" className="underline text-gold-dark">
            Terms &amp; Conditions
          </Link>
          .
        </span>
      </label>
      {error && <span className="field-error-msg text-danger text-[0.78rem] mt-1.5 block">Please accept the Terms &amp; Conditions to continue.</span>}
    </div>
  );
}
