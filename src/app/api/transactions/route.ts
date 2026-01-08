import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { neonAuth } from "@neondatabase/auth/next/server";

type SortOption = "date-new" | "date-old" | "amount-high" | "amount-low";

export async function GET(req: NextRequest) {
  try {
    const { session, user } = await neonAuth();
    if (!session || !user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sql = neon(process.env.POSTGRES_URL!);

    const who = await sql`SELECT current_user AS usr, current_database() AS db`;

    await sql`SELECT set_config('app.user_id', ${user.id}, true)`;
    
    const sp = req.nextUrl.searchParams;
    const q = (sp.get("q") ?? "").trim();
    const sort = (sp.get("sort") ?? "date-new") as SortOption;

    const limit = Math.min(Number(sp.get("limit") ?? 50), 200);
    const page = Math.max(Number(sp.get("page") ?? 1), 1);
    const offset = (page - 1) * limit;

    const hasQ = q.length > 0;
    const like = `%${q}%`;

    const orderBy =
      sort === "date-old"
        ? "transaction_date ASC"
        : sort === "amount-high"
        ? "amount DESC"
        : sort === "amount-low"
        ? "amount ASC"
        : "transaction_date DESC";

    const countRes = await sql`
      WITH settings AS (
        SELECT set_config('app.user_id', ${user.id}, true) AS uid
      )
      SELECT COUNT(*)::int AS total
      FROM settings, transactions
      WHERE (
        ${!hasQ}
        OR description ILIKE ${like}
        OR category ILIKE ${like}
      )
    `;

    const total = Number(countRes[0]?.total ?? 0);
    const totalPages = Math.max(1, Math.ceil(total / limit));

    const rows = await sql`
      WITH settings AS (
        SELECT set_config('app.user_id', ${user.id}, true) AS uid
      )
      SELECT id, description, transaction_date, category, amount
      FROM settings, transactions
      WHERE (
        ${!hasQ}
        OR description ILIKE ${like}
        OR category ILIKE ${like}
      )
      ORDER BY ${sql.unsafe(orderBy)}
      LIMIT ${limit}
      OFFSET ${offset}
    `;

    const dbg = await sql`
      WITH settings AS (
        SELECT set_config('app.user_id', ${user.id}, true) AS uid
      )
      SELECT
        current_user AS usr,
        (SELECT uid FROM settings) AS uid,
        COUNT(*)::int AS c
      FROM settings, transactions
    `;
    console.log("RLS DEBUG:", dbg[0]);

    return NextResponse.json({ rows, totalPages, page, total });
  } catch (err: any) {
    console.error("api/transactions error:", err);
    return NextResponse.json(
      { error: "Server error", detail: err?.message ?? String(err) },
      { status: 500 }
    );
  }
}
