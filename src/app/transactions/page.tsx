'use client'

import { useEffect, useState, useMemo } from 'react'
import TransactionsList from '../components/TransactionsList'
import { Transaction } from '../utils/aggregateTransactions'

type SortOption = 'date-new' | 'date-old' | 'amount-high' | 'amount-low' | ''

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [sortOption, setSortOption] = useState<SortOption>('')
  const [showSortMenu, setShowSortMenu] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true)
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
      setLoading(false)
    }

    fetchTransactions()
  }, [])

  const filteredTransactions = useMemo(() => {
    let list = [...transactions]

    // Search
    if (searchTerm.trim()) {
      list = list.filter(t =>
        t.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Sort
    switch (sortOption) {
      case 'date-new':
        list.sort(
          (a, b) =>
            new Date(b.transaction_date).getTime() -
            new Date(a.transaction_date).getTime()
        )
        break
      case 'date-old':
        list.sort(
          (a, b) =>
            new Date(a.transaction_date).getTime() -
            new Date(b.transaction_date).getTime()
        )
        break
      case 'amount-high':
        list.sort((a, b) => b.amount - a.amount)
        break
      case 'amount-low':
        list.sort((a, b) => a.amount - b.amount)
        break
    }

    return list
  }, [transactions, searchTerm, sortOption])

  // Group by month-year
  const groupedTransactions = useMemo(() => {
    const groups: Record<string, Transaction[]> = {}
    for (const t of filteredTransactions) {
      const date = new Date(t.transaction_date)
      const monthYear = date.toLocaleString('default', { month: 'long', year: 'numeric' })
      if (!groups[monthYear]) groups[monthYear] = []
      groups[monthYear].push(t)
    }
    return groups
  }, [filteredTransactions])

  const monthKeys = useMemo(() => {
    return Object.keys(groupedTransactions).sort(
      (a, b) => new Date(b).getTime() - new Date(a).getTime()
    )
  }, [groupedTransactions])

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <h1 className="text-3xl font-bold mb-8">Transactions</h1>

      {/* Search bar */}
      <input
        type="text"
        placeholder="Search..."
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
        style={{
          width: '100%',
          padding: '0.75rem 1rem',
          borderRadius: '8px',
          border: '1px solid #ccc',
          marginBottom: '1rem',
          fontSize: '1rem',
        }}
      />

      {/* Sort/Filter */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginBottom: '1.5rem' }}>
        {/* Sort */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowSortMenu(prev => !prev)}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              border: '1px solid #ccc',
              background: '#f9f9f9',
              cursor: 'pointer',
            }}
          >
            Sort
          </button>
          {showSortMenu && (
            <div
              style={{
                position: 'absolute',
                right: 0,
                top: '2.5rem',
                background: 'white',
                border: '1px solid #ccc',
                borderRadius: '8px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                zIndex: 10,
              }}
            >
              {[
                { label: 'Date (New to Old)', value: 'date-new' },
                { label: 'Date (Old to New)', value: 'date-old' },
                { label: 'Amount (High to Low)', value: 'amount-high' },
                { label: 'Amount (Low to High)', value: 'amount-low' },
              ].map(opt => (
                <div
                  key={opt.value}
                  onClick={() => {
                    setSortOption(opt.value as SortOption)
                    setShowSortMenu(false)
                  }}
                  style={{
                    padding: '0.5rem 1rem',
                    cursor: 'pointer',
                    background: sortOption === opt.value ? '#f3f4f6' : 'white',
                  }}
                >
                  {opt.label}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Filter */}
        <button
          style={{
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            border: '1px solid #ccc',
            background: '#f9f9f9',
            cursor: 'pointer',
          }}
        >
          Filter
        </button>
      </div>

      {/* Transaction list */}
      {loading ? (
        <div style={{ textAlign: 'center', marginTop: '3rem' }}>
          <div
            style={{
              width: '100%',
              height: '6px',
              background: '#e5e7eb',
              borderRadius: '4px',
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            <div
              style={{
                width: '40%',
                height: '100%',
                background: '#6366F1', // Indigo tone for consistency
                position: 'absolute',
                left: 0,
                animation: 'loadingBar 1.2s ease-in-out infinite',
              }}
            />
          </div>
          <p style={{ marginTop: '1rem', color: '#6b7280' }}>
            Loading transactions...
          </p>

          <style jsx>{`
            @keyframes loadingBar {
              0% {
                left: -40%;
              }
              50% {
                left: 20%;
              }
              100% {
                left: 100%;
              }
            }
          `}</style>
        </div>
      ) : (
        monthKeys.map(month => (
          <div key={month} style={{ marginBottom: '2rem' }}>
            <div
              style={{
                backgroundColor: '#f9fafb',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                marginBottom: '1rem',
              }}
            >
              <h2
                className="text-2xl font-semibold"
                style={{ color: '#374151', margin: 0 }}
              >
                {month}
              </h2>
            </div>
            <TransactionsList transactions={groupedTransactions[month]} />
          </div>
        ))
      )}
    </div>
  )
}