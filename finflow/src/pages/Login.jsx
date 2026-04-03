import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Btn, Input, Field, ErrorMsg } from '../components/UI'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate   = useNavigate()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  const handleSubmit = async e => {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      await login(email, password)
      navigate('/')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg)',
    }}>
      <div className="fade-in" style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-xl)', padding: '36px 32px',
        width: 380, boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
          <div style={{
            width: 36, height: 36, background: 'var(--accent)',
            borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
            </svg>
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 600, letterSpacing: '-0.3px' }}>Finflow</div>
            <div style={{ fontSize: 11, color: 'var(--text-3)' }}>Finance Dashboard</div>
          </div>
        </div>

        <h1 style={{ fontSize: 20, fontWeight: 600, letterSpacing: '-0.4px', marginBottom: 6 }}>Welcome back</h1>
        <p style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 24 }}>Sign in to your account to continue</p>

        <ErrorMsg msg={error} />

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Field label="Email address">
            <Input
              type="email" required placeholder="you@company.com"
              value={email} onChange={e => setEmail(e.target.value)}
            />
          </Field>
          <Field label="Password">
            <Input
              type="password" required placeholder="••••••••"
              value={password} onChange={e => setPassword(e.target.value)}
            />
          </Field>
          <Btn type="submit" variant="primary" size="lg" disabled={loading} style={{ width: '100%', justifyContent: 'center', marginTop: 4 }}>
            {loading ? 'Signing in…' : 'Sign in'}
          </Btn>
        </form>

        <p style={{ textAlign: 'center', marginTop: 18, fontSize: 12, color: 'var(--text-3)' }}>
          API: <code style={{ fontFamily: 'var(--font-mono)', background: 'var(--bg)', padding: '1px 6px', borderRadius: 4 }}>http://127.0.0.1:8000</code>
        </p>
      </div>
    </div>
  )
}
