"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const router = useRouter();
  const sp = useSearchParams();
  const next = sp.get("next") || "/transactions";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");

    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (!res.ok) {
      setErr("Wrong password");
      return;
    }

    router.replace(next);
  }

  return (
    <div style={{ maxWidth: 420, margin: "0 auto", padding: "3rem 1.5rem" }}>
      <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 16 }}>Sign in</h1>
      <form onSubmit={onSubmit}>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          style={{
            width: "100%",
            padding: "0.75rem 1rem",
            borderRadius: 10,
            border: "1px solid var(--border)",
            background: "var(--surface)",
            color: "var(--foreground)",
          }}
        />
        {err && <p style={{ color: "var(--negative)", marginTop: 10 }}>{err}</p>}
        <button
          type="submit"
          style={{
            marginTop: 14,
            width: "100%",
            padding: "0.75rem 1rem",
            borderRadius: 10,
            border: "1px solid var(--border)",
            background: "var(--primary)",
            color: "#fff",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Continue
        </button>
      </form>
    </div>
  );
}