import { auth } from '../firebase'

const BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000'

async function getAuthHeaders() {
  const user = auth.currentUser
  if (!user) return {}
  const token = await user.getIdToken()
  return { Authorization: `Bearer ${token}` }
}

async function request(path, options = {}) {
  const authHeaders = await getAuthHeaders()
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders,
      ...(options.headers || {}),
    },
    ...options,
  })

  const contentType = res.headers.get('content-type') || ''
  const isJson = contentType.includes('application/json')
  const body = isJson ? await res.json() : null

  if (!res.ok) {
    const message = body?.error || res.statusText || 'Request failed'
    throw new Error(message)
  }

  return body
}

export async function fetchAllTestimonials() {
  const res = await fetch(`${BASE_URL}/api/testimonials`)
  if (!res.ok) {
    throw new Error('Gagal mengambil testimoni')
  }
  const data = await res.json()
  return data || []
}

export async function fetchUserTestimonials(userId) {
  if (!userId) throw new Error('userId wajib diisi')

  const res = await fetch(`${BASE_URL}/api/testimonials/user/${encodeURIComponent(userId)}`)
  if (!res.ok) {
    throw new Error('Gagal mengambil testimoni user')
  }
  const data = await res.json()
  return data || []
}

export async function createTestimoni({ username, job, message }) {
  if (!username) throw new Error('username wajib diisi')
  if (!job) throw new Error('job wajib diisi')
  if (!message) throw new Error('message wajib diisi')

  const body = await request('/api/testimonials', {
    method: 'POST',
    body: JSON.stringify({ username, job, message }),
  })

  return body
}
