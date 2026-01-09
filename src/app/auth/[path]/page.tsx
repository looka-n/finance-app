import { AuthView } from "@neondatabase/neon-js/auth/react/ui";
import "@neondatabase/neon-js/ui/css";

export default function AuthPage({ params }: { params: { path: string } }) {
  return (
    <main className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 bg-surface">
      <div className="w-full max-w-md rounded-2xl border border-border bg-background shadow-sm p-6">
        <AuthView pathname={params.path} />
      </div>
    </main>
  );
}
