const BASE = '/api'

function getToken() {
  return localStorage.getItem('token')
}

function authHeaders(extra = {}) {
  const token = getToken()
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra,
  }
}

async function request(method, path, body = null) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: authHeaders(),
    ...(body ? { body: JSON.stringify(body) } : {}),
  })
  if (res.status === 204) return null
  const data = await res.json()
  if (!res.ok) throw new Error(data.detail || 'Request failed')
  return data
}

export const api = {
  // Auth
  login: async (email, password) => {
    const form = new URLSearchParams()
    form.append('username', email)
    form.append('password', password)
    const res = await fetch(`${BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: form,
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.detail || 'Login failed')
    return data
  },
  register: (payload) => request('POST', '/auth/register', payload),

  // Users
  getMe:      ()           => request('GET',    '/users/me'),
  listUsers:  ()           => request('GET',    '/users/'),
  getUser:    (id)         => request('GET',    `/users/${id}`),
  createUser: (payload)    => request('POST',   '/users/', payload),
  updateUser: (id, payload)=> request('PUT',    `/users/${id}`, payload),
  deleteUser: (id)         => request('DELETE', `/users/${id}`),

  // Transactions
  listTransactions: (params = {}) => {
    const q = new URLSearchParams()
    Object.entries(params).forEach(([k, v]) => v !== '' && v != null && q.append(k, v))
    return request('GET', `/transactions/?${q}`)
  },
  getTransaction:    (id)         => request('GET',    `/transactions/${id}`),
  createTransaction: (payload)    => request('POST',   '/transactions/', payload),
  updateTransaction: (id, payload)=> request('PUT',    `/transactions/${id}`, payload),
  deleteTransaction: (id)         => request('DELETE', `/transactions/${id}`),

  // Dashboard
  getSummary:   (params = {}) => {
    const q = new URLSearchParams()
    Object.entries(params).forEach(([k, v]) => v && q.append(k, v))
    return request('GET', `/dashboard/summary?${q}`)
  },
  getByCategory:(params = {}) => {
    const q = new URLSearchParams()
    Object.entries(params).forEach(([k, v]) => v && q.append(k, v))
    return request('GET', `/dashboard/by-category?${q}`)
  },
  getMonthly:   (params = {}) => {
    const q = new URLSearchParams()
    Object.entries(params).forEach(([k, v]) => v && q.append(k, v))
    return request('GET', `/dashboard/monthly?${q}`)
  },
  getRecent:    (limit = 10)  => request('GET', `/dashboard/recent?limit=${limit}`),
}
