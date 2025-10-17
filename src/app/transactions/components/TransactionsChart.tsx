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
        borderColor: '#4F46E5',
        backgroundColor: 'rgba(99, 102, 241, 0.2)',
        tension: 0.4,
        fill: true,
      },
    ],
  }

  return <Line data={data} />
}