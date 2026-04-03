import styles from './UI.module.css'

/* ── Button ── */
export function Btn({ children, variant = 'default', size = 'md', onClick, disabled, type = 'button', style }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={style}
      className={[styles.btn, styles[`btn_${variant}`], styles[`btn_${size}`]].join(' ')}
    >
      {children}
    </button>
  )
}

/* ── Spinner ── */
export function Spinner({ size = 18 }) {
  return (
    <span style={{
      display: 'inline-block',
      width: size, height: size,
      border: '2px solid var(--border-md)',
      borderTopColor: 'var(--accent)',
      borderRadius: '50%',
      animation: 'spin 0.7s linear infinite',
    }} />
  )
}

/* ── Badge ── */
export function Badge({ children, color = 'gray' }) {
  const colors = {
    green:  { bg: 'var(--accent-light)',  color: 'var(--accent-dark)' },
    red:    { bg: 'var(--danger-light)',  color: 'var(--danger)' },
    amber:  { bg: 'var(--amber-light)',   color: 'var(--amber-dark)' },
    purple: { bg: 'var(--purple-light)',  color: 'var(--purple-dark)' },
    gray:   { bg: 'var(--bg)',            color: 'var(--text-3)', border: '1px solid var(--border)' },
  }
  const c = colors[color] || colors.gray
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      fontSize: 11, fontWeight: 600, letterSpacing: '0.04em',
      textTransform: 'uppercase', padding: '3px 8px',
      borderRadius: 20, background: c.bg, color: c.color,
      border: c.border || 'none',
    }}>
      {children}
    </span>
  )
}

/* ── Card ── */
export function Card({ children, style, padding = '20px' }) {
  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)',
      padding,
      ...style,
    }}>
      {children}
    </div>
  )
}

/* ── Modal ── */
export function Modal({ open, onClose, title, children, footer }) {
  if (!open) return null
  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.25)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 200, backdropFilter: 'blur(2px)',
    }}>
      <div onClick={e => e.stopPropagation()} className="fade-in" style={{
        background: 'var(--surface)', borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--border)', padding: 28, width: 500,
        maxWidth: '95vw', maxHeight: '90vh', overflowY: 'auto',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600 }}>{title}</h2>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', fontSize: 20, color: 'var(--text-3)',
            cursor: 'pointer', lineHeight: 1, padding: '0 4px',
          }}>×</button>
        </div>
        {children}
        {footer && <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 24 }}>{footer}</div>}
      </div>
    </div>
  )
}

/* ── Form Field ── */
export function Field({ label, error, children, span }) {
  return (
    <div style={{ gridColumn: span === 2 ? '1 / -1' : undefined, display: 'flex', flexDirection: 'column', gap: 5 }}>
      {label && <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-2)' }}>{label}</label>}
      {children}
      {error && <span style={{ fontSize: 11, color: 'var(--danger)' }}>{error}</span>}
    </div>
  )
}

export function Input({ ...props }) {
  return (
    <input {...props} style={{
      fontSize: 13, padding: '8px 11px',
      border: '1px solid var(--border-md)',
      borderRadius: 'var(--radius-md)',
      background: 'var(--surface)',
      color: 'var(--text)',
      outline: 'none',
      width: '100%',
      transition: 'border-color 0.15s',
      ...props.style,
    }}
    onFocus={e => e.target.style.borderColor = 'var(--accent)'}
    onBlur={e => e.target.style.borderColor = 'var(--border-md)'}
    />
  )
}

export function Select({ children, ...props }) {
  return (
    <select {...props} style={{
      fontSize: 13, padding: '8px 11px',
      border: '1px solid var(--border-md)',
      borderRadius: 'var(--radius-md)',
      background: 'var(--surface)',
      color: 'var(--text)',
      outline: 'none',
      width: '100%',
      ...props.style,
    }}>
      {children}
    </select>
  )
}

/* ── Table ── */
export function Table({ headers, children, empty }) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            {headers.map((h, i) => (
              <th key={i} style={{
                fontSize: 11, fontWeight: 600, color: 'var(--text-3)',
                textTransform: 'uppercase', letterSpacing: '0.06em',
                padding: '10px 20px', textAlign: h.align || 'left',
                borderBottom: '1px solid var(--border)',
                background: 'var(--surface-2)',
                whiteSpace: 'nowrap',
              }}>{h.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
      {empty && (
        <div style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--text-3)' }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>📭</div>
          <div style={{ fontSize: 13 }}>{empty}</div>
        </div>
      )}
    </div>
  )
}

export function Td({ children, align, mono, muted, style }) {
  return (
    <td style={{
      fontSize: 13.5, padding: '12px 20px',
      borderBottom: '1px solid var(--border)',
      textAlign: align || 'left',
      fontFamily: mono ? 'var(--font-mono)' : undefined,
      color: muted ? 'var(--text-2)' : undefined,
      ...style,
    }}>
      {children}
    </td>
  )
}

/* ── Page Header ── */
export function PageHeader({ title, sub, actions }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center',
      justifyContent: 'space-between', marginBottom: 28,
    }}>
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.5px' }}>{title}</h1>
        {sub && <p style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 3 }}>{sub}</p>}
      </div>
      {actions && <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>{actions}</div>}
    </div>
  )
}

/* ── Error / Empty ── */
export function ErrorMsg({ msg }) {
  if (!msg) return null
  return (
    <div style={{
      fontSize: 12, color: 'var(--danger)',
      background: 'var(--danger-light)',
      padding: '9px 13px', borderRadius: 'var(--radius-md)',
      marginBottom: 14,
    }}>{msg}</div>
  )
}

/* ── Stat Card ── */
export function StatCard({ label, value, badge, badgeColor }) {
  return (
    <Card>
      <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 600, letterSpacing: '-0.8px', fontFamily: 'var(--font-mono)', marginBottom: 8 }}>{value}</div>
      {badge && <Badge color={badgeColor}>{badge}</Badge>}
    </Card>
  )
}
