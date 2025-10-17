'use client'

import { useEffect, useState, useMemo } from 'react'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from 'chart.js'

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend)

type Transaction = {
  id: string | number
  description: string
  amount: number
  transaction_date: string
  category?: string
}

type ViewMode = 'week' | 'month' | 'year'

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
        amount: d.amount == null ? 0 : Number(d.amount), // <-- coerce here
        }))

        setTransactions(parsed)
    }
    fetchTransactions()
    }, [])


  const filtered = useMemo(() => aggregateTransactions(transactions, view), [transactions, view])

  const data = {
    labels: filtered.labels,
    datasets: [
      {
        label: `Spending (${view})`,
        data: filtered.values,
        borderColor: '#4F46E5',
        backgroundColor: 'rgba(99, 102, 241, 0.2)',
        tension: 0.4,
        fill: true,
      },
    ],
  }

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

      <Line data={data} />
      
      <h1 className="text-3xl font-bold mb-8">Transactions</h1>
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
    </div>
  )
}

function aggregateTransactions(transactions: Transaction[], view: ViewMode) {
  if (!transactions || transactions.length === 0) {
    return { labels: [], values: [], transactions: [] }
  }

  const groups: Record<string, number> = {}

  transactions.forEach(t => {
    const date = new Date(t.transaction_date)
    if (isNaN(date.getTime())) return
    if (t.amount >= 0) return // only spending

    let key = ''
    if (view === 'year') {
      key = date.getFullYear().toString()
    } else if (view === 'month') {
      key = `${date.toLocaleString('default', { month: 'long' })} ${date.getFullYear()}`
    } else {
      const d = new Date(date)
      const day = d.getDay()
      const diff = d.getDate() - day + (day === 0 ? -6 : 1)
      const monday = new Date(d.setDate(diff))
      key = monday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }

    groups[key] = (groups[key] || 0) + Math.abs(t.amount)
  })

  const labels = Object.keys(groups)
  const values = labels.map(l => groups[l])

  return { labels, values, transactions }
}