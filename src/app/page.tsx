import Chart from 'chart.js/auto'
import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="p-10 text-center">
      <h1 className="text-3xl font-bold mb-8">Finance Tracker</h1>
      <div className="space-y-4">
        <Link href="/transactions" className="block text-blue-600 underline">
          Transactions
        </Link>
        <Link href="/budget" className="block text-blue-600 underline">
          Budget
        </Link>
        <Link href="/reports" className="block text-blue-600 underline">
          Reports
        </Link>
      </div>
    </main>
  )
}