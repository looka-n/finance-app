// src/app/transactions/page.tsx
import React from 'react'

type Transaction = {
  id: number
  description: string
  amount: number | string
  category: string
  ['transaction_date']: string
}

export default async function TransactionsPage() {
  const res = await fetch('http://localhost:3000/api/transactions', { cache: 'no-store' })
  const transactions: Transaction[] = await res.json()

  const fmt = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  })

  return (
    <main className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Transactions</h1>
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2 text-left">Date</th>
            <th className="border p-2 text-left">Description</th>
            <th className="border p-2 text-left">Category</th>
            <th className="border p-2 text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map(t => (
            <tr key={t.id}>
              <td className="border p-2">
                {new Date(t['transaction_date']).toLocaleDateString()}
              </td>
              <td className="border p-2">{t.description}</td>
              <td className="border p-2">{t.category}</td>
              <td
                className={`border p-2 text-right ${
                  Number(t.amount) < 0 ? 'text-red-600' : 'text-green-600'
                }`}
              >
                {fmt.format(Number(t.amount))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  )
}
