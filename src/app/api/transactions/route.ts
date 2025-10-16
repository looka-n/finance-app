// app/api/transactions/route.ts

import { NextResponse } from 'next/server'
import { sql } from '@vercel/postgres'

export async function GET() {
  const { rows } = await sql`SELECT * FROM transactions ORDER BY transaction_date DESC`
  return NextResponse.json(rows)
}