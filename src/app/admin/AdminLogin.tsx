"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function AdminLogin() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/admin/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (!res.ok) {
      setError("Password errata.");
      setLoading(false);
      return;
    }

    router.refresh();
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-sm flex-col justify-center px-6">
      <h1 className="text-xl font-bold text-[var(--text-primary)]">Yeslink · Admin</h1>
      <form onSubmit={submit} className="mt-6 flex flex-col gap-3">
        <input
          type="password"
          autoFocus
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="rounded-lg border border-[var(--border)] bg-[var(--surface-1)] px-4 py-3 text-[var(--text-primary)] outline-none focus:border-[var(--series-1)]"
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
        <button
          type="submit"
          disabled={loading || !password}
          className="rounded-lg bg-[var(--series-1)] px-4 py-3 font-semibold text-black disabled:opacity-50"
        >
          {loading ? "…" : "Entra"}
        </button>
      </form>
    </div>
  );
}
