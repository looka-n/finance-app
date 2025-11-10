'use client'

export default function Dashboard() {
  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      <section>
        <h2 className="text-2xl font-semibold mb-4">This Month</h2>
      </section>
      <section>
        <h2 className="text-2xl font-semibold mb-4">Accounts</h2>
      </section>
      <section>
        <h2 className="text-2xl font-semibold mb-4">Upcoming</h2>
      </section>
    </div>
  )
}
