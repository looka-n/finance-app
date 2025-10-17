export type Transaction = {
  id: string | number
  description: string
  amount: number
  transaction_date: string
  category?: string
}

export type ViewMode = 'week' | 'month' | 'year'

export function aggregateTransactions(transactions: Transaction[], view: ViewMode) {
  if (!transactions || transactions.length === 0)
    return { labels: [], values: [], transactions: [] }

  const groups: Record<string, number> = {}

  transactions.forEach(t => {
    const date = new Date(t.transaction_date)
    if (isNaN(date.getTime())) return
    if (t.amount >= 0) return // spending only

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