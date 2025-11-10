export type Transaction = {
  id: string | number
  description: string
  amount: number
  transaction_date: string
  category?: string
}

export type ViewMode = 'week' | 'month' | 'year'

export function aggregateTransactions(
  transactions: Transaction[],
  view: ViewMode,
  selectedYear?: number,
  selectedWeek?: string
) {
  if (!transactions || transactions.length === 0)
    return { labels: [], values: [], transactions: [] }

  const groups: Record<string, { value: number; sortDate: Date }> = {}

  const filteredTxns = transactions.filter(t => {
    const date = new Date(t.transaction_date)
    if (isNaN(date.getTime())) return false

    if (view === 'month' && selectedYear) {
      return date.getFullYear() === selectedYear
    }

    if (view === 'week' && selectedWeek) {
      const monday = new Date(selectedWeek)
      const sunday = new Date(monday)
      sunday.setDate(monday.getDate() + 6)
      return date >= monday && date <= sunday
    }

    return true
  })

  filteredTxns.forEach(t => {
    const date = new Date(t.transaction_date)
    if (isNaN(date.getTime()) || t.amount >= 0) return

    let key = ''
    let sortDate: Date

    if (view === 'year') {
      key = date.getFullYear().toString()
      sortDate = new Date(date.getFullYear(), 0, 1)
    } else if (view === 'month') {
      const month = date.getMonth()
      const year = date.getFullYear()
      key = `${date.toLocaleString('default', { month: 'long' })} ${year}`
      sortDate = new Date(year, month, 1)
    } else {
      // week view -> group by each day
      key = date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit' })
      sortDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())
    }

    if (!groups[key]) groups[key] = { value: 0, sortDate }
    groups[key].value += Math.abs(t.amount)
  })

  // Sort ascending
  const entries = Object.entries(groups)
    .map(([label, { value, sortDate }]) => ({ label, value, sortDate }))
    .sort((a, b) => a.sortDate.getTime() - b.sortDate.getTime())

  const labels = entries.map(e => e.label)
  const values = entries.map(e => e.value)

  return { labels, values, transactions: filteredTxns }
}