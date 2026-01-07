'use client'

import { useEffect, useMemo, useState } from 'react'
import TransactionsList from '../components/TransactionsList'
import { Transaction } from '../utils/aggregateTransactions'

type SortOption = 'date-new' | 'date-old' | 'amount-high' | 'amount-low' | ''

const PAGE_SIZE = 50

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [sortOption, setSortOption] = useState<SortOption>('')
  const [showSortMenu, setShowSortMenu] = useState(false)
  const [loading, setLoading] = useState(true)

  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    const t = setTimeout(() => setPage(1), 250)
    return () => clearTimeout(t)
  }, [searchTerm])

  useEffect(() => {
    const controller = new AbortController()

    const fetchTransactions = async () => {
      setLoading(true)
      try {
        const res = await fetch(
          `/api/transactions?limit=${PAGE_SIZE}&page=${page}&q=${encodeURIComponent(searchTerm)}`,
          { signal: controller.signal }
        )

        if (!res.ok) {
          console.error('Fetch failed:', res.status, await res.text())
          setTransactions([])
          setTotalPages(1)
          return
        }

        const data = await res.json()

        const parsed: Transaction[] = (data.rows ?? []).map((d: any) => ({
          id: d.id,
          description: d.description,
          transaction_date: d.transaction_date,
          category: d.category,
          amount: d.amount == null ? 0 : Number(d.amount),
        }))

        setTransactions(parsed)
        setTotalPages(Number(data.totalPages ?? 1))
      } finally {
        setLoading(false)
      }
    }

    fetchTransactions()
    return () => controller.abort()
  }, [page, searchTerm])

  const sortedTransactions = useMemo(() => {
    const list = [...transactions]

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
  }, [transactions, sortOption])

  const groupedTransactions = useMemo(() => {
    const groups: Record<string, Transaction[]> = {}
    for (const t of sortedTransactions) {
      const date = new Date(t.transaction_date)
      const monthYear = date.toLocaleString('default', { month: 'long', year: 'numeric' })
      if (!groups[monthYear]) groups[monthYear] = []
      groups[monthYear].push(t)
    }
    return groups
  }, [sortedTransactions])

  const monthKeys = useMemo(() => {
    return Object.keys(groupedTransactions).sort(
      (a, b) => new Date(b).getTime() - new Date(a).getTime()
    )
  }, [groupedTransactions])

  const pagesToShow = useMemo(() => {
    const windowSize = 5
    const start = Math.max(1, page - Math.floor(windowSize / 2))
    const end = Math.min(totalPages, start + windowSize - 1)
    const adjustedStart = Math.max(1, end - windowSize + 1)

    const pages: number[] = []
    for (let p = adjustedStart; p <= end; p++) pages.push(p)
    return pages
  }, [page, totalPages])

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <h1 className="text-3xl font-bold mb-8">Transactions</h1>

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

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginBottom: '1.5rem' }}>
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
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', marginTop: '3rem' }}>
          <p style={{ marginTop: '1rem', color: '#6b7280' }}>Loading transactions...</p>
        </div>
      ) : (
        <>
          {monthKeys.map(month => (
            <div key={month} style={{ marginBottom: '2rem' }}>
              <div
                style={{
                  backgroundColor: '#f9fafb',
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  marginBottom: '1rem',
                }}
              >
                <h2 className="text-2xl font-semibold" style={{ color: '#374151', margin: 0 }}>
                  {month}
                </h2>
              </div>
              <TransactionsList transactions={groupedTransactions[month]} />
            </div>
          ))}

          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '1.5rem 0 2rem',
              borderTop: '1px solid #eee',
              marginTop: '1rem',
            }}
          >
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              style={{
                padding: '0.5rem 0.75rem',
                borderRadius: '8px',
                border: '1px solid #ccc',
                background: page === 1 ? '#f3f4f6' : '#fff',
                cursor: page === 1 ? 'not-allowed' : 'pointer',
              }}
            >
              Prev
            </button>

            {page > 3 && totalPages > 6 && (
              <>
                <button
                  onClick={() => setPage(1)}
                  style={{ padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid #ccc', background: '#fff' }}
                >
                  1
                </button>
                <span style={{ color: '#6b7280' }}>…</span>
              </>
            )}

            {pagesToShow.map(p => (
              <button
                key={p}
                onClick={() => setPage(p)}
                style={{
                  padding: '0.5rem 0.75rem',
                  borderRadius: '8px',
                  border: '1px solid #ccc',
                  background: p === page ? '#4F46E5' : '#fff',
                  color: p === page ? '#fff' : '#111',
                  cursor: 'pointer',
                }}
              >
                {p}
              </button>
            ))}

            {page < totalPages - 2 && totalPages > 6 && (
              <>
                <span style={{ color: '#6b7280' }}>…</span>
                <button
                  onClick={() => setPage(totalPages)}
                  style={{ padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid #ccc', background: '#fff' }}
                >
                  {totalPages}
                </button>
              </>
            )}

            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              style={{
                padding: '0.5rem 0.75rem',
                borderRadius: '8px',
                border: '1px solid #ccc',
                background: page >= totalPages ? '#f3f4f6' : '#fff',
                cursor: page >= totalPages ? 'not-allowed' : 'pointer',
              }}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  )
}