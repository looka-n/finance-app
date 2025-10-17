"use client"

import { Line } from "react-chartjs-2"
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js"

ChartJS.register(LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend)

export default function TransactionChart({ transactions }: { transactions: any[] }) {
  // Filter only expenses (negative amounts)
  const expenses = transactions.filter((t) => Number(t.amount) < 0)

  // Group expenses by month and year
  const monthlyTotals: Record<string, number> = {}
  for (const t of expenses) {
    const date = new Date(t.transaction_date)
    const key = date.toLocaleString("default", { month: "long", year: "numeric" }) // e.g. "September 2025"
    monthlyTotals[key] = (monthlyTotals[key] || 0) + Math.abs(Number(t.amount))
  }

  // Sort by chronological order
  const sortedEntries = Object.entries(monthlyTotals).sort((a, b) => {
    const [monthA, yearA] = a[0].split(" ")
    const [monthB, yearB] = b[0].split(" ")
    const dateA = new Date(`${monthA} 1, ${yearA}`)
    const dateB = new Date(`${monthB} 1, ${yearB}`)
    return dateA.getTime() - dateB.getTime()
  })

  const labels = sortedEntries.map(([label]) => label)
  const dataValues = sortedEntries.map(([, total]) => total)

  const data = {
    labels,
    datasets: [
      {
        label: "Monthly Spending",
        data: dataValues,
        borderColor: "rgba(75, 192, 192, 1)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        tension: 0.4, // smooth interpolation
        fill: true,
        pointRadius: 4,
      },
    ],
  }

  const options = {
    responsive: true,
    plugins: {
      legend: { position: "top" as const },
      tooltip: {
        callbacks: {
          label: (context: any) => `$${context.parsed.y.toFixed(2)}`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: { display: true, text: "Total Spent ($)" },
      },
      x: {
        title: { display: true, text: "Month" },
      },
    },
  }

  return <Line data={data} options={options} />
}