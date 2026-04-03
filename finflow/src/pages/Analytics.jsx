import { useState, useEffect } from 'react'
import {
  BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts'
import { api } from '../api/client'
import { PageHeader, Card, Spinner } from '../components/UI'

const fmt = n => `₹${Number(n || 0).toLocaleString('en-IN')}`
const fmtK = v => `₹${(v / 1000).toFixed(0)}k`

export default function Analytics() {
  const [monthly, setMonthly] = useState([])
  const [cats,    setCats]    = useState([])
  const [year,    setYear]    = useState(new Date().getFullYear())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    Promise.all([api.getMonthly({ year }), api.getByCategory()])
      .then(([m, c]) => { setMonthly(m); setCats(c) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [year])

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}><Spinner size={28}/></div>

  const monthlyFormatted = monthly.map(m => ({
    month: m.month.slice(5),
    Income: m.income,
    Expenses: m.expense,
    Net: m.income - m.expense,
  }))

  const topCats = [...cats].sort((a, b) => b.total - a.total).slice(0, 8)

  return (
    <div>
      <PageHeader
        title="Analytics"
        sub="Detailed financial insights"
        actions={
          <select value={year} onChange={e => setYear(Number(e.target.value))}
            style={{ fontSize: 12, padding: '6px 10px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text)', fontFamily: 'var(--font-sans)' }}>
            {[2023,2024,2025].map(y => <option key={y}>{y}</option>)}
          </select>
        }
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        {/* Monthly bar chart */}
        <Card>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>Monthly comparison</div>
          <div style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 20 }}>Income vs expenses per month</div>
          {monthlyFormatted.length === 0
            ? <Empty />
            : (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={monthlyFormatted} margin={{ top: 4, right: 4, left: -16, bottom: 0 }} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eee" vertical={false}/>
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--text-3)' }} axisLine={false} tickLine={false}/>
                  <YAxis tickFormatter={fmtK} tick={{ fontSize: 11, fill: 'var(--text-3)' }} axisLine={false} tickLine={false}/>
                  <Tooltip formatter={v => [fmt(v)]} contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid var(--border)' }}/>
                  <Legend wrapperStyle={{ fontSize: 12 }}/>
                  <Bar dataKey="Income"   fill="#1D9E75" radius={[4,4,0,0]}/>
                  <Bar dataKey="Expenses" fill="#E24B4A" radius={[4,4,0,0]}/>
                </BarChart>
              </ResponsiveContainer>
            )
          }
        </Card>

        {/* Net balance trend */}
        <Card>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>Net balance trend</div>
          <div style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 20 }}>Month-over-month net</div>
          {monthlyFormatted.length === 0
            ? <Empty />
            : (
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={monthlyFormatted} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
                  <defs>
                    <linearGradient id="net" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#378ADD" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#378ADD" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eee" vertical={false}/>
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--text-3)' }} axisLine={false} tickLine={false}/>
                  <YAxis tickFormatter={fmtK} tick={{ fontSize: 11, fill: 'var(--text-3)' }} axisLine={false} tickLine={false}/>
                  <Tooltip formatter={v => [fmt(v)]} contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid var(--border)' }}/>
                  <Area type="monotone" dataKey="Net" stroke="#378ADD" strokeWidth={2} fill="url(#net)" name="Net Balance"/>
                </AreaChart>
              </ResponsiveContainer>
            )
          }
        </Card>
      </div>

      {/* Category breakdown */}
      <Card>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>Top categories</div>
        <div style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 20 }}>Spending by category (all time)</div>
        {topCats.length === 0
          ? <Empty />
          : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={topCats} layout="vertical" margin={{ top: 0, right: 20, left: 60, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" horizontal={false}/>
                <XAxis type="number" tickFormatter={fmtK} tick={{ fontSize: 11, fill: 'var(--text-3)' }} axisLine={false} tickLine={false}/>
                <YAxis type="category" dataKey="category" tick={{ fontSize: 12, fill: 'var(--text-2)' }} axisLine={false} tickLine={false}/>
                <Tooltip formatter={v => [fmt(v)]} contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid var(--border)' }}/>
                <Bar dataKey="total" fill="#1D9E75" radius={[0,4,4,0]} name="Total"/>
              </BarChart>
            </ResponsiveContainer>
          )
        }
      </Card>
    </div>
  )
}

function Empty() {
  return <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-3)', fontSize: 13 }}>No data for this period</div>
}
