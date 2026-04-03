import { useState, useEffect } from 'react'
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts'
import { api } from '../api/client'
import { PageHeader, StatCard, Card, Spinner, Badge } from '../components/UI'

const PIE_COLORS = ['#1D9E75','#E24B4A','#EF9F27','#378ADD','#D4537E','#BA7517']

const fmt = n => `₹${Number(n || 0).toLocaleString('en-IN')}`
const fmtK = v => `₹${(v/1000).toFixed(0)}k`

export default function Dashboard() {
  const [summary,  setSummary]  = useState(null)
  const [monthly,  setMonthly]  = useState([])
  const [cats,     setCats]     = useState([])
  const [recent,   setRecent]   = useState([])
  const [loading,  setLoading]  = useState(true)
  const [year,     setYear]     = useState(new Date().getFullYear())

  useEffect(() => {
    setLoading(true)
    Promise.all([
      api.getSummary(),
      api.getMonthly({ year }),
      api.getByCategory(),
      api.getRecent(8),
    ]).then(([s, m, c, r]) => {
      setSummary(s); setMonthly(m); setCats(c); setRecent(r)
    }).catch(console.error)
      .finally(() => setLoading(false))
  }, [year])

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}><Spinner size={28} /></div>
  )

  const net = summary ? summary.net_balance : 0

  return (
    <div>
      <PageHeader
        title="Overview"
        sub={`${year} · Financial summary`}
        actions={
          <select
            value={year}
            onChange={e => setYear(Number(e.target.value))}
            style={{
              fontSize: 12, padding: '6px 10px', borderRadius: 8,
              border: '1px solid var(--border)', background: 'var(--surface)',
              color: 'var(--text)', fontFamily: 'var(--font-sans)',
            }}
          >
            {[2023, 2024, 2025].map(y => <option key={y}>{y}</option>)}
          </select>
        }
      />

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
        <StatCard label="Total Income"    value={fmt(summary?.total_income)}    badge="Income"   badgeColor="green" />
        <StatCard label="Total Expenses"  value={fmt(summary?.total_expenses)}  badge="Expenses" badgeColor="red" />
        <StatCard label="Net Balance"     value={fmt(net)}                      badge={net >= 0 ? 'Surplus' : 'Deficit'} badgeColor={net >= 0 ? 'green' : 'red'} />
        <StatCard label="Transactions"    value={summary?.transaction_count ?? 0} badge="Total"  badgeColor="gray" />
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 16, marginBottom: 28 }}>
        {/* Area chart */}
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>Income vs Expenses</div>
              <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>Monthly trend</div>
            </div>
          </div>
          {monthly.length === 0
            ? <EmptyChart />
            : (
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={monthly.map(m => ({
                  month: m.month.slice(5),
                  Income: m.income,
                  Expenses: m.expense,
                }))} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gi" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#1D9E75" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#1D9E75" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="ge" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#E24B4A" stopOpacity={0.12}/>
                      <stop offset="95%" stopColor="#E24B4A" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eee" vertical={false}/>
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--text-3)' }} axisLine={false} tickLine={false}/>
                  <YAxis tickFormatter={fmtK} tick={{ fontSize: 11, fill: 'var(--text-3)' }} axisLine={false} tickLine={false}/>
                  <Tooltip formatter={v => [fmt(v)]} contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid var(--border)' }}/>
                  <Area type="monotone" dataKey="Income"   stroke="#1D9E75" strokeWidth={2} fill="url(#gi)"/>
                  <Area type="monotone" dataKey="Expenses" stroke="#E24B4A" strokeWidth={2} fill="url(#ge)"/>
                </AreaChart>
              </ResponsiveContainer>
            )
          }
        </Card>

        {/* Donut chart */}
        <Card>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>By Category</div>
          <div style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 16 }}>Spending breakdown</div>
          {cats.length === 0
            ? <EmptyChart />
            : (
              <>
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie data={cats} cx="50%" cy="50%" innerRadius={45} outerRadius={68} dataKey="total" paddingAngle={3}>
                      {cats.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]}/>)}
                    </Pie>
                    <Tooltip formatter={v => [fmt(v)]} contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid var(--border)' }}/>
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 14px', marginTop: 12 }}>
                  {cats.slice(0, 6).map((c, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--text-2)' }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: PIE_COLORS[i % PIE_COLORS.length], display: 'inline-block' }}/>
                      {c.category}
                    </div>
                  ))}
                </div>
              </>
            )
          }
        </Card>
      </div>

      {/* Recent transactions */}
      <Card padding="0">
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>Recent activity</div>
            <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>Latest transactions</div>
          </div>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {['Category', 'Date', 'Type', 'Notes', 'Amount'].map((h, i) => (
                <th key={h} style={{
                  fontSize: 11, fontWeight: 600, color: 'var(--text-3)',
                  textTransform: 'uppercase', letterSpacing: '0.06em',
                  padding: '10px 20px', textAlign: i === 4 ? 'right' : 'left',
                  borderBottom: '1px solid var(--border)', background: 'var(--surface-2)',
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {recent.length === 0 && (
              <tr><td colSpan={5} style={{ textAlign: 'center', padding: 40, color: 'var(--text-3)', fontSize: 13 }}>No transactions yet</td></tr>
            )}
            {recent.map(tx => (
              <TxRow key={tx.id} tx={tx} />
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  )
}

function TxRow({ tx }) {
  const isIncome = tx.type === 'income'
  return (
    <tr style={{ transition: 'background 0.1s' }}
      onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >
      <td style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)', fontSize: 13.5 }}>
        <span style={{ fontSize: 12, background: 'var(--bg)', padding: '3px 8px', borderRadius: 6, color: 'var(--text-2)' }}>
          {tx.category}
        </span>
      </td>
      <td style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)', fontSize: 12, color: 'var(--text-3)' }}>
        {tx.date?.slice(0, 10)}
      </td>
      <td style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)' }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 5,
          fontSize: 12, fontWeight: 500, padding: '3px 10px', borderRadius: 20,
          background: isIncome ? 'var(--accent-light)' : 'var(--danger-light)',
          color: isIncome ? 'var(--accent-dark)' : 'var(--danger)',
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: isIncome ? 'var(--accent)' : 'var(--danger)' }}/>
          {tx.type}
        </span>
      </td>
      <td style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)', fontSize: 12, color: 'var(--text-3)', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {tx.notes || '—'}
      </td>
      <td style={{
        padding: '12px 20px', borderBottom: '1px solid var(--border)',
        textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 500,
        color: isIncome ? 'var(--accent-dark)' : 'var(--danger)', fontSize: 13.5,
      }}>
        {isIncome ? '+' : '-'}₹{Number(tx.amount).toLocaleString('en-IN')}
      </td>
    </tr>
  )
}

function EmptyChart() {
  return (
    <div style={{ height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-3)', fontSize: 13 }}>
      No data available
    </div>
  )
}
