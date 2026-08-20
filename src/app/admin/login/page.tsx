"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { BUSINESS } from "@/data/data";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, rememberMe })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not log in.");
      router.push(params.get("next") || "/admin");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6" style={{ background: "var(--cream)" }}>
      <div className="w-full max-w-[400px]">
        <div className="text-center mb-8">
          <Image src="/images/monogram.svg" alt="" width={52} height={52} className="mx-auto mb-4" />
          <h1 className="text-[1.7rem] mb-1">{BUSINESS.name}</h1>
          <p className="text-text-muted text-[0.9rem]">Admin Dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="card p-8 space-y-5">
          <div>
            <label className="field-label">Email</label>
            <input
              className="field-input"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="field-label">Password</label>
            <input
              className="field-input"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="flex items-center justify-between text-[0.86rem]">
            <label className="flex items-center gap-2 cursor-pointer select-none text-ink">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 accent-[var(--gold-dark)]"
              />
              Remember me
            </label>
            <span className="text-text-muted" title="Contact whoever manages this site to reset your password.">
              Forgot password?
            </span>
          </div>

          {error && <p className="text-danger text-[0.85rem]">{error}</p>}

          <button type="submit" disabled={submitting} className="btn btn-primary btn-block">
            {submitting ? "Logging in…" : "Log In"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
