import { neonAuth } from "@neondatabase/auth/next/server";
import { redirect } from "next/navigation";

export default async function Dashboard() {
  const { user } = await neonAuth();
  if (!user) redirect("/auth/sign-in");

  const name = user?.name || user?.email?.split("@")[0] || "there";

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto" }}>
      <h1 className="text-3xl font-bold mb-8">Hello, {name}</h1>
      {/* ... */}
    </div>
  );
}