import { useState, useEffect } from 'react'
import { api } from '../api/client'
import { useAuth } from '../hooks/useAuth'
import { PageHeader, Btn, Card, Modal, Field, Input, Select, ErrorMsg, Spinner, Badge } from '../components/UI'

export default function Users() {
  const { user: me } = useAuth()
  const [users,   setUsers]   = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')
  const [modal,   setModal]   = useState(null)
  const [selected,setSelected]= useState(null)
  const [saving,  setSaving]  = useState(false)
  const [form,    setForm]    = useState(defaultForm())

  function defaultForm() {
    return { name: '', email: '', password: '', role: 'viewer' }
  }

  const load = () => {
    setLoading(true)
    api.listUsers()
      .then(setUsers).catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const openCreate = () => { setForm(defaultForm()); setModal('create') }
  const openEdit   = u  => { setSelected(u); setForm({ name: u.name, email: u.email, password: '', role: u.role, is_active: u.is_active }); setModal('edit') }
  const openDelete = u  => { setSelected(u); setModal('delete') }
  const close      = () => { setModal(null); setSelected(null); setSaving(false); setError('') }

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))
  const setCheck = k => e => setForm(f => ({ ...f, [k]: e.target.checked }))

  const handleSave = async () => {
    setSaving(true); setError('')
    try {
      if (modal === 'create') {
        await api.createUser(form)
      } else {
        const payload = { name: form.name, role: form.role, is_active: form.is_active }
        await api.updateUser(selected.id, payload)
      }
      close(); load()
    } catch (e) { setError(e.message); setSaving(false) }
  }

  const handleDelete = async () => {
    setSaving(true)
    try { await api.deleteUser(selected.id); close(); load() }
    catch (e) { setError(e.message); setSaving(false) }
  }

  const roleColor = r => ({ admin: 'purple', analyst: 'amber', viewer: 'gray' }[r] || 'gray')

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}><Spinner size={28}/></div>

  return (
    <div>
      <PageHeader
        title="Users"
        sub="Manage access and roles"
        actions={<Btn variant="primary" onClick={openCreate}><PlusIcon /> Add user</Btn>}
      />

      <Card padding="0">
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {['User', 'Email', 'Role', 'Status', 'Joined', 'Actions'].map(h => (
                <th key={h} style={{
                  fontSize: 11, fontWeight: 600, color: 'var(--text-3)',
                  textTransform: 'uppercase', letterSpacing: '0.06em',
                  padding: '10px 20px', textAlign: 'left',
                  borderBottom: '1px solid var(--border)', background: 'var(--surface-2)',
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.length === 0 && (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: 48, color: 'var(--text-3)', fontSize: 13 }}>No users found</td></tr>
            )}
            {users.map(u => {
              const initials = u.name.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase()
              return (
                <tr key={u.id}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
                  onMouseLeave={e => e.currentTarget.style.background = ''}
                  style={{ transition: 'background 0.1s' }}
                >
                  <td style={td}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: '50%',
                        background: 'var(--accent-light)', display: 'flex',
                        alignItems: 'center', justifyContent: 'center',
                        fontSize: 12, fontWeight: 600, color: 'var(--accent-dark)', flexShrink: 0,
                      }}>{initials}</div>
                      <span style={{ fontWeight: 500 }}>{u.name}</span>
                      {u.id === me?.id && <span style={{ fontSize: 11, color: 'var(--text-3)', background: 'var(--bg)', padding: '2px 7px', borderRadius: 20, border: '1px solid var(--border)' }}>you</span>}
                    </div>
                  </td>
                  <td style={{ ...td, fontSize: 12, color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>{u.email}</td>
                  <td style={td}><Badge color={roleColor(u.role)}>{u.role}</Badge></td>
                  <td style={td}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
                      <span style={{ width: 7, height: 7, borderRadius: '50%', background: u.is_active ? 'var(--accent)' : '#D3D1C7', display: 'inline-block' }}/>
                      {u.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td style={{ ...td, fontSize: 12, color: 'var(--text-3)' }}>{u.created_at?.slice(0,10)}</td>
                  <td style={td}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <Btn size="sm" onClick={() => openEdit(u)}>Edit</Btn>
                      {u.id !== me?.id && <Btn size="sm" variant="danger" onClick={() => openDelete(u)}>Delete</Btn>}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </Card>

      {/* Create / Edit modal */}
      <Modal
        open={modal === 'create' || modal === 'edit'}
        onClose={close}
        title={modal === 'create' ? 'Add user' : `Edit — ${selected?.name}`}
        footer={
          <>
            <Btn onClick={close}>Cancel</Btn>
            <Btn variant="primary" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving…' : 'Save'}
            </Btn>
          </>
        }
      >
        <ErrorMsg msg={error} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <Field label="Full name" span={2}>
            <Input placeholder="Jane Doe" value={form.name} onChange={set('name')} />
          </Field>
          <Field label="Email" span={2}>
            <Input type="email" placeholder="jane@company.com" value={form.email} onChange={set('email')} disabled={modal === 'edit'} />
          </Field>
          {modal === 'create' && (
            <Field label="Password" span={2}>
              <Input type="password" placeholder="Min 8 characters" value={form.password} onChange={set('password')} />
            </Field>
          )}
          <Field label="Role">
            <Select value={form.role} onChange={set('role')}>
              <option value="viewer">Viewer</option>
              <option value="analyst">Analyst</option>
              <option value="admin">Admin</option>
            </Select>
          </Field>
          {modal === 'edit' && (
            <Field label="Status">
              <Select value={form.is_active ? 'true' : 'false'} onChange={e => setForm(f => ({ ...f, is_active: e.target.value === 'true' }))}>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </Select>
            </Field>
          )}
        </div>
      </Modal>

      {/* Delete modal */}
      <Modal
        open={modal === 'delete'}
        onClose={close}
        title="Delete user"
        footer={
          <>
            <Btn onClick={close}>Cancel</Btn>
            <Btn variant="danger" onClick={handleDelete} disabled={saving}>
              {saving ? 'Deleting…' : 'Delete permanently'}
            </Btn>
          </>
        }
      >
        <ErrorMsg msg={error} />
        <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.6 }}>
          Are you sure you want to permanently delete <strong>{selected?.name}</strong> ({selected?.email})?
          All their data will be removed.
        </p>
      </Modal>
    </div>
  )
}

const td = { padding: '12px 20px', borderBottom: '1px solid var(--border)', fontSize: 13.5 }

function PlusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  )
}
