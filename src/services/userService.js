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

export async function syncFirebaseUserToSupabase(firebaseUser) {
  if (!firebaseUser) throw new Error('firebaseUser is required')

  const firebase_uid = firebaseUser.uid
  const email = firebaseUser.email
  const username = firebaseUser.displayName || (email ? email.split('@')[0] : null)

  const body = await request('/api/auth/sync-user', {
    method: 'POST',
    body: JSON.stringify({ firebase_uid, email, username }),
  })

  return body.id
}

// Ambil target kalori harian user (dalam kkal)
export async function getUserDailyCalorieTarget(userId) {
  if (!userId) throw new Error('userId is required')

  const body = await request(`/api/users/${encodeURIComponent(userId)}/daily-target`)
  return body.target ?? null
}

// Update target kalori harian user (dalam kkal)
export async function updateUserDailyCalorieTarget(userId, target) {
  if (!userId) throw new Error('userId is required')

  const body = await request(`/api/users/${encodeURIComponent(userId)}/daily-target`, {
    method: 'PUT',
    body: JSON.stringify({ target }),
  })

  return body.target
}
