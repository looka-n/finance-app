"use client";

import { useEffect } from "react";
import { authClient } from "@/lib/auth/client";

export default function LogoutPage() {
  useEffect(() => {
    (async () => {
      try {
        await authClient.signOut();
      } finally {
        window.location.href = "/auth/sign-in";
      }
    })();
  }, []);

  return (
    <main style={{ minHeight: "70vh", display: "grid", placeItems: "center" }}>
      <p style={{ opacity: 0.8 }}>Signed out. Redirecting...</p>
    </main>
  );
}