'use client'

type Transaction = {
  id: string | number
  description: string
  amount: number
  transaction_date: string
  category?: string
}

type Props = {
  transactions: Transaction[]
}

export default function TransactionsList({ transactions }: Props) {
  return (
    <ul style={{ marginTop: '1.5rem', listStyle: 'none', padding: 0 }}>
      {transactions.map(t => {
        const isDeposit = t.amount > 0
        const formattedDate = new Date(t.transaction_date).toLocaleDateString(
          'en-US',
          {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          }
        )
        const category = t.category?.trim() || 'UNCATEGORIZED'

        return (
          <li
            key={t.id}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '1rem 0',
              borderBottom: '1px solid var(--border)',
            }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.25rem',
              }}
            >
              <span
                style={{
                  fontWeight: 700,
                  fontSize: '1rem',
                  color: 'var(--foreground)',
                }}
              >
                {t.description}
              </span>

              <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                {formattedDate}
              </span>

              <span
                style={{
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color:
                    category === 'UNCATEGORIZED'
                      ? 'var(--text-muted)'
                      : 'var(--primary)',
                }}
              >
                {category}
              </span>
            </div>

            <div
              style={{
                fontSize: '1rem',
                fontWeight: 800,
                color: isDeposit ? 'var(--positive)' : 'var(--foreground)',
                textAlign: 'right',
              }}
            >
              {Number(t.amount).toFixed(2)}
            </div>
          </li>
        )
      })}
    </ul>
  )
}
