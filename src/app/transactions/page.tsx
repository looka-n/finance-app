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

  // Reset to page 1 when search changes (small debounce)
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

  // Group by month-year (for the current page only)
  const groupedTransactions = useMemo(() => {
    const groups: Record<string, Transaction[]> = {}
    for (const t of sortedTransactions) {
      const date = new Date(t.transaction_date)
      const monthYear = date.toLocaleString('default', {
        month: 'long',
        year: 'numeric',
      })
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

  // Pagination window (1 … 4 5 6 … 20)
  const pagesToShow = useMemo(() => {
    const windowSize = 5
    const start = Math.max(1, page - Math.floor(windowSize / 2))
    const end = Math.min(totalPages, start + windowSize - 1)
    const adjustedStart = Math.max(1, end - windowSize + 1)
    const pages: number[] = []
    for (let p = adjustedStart; p <= end; p++) pages.push(p)
    return pages
  }, [page, totalPages])

  const styles = {
    container: { maxWidth: '900px', margin: '0 auto' },
    input: {
      width: '100%',
      padding: '0.75rem 1rem',
      borderRadius: '10px',
      border: '1px solid var(--border)',
      background: 'var(--surface)',
      color: 'var(--foreground)',
      marginBottom: '1rem',
      fontSize: '1rem',
      outline: 'none',
    } as React.CSSProperties,
    button: (disabled?: boolean) =>
      ({
        padding: '0.5rem 0.9rem',
        borderRadius: '10px',
        border: '1px solid var(--border)',
        background: disabled ? 'var(--surface-muted)' : 'var(--surface)',
        color: 'var(--foreground)',
        cursor: disabled ? 'not-allowed' : 'pointer',
      }) as React.CSSProperties,
    menu: {
      position: 'absolute',
      right: 0,
      top: '2.75rem',
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: '10px',
      boxShadow: '0 10px 30px rgba(0,0,0,0.25)',
      zIndex: 10,
      overflow: 'hidden',
      minWidth: '220px',
    } as React.CSSProperties,
    menuItem: (active: boolean) =>
      ({
        padding: '0.6rem 0.9rem',
        cursor: 'pointer',
        background: active ? 'var(--surface-muted)' : 'var(--surface)',
        color: 'var(--foreground)',
        borderBottom: '1px solid var(--border)',
      }) as React.CSSProperties,
    monthHeaderWrap: {
      background: 'var(--surface)',
      padding: '0.75rem 1rem',
      borderRadius: '12px',
      marginBottom: '1rem',
      border: '1px solid var(--border)',
    } as React.CSSProperties,
    monthHeader: { color: 'var(--foreground)', margin: 0 } as React.CSSProperties,
    subtleText: { color: 'var(--text-muted)' } as React.CSSProperties,
    dividerTop: {
      borderTop: '1px solid var(--border)',
      marginTop: '1rem',
    } as React.CSSProperties,
  }

  return (
    <div style={styles.container}>
      <h1 className="text-3xl font-bold mb-8">Transactions</h1>

      {/* Search */}
      <input
        type="text"
        placeholder="Search..."
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
        style={styles.input}
      />

      {/* Sort */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '0.5rem',
          marginBottom: '1.25rem',
        }}
      >
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowSortMenu(prev => !prev)}
            style={styles.button()}
          >
            Sort
          </button>

          {showSortMenu && (
            <div style={styles.menu}>
              {[
                { label: 'Date (New to Old)', value: 'date-new' },
                { label: 'Date (Old to New)', value: 'date-old' },
                { label: 'Amount (High to Low)', value: 'amount-high' },
                { label: 'Amount (Low to High)', value: 'amount-low' },
              ].map((opt, idx, arr) => (
                <div
                  key={opt.value}
                  onClick={() => {
                    setSortOption(opt.value as SortOption)
                    setShowSortMenu(false)
                  }}
                  style={{
                    ...styles.menuItem(sortOption === opt.value),
                    borderBottom:
                      idx === arr.length - 1 ? 'none' : '1px solid var(--border)',
                  }}
                >
                  {opt.label}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Placeholder for Filter */}
        <button style={styles.button()} disabled>
          Filter
        </button>
      </div>

      {/* List */}
      {loading ? (
        <div style={{ textAlign: 'center', marginTop: '3rem' }}>
          <div
            style={{
              width: '100%',
              height: '6px',
              background: 'var(--surface-muted)',
              borderRadius: '999px',
              overflow: 'hidden',
              position: 'relative',
              border: '1px solid var(--border)',
            }}
          >
            <div
              style={{
                width: '40%',
                height: '100%',
                background: 'var(--primary)',
                position: 'absolute',
                left: 0,
                animation: 'loadingBar 1.2s ease-in-out infinite',
              }}
            />
          </div>
          <p style={{ marginTop: '1rem', ...styles.subtleText }}>
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
        <>
          {monthKeys.map(month => (
            <div key={month} style={{ marginBottom: '2rem' }}>
              <div style={styles.monthHeaderWrap}>
                <h2 className="text-2xl font-semibold" style={styles.monthHeader}>
                  {month}
                </h2>
              </div>
              <TransactionsList transactions={groupedTransactions[month]} />
            </div>
          ))}

          {/* Pagination */}
          <div
            style={{
              ...styles.dividerTop,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '1.5rem 0 2rem',
            }}
          >
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              style={styles.button(page === 1)}
            >
              Prev
            </button>

            {page > 3 && totalPages > 6 && (
              <>
                <button onClick={() => setPage(1)} style={styles.button()}>
                  1
                </button>
                <span style={styles.subtleText}>…</span>
              </>
            )}

            {pagesToShow.map(p => {
              const isActive = p === page
              return (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  style={{
                    ...styles.button(),
                    background: isActive ? 'var(--primary)' : 'var(--surface)',
                    color: isActive ? '#fff' : 'var(--foreground)',
                    borderColor: isActive ? 'transparent' : 'var(--border)',
                  }}
                >
                  {p}
                </button>
              )
            })}

            {page < totalPages - 2 && totalPages > 6 && (
              <>
                <span style={styles.subtleText}>…</span>
                <button onClick={() => setPage(totalPages)} style={styles.button()}>
                  {totalPages}
                </button>
              </>
            )}

            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              style={styles.button(page >= totalPages)}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  )
}
