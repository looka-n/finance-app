import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import TransactionsClient from "./TransactionsClient";

export default async function TransactionsPage() {
  const cookieStore = await cookies();
  const authed = cookieStore.get("app_session")?.value === "ok";

  if (!authed) {
    redirect("/login?next=/transactions");
  }

  return <TransactionsClient />;
}