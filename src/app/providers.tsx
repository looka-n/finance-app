"use client";

import { NeonAuthUIProvider } from "@neondatabase/auth/react";
import { authClient } from "@/lib/auth/client";

export default function Providers({ children }: { children: React.ReactNode }) {
  return <NeonAuthUIProvider authClient={authClient}>{children}</NeonAuthUIProvider>;
}