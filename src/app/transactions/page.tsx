'use client'

import { useEffect, useState, useMemo } from 'react'
import TransactionsChart from './components/TransactionsChart'
import TransactionsList from './components/TransactionsList'
import { aggregateTransactions, Transaction, ViewMode } from './utils/aggregateTransactions'

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [view, setView] = useState<ViewMode>('month')

  useEffect(() => {
    const fetchTransactions = async () => {
      const res = await fetch('/api/transactions')
      if (!res.ok) return
      const data = await res.json()

      const parsed: Transaction[] = data.map((d: any) => ({
        id: d.id,
        description: d.description,
        transaction_date: d.transaction_date,
        category: d.category,
        amount: d.amount == null ? 0 : Number(d.amount),
      }))

      setTransactions(parsed)
    }
    fetchTransactions()
  }, [])

  const filtered = useMemo(() => aggregateTransactions(transactions, view), [transactions, view])

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        {(['week', 'month', 'year'] as ViewMode[]).map(mode => (
          <button
            key={mode}
            onClick={() => setView(mode)}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              border: '1px solid #ddd',
              background: view === mode ? '#4F46E5' : 'white',
              color: view === mode ? 'white' : 'black',
              cursor: 'pointer',
            }}
          >
            {mode.charAt(0).toUpperCase() + mode.slice(1)}
          </button>
        ))}
      </div>

      <TransactionsChart labels={filtered.labels} values={filtered.values} view={view} />
      <h1 className="text-3xl font-bold mb-8">Transactions</h1>
      <TransactionsList transactions={transactions} />
    </div>
  )
}