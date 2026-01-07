import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@vercel/postgres'

type SortOption = 'date-new' | 'date-old' | 'amount-high' | 'amount-low'

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams

  const q = (sp.get('q') ?? '').trim()
  const sort = (sp.get('sort') ?? 'date-new') as SortOption

  const limit = Math.min(Number(sp.get('limit') ?? 50), 200)
  const page = Math.max(Number(sp.get('page') ?? 1), 1)
  const offset = (page - 1) * limit

  try {
    const countRes = await sql`
      SELECT COUNT(*)::int AS total
      FROM transactions
      WHERE (${q} = '' OR description ILIKE ${'%' + q + '%'})
    `
    const total = countRes.rows[0]?.total ?? 0
    const totalPages = Math.max(1, Math.ceil(total / limit))

    let rowsRes

    if (sort === 'date-old') {
      rowsRes = await sql`
        SELECT id, description, transaction_date, category, amount
        FROM transactions
        WHERE (${q} = '' OR description ILIKE ${'%' + q + '%'})
        ORDER BY transaction_date ASC, id ASC
        LIMIT ${limit}
        OFFSET ${offset}
      `
    } else if (sort === 'amount-high') {
      rowsRes = await sql`
        SELECT id, description, transaction_date, category, amount
        FROM transactions
        WHERE (${q} = '' OR description ILIKE ${'%' + q + '%'})
        ORDER BY (NULLIF(amount::text, '')::numeric) DESC NULLS LAST, transaction_date DESC, id DESC
        LIMIT ${limit}
        OFFSET ${offset}
      `
    } else if (sort === 'amount-low') {
      rowsRes = await sql`
        SELECT id, description, transaction_date, category, amount
        FROM transactions
        WHERE (${q} = '' OR description ILIKE ${'%' + q + '%'})
        ORDER BY (NULLIF(amount::text, '')::numeric) ASC NULLS LAST, transaction_date DESC, id DESC
        LIMIT ${limit}
        OFFSET ${offset}
      `
    } else {
      // date-new
      rowsRes = await sql`
        SELECT id, description, transaction_date, category, amount
        FROM transactions
        WHERE (${q} = '' OR description ILIKE ${'%' + q + '%'})
        ORDER BY transaction_date DESC, id DESC
        LIMIT ${limit}
        OFFSET ${offset}
      `
    }

    return NextResponse.json({
      rows: rowsRes.rows,
      total,
      totalPages,
      page,
      pageSize: limit,
      sort,
    })
  } catch (err) {
    console.error('GET /api/transactions failed:', err)
    return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 })
  }
}