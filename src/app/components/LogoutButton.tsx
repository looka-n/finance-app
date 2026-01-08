"use client";

import { usePathname, useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();
  const pathname = usePathname();

  if (pathname === "/login") return null;

  return (
    <button
      onClick={async () => {
        await fetch("/api/logout", { method: "POST" });
        router.push("/login");
        router.refresh();
      }}
      style={{
        background: "transparent",
        border: "1px solid var(--border)",
        color: "var(--foreground)",
        fontWeight: 600,
        fontSize: "0.95rem",
        padding: "0.5rem 0.75rem",
        borderRadius: "10px",
        cursor: "pointer",
      }}
    >
      Log out
    </button>
  );
}