'use client'

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

type Props = {
  labels: string[]
  values: number[]
  view: 'week' | 'month' | 'year'
}

export default function TransactionsChart({ labels, values, view }: Props) {
  const data = {
    labels,
    datasets: [
      {
        label: `Spending (${view})`,
        data: values,
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.4,
        fill: true,
      },
    ],
  }

  return <Line data={data} />
}