import { AuthView } from "@neondatabase/auth/react";

export default async function AuthPage({
  params,
}: {
  params: Promise<{ path: string }>;
}) {
  const { path } = await params;

  return (
    <main style={{ minHeight: "70vh", display: "grid", placeItems: "center" }}>
      <AuthView path={path} />
    </main>
  );
}