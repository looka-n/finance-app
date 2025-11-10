'use client'

import { useEffect, useState, useMemo } from 'react'
import TransactionsChart from '../components/TransactionsChart'
import { aggregateTransactions, Transaction, ViewMode } from '../utils/aggregateTransactions'

export default function Spending() {
    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [view, setView] = useState<ViewMode>('month')
    const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear())

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

    const filteredTransactions = useMemo(
        () => aggregateTransactions(transactions, view, selectedYear),
        [transactions, view, selectedYear]
    )

    const availableYears = Array.from(
        new Set(transactions.map(t => new Date(t.transaction_date).getFullYear()))
    ).sort((a, b) => b - a)

    return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <h1 className="text-3xl font-bold mb-8">Spending</h1>
        <section>
        <h2 className="text-2xl font-semibold mb-4">Spending Trend</h2>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '1rem' }}>
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

        {view === 'month' && (
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
            <select
              value={selectedYear}
              onChange={e => setSelectedYear(Number(e.target.value))}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                border: '1px solid #ddd',
                cursor: 'pointer',
              }}
            >
              {availableYears.map(y => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
        )}

        <TransactionsChart labels={filteredTransactions.labels} values={filteredTransactions.values} view={view} />
        </section>
    </div>
    )
}