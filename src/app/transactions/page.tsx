import { redirect } from "next/navigation";
import TransactionsClient from "./TransactionsClient";
import { auth } from "@/lib/auth/server";

export default async function TransactionsPage() {
  const { data } = await auth.getSession();
  if (!data?.session) redirect("/auth/sign-in");
  return <TransactionsClient />;
}