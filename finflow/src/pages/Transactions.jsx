import { useState, useEffect, useCallback } from 'react'
import { api } from '../api/client'
import { useAuth } from '../hooks/useAuth'
import { PageHeader, Btn, Card, Modal, Field, Input, Select, ErrorMsg, Spinner } from '../components/UI'

const CATEGORIES = ['Salary','Rent','Utilities','Marketing','Travel','Software','Consulting','Freelance','Food','Other']

export default function Transactions() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'

  const [txs,     setTxs]     = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')

  // Filters
  const [filterType, setFilterType]   = useState('')
  const [filterCat,  setFilterCat]    = useState('')
  const [skip,       setSkip]         = useState(0)
  const LIMIT = 20

  // Modal state
  const [modal,    setModal]    = useState(null) // null | 'create' | 'edit' | 'delete'
  const [selected, setSelected] = useState(null)
  const [saving,   setSaving]   = useState(false)
  const [form,     setForm]     = useState(defaultForm())

  function defaultForm() {
    return { amount: '', type: 'income', category: '', date: today(), notes: '' }
  }
  function today() {
    return new Date().toISOString().slice(0, 16)
  }

  const load = useCallback(() => {
    setLoading(true)
    api.listTransactions({ type: filterType || undefined, category: filterCat || undefined, skip, limit: LIMIT })
      .then(setTxs).catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [filterType, filterCat, skip])

  useEffect(() => { load() }, [load])

  const openCreate = () => { setForm(defaultForm()); setModal('create') }
  const openEdit   = tx => { setSelected(tx); setForm({ amount: tx.amount, type: tx.type, category: tx.category, date: tx.date?.slice(0,16), notes: tx.notes || '' }); setModal('edit') }
  const openDelete = tx => { setSelected(tx); setModal('delete') }
  const closeModal = () => { setModal(null); setSelected(null); setSaving(false) }

  const handleSave = async () => {
    setSaving(true); setError('')
    try {
      const payload = { ...form, amount: parseFloat(form.amount), date: new Date(form.date).toISOString() }
      if (modal === 'create') await api.createTransaction(payload)
      else await api.updateTransaction(selected.id, payload)
      closeModal(); load()
    } catch (e) { setError(e.message); setSaving(false) }
  }

  const handleDelete = async () => {
    setSaving(true)
    try { await api.deleteTransaction(selected.id); closeModal(); load() }
    catch (e) { setError(e.message); setSaving(false) }
  }

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  return (
    <div>
      <PageHeader
        title="Transactions"
        sub="All financial records"
        actions={
          <>
            <select value={filterType} onChange={e => { setFilterType(e.target.value); setSkip(0) }}
              style={selectStyle}>
              <option value="">All types</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
            <select value={filterCat} onChange={e => { setFilterCat(e.target.value); setSkip(0) }}
              style={selectStyle}>
              <option value="">All categories</option>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
            {isAdmin && (
              <Btn variant="primary" onClick={openCreate}>
                <PlusIcon /> Add transaction
              </Btn>
            )}
          </>
        }
      />

      <Card padding="0">
        {loading
          ? <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><Spinner /></div>
          : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['#', 'Category', 'Date', 'Type', 'Notes', 'Amount', isAdmin ? 'Actions' : ''].filter(Boolean).map((h, i) => (
                    <th key={h} style={{
                      fontSize: 11, fontWeight: 600, color: 'var(--text-3)',
                      textTransform: 'uppercase', letterSpacing: '0.06em',
                      padding: '10px 20px', textAlign: (h === 'Amount') ? 'right' : 'left',
                      borderBottom: '1px solid var(--border)', background: 'var(--surface-2)',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {txs.length === 0 && (
                  <tr><td colSpan={7} style={{ textAlign: 'center', padding: 48, color: 'var(--text-3)', fontSize: 13 }}>No transactions found</td></tr>
                )}
                {txs.map(tx => {
                  const isIncome = tx.type === 'income'
                  return (
                    <tr key={tx.id}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
                      onMouseLeave={e => e.currentTarget.style.background = ''}
                      style={{ transition: 'background 0.1s' }}
                    >
                      <td style={td}><span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-3)' }}>#{tx.id}</span></td>
                      <td style={td}><span style={catStyle}>{tx.category}</span></td>
                      <td style={{ ...td, fontSize: 12, color: 'var(--text-3)' }}>{tx.date?.slice(0,10)}</td>
                      <td style={td}>
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
                      <td style={{ ...td, fontSize: 12, color: 'var(--text-3)', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tx.notes || '—'}</td>
                      <td style={{ ...td, textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 500, color: isIncome ? 'var(--accent-dark)' : 'var(--danger)' }}>
                        {isIncome ? '+' : '-'}₹{Number(tx.amount).toLocaleString('en-IN')}
                      </td>
                      {isAdmin && (
                        <td style={td}>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <Btn size="sm" onClick={() => openEdit(tx)}>Edit</Btn>
                            <Btn size="sm" variant="danger" onClick={() => openDelete(tx)}>Delete</Btn>
                          </div>
                        </td>
                      )}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )
        }

        {/* Pagination */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', borderTop: '1px solid var(--border)' }}>
          <span style={{ fontSize: 12, color: 'var(--text-3)' }}>Showing {skip + 1}–{skip + txs.length}</span>
          <div style={{ display: 'flex', gap: 8 }}>
            <Btn size="sm" disabled={skip === 0} onClick={() => setSkip(s => Math.max(0, s - LIMIT))}>← Prev</Btn>
            <Btn size="sm" disabled={txs.length < LIMIT} onClick={() => setSkip(s => s + LIMIT)}>Next →</Btn>
          </div>
        </div>
      </Card>

      {/* Create / Edit modal */}
      <Modal
        open={modal === 'create' || modal === 'edit'}
        onClose={closeModal}
        title={modal === 'create' ? 'Add transaction' : 'Edit transaction'}
        footer={
          <>
            <Btn onClick={closeModal}>Cancel</Btn>
            <Btn variant="primary" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving…' : 'Save'}
            </Btn>
          </>
        }
      >
        <ErrorMsg msg={error} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <Field label="Amount (₹)">
            <Input type="number" min="0.01" step="0.01" placeholder="0.00" value={form.amount} onChange={set('amount')} />
          </Field>
          <Field label="Type">
            <Select value={form.type} onChange={set('type')}>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </Select>
          </Field>
          <Field label="Category">
            <Select value={form.category} onChange={set('category')}>
              <option value="">Select category</option>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </Select>
          </Field>
          <Field label="Date & Time">
            <Input type="datetime-local" value={form.date} onChange={set('date')} />
          </Field>
          <Field label="Notes" span={2}>
            <Input placeholder="Optional note…" value={form.notes} onChange={set('notes')} />
          </Field>
        </div>
      </Modal>

      {/* Delete confirm modal */}
      <Modal
        open={modal === 'delete'}
        onClose={closeModal}
        title="Delete transaction"
        footer={
          <>
            <Btn onClick={closeModal}>Cancel</Btn>
            <Btn variant="danger" onClick={handleDelete} disabled={saving}>
              {saving ? 'Deleting…' : 'Delete'}
            </Btn>
          </>
        }
      >
        <p style={{ fontSize: 14, color: 'var(--text-2)' }}>
          Are you sure you want to delete this{' '}
          <strong>{selected?.type}</strong> of{' '}
          <strong>₹{Number(selected?.amount || 0).toLocaleString('en-IN')}</strong> from{' '}
          <strong>{selected?.category}</strong>? This action cannot be undone.
        </p>
      </Modal>
    </div>
  )
}

const td = { padding: '12px 20px', borderBottom: '1px solid var(--border)', fontSize: 13.5 }
const catStyle = { fontSize: 12, background: 'var(--bg)', padding: '3px 8px', borderRadius: 6, color: 'var(--text-2)' }
const selectStyle = {
  fontSize: 12, padding: '6px 10px', borderRadius: 8,
  border: '1px solid var(--border)', background: 'var(--surface)',
  color: 'var(--text)', fontFamily: 'var(--font-sans)',
}

function PlusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  )
}
