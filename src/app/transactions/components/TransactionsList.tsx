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
    <ul style={{ marginTop: '2rem', listStyle: 'none', padding: 0 }}>
      {transactions.map(t => {
        const isDeposit = t.amount > 0
        const formattedDate = new Date(t.transaction_date).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
        const category = t.category?.trim() || 'UNCATEGORIZED'

        return (
          <li
            key={t.id}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '1rem 0',
              borderBottom: '1px solid #eee',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <span style={{ fontWeight: 600, fontSize: '1rem' }}>{t.description}</span>
              <span style={{ fontSize: '0.9rem', color: '#666' }}>{formattedDate}</span>
              <span
                style={{
                  fontSize: '0.85rem',
                  fontWeight: 500,
                  color: category === 'UNCATEGORIZED' ? '#999' : '#4F46E5',
                }}
              >
                {category}
              </span>
            </div>

            <div
              style={{
                fontSize: '1rem',
                fontWeight: 600,
                color: isDeposit ? '#888' : '#000',
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